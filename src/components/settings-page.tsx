import { AlertTriangle, Cloud, FileText, Info, Keyboard, Languages, Palette, SlidersHorizontal, Tags } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Settings } from '@/types/todo'
import { GeneralSettings } from './settings/general-settings'
import { AppearanceSettings } from './settings/appearance-settings'
import { LanguageSettings } from './settings/language-settings'
import { ShortcutsSettings } from './settings/shortcuts-settings'
import { LabelsSettings } from './settings/labels-settings'
import { SyncSettings } from './settings/sync-settings'
import { DataSettings } from './settings/data-settings'
import { AboutSettings } from './settings/about-settings'
import { DangerSettings } from './settings/danger-settings'

type SettingsPageProps = {
  settings: Settings
  onUpdateSettings: (partial: Partial<Settings>) => Promise<void>
  onSetGlobalShortcut: (shortcut: string) => Promise<void>
  onSetAutostartEnabled: (enabled: boolean) => Promise<void>
}

type SettingsSection = 'general' | 'appearance' | 'language' | 'shortcuts' | 'labels' | 'sync' | 'data' | 'about' | 'danger'

export function SettingsPage({
  settings,
  onUpdateSettings,
  onSetGlobalShortcut,
  onSetAutostartEnabled,
}: SettingsPageProps) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')

  const sections = [
    { id: 'general' as const, label: t('settings.general'), icon: SlidersHorizontal },
    { id: 'appearance' as const, label: t('settings.appearance'), icon: Palette },
    { id: 'language' as const, label: t('settings.language'), icon: Languages },
    { id: 'shortcuts' as const, label: t('settings.globalShortcut'), icon: Keyboard },
    { id: 'labels' as const, label: t('settings.labels'), icon: Tags },
    { id: 'sync' as const, label: t('settings.synchronization'), icon: Cloud },
    { id: 'data' as const, label: t('settings.localData'), icon: FileText },
    { id: 'about' as const, label: t('settings.about'), icon: Info },
    { id: 'danger' as const, label: t('settings.dangerZone'), icon: AlertTriangle },
  ]

  function renderContent() {
    switch (activeSection) {
      case 'general':
        return (
          <GeneralSettings
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onSetAutostartEnabled={onSetAutostartEnabled}
          />
        )
      case 'appearance':
        return (
          <AppearanceSettings
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        )
      case 'language':
        return (
          <LanguageSettings
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        )
      case 'shortcuts':
        return (
          <ShortcutsSettings
            settings={settings}
            onSetGlobalShortcut={onSetGlobalShortcut}
          />
        )
      case 'labels':
        return (
          <LabelsSettings
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        )
      case 'sync':
        return <SyncSettings />
      case 'data':
        return <DataSettings />
      case 'about':
        return <AboutSettings />
      case 'danger':
        return <DangerSettings />
      default:
        return null
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-48 border-r border-border bg-muted/30 flex flex-col">
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-2">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                const isDanger = section.id === 'danger'
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors',
                      isActive && !isDanger && 'bg-primary/10 text-primary font-medium',
                      isActive && isDanger && 'bg-red-500/10 text-red-600 font-medium',
                      !isActive && !isDanger && 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      !isActive && isDanger && 'text-red-600/70 hover:bg-red-500/5 hover:text-red-600'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </TooltipProvider>
  )
}
