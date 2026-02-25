import { ArrowLeft, Keyboard, Palette, Plus, SlidersHorizontal, Tags, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { Settings, ThemeMode, TodoLabel } from '@/types/todo'

type SettingsPageProps = {
  settings: Settings
  onBack: () => void
  onUpdateSettings: (partial: Partial<Settings>) => Promise<void>
  onSetGlobalShortcut: (shortcut: string) => Promise<void>
  onSetAutostartEnabled: (enabled: boolean) => Promise<void>
}

const COLOR_OPTIONS: Array<{ value: TodoLabel['color']; label: string }> = [
  { value: 'slate', label: 'Ardoise' },
  { value: 'blue', label: 'Bleu' },
  { value: 'green', label: 'Vert' },
  { value: 'amber', label: 'Orange' },
  { value: 'rose', label: 'Rose' },
  { value: 'violet', label: 'Violet' },
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
  const [shortcutDraft, setShortcutDraft] = useState(settings.globalShortcut)
  const [shortcutError, setShortcutError] = useState<string | null>(null)
  const [isCapturingShortcut, setIsCapturingShortcut] = useState(false)
  const [isSavingShortcut, setIsSavingShortcut] = useState(false)
  const [labelDrafts, setLabelDrafts] = useState<Record<string, string>>({})

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
        setShortcutError('Touche non supportée pour un raccourci global')
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
      setShortcutError(error instanceof Error ? error.message : 'Raccourci invalide')
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
      name: 'Nouveau label',
      color: 'slate',
    }
    await onUpdateSettings({ labels: [...settings.labels, newLabel] })
  }

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="mb-3 flex items-center justify-between">
        <Button type="button" variant="ghost" className="h-7 gap-1 px-2" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </Button>
        <p className="text-sm font-medium">Paramètres</p>
      </div>

      <div className="space-y-4 pb-1">
        <section className="rounded-lg border border-border bg-card/70 p-3">
          <div className="mb-2 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Général</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Fermer si perte de focus</span>
              <Switch
                checked={settings.autoCloseOnBlur}
                onCheckedChange={async (checked) => {
                  await onUpdateSettings({ autoCloseOnBlur: checked })
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Démarrer au lancement du système</span>
              <Switch
                checked={settings.enableAutostart}
                onCheckedChange={async (checked) => {
                  await onSetAutostartEnabled(checked)
                }}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tri par défaut</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={settings.sortMode === 'recent' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={async () => {
                    await onUpdateSettings({ sortMode: 'recent' })
                  }}
                >
                  Récentes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={settings.sortMode === 'oldest' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={async () => {
                    await onUpdateSettings({ sortMode: 'oldest' })
                  }}
                >
                  Anciennes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={settings.sortMode === 'title' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={async () => {
                    await onUpdateSettings({ sortMode: 'title' })
                  }}
                >
                  Titre
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={settings.sortMode === 'dueDate' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={async () => {
                    await onUpdateSettings({ sortMode: 'dueDate' })
                  }}
                >
                  Date limite
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={settings.sortMode === 'manual' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={async () => {
                    await onUpdateSettings({ sortMode: 'manual' })
                  }}
                >
                  Manuel
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card/70 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Apparence</p>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">Thème</p>
          <div className="flex gap-2">
            {([
              ['system', 'Système'],
              ['light', 'Clair'],
              ['dark', 'Sombre'],
            ] as const).map(([mode, label]) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={settings.themeMode === mode ? 'default' : 'outline'}
                className="h-7 px-2 text-xs"
                onClick={async () => {
                  await onUpdateSettings({ themeMode: mode as ThemeMode })
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card/70 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Raccourci global</p>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            Exemple: <code>Shift+Space</code> ou <code>CmdOrCtrl+Shift+T</code>
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
              aria-label="Raccourci global"
            />
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
              {isCapturingShortcut ? 'Écoute…' : 'Capturer'}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => {
                void applyShortcut()
              }}
              disabled={isSavingShortcut}
            >
              Appliquer
            </Button>
          </div>
          {shortcutError ? <p className="mt-2 text-xs text-destructive">{shortcutError}</p> : null}
        </section>

        <section className="rounded-lg border border-border bg-card/70 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Labels</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={addLabel}>
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
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
                  className="h-7 text-xs"
                  aria-label={`Nom du label ${label.name}`}
                />
                <select
                  value={label.color}
                  onChange={(event) => {
                    void updateLabel(label.id, { color: event.currentTarget.value as TodoLabel['color'] })
                  }}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none"
                  aria-label={`Couleur du label ${label.name}`}
                >
                  {COLOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
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
      </div>
    </div>
  )
}
