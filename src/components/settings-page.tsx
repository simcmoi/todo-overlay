import { AlertTriangle, ArrowLeft, Cloud, ExternalLink, FileText, Info, Keyboard, Languages, Palette, Plus, RefreshCw, ScrollText, SlidersHorizontal, Tags, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
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
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { useUpdateStore } from '@/store/use-update-store'
import { getAppVersion, getDataFilePath, openDataFile, getLogFilePath, openLogFile, resetAllData } from '@/lib/tauri'
import { cn } from '@/lib/utils'
import type { Settings, ThemeMode, TodoLabel } from '@/types/todo'
import { StorageSettings } from '@/components/storage'

type SettingsPageProps = {
  settings: Settings
  onBack: () => void
  onUpdateSettings: (partial: Partial<Settings>) => Promise<void>
  onSetGlobalShortcut: (shortcut: string) => Promise<void>
  onSetAutostartEnabled: (enabled: boolean) => Promise<void>
}

const LANGUAGE_OPTIONS: Array<{ value: string; label: string; flag: string }> = [
  { value: 'auto', label: 'Auto (Système)', flag: '🌐' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
]

function keyFromKeyboardEvent(event: KeyboardEvent): string | null {
  if (/^[a-z]$/i.test(event.key)) {
    return event.key.toUpperCase()
  }
  if (/^\d$/.test(event.key)) {
    return event.key
  }
  if (/^F\d{1,2}$/i.test(event.key)) {
    return event.key.toUpperCase()
  }

  switch (event.key) {
    case ' ':
      return 'Space'
    case 'Enter':
      return 'Enter'
    case 'Tab':
      return 'Tab'
    case 'Escape':
      return 'Escape'
    case 'Backspace':
      return 'Backspace'
    case 'Delete':
      return 'Delete'
    case 'ArrowUp':
      return 'Up'
    case 'ArrowDown':
      return 'Down'
    case 'ArrowLeft':
      return 'Left'
    case 'ArrowRight':
      return 'Right'
    default:
      return null
  }
}

function colorClasses(color: TodoLabel['color']): string {
  switch (color) {
    case 'blue':
      return 'bg-blue-500/15 text-blue-600 border-blue-600/30'
    case 'green':
      return 'bg-green-500/15 text-green-600 border-green-600/30'
    case 'amber':
      return 'bg-amber-500/15 text-amber-700 border-amber-700/30'
    case 'rose':
      return 'bg-rose-500/15 text-rose-700 border-rose-700/30'
    case 'violet':
      return 'bg-violet-500/15 text-violet-700 border-violet-700/30'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function SettingsPage({
  settings,
  onBack,
  onUpdateSettings,
  onSetGlobalShortcut,
  onSetAutostartEnabled,
}: SettingsPageProps) {
  const { t } = useTranslation()
  
  const COLOR_OPTIONS: Array<{ value: TodoLabel['color']; label: string }> = [
    { value: 'slate', label: t('settings.colors.slate') },
    { value: 'blue', label: t('settings.colors.blue') },
    { value: 'green', label: t('settings.colors.green') },
    { value: 'amber', label: t('settings.colors.amber') },
    { value: 'rose', label: t('settings.colors.rose') },
    { value: 'violet', label: t('settings.colors.violet') },
  ]
  
  const [shortcutDraft, setShortcutDraft] = useState(settings.globalShortcut)
  const [shortcutError, setShortcutError] = useState<string | null>(null)
  const [isCapturingShortcut, setIsCapturingShortcut] = useState(false)
  const [isSavingShortcut, setIsSavingShortcut] = useState(false)
  const [labelDrafts, setLabelDrafts] = useState<Record<string, string>>({})
  const [appVersion, setAppVersion] = useState<string>('')
  const [dataFilePath, setDataFilePath] = useState<string>('')
  const [logFilePath, setLogFilePath] = useState<string>('')
  const { checkForUpdate, state: updateState, lastChecked } = useUpdateStore()
  const { toast } = useToast()

  useEffect(() => {
    void getAppVersion().then(setAppVersion)
    void getDataFilePath().then(setDataFilePath)
    void getLogFilePath().then(setLogFilePath)
  }, [])

  useEffect(() => {
    setShortcutDraft(settings.globalShortcut)
  }, [settings.globalShortcut])

  useEffect(() => {
    setLabelDrafts(
      Object.fromEntries(settings.labels.map((label) => [label.id, label.name])),
    )
  }, [settings.labels])

  useEffect(() => {
    if (!isCapturingShortcut) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (event.key === 'Escape') {
        setIsCapturingShortcut(false)
        return
      }

      const key = keyFromKeyboardEvent(event)
      if (!key) {
        setShortcutError(t('settings.unsupportedKey'))
        return
      }

      const modifiers: string[] = []
      if (event.metaKey) {
        modifiers.push('CmdOrCtrl')
      }
      if (event.ctrlKey && !modifiers.includes('CmdOrCtrl')) {
        modifiers.push('Ctrl')
      }
      if (event.altKey) {
        modifiers.push('Alt')
      }
      if (event.shiftKey) {
        modifiers.push('Shift')
      }

      const combo = [...modifiers, key].join('+')
      setShortcutDraft(combo)
      setShortcutError(null)
      setIsCapturingShortcut(false)
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
    }
  }, [isCapturingShortcut])

  const sortedLabels = useMemo(
    () => [...settings.labels].sort((a, b) => a.name.localeCompare(b.name, 'fr-FR')),
    [settings.labels],
  )

  const applyShortcut = async () => {
    setShortcutError(null)
    setIsSavingShortcut(true)
    try {
      await onSetGlobalShortcut(shortcutDraft.trim())
    } catch (error) {
      setShortcutError(error instanceof Error ? error.message : t('settings.invalidShortcut'))
    } finally {
      setIsSavingShortcut(false)
    }
  }

  const updateLabel = async (labelId: string, partial: Partial<TodoLabel>) => {
    const nextLabels = settings.labels.map((label) =>
      label.id === labelId ? { ...label, ...partial } : label,
    )
    await onUpdateSettings({ labels: nextLabels })
  }

  const removeLabel = async (labelId: string) => {
    const nextLabels = settings.labels.filter((label) => label.id !== labelId)
    await onUpdateSettings({ labels: nextLabels })
  }

  const addLabel = async () => {
    const newLabel: TodoLabel = {
      id: `label-${Date.now()}`,
      name: t('settings.newLabel'),
      color: 'slate',
    }
    await onUpdateSettings({ labels: [...settings.labels, newLabel] })
  }

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto pr-2">
        <div className="mb-4 flex items-center justify-between">
          <Button type="button" variant="ghost" className="h-7 gap-1 px-2" onClick={onBack}>
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('common.back')}
          </Button>
          <p className="text-sm font-medium">{t('app.settings')}</p>
          <div className="w-7" /> {/* Spacer pour centrer le titre */}
        </div>

        <div className="space-y-5 pb-1">
          {/* Général */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{t('settings.general')}</p>
            </div>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help">{t('settings.autoCloseOnBlur')}</span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>{t('settings.autoCloseOnBlurTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
                <Switch
                  checked={settings.autoCloseOnBlur}
                  onCheckedChange={async (checked) => {
                    await onUpdateSettings({ autoCloseOnBlur: checked })
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help">{t('settings.enableAutostart')}</span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>{t('settings.enableAutostartTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
                <Switch
                  checked={settings.enableAutostart}
                  onCheckedChange={async (checked) => {
                    await onSetAutostartEnabled(checked)
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help">{t('settings.enableSoundEffects')}</span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>{t('settings.enableSoundEffectsTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
                <Switch
                  checked={settings.enableSoundEffects}
                  onCheckedChange={async (checked) => {
                    await onUpdateSettings({ enableSoundEffects: checked })
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help">{t('settings.sortMode')}</span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>{t('settings.sortModeTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
                <Select
                  value={settings.sortMode}
                  onValueChange={async (value) => {
                  await onUpdateSettings({ sortMode: value as typeof settings.sortMode })
                }}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t('settings.sortRecent')}</SelectItem>
                  <SelectItem value="oldest">{t('settings.sortOldest')}</SelectItem>
                  <SelectItem value="title">{t('settings.sortTitle')}</SelectItem>
                  <SelectItem value="dueDate">{t('settings.sortDueDate')}</SelectItem>
                  <SelectItem value="manual">{t('settings.sortManual')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div className="border-t border-border/50" />

        {/* Apparence */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{t('settings.appearance')}</p>
          </div>
          <div className="flex items-center justify-between gap-3 pl-6">
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
        </section>

        <div className="border-t border-border/50" />

        {/* Langue */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{t('settings.language')}</p>
          </div>
          <div className="flex items-center justify-between gap-3 pl-6">
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
        </section>

        <div className="border-t border-border/50" />

        {/* Raccourci global */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium cursor-help">{t('settings.globalShortcut')}</p>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{t('settings.globalShortcutTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2 pl-6">
            <p className="text-xs text-muted-foreground">
              {t('settings.shortcutExample')}: <code className="rounded bg-muted px-1 py-0.5 text-[10px]">Shift+Space</code> {t('common.or')} <code className="rounded bg-muted px-1 py-0.5 text-[10px]">CmdOrCtrl+Shift+T</code>
            </p>
            <div className="flex gap-2">
              <Input
                value={shortcutDraft}
                onChange={(event) => {
                  setShortcutDraft(event.currentTarget.value)
                  setShortcutError(null)
                }}
                className="h-8 text-xs"
                placeholder="Shift+Space"
                aria-label={t('settings.globalShortcut')}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant={isCapturingShortcut ? 'default' : 'outline'}
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      setShortcutError(null)
                    setIsCapturingShortcut((current) => !current)
                  }}
                >
                  {isCapturingShortcut ? t('settings.listening') : t('settings.capture')}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>{t('settings.captureTooltip')}</p>
              </TooltipContent>
            </Tooltip>
            <Button
              type="button"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => {
                void applyShortcut()
              }}
              disabled={isSavingShortcut}
            >
              {t('settings.apply')}
            </Button>
            </div>
            {shortcutError ? <p className="text-xs text-destructive">{shortcutError}</p> : null}
          </div>
        </section>

        <div className="border-t border-border/50" />

        {/* Labels */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-muted-foreground" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-medium cursor-help">{t('settings.labels')}</p>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>{t('settings.labelsTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={addLabel}>
                  <Plus className="h-3.5 w-3.5" />
                  {t('settings.addLabel')}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>{t('settings.addLabelTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2 pl-6">
            {sortedLabels.map((label) => (
              <div key={label.id} className="flex items-center gap-2">
                <span className={cn('inline-flex h-2.5 w-2.5 rounded-full border', colorClasses(label.color))} />
                <Input
                  value={labelDrafts[label.id] ?? label.name}
                  onChange={(event) => {
                    setLabelDrafts((current) => ({
                      ...current,
                      [label.id]: event.currentTarget.value,
                    }))
                  }}
                  onBlur={() => {
                    const draftName = labelDrafts[label.id] ?? label.name
                    const normalizedName = draftName.trim() || label.name
                    if (normalizedName !== label.name) {
                      void updateLabel(label.id, { name: normalizedName })
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      event.currentTarget.blur()
                    }
                  }}
                  className="h-7 flex-1 text-xs"
                  aria-label={`Nom du label ${label.name}`}
                />
                <Select
                  value={label.color}
                  onValueChange={(value) => {
                    void updateLabel(label.id, { color: value as TodoLabel['color'] })
                  }}
                >
                  <SelectTrigger className="h-7 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => {
                    void removeLabel(label.id)
                  }}
                  aria-label={`Supprimer le label ${label.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-border/50" />

        {/* Synchronisation Cloud */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium cursor-help">{t('settings.synchronization')}</p>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{t('settings.synchronizationTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="pl-6">
            <StorageSettings />
          </div>
        </section>

        <div className="border-t border-border/50" />

        {/* Stockage */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium cursor-help">{t('settings.localData')}</p>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{t('settings.localDataTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="pl-6">
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
        </section>

        <div className="border-t border-border/50" />

        {/* Logs */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium cursor-help">{t('settings.logs')}</p>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{t('settings.logsTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="pl-6">
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
        </section>

        <div className="border-t border-border/50" />

        {/* À propos */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{t('settings.about')}</p>
          </div>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground cursor-help">{t('settings.version')}</span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p>{t('settings.versionTooltip')}</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-xs font-mono font-medium">{appVersion}</span>
            </div>
            {lastChecked && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{t('settings.lastCheck')}</span>
                <span className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(lastChecked)}
                </span>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={async () => {
                    await checkForUpdate()
                    
                    // Show feedback toast based on result
                    if (updateState === 'available') {
                      toast({
                        title: t('settings.updateAvailable'),
                        description: t('settings.updateAvailableDesc'),
                      })
                    } else if (updateState === 'error') {
                      toast({
                        title: t('common.error'),
                        description: t('settings.updateError'),
                        variant: 'destructive',
                      })
                    } else {
                      toast({
                        title: t('settings.noUpdate'),
                        description: t('settings.noUpdateDesc'),
                      })
                    }
                  }}
                  disabled={updateState === 'checking'}
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', updateState === 'checking' && 'animate-spin')} />
                  {updateState === 'checking' ? t('settings.checking') : t('settings.checkForUpdates')}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>{t('settings.checkForUpdatesTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </section>

        <div className="border-t border-red-500/30" />

        {/* Danger Zone */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-medium text-red-600">{t('settings.dangerZone')}</p>
          </div>
          <div className="space-y-2 pl-6">
            <p className="text-xs text-muted-foreground">
              {t('settings.dangerZoneWarning')}
            </p>
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
        </section>
      </div>
    </div>
    </TooltipProvider>
  )
}
