import { create } from 'zustand'
import {
  clearHistory as clearHistoryCommand,
  completeTodo as completeTodoCommand,
  createTodo as createTodoCommand,
  deleteTodo as deleteTodoCommand,
  loadState,
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
  }) => Promise<void>
  updateTodo: (payload: {
    id: string
    title: string
    details?: string
    reminderAt?: number
  }) => Promise<void>
  completeTodo: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  updateSettings: (partial: Partial<Settings>) => Promise<void>
}

const defaultSettings: Settings = {
  sortOrder: 'desc',
  autoCloseOnBlur: true,
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
  createTodo: async ({ title, details, reminderAt }) => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    const data = await createTodoCommand(trimmedTitle, details, reminderAt)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  updateTodo: async ({ id, title, details, reminderAt }) => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    const data = await updateTodoCommand(id, trimmedTitle, details, reminderAt)
    set({ todos: data.todos, settings: data.settings, error: null })
  },
  completeTodo: async (id) => {
    const data = await completeTodoCommand(id)
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
