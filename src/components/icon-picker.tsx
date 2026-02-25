import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Home,
  Briefcase,
  ShoppingCart,
  Heart,
  Star,
  BookOpen,
  Code,
  Coffee,
  Palette,
  Music,
  Camera,
  Plane,
  Gift,
  Target,
  Zap,
  Trophy,
  Rocket,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  type LucideIcon,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const ICONS: Array<{ name: string; Icon: LucideIcon; labelFr: string; labelEn: string }> = [
  { name: 'home', Icon: Home, labelFr: 'maison accueil', labelEn: 'home house' },
  { name: 'briefcase', Icon: Briefcase, labelFr: 'travail mallette bureau', labelEn: 'briefcase work office' },
  { name: 'shopping-cart', Icon: ShoppingCart, labelFr: 'panier courses achats shopping', labelEn: 'shopping cart basket' },
  { name: 'heart', Icon: Heart, labelFr: 'coeur amour favori', labelEn: 'heart love favorite' },
  { name: 'star', Icon: Star, labelFr: 'étoile favori important', labelEn: 'star favorite important' },
  { name: 'book-open', Icon: BookOpen, labelFr: 'livre lecture étude', labelEn: 'book reading study' },
  { name: 'code', Icon: Code, labelFr: 'code programmation dev', labelEn: 'code programming dev' },
  { name: 'coffee', Icon: Coffee, labelFr: 'café pause', labelEn: 'coffee break' },
  { name: 'palette', Icon: Palette, labelFr: 'palette art créatif design', labelEn: 'palette art creative design' },
  { name: 'music', Icon: Music, labelFr: 'musique audio', labelEn: 'music audio' },
  { name: 'camera', Icon: Camera, labelFr: 'caméra photo', labelEn: 'camera photo' },
  { name: 'plane', Icon: Plane, labelFr: 'avion voyage', labelEn: 'plane travel flight' },
  { name: 'gift', Icon: Gift, labelFr: 'cadeau', labelEn: 'gift present' },
  { name: 'target', Icon: Target, labelFr: 'cible objectif but', labelEn: 'target goal objective' },
  { name: 'zap', Icon: Zap, labelFr: 'éclair rapide énergie', labelEn: 'zap lightning energy fast' },
  { name: 'trophy', Icon: Trophy, labelFr: 'trophée victoire succès', labelEn: 'trophy victory success' },
  { name: 'rocket', Icon: Rocket, labelFr: 'fusée lancement startup', labelEn: 'rocket launch startup' },
  { name: 'sun', Icon: Sun, labelFr: 'soleil jour lumière', labelEn: 'sun day light' },
  { name: 'moon', Icon: Moon, labelFr: 'lune nuit', labelEn: 'moon night' },
  { name: 'cloud', Icon: Cloud, labelFr: 'nuage météo', labelEn: 'cloud weather' },
  { name: 'umbrella', Icon: Umbrella, labelFr: 'parapluie pluie', labelEn: 'umbrella rain' },
]

export function getIconComponent(iconName?: string): LucideIcon {
  const found = ICONS.find((icon) => icon.name === iconName)
  return found?.Icon ?? Home
}

type IconPickerProps = {
  value?: string
  onValueChange: (iconName: string) => void
}

export function IconPicker({ value, onValueChange }: IconPickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const SelectedIcon = getIconComponent(value)

  // Filtrer les icônes en fonction de la recherche (FR + EN)
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return ICONS
    }
    const query = searchQuery.toLowerCase().trim()
    return ICONS.filter(
      ({ name, labelFr, labelEn }) =>
        name.toLowerCase().includes(query) ||
        labelFr.toLowerCase().includes(query) ||
        labelEn.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <Popover open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        setSearchQuery('') // Reset search when closing
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
          }}
          onMouseDown={(e) => {
            e.preventDefault()
          }}
        >
          <SelectedIcon className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-2 bg-background border-border" 
        align="start" 
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          // Focus le champ de recherche après ouverture
          const target = e.currentTarget as HTMLElement | null
          const input = target?.querySelector('input')
          input?.focus()
        }}
      >
        <div className="space-y-2">
          <Input
            type="text"
            placeholder={t('icons.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="grid grid-cols-6 gap-1 max-h-[240px] overflow-y-auto">
            {filteredIcons.length > 0 ? (
              filteredIcons.map(({ name, Icon }) => (
                <Button
                  key={name}
                  type="button"
                  variant={value === name ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    'h-9 w-9',
                    value === name && 'ring-2 ring-ring'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onValueChange(name)
                    setOpen(false)
                  }}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))
            ) : (
              <div className="col-span-6 py-6 text-center text-xs text-muted-foreground">
                {t('icons.noIconsFound')}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
