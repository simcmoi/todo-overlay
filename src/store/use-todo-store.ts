import { create } from 'zustand'
import {
  clearCompletedInList as clearCompletedInListCommand,
  clearHistory as clearHistoryCommand,
  createList as createListCommand,
  createTodo as createTodoCommand,
  deleteTodo as deleteTodoCommand,
  loadState,
  moveTodoToList as moveTodoToListCommand,
  reorderTodos as reorderTodosCommand,
  renameList as renameListCommand,
  setActiveList as setActiveListCommand,
  setAutostartEnabled as setAutostartEnabledCommand,
  setTodoCompleted as setTodoCompletedCommand,
  setTodoLabel as setTodoLabelCommand,
  setTodoPriority as setTodoPriorityCommand,
  setTodoStarred as setTodoStarredCommand,
  setGlobalShortcut as setGlobalShortcutCommand,
  updateTodo as updateTodoCommand,
  updateSettings as updateSettingsCommand,
} from '@/lib/tauri'
import type { Settings, Todo, TodoPriority, ViewMode } from '@/types/todo'

type TodoStore = {
  hydrated: boolean
  loading: boolean
  error: string | null
  todos: Todo[]
  settings: Settings
  view: ViewMode
  hydrate: () => Promise<void>
  setView: (view: ViewMode) => void
  createTodo: (payload: {
    title: string
    details?: string
    reminderAt?: number
    parentId?: string
    listId?: string
  }) => Promise<void>
  updateTodo: (payload: {
    id: string
    title: string
    details?: string
    reminderAt?: number
  }) => Promise<void>
  setTodoCompleted: (id: string, completed: boolean) => Promise<void>
  setTodoStarred: (id: string, starred: boolean) => Promise<void>
  setTodoPriority: (id: string, priority: TodoPriority) => Promise<void>
  setTodoLabel: (id: string, labelId?: string) => Promise<void>
  reorderTodos: (payload: {
    listId: string
    parentId?: string
    completed: boolean
    orderedIds: string[]
  }) => Promise<void>
  createList: (name: string) => Promise<void>
  renameList: (id: string, name: string) => Promise<void>
  setActiveList: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  clearCompletedInList: (listId: string) => Promise<void>
  moveTodoToList: (id: string, listId: string) => Promise<void>
  updateSettings: (partial: Partial<Settings>) => Promise<void>
  setGlobalShortcut: (shortcut: string) => Promise<void>
  setAutostartEnabled: (enabled: boolean) => Promise<void>
}

const defaultSettings: Settings = {
  sortMode: 'recent',
  sortOrder: 'desc',
  autoCloseOnBlur: true,
  globalShortcut: 'Shift+Space',
  themeMode: 'system',
  activeListId: 'default',
  lists: [{ id: 'default', name: 'Mes tâches', createdAt: 0 }],
  labels: [{ id: 'general', name: 'Général', color: 'slate' }],
  enableAutostart: true,
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  hydrated: false,
  loading: false,
  error: null,
  todos: [],
  settings: defaultSettings,
  view: 'active',
  hydrate: async () => {
    set({ loading: true, error: null })
    try {
      const data = await loadState()
      set({
        hydrated: true,
        loading: false,
        todos: data.todos,
        settings: data.settings,
      })
    } catch (error) {
      set({
        hydrated: true,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load todos',
      })
    }
  },
  setView: (view) => set({ view }),
  createTodo: async ({ title, details, reminderAt, parentId, listId }) => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    try {
      const data = await createTodoCommand(trimmedTitle, details, reminderAt, parentId, listId)
      set({ todos: data.todos, settings: data.settings, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de créer la tâche'
      set({ error: message })
      throw error instanceof Error ? error : new Error(message)
    }
  },
  updateTodo: async ({ id, title, details, reminderAt }) => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    try {
      const data = await updateTodoCommand(id, trimmedTitle, details, reminderAt)
      set({ todos: data.todos, settings: data.settings, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de mettre à jour la tâche'
      set({ error: message })
      throw error instanceof Error ? error : new Error(message)
    }
  },
  setTodoCompleted: async (id, completed) => {
    const data = await setTodoCompletedCommand(id, completed)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  setTodoStarred: async (id, starred) => {
    const data = await setTodoStarredCommand(id, starred)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  setTodoPriority: async (id, priority) => {
    const data = await setTodoPriorityCommand(id, priority)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  setTodoLabel: async (id, labelId) => {
    const data = await setTodoLabelCommand(id, labelId)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  reorderTodos: async ({ listId, parentId, completed, orderedIds }) => {
    if (orderedIds.length < 2) {
      return
    }

    const data = await reorderTodosCommand(listId, parentId, completed, orderedIds)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  createList: async (name) => {
    const data = await createListCommand(name)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  renameList: async (id, name) => {
    const data = await renameListCommand(id, name)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  setActiveList: async (id) => {
    const data = await setActiveListCommand(id)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  deleteTodo: async (id) => {
    const data = await deleteTodoCommand(id)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  clearHistory: async () => {
    const data = await clearHistoryCommand()
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  clearCompletedInList: async (listId) => {
    const data = await clearCompletedInListCommand(listId)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  moveTodoToList: async (id, listId) => {
    const data = await moveTodoToListCommand(id, listId)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  updateSettings: async (partial) => {
    const mergedSettings = { ...get().settings, ...partial }
    const data = await updateSettingsCommand(mergedSettings)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  setGlobalShortcut: async (shortcut) => {
    const data = await setGlobalShortcutCommand(shortcut)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  setAutostartEnabled: async (enabled) => {
    const data = await setAutostartEnabledCommand(enabled)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
}))
