import { ExternalLink, ScrollText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getDataFilePath, getLogFilePath, openDataFile, openLogFile } from '@/lib/tauri'

export function DataSettings() {
  const { t } = useTranslation()
  const [dataFilePath, setDataFilePath] = useState<string>('')
  const [logFilePath, setLogFilePath] = useState<string>('')

  useEffect(() => {
    void getDataFilePath().then(setDataFilePath)
    void getLogFilePath().then(setLogFilePath)
  }, [])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('settings.localData')}</h2>
        <p className="text-xs text-muted-foreground">Gérez vos fichiers de données locaux</p>
      </div>

      <div className="space-y-6">
        {/* Data file */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium">{t('settings.localData')}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="break-all text-[10px] text-muted-foreground/70 flex-1">{dataFilePath}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => {
                    void openDataFile()
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>{t('settings.openDataFileTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Log file */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{t('settings.logs')}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="break-all text-[10px] text-muted-foreground/70 flex-1">{logFilePath}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => {
                    void openLogFile()
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>{t('settings.openLogFileTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
