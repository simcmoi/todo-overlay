import { create } from 'zustand'
import {
  clearHistory as clearHistoryCommand,
  createList as createListCommand,
  createTodo as createTodoCommand,
  deleteTodo as deleteTodoCommand,
  loadState,
  renameList as renameListCommand,
  setActiveList as setActiveListCommand,
  setTodoCompleted as setTodoCompletedCommand,
  setTodoStarred as setTodoStarredCommand,
  updateTodo as updateTodoCommand,
  updateSettings as updateSettingsCommand,
} from '@/lib/tauri'
import type { Settings, Todo, ViewMode } from '@/types/todo'

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
  createList: (name: string) => Promise<void>
  renameList: (id: string, name: string) => Promise<void>
  setActiveList: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  updateSettings: (partial: Partial<Settings>) => Promise<void>
}

const defaultSettings: Settings = {
  sortOrder: 'desc',
  autoCloseOnBlur: true,
  activeListId: 'default',
  lists: [{ id: 'default', name: 'Mes tâches', createdAt: 0 }],
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
  updateSettings: async (partial) => {
    const mergedSettings = { ...get().settings, ...partial }
    const data = await updateSettingsCommand(mergedSettings)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
}))
