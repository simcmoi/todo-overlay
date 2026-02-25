import { useTranslation } from 'react-i18next'
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
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Todo } from '@/types/todo'

type HistoryViewProps = {
  todos: Todo[]
  onClearHistory: () => Promise<void>
}

export function HistoryView({ todos, onClearHistory }: HistoryViewProps) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={todos.length === 0}>
              {t('history.clearHistory')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('history.deleteAllTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('history.deleteAllDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await onClearHistory()
                }}
              >
                {t('common.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {todos.length === 0 ? (
        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Historique vide
        </div>
      ) : (
        <ScrollArea className="h-full rounded-md border border-border">
          <ul className="space-y-1 p-2">
            {todos.map((todo) => (
              <li key={todo.id} className="rounded-md px-2 py-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-foreground text-[10px] text-foreground">
                    ✓
                  </span>
                  <span className="line-through">{todo.title}</span>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  )
}
