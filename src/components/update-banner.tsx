import { AnimatePresence, motion } from 'framer-motion'
import { Download, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUpdateStore } from '@/store/use-update-store'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export function UpdateBanner() {
  const { state, updateInfo, downloadProgress, installUpdate, dismissUpdate } = useUpdateStore()
  const { toast } = useToast()

  // Show toast notification for download/install progress
  useEffect(() => {
    if (state === 'downloading') {
      toast({
        title: 'Téléchargement de la mise à jour',
        description: `Version ${updateInfo?.latestVersion} - ${downloadProgress}%`,
      })
    } else if (state === 'installing') {
      toast({
        title: 'Installation en cours',
        description: 'L\'application va redémarrer dans un instant...',
      })
    }
  }, [state, downloadProgress, toast, updateInfo?.latestVersion])

  if (state === 'idle' || state === 'checking') {
    return null
  }

  return (
    <AnimatePresence>
      {(state === 'available' || state === 'error') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-4 right-4 z-50"
        >
          {state === 'error' ? (
            <Badge 
              variant="destructive" 
              className="flex items-center gap-2 px-3 py-2 shadow-lg"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Update failed</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-destructive-foreground/20"
                onClick={dismissUpdate}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ) : (
            <Badge 
              variant="default"
              className="flex items-center gap-2 px-3 py-2 shadow-lg"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>v{updateInfo?.latestVersion} available</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-5 px-2 text-[10px] ml-1"
                onClick={() => {
                  void installUpdate()
                }}
              >
                <Download className="mr-1 h-2.5 w-2.5" />
                Install
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-primary-foreground/20"
                onClick={dismissUpdate}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
