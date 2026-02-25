import { Badge } from '@/components/ui/badge'
import { useTodoStore } from '@/store/use-todo-store'
import { Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react'
import type { SyncStatus } from '@/lib/storage'

export function SyncStatusIndicator() {
  const { syncStatus, storageMode } = useTodoStore()

  if (storageMode === 'local') {
    return (
      <Badge variant="outline" className="gap-1.5">
        <HardDrive className="h-3 w-3" />
        <span>Local</span>
      </Badge>
    )
  }

  const statusConfig: Record<
    SyncStatus,
    { icon: React.ReactNode; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    idle: {
      icon: <Cloud className="h-3 w-3" />,
      label: 'Cloud',
      variant: 'outline',
    },
    syncing: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: 'Synchronisation...',
      variant: 'secondary',
    },
    synced: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: 'Synchronisé',
      variant: 'default',
    },
    error: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: 'Erreur de sync',
      variant: 'destructive',
    },
    offline: {
      icon: <CloudOff className="h-3 w-3" />,
      label: 'Hors ligne',
      variant: 'destructive',
    },
  }

  const config = statusConfig[syncStatus]

  return (
    <Badge variant={config.variant} className="gap-1.5">
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  )
}
