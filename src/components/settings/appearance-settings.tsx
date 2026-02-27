import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Settings, ThemeMode } from '@/types/todo'

type AppearanceSettingsProps = {
  settings: Settings
  onUpdateSettings: (partial: Partial<Settings>) => Promise<void>
}

export function AppearanceSettings({
  settings,
  onUpdateSettings,
}: AppearanceSettingsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('settings.appearance')}</h2>
        <p className="text-xs text-muted-foreground">Personnalisez l'apparence de l'application</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-help">{t('settings.theme')}</span>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p>{t('settings.themeTooltip')}</p>
            </TooltipContent>
          </Tooltip>
          <Select
            value={settings.themeMode}
            onValueChange={async (value) => {
              await onUpdateSettings({ themeMode: value as ThemeMode })
            }}
          >
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
              <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
              <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
