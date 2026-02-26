import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getChangelog } from '@/lib/tauri'

type ChangelogDialogProps = {
  version: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangelogDialog({ version, open, onOpenChange }: ChangelogDialogProps) {
  const { t } = useTranslation()
  const [changelog, setChangelog] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChangelog('')
      setLoading(true)
      setError(null)
      return
    }

    // Load changelog when dialog opens
    let cancelled = false

    void getChangelog(version)
      .then((content) => {
        if (!cancelled) {
          setChangelog(content)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load changelog:', err)
          setError('Impossible de charger le changelog.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [version, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('changelog.title', { version })}
          </DialogTitle>
          <DialogDescription>
            {t('changelog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive py-4">
              {error}
            </div>
          )}

          {!loading && !error && changelog && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-foreground">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-muted-foreground my-2">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  hr: () => <hr className="my-4 border-border" />,
                }}
              >
                {changelog}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
