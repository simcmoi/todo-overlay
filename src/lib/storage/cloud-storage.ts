import { createClient, type SupabaseClient, type RealtimeChannel, type AuthError } from '@supabase/supabase-js'
import type { AppData, Todo, TodoLabel, Settings } from '@/types/todo'
import type { StorageProvider, StorageMode, SyncStatus, AuthUser } from './types'

// Helper to check if error is an auth error
function isAuthError(error: unknown): error is AuthError {
  return typeof error === 'object' && error !== null && 'status' in error && '__isAuthError' in error
}

// Helper to format auth errors with user-friendly messages
function formatAuthError(error: unknown): string {
  if (isAuthError(error)) {
    switch (error.status) {
      case 400:
        if (error.message.includes('Invalid login credentials')) {
          return 'Email ou mot de passe incorrect'
        }
        if (error.message.includes('email') || error.message.includes('Email')) {
          return 'Adresse email invalide'
        }
        return 'Identifiants invalides. Veuillez vérifier vos informations.'
      case 422:
        if (error.message.includes('email')) {
          return 'Cette adresse email est déjà utilisée'
        }
        if (error.message.includes('password')) {
          return 'Le mot de passe doit contenir au moins 6 caractères'
        }
        return error.message
      case 429:
        return 'Trop de tentatives. Veuillez réessayer dans quelques instants.'
      default:
        return error.message || 'Erreur d\'authentification'
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Une erreur inattendue s\'est produite'
}

// Types Supabase DB
interface DbTodo {
  id: string
  user_id: string
  title: string
  details: string | null
  parent_id: string | null
  list_id: string | null
  starred: boolean
  priority: string
  label_id: string | null
  sort_index: number | null
  created_at: number
  completed_at: number | null
  reminder_at: number | null
  updated_at: number
  deleted_at: number | null
  device_id: string | null
  version: number
}

interface DbList {
  id: string
  user_id: string
  name: string
  created_at: number
  updated_at: number
  deleted_at: number | null
  device_id: string | null
  version: number
}

interface DbLabel {
  id: string
  user_id: string
  name: string
  color: string
  created_at: number
  updated_at: number
  deleted_at: number | null
  device_id: string | null
  version: number
}

interface DbSettings {
  user_id: string
  theme_mode: string
  auto_close_on_blur: boolean
  enable_autostart: boolean
  global_shortcut: string
  sort_mode: string
  sort_order: string
  active_list_id: string
  updated_at: number
  device_id: string | null
  version: number
}

export class CloudStorageProvider implements StorageProvider {
  readonly mode: StorageMode = 'cloud'
  private client: SupabaseClient
  private syncStatus: SyncStatus = 'idle'
  private currentUser: AuthUser | null = null
  private subscriptions: RealtimeChannel[] = []
  private authSubscription?: { unsubscribe: () => void }
  private currentData: AppData | null = null
  private networkListenersAttached = false
  
  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
    }
    
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'todo-overlay-auth',
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }
  
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
  
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }
  
  getSyncStatus(): SyncStatus {
    return this.syncStatus
  }
  
  async initialize(): Promise<void> {
    // Vérifier si l'utilisateur est déjà connecté
    const { data: { session } } = await this.client.auth.getSession()
    if (session?.user) {
      this.currentUser = {
        id: session.user.id,
        email: session.user.email || ''
      }
    }
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = this.client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.currentUser = {
          id: session.user.id,
          email: session.user.email || ''
        }
      } else {
        this.currentUser = null
      }
    })
    this.authSubscription = subscription
    
    // Détecter le statut réseau (seulement dans un environnement browser)
    if (typeof window !== 'undefined' && !this.networkListenersAttached) {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
      this.networkListenersAttached = true
      
      // Vérifier le statut initial
      if (!navigator.onLine) {
        this.syncStatus = 'offline'
      }
    }
  }
  
  private handleOnline = () => {
    if (this.syncStatus === 'offline') {
      this.syncStatus = 'idle'
    }
  }
  
  private handleOffline = () => {
    this.syncStatus = 'offline'
  }
  
  async load(): Promise<AppData> {
    if (!this.isAuthenticated()) {
      throw new Error('Vous devez être connecté pour accéder à vos données cloud')
    }
    
    if (this.syncStatus === 'offline') {
      throw new Error('Impossible de charger les données hors ligne. Vérifiez votre connexion internet.')
    }
    
    this.syncStatus = 'syncing'
    
    try {
      const userId = this.currentUser!.id
      
      // Charger tous les todos
      const { data: todos, error: todosError } = await this.client
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
      
      if (todosError) {
        // Check if it's an auth error
        if (todosError.message.includes('JWT') || todosError.message.includes('expired')) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
        }
        throw todosError
      }
      
      // Charger toutes les listes
      const { data: lists, error: listsError } = await this.client
        .from('lists')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
      
      if (listsError) {
        if (listsError.message.includes('JWT') || listsError.message.includes('expired')) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
        }
        throw listsError
      }
      
      // Charger tous les labels
      const { data: labels, error: labelsError } = await this.client
        .from('labels')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
      
      if (labelsError) {
        if (labelsError.message.includes('JWT') || labelsError.message.includes('expired')) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
        }
        throw labelsError
      }
      
      // Charger les settings
      const { data: settings, error: settingsError } = await this.client
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      // Settings peuvent ne pas exister encore (premier chargement)
      if (settingsError && settingsError.code !== 'PGRST116') {
        if (settingsError.message.includes('JWT') || settingsError.message.includes('expired')) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
        }
        throw settingsError
      }
      
      this.syncStatus = 'synced'
      
      const appData: AppData = {
        todos: (todos || []).map(this.dbTodoToTodo),
        settings: settings ? this.dbSettingsToSettings(settings, lists || [], labels || []) : this.getDefaultSettings(lists || [], labels || [])
      }
      
      // Stocker les données actuelles pour les updates incrémentales
      this.currentData = appData
      
      return appData
    } catch (error) {
      this.syncStatus = 'error'
      console.error('Failed to load cloud data:', error)
      
      // Rethrow with formatted message if it's already an Error
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Impossible de charger les données du cloud')
    }
  }
  
  async save(data: AppData): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Vous devez être connecté pour sauvegarder vos données dans le cloud')
    }
    
    if (this.syncStatus === 'offline') {
      throw new Error('Impossible de sauvegarder hors ligne. Vérifiez votre connexion internet.')
    }
    
    this.syncStatus = 'syncing'
    
    try {
      const userId = this.currentUser!.id
      const deviceId = this.getDeviceId()
      const now = Date.now()
      
      // Upsert todos
      const dbTodos: DbTodo[] = data.todos.map(todo => ({
        id: todo.id,
        user_id: userId,
        title: todo.title,
        details: todo.details || null,
        parent_id: todo.parentId || null,
        list_id: todo.listId || null,
        starred: todo.starred ?? false,
        priority: todo.priority || 'none',
        label_id: todo.labelId || null,
        sort_index: todo.sortIndex || null,
        created_at: todo.createdAt,
        completed_at: todo.completedAt || null,
        reminder_at: todo.reminderAt || null,
        updated_at: now,
        deleted_at: null,
        device_id: deviceId,
        version: 1
      }))
      
      if (dbTodos.length > 0) {
        const { error: todosError } = await this.client
          .from('todos')
          .upsert(dbTodos)
        
        if (todosError) {
          if (todosError.message.includes('JWT') || todosError.message.includes('expired')) {
            throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
          }
          throw todosError
        }
      }
      
      // Upsert lists
      const dbLists: DbList[] = data.settings.lists.map(list => ({
        id: list.id,
        user_id: userId,
        name: list.name,
        created_at: list.createdAt,
        updated_at: now,
        deleted_at: null,
        device_id: deviceId,
        version: 1
      }))
      
      if (dbLists.length > 0) {
        const { error: listsError } = await this.client
          .from('lists')
          .upsert(dbLists)
        
        if (listsError) {
          if (listsError.message.includes('JWT') || listsError.message.includes('expired')) {
            throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
          }
          throw listsError
        }
      }
      
      // Upsert labels
      const dbLabels: DbLabel[] = data.settings.labels.map(label => ({
        id: label.id,
        user_id: userId,
        name: label.name,
        color: label.color,
        created_at: 0,
        updated_at: now,
        deleted_at: null,
        device_id: deviceId,
        version: 1
      }))
      
      if (dbLabels.length > 0) {
        const { error: labelsError } = await this.client
          .from('labels')
          .upsert(dbLabels)
        
        if (labelsError) {
          if (labelsError.message.includes('JWT') || labelsError.message.includes('expired')) {
            throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
          }
          throw labelsError
        }
      }
      
      // Upsert settings
      const dbSettings: DbSettings = {
        user_id: userId,
        theme_mode: data.settings.themeMode,
        auto_close_on_blur: data.settings.autoCloseOnBlur,
        enable_autostart: data.settings.enableAutostart,
        global_shortcut: data.settings.globalShortcut,
        sort_mode: data.settings.sortMode,
        sort_order: data.settings.sortOrder,
        active_list_id: data.settings.activeListId,
        updated_at: now,
        device_id: deviceId,
        version: 1
      }
      
      const { error: settingsError } = await this.client
        .from('user_settings')
        .upsert(dbSettings)
      
      if (settingsError) {
        if (settingsError.message.includes('JWT') || settingsError.message.includes('expired')) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
        }
        throw settingsError
      }
      
      // Mettre à jour les données actuelles
      this.currentData = data
      
      this.syncStatus = 'synced'
    } catch (error) {
      this.syncStatus = 'error'
      console.error('Failed to save cloud data:', error)
      
      // Rethrow with formatted message if it's already an Error
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Impossible de sauvegarder les données dans le cloud')
    }
  }
  
  async signIn(email: string, password: string): Promise<void> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        this.currentUser = {
          id: data.user.id,
          email: data.user.email || ''
        }
      }
    } catch (error) {
      throw new Error(formatAuthError(error))
    }
  }
  
  async signUp(email: string, password: string): Promise<void> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        this.currentUser = {
          id: data.user.id,
          email: data.user.email || ''
        }
      }
    } catch (error) {
      throw new Error(formatAuthError(error))
    }
  }
  
  async signOut(): Promise<void> {
    await this.client.auth.signOut()
    this.currentUser = null
    this.currentData = null
    this.syncStatus = 'idle'
    this.unsubscribeAll()
  }
  
  subscribe(callback: (data: AppData) => void): () => void {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }
    
    const userId = this.currentUser!.id
    
    // Subscribe to todos changes
    const todosChannel = this.client
      .channel(`todos-changes-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Mise à jour incrémentale au lieu de recharger tout
          this.handleTodoChange(payload, callback)
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[CloudStorage] Subscribed to todos changes')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[CloudStorage] Channel error:', err?.message)
          this.syncStatus = 'error'
        }
        if (status === 'TIMED_OUT') {
          console.error('[CloudStorage] Subscription timed out')
          this.syncStatus = 'error'
        }
        if (status === 'CLOSED') {
          console.log('[CloudStorage] Channel closed')
        }
      })
    
    this.subscriptions.push(todosChannel)
    
    // Subscribe to lists changes
    const listsChannel = this.client
      .channel(`lists-changes-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleListChange(payload, callback)
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('[CloudStorage] Lists channel error:', err?.message)
        }
      })
    
    this.subscriptions.push(listsChannel)
    
    // Subscribe to labels changes
    const labelsChannel = this.client
      .channel(`labels-changes-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'labels',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleLabelChange(payload, callback)
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('[CloudStorage] Labels channel error:', err?.message)
        }
      })
    
    this.subscriptions.push(labelsChannel)
    
    // Subscribe to settings changes
    const settingsChannel = this.client
      .channel(`settings-changes-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Pour les settings, on recharge tout car c'est un seul objet
          void this.load().then(callback).catch(console.error)
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('[CloudStorage] Settings channel error:', err?.message)
        }
      })
    
    this.subscriptions.push(settingsChannel)
    
    // Retourner la fonction d'unsubscribe
    return () => this.unsubscribeAll()
  }
  
  destroy(): void {
    // Cleanup auth subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe()
      this.authSubscription = undefined
    }
    
    // Cleanup realtime subscriptions
    this.unsubscribeAll()
    
    // Cleanup network listeners
    if (typeof window !== 'undefined' && this.networkListenersAttached) {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
      this.networkListenersAttached = false
    }
  }
  
  private unsubscribeAll(): void {
    this.subscriptions.forEach(sub => {
      void this.client.removeChannel(sub)
    })
    this.subscriptions = []
  }
  
  private handleTodoChange(payload: any, callback: (data: AppData) => void): void {
    if (!this.currentData) {
      // Si pas de données en cache, recharger tout
      void this.load().then(callback).catch(console.error)
      return
    }
    
    const eventType = payload.eventType
    const newRecord = payload.new as DbTodo | undefined
    const oldRecord = payload.old as { id: string } | undefined
    
    let todos = [...this.currentData.todos]
    
    if (eventType === 'INSERT' && newRecord) {
      // Ajouter le nouveau todo
      todos.push(this.dbTodoToTodo(newRecord))
    } else if (eventType === 'UPDATE' && newRecord) {
      // Mettre à jour le todo existant
      const index = todos.findIndex(t => t.id === newRecord.id)
      if (index !== -1) {
        todos[index] = this.dbTodoToTodo(newRecord)
      }
    } else if (eventType === 'DELETE' && oldRecord) {
      // Supprimer le todo
      todos = todos.filter(t => t.id !== oldRecord.id)
    }
    
    this.currentData = {
      ...this.currentData,
      todos
    }
    
    callback(this.currentData)
  }
  
  private handleListChange(payload: any, callback: (data: AppData) => void): void {
    if (!this.currentData) {
      void this.load().then(callback).catch(console.error)
      return
    }
    
    const eventType = payload.eventType
    const newRecord = payload.new as DbList | undefined
    const oldRecord = payload.old as { id: string } | undefined
    
    let lists = [...this.currentData.settings.lists]
    
    if (eventType === 'INSERT' && newRecord) {
      lists.push({
        id: newRecord.id,
        name: newRecord.name,
        createdAt: newRecord.created_at
      })
    } else if (eventType === 'UPDATE' && newRecord) {
      const index = lists.findIndex(l => l.id === newRecord.id)
      if (index !== -1) {
        lists[index] = {
          id: newRecord.id,
          name: newRecord.name,
          createdAt: newRecord.created_at
        }
      }
    } else if (eventType === 'DELETE' && oldRecord) {
      lists = lists.filter(l => l.id !== oldRecord.id)
    }
    
    this.currentData = {
      ...this.currentData,
      settings: {
        ...this.currentData.settings,
        lists
      }
    }
    
    callback(this.currentData)
  }
  
  private handleLabelChange(payload: any, callback: (data: AppData) => void): void {
    if (!this.currentData) {
      void this.load().then(callback).catch(console.error)
      return
    }
    
    const eventType = payload.eventType
    const newRecord = payload.new as DbLabel | undefined
    const oldRecord = payload.old as { id: string } | undefined
    
    let labels = [...this.currentData.settings.labels]
    
    if (eventType === 'INSERT' && newRecord) {
      labels.push({
        id: newRecord.id,
        name: newRecord.name,
        color: newRecord.color as TodoLabel['color']
      })
    } else if (eventType === 'UPDATE' && newRecord) {
      const index = labels.findIndex(l => l.id === newRecord.id)
      if (index !== -1) {
        labels[index] = {
          id: newRecord.id,
          name: newRecord.name,
          color: newRecord.color as TodoLabel['color']
        }
      }
    } else if (eventType === 'DELETE' && oldRecord) {
      labels = labels.filter(l => l.id !== oldRecord.id)
    }
    
    this.currentData = {
      ...this.currentData,
      settings: {
        ...this.currentData.settings,
        labels
      }
    }
    
    callback(this.currentData)
  }
  
  private dbTodoToTodo(dbTodo: DbTodo): Todo {
    return {
      id: dbTodo.id,
      title: dbTodo.title,
      details: dbTodo.details || undefined,
      parentId: dbTodo.parent_id || undefined,
      listId: dbTodo.list_id || undefined,
      starred: dbTodo.starred,
      priority: dbTodo.priority as Todo['priority'],
      labelId: dbTodo.label_id || undefined,
      sortIndex: dbTodo.sort_index || undefined,
      createdAt: dbTodo.created_at,
      completedAt: dbTodo.completed_at || undefined,
      reminderAt: dbTodo.reminder_at || undefined
    }
  }
  
  private dbSettingsToSettings(dbSettings: DbSettings, lists: DbList[], labels: DbLabel[]): Settings {
    return {
      sortMode: dbSettings.sort_mode as Settings['sortMode'],
      sortOrder: dbSettings.sort_order as Settings['sortOrder'],
      autoCloseOnBlur: dbSettings.auto_close_on_blur,
      lists: lists.map(list => ({
        id: list.id,
        name: list.name,
        createdAt: list.created_at
      })),
      activeListId: dbSettings.active_list_id,
      globalShortcut: dbSettings.global_shortcut,
      themeMode: dbSettings.theme_mode as Settings['themeMode'],
      labels: labels.map(label => ({
        id: label.id,
        name: label.name,
        color: label.color as TodoLabel['color']
      })),
      enableAutostart: dbSettings.enable_autostart
    }
  }
  
  private getDefaultSettings(lists: DbList[], labels: DbLabel[]): Settings {
    return {
      sortMode: 'recent',
      sortOrder: 'desc',
      autoCloseOnBlur: true,
      lists: lists.map(list => ({
        id: list.id,
        name: list.name,
        createdAt: list.created_at
      })),
      activeListId: lists[0]?.id || 'default',
      globalShortcut: 'Shift+Space',
      themeMode: 'system',
      labels: labels.map(label => ({
        id: label.id,
        name: label.name,
        color: label.color as TodoLabel['color']
      })),
      enableAutostart: true
    }
  }
  
  private getDeviceId(): string {
    // Générer un ID d'appareil unique et le persister
    const storageKey = 'todo-overlay-device-id'
    let deviceId = localStorage.getItem(storageKey)
    
    if (!deviceId) {
      deviceId = crypto.randomUUID()
      localStorage.setItem(storageKey, deviceId)
    }
    
    return deviceId
  }
}
