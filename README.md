# ToDo Overlay (Tauri + React)

Application desktop ToDo minimaliste en overlay, pilotée par `Shift + Space`, avec stockage local JSON et notifications de rappel.

## Stack

- Frontend: React + TypeScript + Vite + TailwindCSS + shadcn/ui + Zustand + Framer Motion
- Backend: Rust + Tauri v2
- Stockage: JSON local via `appDataDir()/todos.json`

## Fonctionnalités V1

- Fenêtre overlay 420x520, always-on-top, non redimensionnable, sans décorations
- Toggle global via `Shift + Space` (fonctionne hors focus)
- Icône tray avec actions `Afficher / Masquer` et `Quitter`
- Bouton inline `Ajouter une tâche` dans la liste (pas d’input fixe en haut)
- Mode édition contextuel (une tâche ouverte à la fois) avec auto-save au blur / Enter
- Cases à cocher pour complétion instantanée + animation
- Bloc inline `Tâches terminées (n)` dépliable en bas de la liste
- Tâches terminées avec date de fin + suppression unitaire (poubelle)
- Pagination simple via bouton `Afficher plus` sur les tâches terminées
- Détails optionnels repliés/affichés à la demande
- Date optionnelle avec raccourcis: `Aujourd'hui`, `Demain`, `Choisir date`, `Date + heure`
- Historique + suppression d’historique avec confirmation
- Paramètres persistés:
  - `sortOrder`: `asc | desc`
  - `autoCloseOnBlur`: `true | false`
- Rappels par tâche depuis la liste active (date/heure locale, édition/suppression)
- Sauvegarde JSON automatique à chaque modification
- Scheduler reminders backend (scan toutes les 10 secondes)
- Notification système au rappel (`Rappel tâche`)
- Activation automatique du démarrage système (autostart plugin)

## Lancer en développement

```bash
npm install
npm run tauri dev
```

`tauri dev` lance une vraie fenêtre desktop native Tauri, mais avec un serveur Vite local uniquement pour le hot reload.

## Build

```bash
npm run tauri build -- --debug
```

## Build Windows (application installable)

Sur une machine Windows:

```powershell
npm install
npm run tauri build
```

Installers générés (selon config bundle):

- `src-tauri\\target\\release\\bundle\\nsis\\*.exe`
- `src-tauri\\target\\release\\bundle\\msi\\*.msi`

Après installation, l’app se lance comme une application Windows classique (pas via navigateur, pas via localhost).

Bundles générés (macOS):

- `src-tauri/target/debug/bundle/macos/ToDo Overlay.app`
- `src-tauri/target/debug/bundle/dmg/ToDo Overlay_0.1.0_aarch64.dmg`

## Structure

```txt
src/
  App.tsx
  components/
  hooks/
  lib/
  store/
  types/
src-tauri/src/
  main.rs
  lib.rs
  commands.rs
  tray.rs
  shortcuts.rs
  storage.rs
  reminder.rs
  window.rs
```
