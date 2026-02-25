# Architecture de Synchronisation Cloud

Ce document décrit l'architecture complète du système de synchronisation cloud pour Todo Overlay, permettant aux utilisateurs de synchroniser leurs données entre plusieurs appareils.

---

## 📋 Vue d'ensemble

Les utilisateurs peuvent choisir entre 3 modes de stockage :

1. **Local (par défaut)** - Fichier JSON sur le disque local
2. **Cloud** - Synchronisation avec base de données hébergée (Supabase)
3. **Hybride** - Local + backup cloud périodique

```
┌─────────────────────────────────────────────────────────────┐
│                    Todo Overlay App                         │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Local    │  │    Cloud     │  │   Hybride    │       │
│  │  Storage   │  │   Storage    │  │   Storage    │       │
│  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘       │
│        │                 │                  │                │
└────────┼─────────────────┼──────────────────┼────────────────┘
         │                 │                  │
         ▼                 ▼                  ▼
    ┌────────┐      ┌──────────────┐    ┌────────┐
    │ JSON   │      │   Supabase   │    │ JSON + │
    │  File  │      │  PostgreSQL  │    │  Cloud │
    └────────┘      └──────────────┘    └────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │  Auth    │  │ Real-time│
              │ Service  │  │   Sync   │
              └──────────┘  └──────────┘
```

---

## 🎯 Expérience Utilisateur

### Premier Démarrage

**Écran de bienvenue avec 3 options :**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Bienvenue sur Todo Overlay             │
│                                                     │
│     Où souhaitez-vous sauvegarder vos données ?    │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  💾 Local (Recommandé pour débuter)        │   │
│  │                                            │   │
│  │  • Tout reste sur votre appareil          │   │
│  │  • 100% privé, aucune connexion           │   │
│  │  • Gratuit, rapide, offline               │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  ☁️  Cloud (Sync entre appareils)          │   │
│  │                                            │   │
│  │  • Accédez à vos tâches partout           │   │
│  │  • Synchronisation automatique             │   │
│  │  • Backup automatique                      │   │
│  │  • Gratuit jusqu'à 1000 tâches            │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  🔄 Hybride (Meilleur des deux)           │   │
│  │                                            │   │
│  │  • Local par défaut (rapide)              │   │
│  │  • Backup cloud automatique               │   │
│  │  • Restauration facile                    │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│         Vous pourrez changer à tout moment         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Changement de Mode (Settings)

L'utilisateur peut basculer entre les modes à tout moment :

```tsx
Settings → Stockage des données
  
  [ ] Local uniquement
  [x] Cloud (connecté comme simon@example.com)
  [ ] Hybride
  
  [Migrer mes données vers le cloud]
  [Télécharger une copie locale]
```

---

## 🗄️ Architecture Base de Données (Supabase)

### Schéma PostgreSQL

```sql
-- Table des utilisateurs (gérée par Supabase Auth)
-- auth.users (built-in)

-- Table des todos
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Données de la tâche
  title TEXT NOT NULL,
  completed_at BIGINT,
  starred BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low', 'none')),
  label_id UUID REFERENCES labels(id) ON DELETE SET NULL,
  list_id UUID REFERENCES lists(id) ON DELETE SET NULL,
  reminder_at BIGINT,
  sort_index INTEGER,
  
  -- Métadonnées
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT, -- Soft delete pour sync
  
  -- Sync
  device_id TEXT, -- Quel appareil a modifié en dernier
  version INTEGER DEFAULT 1, -- Pour résolution de conflits
  
  UNIQUE(user_id, id)
);

-- Index pour performances
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_list_id ON todos(list_id);
CREATE INDEX idx_todos_updated_at ON todos(updated_at);
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at) WHERE deleted_at IS NULL;

-- Table des listes
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT,
  
  device_id TEXT,
  version INTEGER DEFAULT 1,
  
  UNIQUE(user_id, id)
);

CREATE INDEX idx_lists_user_id ON lists(user_id);
CREATE INDEX idx_lists_updated_at ON lists(updated_at);

-- Table des labels
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('slate', 'blue', 'green', 'amber', 'rose', 'violet')),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT,
  
  device_id TEXT,
  version INTEGER DEFAULT 1,
  
  UNIQUE(user_id, id)
);

CREATE INDEX idx_labels_user_id ON labels(user_id);
CREATE INDEX idx_labels_updated_at ON labels(updated_at);

-- Table des settings (1 row par user)
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Settings de l'app
  theme_mode TEXT DEFAULT 'system',
  auto_close_on_blur BOOLEAN DEFAULT TRUE,
  enable_autostart BOOLEAN DEFAULT FALSE,
  global_shortcut TEXT DEFAULT 'CmdOrCtrl+Shift+T',
  sort_mode TEXT DEFAULT 'recent',
  sort_order TEXT DEFAULT 'desc',
  active_list_id UUID,
  
  updated_at BIGINT NOT NULL,
  device_id TEXT,
  version INTEGER DEFAULT 1
);

-- Table de sync state (pour chaque appareil)
CREATE TABLE sync_state (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  
  last_sync_at BIGINT NOT NULL,
  last_push_at BIGINT,
  last_pull_at BIGINT,
  
  PRIMARY KEY (user_id, device_id)
);
```

### Row Level Security (RLS)

Chaque utilisateur ne peut accéder qu'à ses propres données :

```sql
-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_state ENABLE ROW LEVEL SECURITY;

-- Policies pour todos
CREATE POLICY "Users can view their own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- Répéter pour lists, labels, user_settings, sync_state
```

---

## 🔄 Synchronisation en Temps Réel

### Stratégie de Sync

**Modèle : Optimistic UI + Eventual Consistency**

```
Appareil A                 Supabase                 Appareil B
    |                         |                         |
    |--[1] Créer todo]------->|                         |
    |   (optimistic)          |                         |
    |                         |--[2] Broadcast-------->|
    |<--[3] Confirmation------|   (WebSocket)          |
    |                         |                         |--[4] Apply change
    |                         |                         |   (merge local)
```

### Gestion des Conflits

**Résolution automatique avec stratégie "Last Write Wins" (LWW) :**

```typescript
interface SyncRecord {
  id: string
  user_id: string
  updated_at: number    // Timestamp
  version: number       // Version incrémentale
  device_id: string     // Appareil source
  // ... data fields
}

function resolveConflict(local: SyncRecord, remote: SyncRecord): SyncRecord {
  // 1. Si même version, prendre le plus récent (timestamp)
  if (local.version === remote.version) {
    return local.updated_at > remote.updated_at ? local : remote
  }
  
  // 2. Si versions différentes, prendre la version la plus haute
  return local.version > remote.version ? local : remote
}
```

### WebSocket Real-time

**Supabase Real-time pour sync instantanée :**

```typescript
// src/lib/supabase-sync.ts

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Subscribe to todos changes
const subscription = supabase
  .channel('todos')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'todos',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Change received:', payload)
      
      if (payload.eventType === 'INSERT') {
        // Merge new todo
        store.mergeTodo(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        // Update existing todo (conflict resolution)
        store.updateTodo(payload.new, { resolveConflict: true })
      } else if (payload.eventType === 'DELETE') {
        // Remove todo
        store.removeTodo(payload.old.id)
      }
    }
  )
  .subscribe()
```

---

## 🔐 Authentification

### Flux d'Authentification

**Supabase Auth avec Email/Password + OAuth :**

```
┌──────────────────────────────────────────────────┐
│           Écran de Connexion                     │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Email                                 │    │
│  │  ┌──────────────────────────────────┐ │    │
│  │  │ simon@example.com                │ │    │
│  │  └──────────────────────────────────┘ │    │
│  │                                        │    │
│  │  Mot de passe                          │    │
│  │  ┌──────────────────────────────────┐ │    │
│  │  │ ••••••••                         │ │    │
│  │  └──────────────────────────────────┘ │    │
│  │                                        │    │
│  │  [ Se connecter ]  [ S'inscrire ]     │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ────────────── ou ──────────────              │
│                                                  │
│  [ 🔗 Lien magique (email) ]                   │
│  [ G  Continuer avec Google ]                  │
│  [ 🍎 Continuer avec Apple ]                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Implémentation

```typescript
// src/lib/supabase-auth.ts

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Email/Password signup
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// Email/Password signin
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// Magic link (passwordless)
export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'todooverlay://auth/callback'
    }
  })
  
  if (error) throw error
  return data
}

// OAuth (Google, Apple)
export async function signInWithOAuth(provider: 'google' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'todooverlay://auth/callback'
    }
  })
  
  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Listen to auth changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
```

---

## 📦 Migration des Données

### Local → Cloud

**Quand l'utilisateur active le cloud pour la première fois :**

```typescript
// src/lib/migration.ts

export async function migrateLocalToCloud(userId: string) {
  // 1. Lire les données locales
  const localData = await storage.load()
  
  // 2. Créer les UUIDs si nécessaire
  const todos = localData.todos.map(todo => ({
    ...todo,
    id: todo.id || crypto.randomUUID(),
    user_id: userId,
    device_id: getDeviceId(),
    version: 1
  }))
  
  const lists = localData.lists.map(list => ({
    ...list,
    id: list.id || crypto.randomUUID(),
    user_id: userId,
    device_id: getDeviceId(),
    version: 1
  }))
  
  const labels = localData.labels.map(label => ({
    ...label,
    id: label.id || crypto.randomUUID(),
    user_id: userId,
    device_id: getDeviceId(),
    version: 1
  }))
  
  // 3. Upload vers Supabase (batch insert)
  await supabase.from('todos').insert(todos)
  await supabase.from('lists').insert(lists)
  await supabase.from('labels').insert(labels)
  await supabase.from('user_settings').upsert({
    user_id: userId,
    ...localData.settings,
    device_id: getDeviceId(),
    version: 1
  })
  
  // 4. Marquer la migration comme terminée
  await storage.saveMigrationState({ 
    migrated_to_cloud: true,
    migration_date: Date.now()
  })
  
  console.log('Migration terminée: Local → Cloud')
}
```

### Cloud → Local

**Télécharger une copie locale (backup) :**

```typescript
export async function downloadCloudToLocal(userId: string) {
  // 1. Fetch toutes les données
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
  
  const { data: lists } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
  
  const { data: labels } = await supabase
    .from('labels')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
  
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  // 2. Sauvegarder localement
  await storage.save({
    todos: todos || [],
    lists: lists || [],
    labels: labels || [],
    settings: settings || getDefaultSettings(),
  })
  
  console.log('Téléchargement terminé: Cloud → Local')
}
```

---

## 🔄 Mode Hybride

### Stratégie

**Local-first avec backup cloud périodique :**

1. **Lecture** : Toujours depuis le local (rapide)
2. **Écriture** : Local immédiat + Cloud async (non-bloquant)
3. **Sync** : Pull du cloud toutes les 5 minutes
4. **Conflit** : Résolution automatique (LWW)

```typescript
// src/lib/hybrid-storage.ts

class HybridStorage {
  private localStore: LocalStorage
  private cloudStore: CloudStorage
  private syncQueue: SyncQueue
  
  constructor() {
    this.localStore = new LocalStorage()
    this.cloudStore = new CloudStorage()
    this.syncQueue = new SyncQueue()
    
    // Sync périodique (toutes les 5 minutes)
    setInterval(() => this.sync(), 5 * 60 * 1000)
    
    // Sync au démarrage
    this.sync()
  }
  
  async save(data: AppData) {
    // 1. Sauvegarder localement (immédiat)
    await this.localStore.save(data)
    
    // 2. Enqueue cloud sync (non-bloquant)
    this.syncQueue.enqueue(() => this.cloudStore.save(data))
    
    return data
  }
  
  async load(): Promise<AppData> {
    // Toujours lire depuis local (rapide)
    return await this.localStore.load()
  }
  
  async sync() {
    try {
      // 1. Get last sync timestamp
      const lastSync = await this.localStore.getLastSyncTimestamp()
      
      // 2. Pull changes depuis cloud (since lastSync)
      const remoteChanges = await this.cloudStore.getChangesSince(lastSync)
      
      // 3. Merge avec local
      const localData = await this.localStore.load()
      const mergedData = this.mergeChanges(localData, remoteChanges)
      
      // 4. Sauvegarder le résultat
      await this.localStore.save(mergedData)
      
      // 5. Push local changes vers cloud
      const localChanges = await this.localStore.getChangesSince(lastSync)
      await this.cloudStore.pushChanges(localChanges)
      
      // 6. Update sync timestamp
      await this.localStore.setLastSyncTimestamp(Date.now())
      
      console.log('Sync réussie')
    } catch (error) {
      console.error('Erreur de sync:', error)
      // Continue en mode offline
    }
  }
  
  private mergeChanges(local: AppData, remote: AppData): AppData {
    // Résolution de conflits (LWW)
    return {
      todos: this.mergeTodos(local.todos, remote.todos),
      lists: this.mergeLists(local.lists, remote.lists),
      labels: this.mergeLabels(local.labels, remote.labels),
      settings: this.mergeSettings(local.settings, remote.settings),
    }
  }
  
  private mergeTodos(local: Todo[], remote: Todo[]): Todo[] {
    const merged = new Map<string, Todo>()
    
    // Ajouter tous les todos locaux
    local.forEach(todo => merged.set(todo.id, todo))
    
    // Merger avec remote (résolution de conflits)
    remote.forEach(remoteTodo => {
      const localTodo = merged.get(remoteTodo.id)
      
      if (!localTodo) {
        // Nouveau todo du cloud
        merged.set(remoteTodo.id, remoteTodo)
      } else {
        // Conflit → Résoudre avec LWW
        const resolved = resolveConflict(localTodo, remoteTodo)
        merged.set(remoteTodo.id, resolved)
      }
    })
    
    return Array.from(merged.values())
  }
}
```

---

## 💰 Modèle Freemium

### Plans

**Free (par défaut) :**
- ✅ 1000 tâches maximum
- ✅ Sync 2 appareils
- ✅ Backup automatique
- ✅ Support email

**Pro (4,99€/mois) :**
- ✅ Tâches illimitées
- ✅ Sync illimité
- ✅ Historique 1 an
- ✅ Export avancé
- ✅ Support prioritaire

**Team (14,99€/mois) :**
- ✅ Tout Pro +
- ✅ Partage de listes
- ✅ Collaboration temps réel
- ✅ Permissions granulaires
- ✅ SSO

### Implémentation

```sql
-- Table des subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  
  current_period_start BIGINT NOT NULL,
  current_period_end BIGINT NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
```

```typescript
// Vérifier les limites
async function canCreateTodo(userId: string): Promise<boolean> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single()
  
  const plan = subscription?.plan || 'free'
  
  if (plan === 'free') {
    const { count } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null)
    
    return (count || 0) < 1000
  }
  
  return true // Pro/Team = illimité
}
```

---

## 🚀 Déploiement Backend

### Option 1 : Supabase Cloud (Recommandé pour MVP)

```bash
# 1. Créer un projet sur supabase.com
# 2. Copier les credentials
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Appliquer les migrations
npx supabase db push

# 4. Configurer Auth providers (Google, Apple)
# Dans Dashboard → Auth → Providers
```

### Option 2 : Self-hosted (Pour contrôle total)

```bash
# Docker Compose (Supabase local)
git clone https://github.com/supabase/supabase
cd supabase/docker
docker-compose up -d
```

---

## 📊 Monitoring & Analytics

### Métriques à Tracker

**Performance :**
- Latence sync (moyenne, p95, p99)
- Nombre de conflits / heure
- Taux d'échec sync

**Usage :**
- Utilisateurs actifs (DAU, MAU)
- Nombre de todos / user
- Nombre d'appareils / user
- Répartition Free vs Pro

**Business :**
- Conversion Free → Pro
- Churn rate
- MRR (Monthly Recurring Revenue)

```typescript
// src/lib/analytics.ts

export function trackSyncEvent(event: 'success' | 'conflict' | 'error', metadata: any) {
  // PostHog, Mixpanel, ou analytics maison
  analytics.track('sync_event', {
    event,
    ...metadata,
    timestamp: Date.now()
  })
}
```

---

## 🔗 API Reference

### Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)
```

### CRUD Operations

```typescript
// Create
const { data, error } = await supabase
  .from('todos')
  .insert({ title: 'New task', user_id: userId })
  .select()
  .single()

// Read
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .eq('user_id', userId)
  .is('deleted_at', null)

// Update
const { data, error } = await supabase
  .from('todos')
  .update({ title: 'Updated task', updated_at: Date.now() })
  .eq('id', todoId)
  .eq('user_id', userId)

// Delete (soft delete)
const { data, error } = await supabase
  .from('todos')
  .update({ deleted_at: Date.now() })
  .eq('id', todoId)
  .eq('user_id', userId)
```

---

## 🎯 Roadmap d'Implémentation

### Phase 1 : MVP (2-3 semaines)
- [ ] Setup Supabase project
- [ ] Implémenter Auth (email/password)
- [ ] Écran de bienvenue (choix storage)
- [ ] Migration Local → Cloud
- [ ] Sync basique (pull/push manuel)
- [ ] UI pour connexion/déconnexion

### Phase 2 : Real-time (1-2 semaines)
- [ ] WebSocket subscriptions
- [ ] Sync automatique temps réel
- [ ] Gestion des conflits (LWW)
- [ ] Indicateur de sync status
- [ ] Mode offline graceful

### Phase 3 : Hybride (1 semaine)
- [ ] Local-first storage
- [ ] Backup cloud périodique
- [ ] Queue de sync
- [ ] Retry logic

### Phase 4 : Freemium (2-3 semaines)
- [ ] Intégration Stripe
- [ ] Limites Free tier
- [ ] Upgrade flow
- [ ] Gestion subscriptions

### Phase 5 : Polish (1-2 semaines)
- [ ] OAuth (Google, Apple)
- [ ] Magic links
- [ ] Analytics
- [ ] Monitoring
- [ ] Tests end-to-end

**Total : ~8-12 semaines de développement**

---

## 🔐 Sécurité

### Checklist

- [ ] HTTPS only
- [ ] Row Level Security (RLS) activée
- [ ] JWT tokens avec expiration
- [ ] Refresh tokens sécurisés
- [ ] Rate limiting (Supabase built-in)
- [ ] SQL injection protection (Supabase built-in)
- [ ] XSS protection (CSP headers)
- [ ] Chiffrement at-rest (PostgreSQL)
- [ ] Chiffrement in-transit (TLS 1.3)
- [ ] Audit logs
- [ ] 2FA (optional, Supabase Pro)

---

## 📚 Ressources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Real-time](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe Billing](https://stripe.com/docs/billing)

---

**Dernière mise à jour : 2026-02-25**
