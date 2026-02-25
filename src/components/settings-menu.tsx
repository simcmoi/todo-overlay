import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import type { Settings as SettingsType } from '@/types/todo'

type SettingsMenuProps = {
  settings: SettingsType
  onAutoCloseChange: (enabled: boolean) => Promise<void>
  onOpenSettingsPage: () => void
}

export function SettingsMenu({
  settings,
  onAutoCloseChange,
  onOpenSettingsPage,
}: SettingsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu paramètres">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Paramètres</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
          }}
          className="flex items-center justify-between gap-2"
        >
          <span>Fermer si perte de focus</span>
          <Switch
            checked={settings.autoCloseOnBlur}
            onCheckedChange={async (checked) => {
              await onAutoCloseChange(checked)
            }}
            aria-label="Activer fermeture au blur"
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            onOpenSettingsPage()
          }}
        >
          Ouvrir la page paramètres
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
