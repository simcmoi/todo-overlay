import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { resetAllData } from '@/lib/tauri'

export function DangerSettings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold mb-1 text-red-600">{t('settings.dangerZone')}</h2>
        <p className="text-xs text-muted-foreground">{t('settings.dangerZoneWarning')}</p>
      </div>

      <div className="space-y-4">
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 px-2 text-xs border-red-500/50 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('settings.deleteAllData')}
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p>{t('settings.deleteAllDataTooltip')}</p>
            </TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settings.confirmDeleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('settings.confirmDeleteDesc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  try {
                    console.log('🔴 Starting reset all data...')
                    const result = await resetAllData()
                    console.log('✅ Reset all data result:', result)
                    // Backend will emit 'data-reset' event, App.tsx will handle rehydration
                  } catch (error) {
                    console.error('❌ Failed to reset data:', error)
                    alert(`${t('common.error')}: ${error}`)
                  }
                }}
              >
                {t('settings.confirmDelete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
