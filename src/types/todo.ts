export type SortOrder = 'asc' | 'desc'
export type SortMode = 'manual' | 'recent' | 'oldest' | 'title' | 'dueDate'
export type ThemeMode = 'system' | 'light' | 'dark'
export type TodoPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'

export type TodoLabel = {
  id: string
  name: string
  color: 'slate' | 'blue' | 'green' | 'amber' | 'rose' | 'violet'
}

export type TodoListMeta = {
  id: string
  name: string
  createdAt: number
}

export type Todo = {
  id: string
  title: string
  details?: string
  parentId?: string
  listId?: string
  starred?: boolean
  priority?: TodoPriority
  labelId?: string
  sortIndex?: number
  createdAt: number
  completedAt?: number
  reminderAt?: number
}

export type Settings = {
  sortMode: SortMode
  sortOrder: SortOrder
  autoCloseOnBlur: boolean
  globalShortcut: string
  themeMode: ThemeMode
  activeListId: string
  lists: TodoListMeta[]
  labels: TodoLabel[]
  enableAutostart: boolean
  enableSoundEffects: boolean
}

export type AppData = {
  settings: Settings
  todos: Todo[]
}

export type ViewMode = 'active' | 'history'
