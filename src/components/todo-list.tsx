import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, ChevronDown, ChevronRight, FileText, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Todo } from '@/types/todo'

type TodoListProps = {
  composeInputRef: MutableRefObject<HTMLInputElement | null>
  activeTodos: Todo[]
  completedTodos: Todo[]
  onCreate: (payload: { title: string; details?: string; reminderAt?: number }) => Promise<void>
  onUpdate: (payload: {
    id: string
    title: string
    details?: string
    reminderAt?: number
  }) => Promise<void>
  onComplete: (id: string) => Promise<void>
  onDeleteCompleted: (id: string) => Promise<void>
  emptyLabel: string
}

type DateEditMode = 'date' | 'datetime' | null

type TodoDraft = {
  title: string
  details: string
  reminderAt?: number
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

function reminderIsSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function TodoList({
  composeInputRef,
  activeTodos,
  completedTodos,
  onCreate,
  onUpdate,
  onComplete,
  onDeleteCompleted,
  emptyLabel,
}: TodoListProps) {
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<TodoDraft>({ title: '', details: '' })
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const [dateMode, setDateMode] = useState<DateEditMode>(null)
  const [dateInput, setDateInput] = useState('')
  const [dateTimeInput, setDateTimeInput] = useState('')
  const [completedExpanded, setCompletedExpanded] = useState(false)
  const [completedVisibleCount, setCompletedVisibleCount] = useState(INITIAL_COMPLETED_VISIBLE_COUNT)

  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const saveInFlightRef = useRef(false)
  const editingIdRef = useRef<string | 'new' | null>(null)

  const reminderFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  )

  const completedFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  )

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  )

  const dateCompactFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
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
      Math.min(Math.max(current, INITIAL_COMPLETED_VISIBLE_COUNT), completedTodos.length || INITIAL_COMPLETED_VISIBLE_COUNT),
    )
  }, [completedExpanded, completedTodos.length])

  const closeEditor = () => {
    setEditingId(null)
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
    let persistSucceeded = true
    saveInFlightRef.current = true
    setSaveError(null)

    try {
      const title = draft.title.trim()
      const details = draft.details.trim() || undefined

      if (editingIdAtStart === 'new') {
        if (title) {
          await onCreate({ title, details, reminderAt: draft.reminderAt })
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

  const openCreateEditor = async () => {
    if (editingId !== null) {
      const previousSaveSucceeded = await persistAndMaybeClose(true)
      if (!previousSaveSucceeded) {
        return
      }
    }

    setEditingId('new')
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
    setSaveError(null)
    setShowDetails(Boolean(todo.details))
    setShowDate(Boolean(todo.reminderAt))
    setDateMode(null)
    setDateInput(todo.reminderAt ? toDateInputValue(todo.reminderAt) : '')
    setDateTimeInput(todo.reminderAt ? toDateTimeInputValue(todo.reminderAt) : '')
  }

  const onEditorBlur = () => {
    window.setTimeout(() => {
      const root = editorContainerRef.current
      if (!root) {
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

  const compactReminderLabel = (reminderAt: number): string => {
    const reminderDate = new Date(reminderAt)
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(now.getDate() + 1)

    const timeLabel = timeFormatter.format(reminderDate)

    if (reminderIsSameDay(reminderDate, now)) {
      return `Aujourd'hui ${timeLabel}`
    }

    if (reminderIsSameDay(reminderDate, tomorrow)) {
      return `Demain ${timeLabel}`
    }

    return `${dateCompactFormatter.format(reminderDate)} ${timeLabel}`
  }

  const renderEditorRow = (targetId: string | 'new') => {
    const isExistingTodo = targetId !== 'new'

    return (
      <li key={targetId === 'new' ? 'new-editor' : `editor-${targetId}`} className="px-2 py-2">
        <div
          ref={editorContainerRef}
          className="flex items-start gap-2 rounded-md border border-border/80 bg-card px-2 py-2"
          onBlur={onEditorBlur}
        >
          {isExistingTodo ? (
            <Checkbox
              className="mt-1"
              checked={false}
              onCheckedChange={async () => {
                await onComplete(targetId)
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
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowDetails(true)
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Ajouter des détails
              </button>
            )}

            {showDate || draft.reminderAt ? (
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
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSaveError(null)
                  setShowDate(true)
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Ajouter une date
              </button>
            )}

            {saveError ? <p className="text-xs text-muted-foreground">{`Échec de sauvegarde: ${saveError}`}</p> : null}
          </div>
        </div>
      </li>
    )
  }

  const visibleCompletedTodos = completedExpanded
    ? completedTodos.slice(0, completedVisibleCount)
    : []
  const hasMoreCompleted = completedExpanded && completedVisibleCount < completedTodos.length

  return (
    <ScrollArea className="h-full rounded-md border border-border">
      <ul className="py-1">
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

        {editingId === 'new' ? renderEditorRow('new') : null}

        {activeTodos.length === 0 ? (
          <li className="px-4 py-4 text-center text-sm text-muted-foreground">{emptyLabel}</li>
        ) : (
          <AnimatePresence initial={false}>
            {activeTodos.map((todo) =>
              editingId === todo.id ? (
                renderEditorRow(todo.id)
              ) : (
                <motion.li
                  key={todo.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-2 py-1"
                >
                  <div className="flex items-start gap-2 rounded-md px-1 py-1 hover:bg-muted/40">
                    <Checkbox
                      className="mt-1"
                      checked={Boolean(todo.completedAt)}
                      onCheckedChange={async () => {
                        if (!todo.completedAt) {
                          await onComplete(todo.id)
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
                          {todo.reminderAt ? (
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="h-3 w-3" />
                              {compactReminderLabel(todo.reminderAt)}
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
                  </div>
                </motion.li>
              ),
            )}
          </AnimatePresence>
        )}

        <li className="mt-2 border-t border-border px-2 pt-2">
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
              {visibleCompletedTodos.map((todo) => (
                <li key={`completed-${todo.id}`} className="px-2 py-1">
                  <div className="flex items-start gap-2 rounded-md px-1 py-1">
                    <Checkbox checked disabled className="mt-1" aria-label={`${todo.title} terminée`} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-muted-foreground line-through">{todo.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {todo.completedAt
                          ? `Terminée le ${completedFormatter.format(new Date(todo.completedAt))}`
                          : 'Terminée'}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={async () => {
                        await onDeleteCompleted(todo.id)
                      }}
                      aria-label={`Supprimer ${todo.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}

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
    </ScrollArea>
  )
}
