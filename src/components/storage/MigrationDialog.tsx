import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useTodoStore } from '@/store/use-todo-store'
import {
  createTodo as createTodoCommand,
  updateSettings as updateSettingsCommand,
  setTodoCompleted,
  setTodoStarred,
  setTodoPriority,
  setTodoLabel,
} from '@/lib/tauri'

type MigrationDirection = 'local-to-cloud' | 'cloud-to-local'

interface MigrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  direction: MigrationDirection
}

export function MigrationDialog({ open, onOpenChange, direction }: MigrationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const { todos, settings, storageProvider } = useTodoStore()

  const isLocalToCloud = direction === 'local-to-cloud'

  const handleMigration = async () => {
    if (!storageProvider) {
      setError('Storage provider not initialized')
      setStatus('error')
      return
    }

    setIsLoading(true)
    setStatus('migrating')
    setError(null)
    setProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      if (isLocalToCloud) {
        // Export local data to cloud
        setProgress(20)
        await storageProvider.save({ todos, settings })
        setProgress(90)
      } else {
        // Import cloud data to local
        // Load data from cloud first
        setProgress(10)
        const cloudData = await storageProvider.load()
        setProgress(30)
        
        // Update settings first (includes lists and labels)
        await updateSettingsCommand(cloudData.settings)
        setProgress(50)
        
        // Create each todo in local storage
        const totalTodos = cloudData.todos.length
        if (totalTodos > 0) {
          for (let i = 0; i < totalTodos; i++) {
            const todo = cloudData.todos[i]
            
            // Create the todo
            const result = await createTodoCommand(
              todo.title,
              todo.details,
              todo.reminderAt,
              todo.parentId,
              todo.listId
            )
            
            // Get the newly created todo ID (last todo in the result)
            const createdTodo = result.todos[result.todos.length - 1]
            if (createdTodo) {
              // Set additional properties
              if (todo.completedAt) {
                await setTodoCompleted(createdTodo.id, true)
              }
              if (todo.starred) {
                await setTodoStarred(createdTodo.id, true)
              }
              if (todo.priority && todo.priority !== 'none') {
                await setTodoPriority(createdTodo.id, todo.priority)
              }
              if (todo.labelId) {
                await setTodoLabel(createdTodo.id, todo.labelId)
              }
            }
            
            // Update progress based on todos created
            setProgress(50 + Math.floor((i / totalTodos) * 40))
          }
        }
        setProgress(90)
      }

      clearInterval(progressInterval)
      setProgress(100)
      setStatus('success')

      // Close dialog after success
      setTimeout(() => {
        onOpenChange(false)
        setStatus('idle')
        setProgress(0)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed')
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    if (isLocalToCloud) {
      return 'Migrer vers le cloud'
    }
    return 'Migrer vers le local'
  }

  const getDescription = () => {
    if (isLocalToCloud) {
      return (
        <>
          Cette action va copier toutes vos données locales (tâches, listes, labels) vers votre
          compte cloud.
          <br />
          <br />
          Les données existantes dans le cloud seront remplacées.
        </>
      )
    }
    return (
      <>
        Cette action va copier toutes vos données cloud vers le stockage local de cet appareil.
        <br />
        <br />
        Les données existantes en local seront remplacées.
      </>
    )
  }

  const getIcon = () => {
    if (status === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    if (status === 'error') {
      return <AlertCircle className="h-5 w-5 text-destructive" />
    }
    if (status === 'migrating') {
      return <Loader2 className="h-5 w-5 animate-spin" />
    }
    return isLocalToCloud ? (
      <Upload className="h-5 w-5 text-muted-foreground" />
    ) : (
      <Download className="h-5 w-5 text-muted-foreground" />
    )
  }

  const getStats = () => {
    const todoCount = todos.length
    const listCount = settings.lists.length
    const labelCount = settings.labels.length

    return (
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{todoCount} tâches</span>
        <span>{listCount} listes</span>
        <span>{labelCount} labels</span>
      </div>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {getIcon()}
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4">
            <p>{getDescription()}</p>

            {status === 'idle' && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Données à migrer :</p>
                {getStats()}
              </div>
            )}

            {status === 'migrating' && (
              <div className="space-y-2">
                <p className="text-sm">Migration en cours...</p>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {status === 'success' && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Migration réussie !</AlertDescription>
              </Alert>
            )}

            {status === 'error' && error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {status === 'idle' && (
            <>
              <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button onClick={handleMigration} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Migrer les données
                </Button>
              </AlertDialogAction>
            </>
          )}
          {(status === 'success' || status === 'error') && (
            <Button onClick={() => onOpenChange(false)}>Fermer</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
