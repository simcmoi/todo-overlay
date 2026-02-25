# Agent Context - Todo Overlay

**Version**: v0.2.3 | **Updated**: 2026-02-25  
**Repo**: https://github.com/simcmoi/todo-overlay

---

## 🎯 Vue d'ensemble

**Todo Overlay** est une application de tâches desktop cross-platform avec :
- Fenêtre overlay toujours visible activée par raccourci global
- Stockage local par défaut, sync cloud Supabase optionnel
- Backend Rust (Tauri 2) + Frontend React 19 + TypeScript

### Stack technique

```
Backend:    Rust + Tauri 2.x
Frontend:   React 19 + TypeScript + Vite
UI:         shadcn/ui + Radix UI + Tailwind CSS
State:      Zustand
Cloud:      Supabase (optionnel)
Updates:    Tauri updater + GitHub Releases
```

---

## 🏗️ Architecture critique

### 1. Système dual-window

```
main window     → Fenêtre normale (settings, gestion)
overlay window  → Always-on-top, frameless (quick access)
```

**⚠️ ERREUR À NE PAS FAIRE**:
- Ne JAMAIS créer de troisième fenêtre
- Ne JAMAIS confondre les labels "main" et "overlay"
- Les deux fenêtres existent TOUJOURS (jamais destroy/recreate)

### 2. Communication Backend ↔ Frontend

**Tauri Commands** (Frontend appelle Backend):
```rust
// Backend: src-tauri/src/commands.rs
#[tauri::command]
pub fn my_command() -> Result<String, String> { }

// Frontend: src/lib/tauri.ts
import { invoke } from '@tauri-apps/api/core'
invoke<string>('my_command')
```

**Events** (Backend notifie Frontend):
```rust
// Backend
app.emit("event-name", payload)?;

// Frontend
import { listen } from '@tauri-apps/api/event'
await listen('event-name', (event) => { })
```

**⚠️ ERREUR À NE PAS FAIRE**:
- Ne JAMAIS utiliser `window.location.reload()` → Utiliser events Tauri
- Ne JAMAIS faire de HTTP requests du frontend vers "localhost:XXXX" → Utiliser commands Tauri
- Ne JAMAIS utiliser localStorage pour communiquer entre fenêtres → Utiliser events Tauri

### 3. Storage Modes

```
Local Mode:  Fichier JSON via Tauri filesystem API
            └─ src-tauri/src/storage.rs

Cloud Mode:  Supabase avec real-time sync
            └─ src/lib/storage/cloud-storage.ts
```

**⚠️ ERREUR À NE PAS FAIRE**:
- Ne JAMAIS mélanger les deux modes simultanément
- Ne JAMAIS écrire directement dans le filesystem depuis React
- Les writes passent TOUJOURS par Zustand store → storage layer → Tauri command

### 4. État global (Zustand)

**Store principal**: `src/store/use-todo-store.ts`

```typescript
// ❌ MAUVAIS - Mutation directe
todos[0].completed = true

// ✅ BON - Via action Zustand
toggleTodo(todoId)
```

**⚠️ ERREUR À NE PAS FAIRE**:
- Ne JAMAIS muter le state directement
- Ne JAMAIS créer plusieurs stores pour les mêmes données
- Toujours utiliser les actions du store

---

## ⚠️ Erreurs critiques à éviter

### 1. Rust / Tauri

```rust
// ❌ MAUVAIS - Panic en production
window.ns_window().unwrap()

// ✅ BON - Gestion d'erreur
match window.ns_window() {
    Ok(ns_window) => { /* ... */ }
    Err(e) => eprintln!("Error: {}", e)
}
```

**Règles**:
- ❌ Ne JAMAIS utiliser `.unwrap()` dans le code de production
- ❌ Ne JAMAIS utiliser `.expect()` sauf cas impossible
- ✅ TOUJOURS gérer les `Result` et `Option` proprement
- ✅ Utiliser `?` pour propager les erreurs

### 2. Raccourcis globaux

**⚠️ CRITIQUE**: Le raccourci global doit être ré-enregistré après `reset_all_data()`

```rust
// src-tauri/src/commands.rs:286-290
pub fn reset_all_data(app: AppHandle) -> Result<(), String> {
    storage::reset_data_dir(&app)?;
    // ⚠️ NE PAS OUBLIER ↓
    shortcuts::replace_registered_shortcut(&app, DEFAULT_SHORTCUT)?;
    Ok(())
}
```

### 3. shadcn/ui Components

```bash
npx shadcn@latest add select
```

**⚠️ ATTENTION**: Les composants sont créés dans `src/components/ui/`, PAS dans `@/components/ui/`

Si shadcn crée le fichier au mauvais endroit, le déplacer manuellement.

### 4. Système de mise à jour

**Configuration**: `src-tauri/tauri.conf.json`

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://github.com/simcmoi/todo-overlay/releases/latest/download/latest.json"
      ],
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6..."
    }
  }
}
```

**⚠️ ERREURS À NE PAS FAIRE**:
- ❌ Ne JAMAIS changer la `pubkey` (signatures invalides)
- ❌ Ne JAMAIS rendre le repo privé (updates cassées)
- ❌ Ne JAMAIS oublier de bump la version dans **2 fichiers**:
  - `package.json`
  - `src-tauri/tauri.conf.json`

### 5. Release Process

**Workflow automatisé** via GitHub Actions au push d'un tag:

```bash
# 1. Bump version dans LES DEUX fichiers
package.json             → "version": "0.2.4"
src-tauri/tauri.conf.json → "version": "0.2.4"

# 2. Commit + Tag + Push
git add package.json src-tauri/tauri.conf.json
git commit -m "chore: bump version to 0.2.4"
git tag -a v0.2.4 -m "Release v0.2.4"
git push origin main
git push origin v0.2.4

# 3. GitHub Actions build et publie automatiquement
```

**⚠️ Si tu oublies un fichier** → Les versions ne matchent pas → Confusion totale

---

## 📁 Structure du projet

```
src/
├── components/
│   ├── auth/              # Supabase login
│   ├── onboarding/        # First-launch wizard
│   ├── storage/           # Storage mode settings
│   └── ui/                # shadcn/ui components ⚠️ Vérifier le path
├── lib/
│   ├── storage/           # Abstraction local/cloud
│   └── sounds/            # Audio feedback
├── store/
│   ├── use-todo-store.ts  # État principal ⚠️ NE PAS MUTER DIRECTEMENT
│   └── use-update-store.ts
└── types/
    └── todo.ts            # Types TypeScript

src-tauri/src/
├── main.rs               # Entry point
├── commands.rs           # Tauri commands ⚠️ Toujours Result<T, String>
├── shortcuts.rs          # Global shortcuts ⚠️ Re-register après reset
├── window.rs             # Window management ⚠️ Pas de .unwrap()
├── tray.rs               # System tray
└── storage.rs            # File operations
```

---

## 🔑 Points d'attention

### Fenêtres
- **2 fenêtres** (main + overlay), pas plus, pas moins
- Overlay = always-on-top, frameless, toggle avec raccourci global
- Ne jamais destroy/recreate, juste show/hide

### Communication
- Frontend → Backend: `invoke()` commands
- Backend → Frontend: `emit()` events
- JAMAIS de `window.location.reload()`, utiliser events

### État
- Un seul store Zustand pour les todos
- Passer par les actions, ne jamais muter directement
- Storage layer abstrait local vs cloud

### Rust
- JAMAIS de `.unwrap()` en production
- TOUJOURS gérer Result/Option
- Re-register shortcuts après reset

### Releases
- Bump version dans **2 fichiers** (package.json + tauri.conf.json)
- Tag Git déclenche GitHub Actions
- Repo DOIT être public pour les updates

### shadcn/ui
- Components dans `src/components/ui/`
- Vérifier le path après installation

---

## 🚀 Commandes essentielles

```bash
# Dev
npm run tauri dev          # Hot reload

# Build
npm run tauri build        # Production build
                          # → src-tauri/target/release/bundle/

# Test
npm run test              # Vitest
npm run test:ui           # Vitest UI

# Release
# 1. Bump dans package.json + tauri.conf.json
# 2. git commit + git tag + git push
```

---

## 📝 État actuel (v0.2.3)

### ✅ Fonctionnel
- Dual window system
- Global shortcuts
- Local + Cloud storage
- Auto-updates via GitHub
- Onboarding wizard
- Settings UI modernisée (Select components)
- Event-driven data reset

### 🔧 Fixes récents (v0.2.3)
1. Re-register shortcut après reset
2. Gestion erreur macOS unsafe code
3. Event-driven reset (plus de `location.reload()`)
4. UI settings avec shadcn/ui Select

### 📍 Prochaines étapes
Voir `NEXT_STEPS.md` pour la roadmap

---

## 🆘 Debugging

### Updates cassées ?
→ Vérifier que le repo est **public**  
→ Vérifier que `latest.json` existe sur GitHub Releases

### Shortcut ne fonctionne plus après reset ?
→ Vérifier que `replace_registered_shortcut()` est appelé dans `reset_all_data()`

### Fenêtre overlay ne s'affiche pas ?
→ Vérifier le label ("overlay" pas "main")  
→ Vérifier `alwaysOnTop: true` dans window config

### shadcn component non trouvé ?
→ Vérifier qu'il est dans `src/components/ui/` (pas `@/components/ui/`)

### État Zustand corrompu ?
→ Ne JAMAIS muter directement, toujours via actions  
→ Vérifier que storage layer est bien synchronisé

---

**Règle d'or**: En cas de doute sur l'architecture, cherche d'abord dans les fichiers existants comment c'est fait ailleurs dans le projet. La cohérence est critique.
