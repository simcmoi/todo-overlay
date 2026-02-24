import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Plus, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { SettingsMenu } from '@/components/settings-menu'
import { TodoList } from '@/components/todo-list'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useWindowBehavior } from '@/hooks/use-window-behavior'
import { useTodoStore } from '@/store/use-todo-store'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types/todo'

function sortTodos(todos: Todo[], sortOrder: 'asc' | 'desc'): Todo[] {
  return [...todos].sort((a, b) => {
    const starredDelta = Number(Boolean(b.starred)) - Number(Boolean(a.starred))
    if (starredDelta !== 0) {
      return starredDelta
    }

    if (sortOrder === 'asc') {
      return a.createdAt - b.createdAt
    }
    return b.createdAt - a.createdAt
  })
}

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const listNameInputRef = useRef<HTMLInputElement>(null)
  const [renamingListId, setRenamingListId] = useState<string | null>(null)
  const [listNameDraft, setListNameDraft] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const {
    hydrated,
    loading,
    error,
    todos,
    settings,
    hydrate,
    createTodo,
    createList,
    deleteTodo,
    renameList,
    setActiveList,
    setTodoCompleted,
    setTodoStarred,
    updateSettings,
    updateTodo,
  } = useTodoStore()

  useWindowBehavior(settings.autoCloseOnBlur, inputRef)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const activeList = useMemo(() => {
    if (settings.lists.length === 0) {
      return undefined
    }
    return settings.lists.find((list) => list.id === settings.activeListId) ?? settings.lists[0]
  }, [settings.activeListId, settings.lists])

  const listScopedTodos = useMemo(() => {
    if (!activeList) {
      return [] as Todo[]
    }
    return todos.filter((todo) => (todo.listId ?? activeList.id) === activeList.id)
  }, [activeList, todos])

  const sortedTodos = useMemo(
    () => sortTodos(listScopedTodos, settings.sortOrder),
    [listScopedTodos, settings.sortOrder],
  )

  const visibleTodos = useMemo(
    () => (favoritesOnly ? sortedTodos.filter((todo) => todo.starred) : sortedTodos),
    [favoritesOnly, sortedTodos],
  )

  const activeTodos = useMemo(
    () => visibleTodos.filter((todo) => typeof todo.completedAt !== 'number'),
    [visibleTodos],
  )

  const completedTodos = useMemo(
    () => visibleTodos.filter((todo) => typeof todo.completedAt === 'number'),
    [visibleTodos],
  )

  const persistListRename = async () => {
    if (!activeList || renamingListId !== activeList.id) {
      setRenamingListId(null)
      return
    }

    const normalizedName = listNameDraft.trim() || 'Nouvelle liste'
    if (listNameInputRef.current) {
      listNameInputRef.current.value = normalizedName
    }

    if (normalizedName !== activeList.name) {
      await renameList(activeList.id, normalizedName)
    }

    setRenamingListId(null)
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
            {activeList && renamingListId === activeList.id ? (
              <Input
                ref={listNameInputRef}
                value={listNameDraft}
                onChange={(event) => {
                  setListNameDraft(event.currentTarget.value)
                }}
                onBlur={() => {
                  void persistListRename()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    event.currentTarget.blur()
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setRenamingListId(null)
                  }
                }}
                className="h-7 max-w-[220px] border-none bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-0"
                aria-label="Renommer la liste"
                placeholder="Nom de la liste"
                autoFocus
              />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-7 max-w-[220px] justify-start gap-1 px-1 text-sm font-medium"
                  >
                    <span className="truncate">{activeList?.name ?? 'Mes tâches'}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Listes</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {settings.lists.map((list) => (
                    <DropdownMenuItem
                      key={list.id}
                      onSelect={() => {
                        void setActiveList(list.id)
                      }}
                      className={cn(list.id === activeList?.id ? 'font-medium' : undefined)}
                    >
                      {list.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  {activeList ? (
                    <DropdownMenuItem
                      onSelect={() => {
                        setRenamingListId(activeList.id)
                        setListNameDraft(activeList.name)
                      }}
                    >
                      Renommer la liste
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await createList('Nouvelle liste')
              }}
              aria-label="Ajouter une liste"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setFavoritesOnly((current) => !current)
              }}
              aria-label={favoritesOnly ? 'Afficher toutes les tâches' : 'Afficher uniquement les favoris'}
            >
              <Star className={cn('h-3.5 w-3.5', favoritesOnly ? 'fill-foreground text-foreground' : undefined)} />
            </Button>
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
                await createTodo({
                  ...payload,
                  listId: activeList?.id,
                })
              }}
              onUpdate={async (payload) => {
                await updateTodo(payload)
              }}
              onSetCompleted={async (id, completed) => {
                await setTodoCompleted(id, completed)
              }}
              onSetStarred={async (id, starred) => {
                await setTodoStarred(id, starred)
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
