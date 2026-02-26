import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { listen } from '@tauri-apps/api/event'

type UpdateDownloadDialogProps = {
  version: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ProgressPayload = {
  progress: number
  chunkLength: number
  contentLength: number
}

export function UpdateDownloadDialog({ version, open, onOpenChange }: UpdateDownloadDialogProps) {
  const { t } = useTranslation()
  const [progress, setProgress] = useState(0)
  const [downloadSpeed, setDownloadSpeed] = useState(0)
  const [downloadedBytes, setDownloadedBytes] = useState(0)
  const [totalBytes, setTotalBytes] = useState(0)
  const [status, setStatus] = useState<'downloading' | 'installing' | 'restarting'>('downloading')
  
  // Pour calculer la vitesse de téléchargement
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [lastBytes, setLastBytes] = useState(0)

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setProgress(0)
      setDownloadSpeed(0)
      setDownloadedBytes(0)
      setTotalBytes(0)
      setStatus('downloading')
      setLastUpdate(Date.now())
      setLastBytes(0)
      return
    }

    // Listen to download progress events
    const unlistenProgress = listen<ProgressPayload>('update-download-progress', (event) => {
      const { progress: progressPercent, chunkLength, contentLength } = event.payload
      setProgress(progressPercent)
      
      // Set total bytes on first event
      if (totalBytes === 0 && contentLength > 0) {
        setTotalBytes(contentLength)
      }
      
      // Calculate download speed
      const now = Date.now()
      const timeDiff = (now - lastUpdate) / 1000 // seconds
      
      if (timeDiff > 0.5) {
        const bytesDiff = chunkLength - lastBytes
        const speed = bytesDiff / timeDiff // bytes per second
        
        setDownloadSpeed(speed)
        setDownloadedBytes(chunkLength)
        setLastUpdate(now)
        setLastBytes(chunkLength)
      }
    })

    // Listen to status change events
    const unlistenStatus = listen<string>('update-progress', (event) => {
      const newStatus = event.payload as 'downloading' | 'installing' | 'restarting'
      setStatus(newStatus)
      
      if (newStatus === 'installing') {
        setProgress(100)
      }
    })

    return () => {
      void unlistenProgress.then(fn => fn())
      void unlistenStatus.then(fn => fn())
    }
  }, [open, lastUpdate, lastBytes, totalBytes])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === 'downloading' && <Download className="h-5 w-5 animate-bounce" />}
            {status === 'installing' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {status === 'restarting' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {t(`update.status.${status}`)}
          </DialogTitle>
          <DialogDescription>
            {status === 'downloading' && t('update.downloadingVersion', { version })}
            {status === 'installing' && t('update.installingVersion', { version })}
            {status === 'restarting' && t('update.restartingVersion', { version })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {progress.toFixed(1)}%
              </span>
              {status === 'downloading' && downloadSpeed > 0 && (
                <span className="font-mono text-muted-foreground">
                  {formatSpeed(downloadSpeed)}
                </span>
              )}
            </div>
          </div>

          {/* Download info */}
          {status === 'downloading' && totalBytes > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
              </span>
              {downloadSpeed > 0 && (
                <span>
                  ETA: {Math.round((totalBytes - downloadedBytes) / downloadSpeed)}s
                </span>
              )}
            </div>
          )}

          {/* Status messages */}
          <div className="rounded-md bg-muted p-3 text-sm">
            {status === 'downloading' && (
              <p className="text-muted-foreground">
                {t('update.downloadingMessage')}
              </p>
            )}
            {status === 'installing' && (
              <p className="text-muted-foreground">
                {t('update.installingMessage')}
              </p>
            )}
            {status === 'restarting' && (
              <p className="text-muted-foreground">
                {t('update.restartingMessage')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
