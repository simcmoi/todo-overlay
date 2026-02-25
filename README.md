<div align="center">

# 📝 Todo Overlay

**L'application de to-do la plus rapide pour macOS, Windows et Linux**

Une application desktop minimaliste qui s'affiche instantanément avec `Shift+Space` pour capturer vos pensées sans interrompre votre workflow.

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/simcmoi/todo-overlay/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.10-orange.svg)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)

[🌐 Site Web](https://simcmoi.github.io/todo-overlay) • [📥 Télécharger](https://github.com/simcmoi/todo-overlay/releases) • [🐛 Reporter un Bug](https://github.com/simcmoi/todo-overlay/issues)

</div>

---

## ✨ Pourquoi Todo Overlay ?

- **⚡ Instantané** : Appuyez sur `Shift+Space` n'importe où, n'importe quand
- **🎯 Zéro friction** : Créez une tâche, ajoutez des détails, définissez une date - tout au clavier
- **🪶 Ultra-léger** : ~10MB, utilise moins de 50MB de RAM
- **🔒 Privé** : Vos données restent sur votre machine (JSON local)
- **🎨 Élégant** : Interface moderne avec mode sombre/clair
- **🚀 Rapide** : Bâti avec Rust + React pour des performances optimales

## 🎬 Démarrage Rapide

### Installation

**macOS / Windows / Linux**

Téléchargez la dernière version depuis la [page des releases](https://github.com/simcmoi/todo-overlay/releases) :

- **macOS** : `.dmg` (Apple Silicon & Intel)
- **Windows** : `.msi` ou `.exe` 
- **Linux** : `.AppImage` ou `.deb`

### Premier lancement

1. Lancez l'application (elle se place automatiquement dans la barre système)
2. Appuyez sur `Shift+Space` pour ouvrir l'overlay
3. Commencez à taper votre première tâche !

## 🚀 Fonctionnalités

### Multi-listes & Organisation

- **Listes multiples** : Organisez vos tâches en catégories (Personnel, Travail, Projets...)
- **Labels colorés** : Catégorisez et filtrez vos tâches avec des labels personnalisables
- **Sous-tâches illimitées** : Décomposez vos projets en sous-tâches imbriquées
- **Drag & Drop** : Réorganisez vos tâches et listes par glisser-déposer

### Productivité

- **Raccourcis clavier** : `Shift+Space` (toggle), `Escape` (fermer), `Enter` (sauvegarder)
- **Auto-focus** : L'éditeur s'ouvre automatiquement à chaque ouverture
- **Dates & Rappels** : Boutons rapides (Aujourd'hui, Demain) + sélecteur date/heure
- **Notifications natives** : Rappels système pour ne rien oublier
- **Historique complet** : Consultez et restaurez vos tâches terminées

### Interface

- **Overlay intelligent** : S'affiche au-dessus de toutes les fenêtres (même fullscreen sur macOS)
- **Mode sombre/clair** : Suit automatiquement vos préférences système
- **Animations fluides** : Transitions douces avec Framer Motion
- **Responsive** : Interface adaptative et intuitive

### Technique

- **Sauvegarde automatique** : Chaque modification est sauvegardée instantanément
- **Mises à jour auto** : L'app se met à jour automatiquement en arrière-plan
- **Système de logs** : Debug facilité avec logs détaillés (accès depuis les Paramètres)
- **Cross-platform** : Fonctionne sur macOS, Windows et Linux
- **Démarrage système** : Lance automatiquement au démarrage de votre machine

## 🛠️ Stack Technique

### Frontend
- **React 19** + TypeScript
- **Vite** - Build ultra-rapide
- **TailwindCSS** - Styling utility-first
- **shadcn/ui** - Composants UI accessibles
- **Zustand** - State management minimal
- **Framer Motion** - Animations fluides

### Backend
- **Rust** - Performance et sécurité
- **Tauri 2.10** - Framework desktop moderne
- **JSON local** - Stockage simple dans `appDataDir()`

### Infrastructure
- **Docker** - Déploiement de la landing page
- **GitHub Actions** - CI/CD automatisé
- **Nginx** - Serveur web + API updates

## 📦 Développement

### Prérequis

- **Node.js** 20+
- **Rust** 1.70+
- **pnpm** (recommandé) ou npm

### Installation

```bash
# Cloner le repo
git clone https://github.com/simcmoi/todo-overlay.git
cd todo-overlay

# Installer les dépendances
npm install

# Lancer en dev
npm run tauri dev
```

### Scripts disponibles

```bash
npm run tauri dev          # Mode développement avec hot reload
npm run tauri build        # Build production
npm test                   # Tests unitaires avec Vitest
npm run test:coverage      # Coverage des tests
npm run lint              # Linter ESLint
```

### Build production

**macOS :**
```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/dmg/
```

**Windows :**
```powershell
npm run tauri build
# Output: src-tauri\target\release\bundle\nsis\
```

**Linux :**
```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/appimage/
```

## 📁 Structure du Projet

```
todo-overlay/
├── src/                          # Frontend React
│   ├── components/              # Composants UI
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── todo-list.tsx       # Liste principale
│   │   ├── settings-page.tsx   # Page paramètres
│   │   └── update-banner.tsx   # Banner mises à jour
│   ├── hooks/                   # Custom hooks
│   ├── store/                   # Zustand stores
│   ├── lib/                     # Utilitaires
│   └── types/                   # Types TypeScript
├── src-tauri/                    # Backend Rust
│   └── src/
│       ├── lib.rs              # Point d'entrée
│       ├── commands.rs         # Commandes Tauri
│       ├── storage.rs          # Gestion JSON
│       ├── shortcuts.rs        # Raccourcis globaux
│       ├── window.rs           # Gestion fenêtre
│       └── updater.rs          # Auto-update
├── web/                          # Infrastructure web
│   ├── landing/                # Landing page React
│   └── updates/                # Serveur de mises à jour
└── .github/workflows/           # CI/CD
```

## 🔄 Mises à Jour Automatiques

L'application vérifie automatiquement les nouvelles versions et se met à jour en arrière-plan. Un banner apparaît quand une nouvelle version est prête à être installée.

Pour les développeurs : voir [UPDATER.md](UPDATER.md) pour configurer le système d'auto-update.

## 🐳 Déploiement Docker

Le projet inclut une stack Docker pour héberger la landing page et le serveur de mises à jour :

```bash
docker-compose up -d
```

Voir [web/README.md](web/README.md) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'feat: add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Guidelines

- Utiliser [Conventional Commits](https://www.conventionalcommits.org/)
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour le CHANGELOG.md

## 📝 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet des versions.

## 📚 Documentation Complète

➡️ **[DOCUMENTATION.md](DOCUMENTATION.md)** - Guides complets, workflow, troubleshooting

➡️ **[docs/GENERER_CLES.md](docs/GENERER_CLES.md)** ⭐ - Guide pour configurer l'auto-update

## 📄 License

MIT © Simon Fessy

---

<div align="center">

**Fait avec ❤️ en Rust et React**

[⭐ Star ce projet](https://github.com/simcmoi/todo-overlay) • [🐦 Suivre sur Twitter](https://twitter.com/simonfessy)

</div>
