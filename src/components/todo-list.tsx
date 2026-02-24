import { type FocusEvent, type MutableRefObject, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, ChevronDown, ChevronRight, Ellipsis, FileText, Plus, Star } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types/todo'

type TodoListProps = {
  composeInputRef: MutableRefObject<HTMLInputElement | null>
  activeTodos: Todo[]
  completedTodos: Todo[]
  onCreate: (payload: {
    title: string
    details?: string
    reminderAt?: number
    parentId?: string
  }) => Promise<void>
  onUpdate: (payload: {
    id: string
    title: string
    details?: string
    reminderAt?: number
  }) => Promise<void>
  onSetCompleted: (id: string, completed: boolean) => Promise<void>
  onSetStarred: (id: string, starred: boolean) => Promise<void>
  onDeleteCompleted: (id: string) => Promise<void>
  emptyLabel: string
}

type DateEditMode = 'date' | 'datetime' | null

type TodoDraft = {
  title: string
  details: string
  reminderAt?: number
}

type TodoWithDepth = {
  todo: Todo
  depth: number
}

const INITIAL_COMPLETED_VISIBLE_COUNT = 5
const COMPLETED_VISIBLE_STEP = 10

function toDateInputValue(timestamp: number): string {
  const date = new Date(timestamp)
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 10)
}

function toDateTimeInputValue(timestamp: number): string {
  const date = new Date(timestamp)
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

function fromDateInputValue(value: string): number | undefined {
  if (!value) {
    return undefined
  }

  const timestamp = new Date(`${value}T18:00`).getTime()
  return Number.isNaN(timestamp) ? undefined : timestamp
}

function fromDateTimeInputValue(value: string): number | undefined {
  if (!value) {
    return undefined
  }

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? undefined : timestamp
}

function getTodayAtDefaultHour(): number {
  const now = new Date()
  now.setHours(18, 0, 0, 0)
  return now.getTime()
}

function getTomorrowAtDefaultHour(): number {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  return tomorrow.getTime()
}

function buildTodoWithDepth(todos: Todo[]): TodoWithDepth[] {
  const todosById = new Map(todos.map((todo) => [todo.id, todo]))
  const childrenByParent = new Map<string, Todo[]>()

  for (const todo of todos) {
    if (!todo.parentId || !todosById.has(todo.parentId)) {
      continue
    }

    const siblings = childrenByParent.get(todo.parentId) ?? []
    siblings.push(todo)
    childrenByParent.set(todo.parentId, siblings)
  }

  const roots = todos.filter((todo) => !todo.parentId || !todosById.has(todo.parentId))
  const ordered: TodoWithDepth[] = []
  const visited = new Set<string>()

  const walk = (todo: Todo, depth: number) => {
    if (visited.has(todo.id)) {
      return
    }

    visited.add(todo.id)
    ordered.push({ todo, depth })

    const children = childrenByParent.get(todo.id) ?? []
    for (const child of children) {
      walk(child, depth + 1)
    }
  }

  for (const root of roots) {
    walk(root, 0)
  }

  for (const orphan of todos) {
    if (!visited.has(orphan.id)) {
      walk(orphan, 0)
    }
  }

  return ordered
}

export function TodoList({
  composeInputRef,
  activeTodos,
  completedTodos,
  onCreate,
  onUpdate,
  onSetCompleted,
  onSetStarred,
  onDeleteCompleted,
  emptyLabel,
}: TodoListProps) {
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [draft, setDraft] = useState<TodoDraft>({ title: '', details: '' })
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const [dateMode, setDateMode] = useState<DateEditMode>(null)
  const [dateInput, setDateInput] = useState('')
  const [dateTimeInput, setDateTimeInput] = useState('')
  const [completedExpanded, setCompletedExpanded] = useState(false)
  const [completedVisibleCount, setCompletedVisibleCount] = useState(INITIAL_COMPLETED_VISIBLE_COUNT)

  const activeItems = useMemo(() => buildTodoWithDepth(activeTodos), [activeTodos])
  const completedItems = useMemo(() => buildTodoWithDepth(completedTodos), [completedTodos])

  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const saveInFlightRef = useRef(false)
  const editingIdRef = useRef<string | 'new' | null>(null)
  const lastPointerInsideEditorAtRef = useRef(0)

  const reminderFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  )

  const compactDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }),
    [],
  )

  const fullDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  useEffect(() => {
    editingIdRef.current = editingId
  }, [editingId])

  useEffect(() => {
    if (editingId === null) {
      composeInputRef.current = null
      return
    }

    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    })
  }, [editingId, composeInputRef])

  useEffect(() => {
    if (!completedExpanded) {
      setCompletedVisibleCount(INITIAL_COMPLETED_VISIBLE_COUNT)
      return
    }

    setCompletedVisibleCount((current) =>
      Math.min(Math.max(current, INITIAL_COMPLETED_VISIBLE_COUNT), completedItems.length || INITIAL_COMPLETED_VISIBLE_COUNT),
    )
  }, [completedExpanded, completedItems.length])

  const closeEditor = () => {
    setEditingId(null)
    setNewParentId(null)
    setDraft({ title: '', details: '' })
    setSaveError(null)
    setShowDetails(false)
    setShowDate(false)
    setDateMode(null)
    setDateInput('')
    setDateTimeInput('')
  }

  const persistAndMaybeClose = async (shouldClose: boolean): Promise<boolean> => {
    if (editingId === null || saveInFlightRef.current) {
      return false
    }

    const editingIdAtStart = editingId
    const newParentIdAtStart = newParentId
    let persistSucceeded = true
    saveInFlightRef.current = true
    setSaveError(null)

    try {
      const title = draft.title.trim()
      const details = draft.details.trim() || undefined

      if (editingIdAtStart === 'new') {
        if (title) {
          await onCreate({
            title,
            details,
            reminderAt: draft.reminderAt,
            parentId: newParentIdAtStart ?? undefined,
          })
        }
      } else if (title) {
        await onUpdate({
          id: editingIdAtStart,
          title,
          details,
          reminderAt: draft.reminderAt,
        })
      }
    } catch (error) {
      persistSucceeded = false
      setSaveError(error instanceof Error ? error.message : 'Échec de sauvegarde')
    } finally {
      saveInFlightRef.current = false
      if (persistSucceeded && shouldClose && editingIdRef.current === editingIdAtStart) {
        closeEditor()
      }
    }

    return persistSucceeded
  }

  const openCreateEditor = async (parentId?: string) => {
    if (editingId !== null) {
      const previousSaveSucceeded = await persistAndMaybeClose(true)
      if (!previousSaveSucceeded) {
        return
      }
    }

    setEditingId('new')
    setNewParentId(parentId ?? null)
    setDraft({ title: '', details: '' })
    setSaveError(null)
    setShowDetails(false)
    setShowDate(false)
    setDateMode(null)
    setDateInput('')
    setDateTimeInput('')
  }

  const openTodoEditor = async (todo: Todo) => {
    if (editingId === todo.id) {
      return
    }

    if (editingId !== null) {
      const previousSaveSucceeded = await persistAndMaybeClose(true)
      if (!previousSaveSucceeded) {
        return
      }
    }

    setEditingId(todo.id)
    setDraft({
      title: todo.title,
      details: todo.details ?? '',
      reminderAt: todo.reminderAt,
    })
    setNewParentId(null)
    setSaveError(null)
    setShowDetails(Boolean(todo.details))
    setShowDate(Boolean(todo.reminderAt))
    setDateMode(null)
    setDateInput(todo.reminderAt ? toDateInputValue(todo.reminderAt) : '')
    setDateTimeInput(todo.reminderAt ? toDateTimeInputValue(todo.reminderAt) : '')
  }

  const onEditorBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget
    if (nextFocused && event.currentTarget.contains(nextFocused)) {
      return
    }

    window.setTimeout(() => {
      const root = editorContainerRef.current
      if (!root) {
        return
      }

      // macOS may not focus buttons on click; keep editor open for recent internal pointer interactions.
      if (window.performance.now() - lastPointerInsideEditorAtRef.current < 200) {
        return
      }

      const active = document.activeElement
      if (active && root.contains(active)) {
        return
      }

      void persistAndMaybeClose(true)
    }, 0)
  }

  const applyReminder = (timestamp: number | undefined) => {
    setDraft((previous) => ({
      ...previous,
      reminderAt: timestamp,
    }))

    if (!timestamp) {
      setDateInput('')
      setDateTimeInput('')
      return
    }

    setDateInput(toDateInputValue(timestamp))
    setDateTimeInput(toDateTimeInputValue(timestamp))
  }

  const normalizeDateLabel = (label: string): string => {
    return label.replace(',', '').replace(/\s+/g, ' ').trim()
  }

  const formatDateLabel = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()

    if (date.getFullYear() === now.getFullYear()) {
      return normalizeDateLabel(compactDateFormatter.format(date))
    }

    return normalizeDateLabel(fullDateFormatter.format(date))
  }

  const reminderMeta = (reminderAt: number): { label: string; overdue: boolean } => {
    const reminderDate = new Date(reminderAt)
    const now = new Date()
    const dayMs = 24 * 60 * 60 * 1000

    const reminderDay = new Date(reminderDate)
    reminderDay.setHours(0, 0, 0, 0)

    const todayDay = new Date(now)
    todayDay.setHours(0, 0, 0, 0)

    const dayDiff = Math.round((reminderDay.getTime() - todayDay.getTime()) / dayMs)
    const overdue = dayDiff < 0

    if (dayDiff === 0) {
      return { label: "Aujourd'hui", overdue: false }
    }

    if (dayDiff === 1) {
      return { label: 'Demain', overdue: false }
    }

    if (dayDiff === -1) {
      return { label: 'Il y a un jour', overdue: true }
    }

    if (dayDiff < -1) {
      return { label: `Il y a ${Math.abs(dayDiff)} jours`, overdue: true }
    }

    return { label: formatDateLabel(reminderAt), overdue }
  }

  const renderEditorRow = (targetId: string | 'new', depth = 0) => {
    const isExistingTodo = targetId !== 'new'
    const reminderEditorVisible = showDate || Boolean(draft.reminderAt)
    const showQuickDetailsAction = !showDetails
    const showQuickDateAction = !reminderEditorVisible
    const leftOffset = Math.min(depth, 6) * 16

    return (
      <li
        key={targetId === 'new' ? 'new-editor' : `editor-${targetId}`}
        className="px-2 py-2"
        style={leftOffset > 0 ? { paddingLeft: `${leftOffset + 8}px` } : undefined}
      >
        <div
          ref={editorContainerRef}
          className="flex items-start gap-2 rounded-md bg-muted/50 px-2 py-2"
          onPointerDownCapture={() => {
            lastPointerInsideEditorAtRef.current = window.performance.now()
          }}
          onBlur={onEditorBlur}
        >
          {isExistingTodo ? (
            <Checkbox
              className="mt-1"
              checked={false}
              onCheckedChange={async () => {
                await onSetCompleted(targetId, true)
                closeEditor()
              }}
              aria-label="Marquer la tâche en cours d'édition comme terminée"
            />
          ) : (
            <Checkbox className="mt-1" checked={false} disabled aria-label="Nouvelle tâche" />
          )}

          <div className="min-w-0 flex-1 space-y-2">
            <Input
              ref={(node) => {
                titleInputRef.current = node
                composeInputRef.current = node
              }}
              value={draft.title}
              onChange={(event) => {
                setSaveError(null)
                setDraft((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void persistAndMaybeClose(true)
                }

                if (event.key === 'Escape') {
                  event.preventDefault()
                  closeEditor()
                }
              }}
              placeholder="Titre de la tâche"
              className="h-8 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />

            {showDetails ? (
              <div className="space-y-1">
                <textarea
                  value={draft.details}
                  onChange={(event) => {
                    setSaveError(null)
                    setDraft((previous) => ({
                      ...previous,
                      details: event.target.value,
                    }))
                  }}
                  rows={3}
                  className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Détails"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowDetails(false)
                    setDraft((previous) => ({
                      ...previous,
                      details: '',
                    }))
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Supprimer les détails
                </button>
              </div>
            ) : null}

            {reminderEditorVisible ? (
              <div className="space-y-1">
                {draft.reminderAt ? (
                  <p className="text-xs text-muted-foreground">
                    {`Échéance ${reminderFormatter.format(new Date(draft.reminderAt))}`}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setSaveError(null)
                      applyReminder(getTodayAtDefaultHour())
                    }}
                  >
                    Aujourd&apos;hui
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setSaveError(null)
                      applyReminder(getTomorrowAtDefaultHour())
                    }}
                  >
                    Demain
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setSaveError(null)
                      setDateMode('date')
                    }}
                  >
                    Choisir date
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setSaveError(null)
                      setDateMode('datetime')
                    }}
                  >
                    Date + heure
                  </Button>
                  {draft.reminderAt ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setSaveError(null)
                        applyReminder(undefined)
                      }}
                    >
                      Supprimer
                    </Button>
                  ) : null}
                </div>

                {dateMode === 'date' ? (
                  <Input
                    type="date"
                    value={dateInput}
                    onChange={(event) => {
                      setSaveError(null)
                      setDateInput(event.target.value)
                      applyReminder(fromDateInputValue(event.target.value))
                    }}
                    className="h-8 text-xs"
                  />
                ) : null}

                {dateMode === 'datetime' ? (
                  <Input
                    type="datetime-local"
                    value={dateTimeInput}
                    onChange={(event) => {
                      setSaveError(null)
                      setDateTimeInput(event.target.value)
                      applyReminder(fromDateTimeInputValue(event.target.value))
                    }}
                    className="h-8 text-xs"
                    step={60}
                  />
                ) : null}
              </div>
            ) : null}

            {showQuickDetailsAction || showQuickDateAction ? (
              <motion.div layout className="flex flex-wrap items-center gap-2 pt-0.5">
                {showQuickDetailsAction ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full px-2.5 text-xs"
                    onClick={() => {
                      setSaveError(null)
                      setShowDetails(true)
                    }}
                  >
                    <FileText className="mr-1 h-3.5 w-3.5" />
                    Ajouter des détails
                  </Button>
                ) : null}
                {showQuickDateAction ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full px-2.5 text-xs"
                    onClick={() => {
                      setSaveError(null)
                      setShowDate(true)
                    }}
                  >
                    <CalendarClock className="mr-1 h-3.5 w-3.5" />
                    Ajouter une date
                  </Button>
                ) : null}
              </motion.div>
            ) : null}

            {saveError ? <p className="text-xs text-muted-foreground">{`Échec de sauvegarde: ${saveError}`}</p> : null}
          </div>
        </div>
      </li>
    )
  }

  const visibleCompletedItems = completedExpanded
    ? completedItems.slice(0, completedVisibleCount)
    : []
  const hasMoreCompleted = completedExpanded && completedVisibleCount < completedItems.length

  return (
    <ScrollArea className="h-full rounded-md border border-border">
      <LayoutGroup id="todo-items">
        <ul className="py-1 pr-2">
          <li className="px-2 py-1">
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-full justify-start px-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                void openCreateEditor()
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Ajouter une tâche
            </Button>
          </li>

          {editingId === 'new' && newParentId === null ? renderEditorRow('new', 0) : null}

          {activeTodos.length === 0 ? (
            <li className="px-4 py-4 text-center text-sm text-muted-foreground">{emptyLabel}</li>
          ) : (
            <AnimatePresence initial={false}>
              {activeItems.flatMap(({ todo, depth }) => {
                const leftOffset = Math.min(depth, 6) * 16
                const dueMeta = todo.reminderAt ? reminderMeta(todo.reminderAt) : null
                const rows: ReactNode[] = []

                if (editingId === todo.id) {
                  rows.push(renderEditorRow(todo.id, depth))
                } else {
                  rows.push(
                    <motion.li
                      key={todo.id}
                      layout
                      initial={{ opacity: 0, y: 6, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -12, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 36, mass: 0.55 }}
                      className="px-2 py-1"
                      style={leftOffset > 0 ? { paddingLeft: `${leftOffset + 8}px` } : undefined}
                    >
                      <motion.div
                        layout
                        layoutId={`todo-card-${todo.id}`}
                        className="flex items-start gap-2 rounded-md px-1 py-1 hover:bg-muted/40"
                      >
                        <Checkbox
                          className="mt-1"
                          checked={Boolean(todo.completedAt)}
                          onCheckedChange={async (checked) => {
                            if (checked === true) {
                              await onSetCompleted(todo.id, true)
                            }
                          }}
                          aria-label={`Marquer "${todo.title}" comme terminée`}
                        />

                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          onClick={() => {
                            void openTodoEditor(todo)
                          }}
                        >
                          <p className="truncate text-sm text-foreground">{todo.title}</p>
                          {(todo.details || todo.reminderAt) && (
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                              {dueMeta ? (
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1',
                                    dueMeta.overdue ? 'text-destructive' : 'text-muted-foreground',
                                  )}
                                >
                                  <CalendarClock className="h-3 w-3" />
                                  {dueMeta.label}
                                </span>
                              ) : null}
                              {todo.details ? (
                                <span className="inline-flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  Détails
                                </span>
                              ) : null}
                            </div>
                          )}
                        </button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={async () => {
                            await onSetStarred(todo.id, !todo.starred)
                          }}
                          aria-label={todo.starred ? `Retirer ${todo.title} des favoris` : `Ajouter ${todo.title} aux favoris`}
                        >
                          <Star
                            className={cn(
                              'h-3.5 w-3.5',
                              todo.starred ? 'fill-foreground text-foreground' : 'text-muted-foreground',
                            )}
                          />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              aria-label={`Actions pour ${todo.title}`}
                            >
                              <Ellipsis className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onSelect={() => {
                                void openCreateEditor(todo.id)
                              }}
                            >
                              Ajouter une sous-tâche
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    </motion.li>,
                  )
                }

                if (editingId === 'new' && newParentId === todo.id) {
                  rows.push(renderEditorRow('new', depth + 1))
                }

                return rows
              })}
            </AnimatePresence>
          )}

          <li className="mt-2 px-2 pt-1">
            <button
              type="button"
              className="flex w-full items-center gap-1 text-left text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setCompletedExpanded((current) => !current)
              }}
            >
              {completedExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span>{`Tâches terminées (${completedTodos.length})`}</span>
            </button>
          </li>

          {completedExpanded ? (
            completedTodos.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">Aucune tâche terminée</li>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {visibleCompletedItems.map(({ todo, depth }) => {
                    const leftOffset = Math.min(depth, 6) * 16

                    return (
                      <motion.li
                        key={`completed-${todo.id}`}
                        layout
                        initial={{ opacity: 0, y: 8, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 460, damping: 34, mass: 0.52 }}
                        className="px-2 py-1"
                        style={leftOffset > 0 ? { paddingLeft: `${leftOffset + 8}px` } : undefined}
                      >
                        <motion.div
                          layout
                          layoutId={`todo-card-${todo.id}`}
                          className="flex items-start gap-2 rounded-md px-1 py-1 hover:bg-muted/30"
                        >
                          <Checkbox
                            checked
                            className="mt-1"
                            onCheckedChange={async (checked) => {
                              if (checked === false) {
                                await onSetCompleted(todo.id, false)
                              }
                            }}
                            aria-label={`Rouvrir ${todo.title}`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-muted-foreground line-through">{todo.title}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {todo.completedAt
                                ? `Terminée ${formatDateLabel(todo.completedAt)}`
                                : 'Terminée'}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={async () => {
                              await onSetStarred(todo.id, !todo.starred)
                            }}
                            aria-label={todo.starred ? `Retirer ${todo.title} des favoris` : `Ajouter ${todo.title} aux favoris`}
                          >
                            <Star
                              className={cn(
                                'h-3.5 w-3.5',
                                todo.starred ? 'fill-foreground text-foreground' : 'text-muted-foreground',
                              )}
                            />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                aria-label={`Actions pour ${todo.title}`}
                              >
                                <Ellipsis className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onSelect={() => {
                                  void onSetCompleted(todo.id, false)
                                }}
                              >
                                Rouvrir la tâche
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  void onDeleteCompleted(todo.id)
                                }}
                              >
                                Supprimer la tâche
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>

                {hasMoreCompleted ? (
                  <li className="px-3 pb-2 pt-1">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setCompletedVisibleCount((current) => current + COMPLETED_VISIBLE_STEP)
                      }}
                    >
                      Afficher plus
                    </button>
                  </li>
                ) : null}
              </>
            )
          ) : null}
        </ul>
      </LayoutGroup>
    </ScrollArea>
  )
}
