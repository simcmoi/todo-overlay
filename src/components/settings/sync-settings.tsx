import { useTranslation } from 'react-i18next'
import { StorageSettings } from '@/components/storage'

export function SyncSettings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('settings.synchronization')}</h2>
        <p className="text-xs text-muted-foreground">Synchronisez vos données avec le cloud</p>
      </div>

      <div>
        <StorageSettings />
      </div>
    </div>
  )
}
