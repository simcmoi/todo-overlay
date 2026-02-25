import type { AppData } from '@/types/todo'

export type StorageMode = 'local' | 'cloud'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

export interface AuthUser {
  id: string
  email: string
}

export interface StorageProvider {
  // Identification
  readonly mode: StorageMode
  
  // État
  isAuthenticated(): boolean
  getCurrentUser(): AuthUser | null
  getSyncStatus(): SyncStatus
  
  // CRUD Operations
  load(): Promise<AppData>
  save(data: AppData): Promise<void>
  
  // Auth (cloud uniquement)
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  
  // Sync (cloud uniquement)
  subscribe(callback: (data: AppData) => void): () => void
  
  // Lifecycle
  initialize(): Promise<void>
  destroy(): void
}
