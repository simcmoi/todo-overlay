import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Filter, MoreHorizontal, Plus, Printer, Star, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { SettingsMenu } from '@/components/settings-menu'
import { SettingsPage } from '@/components/settings-page'
import { TodoList } from '@/components/todo-list'
import { UpdateBanner } from '@/components/update-banner'
import { Toaster } from '@/components/ui/toaster'
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
import { useUpdateStore } from '@/store/use-update-store'
import { cn } from '@/lib/utils'
import type { SortMode, Todo, TodoPriority } from '@/types/todo'

function compareTodoOrder(
  left: Todo,
  right: Todo,
  sortOrder: 'asc' | 'desc',
): number {
  const leftHasManualOrder = typeof left.sortIndex === 'number'
  const rightHasManualOrder = typeof right.sortIndex === 'number'

  if (leftHasManualOrder && rightHasManualOrder && left.sortIndex !== right.sortIndex) {
    return (left.sortIndex ?? 0) - (right.sortIndex ?? 0)
  }

  if (leftHasManualOrder !== rightHasManualOrder) {
    return leftHasManualOrder ? -1 : 1
  }

  if (sortOrder === 'asc') {
    return left.createdAt - right.createdAt
  }

  return right.createdAt - left.createdAt
}

const PRIORITY_FILTERS: Array<{ id: TodoPriority | 'all'; label: string }> = [
  { id: 'all', label: 'Toutes priorités' },
  { id: 'urgent', label: 'Urgentes' },
  { id: 'high', label: 'Hautes' },
  { id: 'medium', label: 'Moyennes' },
  { id: 'low', label: 'Faibles' },
  { id: 'none', label: 'Sans priorité' },
]

const SORT_MODE_OPTIONS: Array<{ id: SortMode; label: string }> = [
  { id: 'manual', label: 'Manuel (drag & drop)' },
  { id: 'recent', label: 'Récemment ajoutées' },
  { id: 'oldest', label: 'Anciennes d’abord' },
  { id: 'title', label: 'Titre (A-Z)' },
  { id: 'dueDate', label: 'Date limite' },
]

function sortTodos(todos: Todo[], sortMode: SortMode, sortOrder: 'asc' | 'desc'): Todo[] {
  return [...todos].sort((a, b) => {
    const starredDelta = Number(Boolean(b.starred)) - Number(Boolean(a.starred))
    if (starredDelta !== 0) {
      return starredDelta
    }

    switch (sortMode) {
      case 'manual':
        return compareTodoOrder(a, b, sortOrder)
      case 'oldest':
        return a.createdAt - b.createdAt
      case 'title':
        return a.title.localeCompare(b.title, 'fr-FR', { sensitivity: 'base' })
      case 'dueDate': {
        const leftDue = a.reminderAt
        const rightDue = b.reminderAt
        if (typeof leftDue === 'number' && typeof rightDue === 'number') {
          if (leftDue !== rightDue) {
            return leftDue - rightDue
          }
          return b.createdAt - a.createdAt
        }
        if (typeof leftDue === 'number') {
          return -1
        }
        if (typeof rightDue === 'number') {
          return 1
        }
        return b.createdAt - a.createdAt
      }
      case 'recent':
      default:
        return b.createdAt - a.createdAt
    }
  })
}

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const listNameInputRef = useRef<HTMLInputElement>(null)
  const [renamingListId, setRenamingListId] = useState<string | null>(null)
  const [listNameDraft, setListNameDraft] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'all'>('all')
  const [labelFilterId, setLabelFilterId] = useState<string | 'all'>('all')
  const [settingsPageOpen, setSettingsPageOpen] = useState(false)

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
    clearCompletedInList,
    moveTodoToList,
    reorderTodos,
    renameList,
    setActiveList,
    setTodoCompleted,
    setTodoLabel,
    setTodoPriority,
    setTodoStarred,
    setGlobalShortcut,
    setAutostartEnabled,
    updateSettings,
    updateTodo,
  } = useTodoStore()

  const { checkForUpdate } = useUpdateStore()

  useWindowBehavior(settings.autoCloseOnBlur, inputRef)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  // Vérifier les mises à jour au démarrage
  useEffect(() => {
    if (hydrated) {
      void checkForUpdate()
    }
  }, [hydrated, checkForUpdate])

  // Vérifier les mises à jour périodiquement (toutes les 24h)
  useEffect(() => {
    if (!hydrated) return

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
    const interval = setInterval(() => {
      void checkForUpdate()
    }, TWENTY_FOUR_HOURS)

    return () => clearInterval(interval)
  }, [hydrated, checkForUpdate])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    if (settings.themeMode === 'light') {
      root.classList.add('theme-light')
    }
    if (settings.themeMode === 'dark') {
      root.classList.add('theme-dark')
    }
  }, [settings.themeMode])

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
    () => sortTodos(listScopedTodos, settings.sortMode, settings.sortOrder),
    [listScopedTodos, settings.sortMode, settings.sortOrder],
  )

  const effectiveLabelFilterId = useMemo(
    () =>
      labelFilterId !== 'all' && !settings.labels.some((label) => label.id === labelFilterId)
        ? 'all'
        : labelFilterId,
    [labelFilterId, settings.labels],
  )

  const visibleTodos = useMemo(
    () =>
      sortedTodos
        .filter((todo) => (favoritesOnly ? todo.starred : true))
        .filter((todo) =>
          priorityFilter === 'all' ? true : (todo.priority ?? 'none') === priorityFilter,
        )
        .filter((todo) =>
          effectiveLabelFilterId === 'all' ? true : todo.labelId === effectiveLabelFilterId,
        ),
    [effectiveLabelFilterId, favoritesOnly, priorityFilter, sortedTodos],
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

  const selectedSortModeLabel = useMemo(
    () => SORT_MODE_OPTIONS.find((option) => option.id === settings.sortMode)?.label ?? 'Récemment ajoutées',
    [settings.sortMode],
  )

  const printCurrentList = () => {
    if (!activeList) {
      return
    }

    const popup = window.open('', '_blank', 'width=900,height=700')
    if (!popup) {
      return
    }

    const escapeHtml = (value: string): string =>
      value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')

    const printableActive = sortedTodos.filter((todo) => typeof todo.completedAt !== 'number')
    const printableCompleted = sortedTodos.filter((todo) => typeof todo.completedAt === 'number')

    const activeRows = printableActive
      .map((todo) => `<li>${escapeHtml(todo.title)}</li>`)
      .join('')
    const completedRows = printableCompleted
      .map((todo) => `<li style="color:#666;text-decoration:line-through">${escapeHtml(todo.title)}</li>`)
      .join('')

    popup.document.write(`
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHtml(activeList.name)}</title>
          <style>
            body { font-family: Inter, -apple-system, sans-serif; margin: 24px; color: #111; }
            h1 { font-size: 20px; margin: 0 0 12px; }
            h2 { font-size: 14px; margin: 18px 0 8px; color: #444; }
            ul { margin: 0; padding-left: 20px; }
            li { margin: 4px 0; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(activeList.name)}</h1>
          <h2>Tâches actives</h2>
          <ul>${activeRows || '<li>Aucune tâche active</li>'}</ul>
          <h2>Tâches terminées</h2>
          <ul>${completedRows || '<li>Aucune tâche terminée</li>'}</ul>
        </body>
      </html>
    `)
    popup.document.close()
    popup.focus()
    popup.print()
    popup.close()
  }

  const selectedPriorityFilterLabel = useMemo(
    () => PRIORITY_FILTERS.find((option) => option.id === priorityFilter)?.label ?? 'Toutes priorités',
    [priorityFilter],
  )

  const selectedLabelFilterName = useMemo(() => {
    if (effectiveLabelFilterId === 'all') {
      return 'Tous les labels'
    }
    return settings.labels.find((label) => label.id === effectiveLabelFilterId)?.name ?? 'Tous les labels'
  }, [effectiveLabelFilterId, settings.labels])

  const canReorder =
    !settingsPageOpen &&
    settings.sortMode === 'manual' &&
    !favoritesOnly &&
    priorityFilter === 'all' &&
    effectiveLabelFilterId === 'all'

  return (
    <main className="h-screen w-screen bg-transparent p-1 text-foreground">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12 }}
        className="mx-auto flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card px-3 pb-3 pt-2"
      >
        <UpdateBanner />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label="Paramètres de la liste"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Paramètres de la liste</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SORT_MODE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    className="flex items-center justify-between gap-2"
                    onSelect={() => {
                      void updateSettings({ sortMode: option.id })
                    }}
                  >
                    <span>{option.label}</span>
                    {settings.sortMode === option.id ? <Check className="h-3.5 w-3.5" /> : null}
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
                <DropdownMenuItem
                  onSelect={() => {
                    printCurrentList()
                  }}
                >
                  <Printer className="mr-2 h-3.5 w-3.5" />
                  Imprimer la liste
                </DropdownMenuItem>
                {activeList ? (
                  <DropdownMenuItem
                    onSelect={() => {
                      void clearCompletedInList(activeList.id)
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Supprimer les tâches terminées
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SettingsMenu
            settings={settings}
            onAutoCloseChange={async (autoCloseOnBlur) => {
              await updateSettings({ autoCloseOnBlur })
            }}
            onOpenSettingsPage={() => {
              setSettingsPageOpen(true)
            }}
          />
        </div>

        {!settingsPageOpen ? (
          <div className="mb-2 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                  <Filter className="h-3.5 w-3.5" />
                  {selectedPriorityFilterLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {PRIORITY_FILTERS.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    className={cn(option.id === priorityFilter ? 'font-medium' : undefined)}
                    onSelect={() => {
                      setPriorityFilter(option.id)
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                  {selectedLabelFilterName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem
                  className={cn(effectiveLabelFilterId === 'all' ? 'font-medium' : undefined)}
                  onSelect={() => {
                    setLabelFilterId('all')
                  }}
                >
                  Tous les labels
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {settings.labels.map((label) => (
                  <DropdownMenuItem
                    key={label.id}
                    className={cn(effectiveLabelFilterId === label.id ? 'font-medium' : undefined)}
                    onSelect={() => {
                      setLabelFilterId(label.id)
                    }}
                  >
                    {label.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(favoritesOnly || priorityFilter !== 'all' || effectiveLabelFilterId !== 'all') ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setFavoritesOnly(false)
                  setPriorityFilter('all')
                  setLabelFilterId('all')
                }}
              >
                Réinitialiser
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="min-h-0 flex-1">
          {loading && !hydrated ? (
            <div className="flex h-full items-center justify-center rounded-md border border-border text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : (
            settingsPageOpen ? (
              <SettingsPage
                settings={settings}
                onBack={() => {
                  setSettingsPageOpen(false)
                }}
                onUpdateSettings={async (partial) => {
                  await updateSettings(partial)
                }}
                onSetGlobalShortcut={async (shortcut) => {
                  await setGlobalShortcut(shortcut)
                }}
                onSetAutostartEnabled={async (enabled) => {
                  await setAutostartEnabled(enabled)
                }}
              />
            ) : (
              <TodoList
                composeInputRef={inputRef}
                activeListId={activeList?.id ?? settings.activeListId}
                canReorder={canReorder}
                lists={settings.lists}
                labels={settings.labels}
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
                onSetPriority={async (id, priority) => {
                  await setTodoPriority(id, priority)
                }}
                onSetLabel={async (id, labelId) => {
                  await setTodoLabel(id, labelId)
                }}
                onDelete={async (id) => {
                  await deleteTodo(id)
                }}
                onMoveToList={async (id, listId) => {
                  await moveTodoToList(id, listId)
                }}
                onReorder={async (payload) => {
                  await reorderTodos(payload)
                }}
                onDeleteCompleted={async (id) => {
                  await deleteTodo(id)
                }}
                emptyLabel="Aucune tâche active"
              />
            )
          )}
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          {error ? `Erreur: ${error}` : `${settings.globalShortcut} pour afficher/masquer · Tri: ${selectedSortModeLabel}`}
        </p>
      </motion.section>
      <Toaster />
    </main>
  )
}
