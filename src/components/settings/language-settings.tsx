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
import type { Settings } from '@/types/todo'

const LANGUAGE_OPTIONS: Array<{ value: string; label: string; flag: string }> = [
  { value: 'auto', label: 'Auto (Système)', flag: '🌐' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
]

type LanguageSettingsProps = {
  settings: Settings
  onUpdateSettings: (partial: Partial<Settings>) => Promise<void>
}

export function LanguageSettings({
  settings,
  onUpdateSettings,
}: LanguageSettingsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('settings.language')}</h2>
        <p className="text-xs text-muted-foreground">Choisissez la langue de l'interface</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-help">{t('settings.interface')}</span>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p>{t('settings.languageTooltip')}</p>
            </TooltipContent>
          </Tooltip>
          <Select
            value={settings.language}
            onValueChange={async (value) => {
              await onUpdateSettings({ language: value })
            }}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue>
                {LANGUAGE_OPTIONS.find((lang) => lang.value === settings.language) ? (
                  <span className="flex items-center gap-1.5">
                    {LANGUAGE_OPTIONS.find((lang) => lang.value === settings.language)?.flag}
                    {' '}
                    {LANGUAGE_OPTIONS.find((lang) => lang.value === settings.language)?.label}
                  </span>
                ) : (
                  'Select language'
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-1.5">
                    {lang.flag} {lang.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
