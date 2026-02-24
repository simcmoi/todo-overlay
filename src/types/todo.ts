export type SortOrder = 'asc' | 'desc'

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
  createdAt: number
  completedAt?: number
  reminderAt?: number
}

export type Settings = {
  sortOrder: SortOrder
  autoCloseOnBlur: boolean
  activeListId: string
  lists: TodoListMeta[]
}

export type AppData = {
  settings: Settings
  todos: Todo[]
}

export type ViewMode = 'active' | 'history'
