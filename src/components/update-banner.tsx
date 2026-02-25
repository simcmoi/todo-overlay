import { AnimatePresence, motion } from 'framer-motion'
import { Download, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateStore } from '@/store/use-update-store'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChangelogDialog } from '@/components/changelog-dialog'
import { useTranslation } from 'react-i18next'

export function UpdateBanner() {
  const { state, updateInfo, downloadProgress, installUpdate, dismissUpdate } = useUpdateStore()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [showChangelog, setShowChangelog] = useState(false)

  // Show toast notification for download/install progress
  useEffect(() => {
    if (state === 'downloading') {
      toast({
        title: t('update.downloading'),
        description: t('update.downloadingDesc', { 
          version: updateInfo?.latestVersion,
          progress: downloadProgress 
        }),
      })
    } else if (state === 'installing') {
      toast({
        title: t('update.installing'),
        description: t('update.installingDesc'),
      })
    }
  }, [state, downloadProgress, toast, updateInfo?.latestVersion, t])

  if (state !== 'available') {
    return null
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-blue-200/50 bg-blue-50/50 px-2.5 py-1.5 text-xs dark:border-blue-800/30 dark:bg-blue-950/30"
        >
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"
            )} />
            <span className="font-medium">v{updateInfo?.latestVersion}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-5 px-2 text-[10px] font-medium text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/50"
              onClick={() => setShowChangelog(true)}
            >
              <FileText className="mr-1 h-2.5 w-2.5" />
              {t('update.whatsNew')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-5 px-2 text-[10px] font-medium text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/50"
              onClick={() => {
                void installUpdate()
              }}
            >
              <Download className="mr-1 h-2.5 w-2.5" />
              {t('update.install')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-blue-600/60 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400/60 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
              onClick={dismissUpdate}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {updateInfo?.latestVersion && (
        <ChangelogDialog
          version={updateInfo.latestVersion}
          open={showChangelog}
          onOpenChange={setShowChangelog}
        />
      )}
    </>
  )
}
