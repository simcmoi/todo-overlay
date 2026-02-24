export type SortOrder = 'asc' | 'desc'

export type Todo = {
  id: string
  title: string
  details?: string
  createdAt: number
  completedAt?: number
  reminderAt?: number
}

export type Settings = {
  sortOrder: SortOrder
  autoCloseOnBlur: boolean
}

export type AppData = {
  settings: Settings
  todos: Todo[]
}

export type ViewMode = 'active' | 'history'
