import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { SettingsMenu } from '@/components/settings-menu'
import { TodoList } from '@/components/todo-list'
import { Input } from '@/components/ui/input'
import { useWindowBehavior } from '@/hooks/use-window-behavior'
import { useTodoStore } from '@/store/use-todo-store'
import type { Todo } from '@/types/todo'

function sortTodos(todos: Todo[], sortOrder: 'asc' | 'desc'): Todo[] {
  return [...todos].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.createdAt - b.createdAt
    }
    return b.createdAt - a.createdAt
  })
}

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const listNameInputRef = useRef<HTMLInputElement>(null)

  const {
    hydrated,
    loading,
    error,
    todos,
    settings,
    hydrate,
    createTodo,
    deleteTodo,
    setTodoCompleted,
    updateSettings,
    updateTodo,
  } = useTodoStore()

  useWindowBehavior(settings.autoCloseOnBlur, inputRef)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const sortedTodos = useMemo(
    () => sortTodos(todos, settings.sortOrder),
    [settings.sortOrder, todos],
  )

  const activeTodos = useMemo(
    () => sortedTodos.filter((todo) => typeof todo.completedAt !== 'number'),
    [sortedTodos],
  )

  const completedTodos = useMemo(
    () => sortedTodos.filter((todo) => typeof todo.completedAt === 'number'),
    [sortedTodos],
  )

  const persistListName = async (value: string) => {
    const normalizedName = value.trim() || 'Mes tâches'
    if (listNameInputRef.current) {
      listNameInputRef.current.value = normalizedName
    }

    if (normalizedName !== settings.listName) {
      await updateSettings({ listName: normalizedName })
    }
  }

  return (
    <main className="h-screen w-screen bg-transparent p-1 text-foreground">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12 }}
        className="mx-auto flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card px-3 pb-3 pt-2"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <img src="/app-icon.png" alt="ToDo Overlay" className="h-4 w-4 rounded-sm" />
            <Input
              key={settings.listName}
              ref={listNameInputRef}
              defaultValue={settings.listName}
              onBlur={(event) => {
                void persistListName(event.currentTarget.value)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  event.currentTarget.blur()
                }
              }}
              className="h-7 max-w-[220px] border-none bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-0"
              aria-label="Nom de la liste"
              placeholder="Nom de la liste"
            />
          </div>
          <SettingsMenu
            settings={settings}
            onSortOrderChange={async (sortOrder) => {
              await updateSettings({ sortOrder })
            }}
            onAutoCloseChange={async (autoCloseOnBlur) => {
              await updateSettings({ autoCloseOnBlur })
            }}
          />
        </div>

        <div className="min-h-0 flex-1">
          {loading && !hydrated ? (
            <div className="flex h-full items-center justify-center rounded-md border border-border text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : (
            <TodoList
              composeInputRef={inputRef}
              activeTodos={activeTodos}
              completedTodos={completedTodos}
              onCreate={async (payload) => {
                await createTodo(payload)
              }}
              onUpdate={async (payload) => {
                await updateTodo(payload)
              }}
              onSetCompleted={async (id, completed) => {
                await setTodoCompleted(id, completed)
              }}
              onDeleteCompleted={async (id) => {
                await deleteTodo(id)
              }}
              emptyLabel="Aucune tâche active"
            />
          )}
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          {error ? `Erreur: ${error}` : 'Shift + Space pour afficher/masquer'}
        </p>
      </motion.section>
    </main>
  )
}
