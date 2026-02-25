# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

## [0.2.4] - 2026-02-25

### Ajouté
- Tooltips détaillés sur tous les paramètres de l'application pour une meilleure compréhension
- Système automatique de changelog lors des releases GitHub
- Dialog "Nouveautés" affichant le changelog formaté en Markdown
- Bouton "Nouveautés" dans le banner de mise à jour
- Commande Tauri `get_changelog` pour récupérer le changelog depuis GitHub ou localement
- Script `.github/scripts/extract-changelog.sh` pour extraire automatiquement les sections de version
- Support react-markdown pour afficher le changelog formaté

### Modifié
- GitHub Action `release.yml` : intègre désormais le changelog dans le corps de la release
- UpdateBanner : ajout d'un bouton "Nouveautés" avant le bouton "Installer"

### Corrigé
- Variables CSS `--popover` et `--popover-foreground` manquantes causant des tooltips transparents
- Tooltips désormais opaques avec fond adapté au thème (clair/sombre)

## [0.2.2] - 2026-02-25

### Changed
- Redesigned settings page with cleaner, minimal interface
- Removed unnecessary borders and boxes from settings
- Improved visual hierarchy with subtle separators
- Redesigned update notification banner (more discreet and integrated)

### Fixed
- App now properly hides from macOS Dock (menu bar only)
- Fixed updater signing key configuration

## [0.2.0] - 2026-02-25

### Ajouté

#### UX
- **Auto-ouverture de l'éditeur** : L'éditeur de création de tâche s'ouvre automatiquement à chaque fois que vous appuyez sur Shift+Space
- **Gestion Escape à deux niveaux** : Premier Escape ferme l'éditeur, deuxième Escape ferme la fenêtre
- **Refonte UI éditeur** : Layout vertical simplifié et intuitif
  - Checkbox + Input titre alignés horizontalement
  - Icône + texte "Détails" cliquable qui affiche un input inline sans cadre
  - Boutons de dates (Aujourd'hui | Demain | Calendrier) toujours visibles
- **Input date-time** : Sélecteur de date/heure apparaît sous les boutons rapides

#### Système
- **Support macOS Fullscreen** : L'overlay s'affiche maintenant au-dessus des applications en plein écran (NSFloatingWindowLevel)
- **Système de logging complet** :
  - Logs écrits dans `todo-overlay.log` avec rotation à 5MB
  - Logs ajoutés pour : create, update, delete, complete todo
  - Section "Logs de débogage" dans les Paramètres
  - Bouton pour ouvrir directement le fichier de log

#### Tests
- Configuration complète de Vitest
- 7 tests unitaires pour le store de todos
- Scripts npm : `test`, `test:run`, `test:coverage`

#### Infrastructure Web
- **Landing page** React avec Tailwind CSS + shadcn/ui + Framer Motion
  - Hero section animée
  - Grid de 8 fonctionnalités avec animations
  - Section screenshots avec placeholders
  - Section download avec détection automatique de l'OS
  - Footer avec liens GitHub
- **Serveur de mises à jour** :
  - Structure pour héberger les releases par plateforme
  - `releases.json` pour le manifest des versions
  - Documentation pour signer les releases
- **Docker** :
  - `docker-compose.yml` pour déploiement facile
  - Dockerfile multi-étapes pour la landing page
  - Configuration Nginx pour SPA + serveur d'updates avec CORS
- **GitHub Actions** :
  - Workflow `release.yml` pour build automatique multi-plateforme
  - Workflow `deploy-landing.yml` pour déployer sur GitHub Pages
  - Documentation complète dans `.github/GITHUB_ACTIONS_SETUP.md`

### Modifié

- **Code refactorisé** dans `todo-list.tsx` et `use-window-behavior.ts`
- **Événements custom** pour communication entre composants et hooks
- **Configuration du plugin `tauri-plugin-log`** dans `src-tauri/src/lib.rs`
- **Commandes Tauri** ajoutées : `get_log_file_path()`, `open_log_file()`

### Supprimé

- Fichiers inutilisés : `App.css`, `react.svg`, `vite.svg` (remplacé par `app-icon.png`)
- Code dupliqué : fonctions `fromDateInputValue()`, `toDateInputValue()`
- Variables inutilisées dans `todo-list.tsx`

### Corrigé

- L'éditeur de tâche ne s'ouvrait pas aux lancements suivants après le premier
- Gestion des événements Escape qui interfère avec la fermeture de fenêtre
- Propagation d'événements entre l'input et le hook window-behavior

---

## [0.1.0] - [Date initiale]

### Ajouté

- Application de base Tauri v2 + React 19
- Gestion de tâches avec store Zustand
- Multi-listes et labels
- Sous-tâches illimitées avec drag & drop
- Rappels avec notifications natives
- Mode sombre/clair avec synchronisation système
- Overlay transparent toujours au premier plan
- Raccourci global Shift+Space pour afficher/masquer
- Base de données SQLite locale
- Paramètres utilisateur persistants

---

## Format des versions

- **MAJOR** (X.0.0) : Changements incompatibles avec les versions précédentes
- **MINOR** (0.X.0) : Ajout de fonctionnalités rétro-compatibles
- **PATCH** (0.0.X) : Corrections de bugs rétro-compatibles

[0.2.0]: https://github.com/simonfessy/todo-overlay/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/simonfessy/todo-overlay/releases/tag/v0.1.0
