# 📚 Documentation Todo Overlay

Bienvenue ! Voici la documentation organisée du projet.

## 🚀 Démarrage Rapide

### Installer les dépendances

```bash
npm install
```

### Lancer en développement

```bash
npm run tauri dev
```

### Build production

```bash
npm run tauri build
```

## 📖 Guides

### Pour les Utilisateurs

- **[README.md](README.md)** - Vue d'ensemble du projet, fonctionnalités, installation

### Pour les Développeurs

- **[docs/RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md)** 🚀 **COMMENCE ICI** - Workflow de release automatisé (une seule commande !)
- **[docs/GENERER_CLES.md](docs/GENERER_CLES.md)** 🔑 - Guide simple pour générer les clés de signature
- **[CHANGELOG.md](CHANGELOG.md)** - Historique des versions et modifications
- **[docs/AUTO_UPDATE_SETUP.md](docs/AUTO_UPDATE_SETUP.md)** - Documentation complète du système d'auto-update
- **[docs/UPDATER.md](docs/UPDATER.md)** - Configuration détaillée du serveur de mises à jour

### Pour le Déploiement

- **[web/README.md](web/README.md)** - Déploiement Docker de la landing page et serveur updates
- **[.github/GITHUB_ACTIONS_SETUP.md](.github/GITHUB_ACTIONS_SETUP.md)** - Configuration CI/CD

### Docs Techniques

- **[docs/SESSION_RECAP.md](docs/SESSION_RECAP.md)** - Récapitulatif complet du projet et de l'architecture
- **[docs/DOCKER_TEST_RESULTS.md](docs/DOCKER_TEST_RESULTS.md)** - Tests Docker effectués

## 🗂️ Structure du Projet

```
todo-overlay/
├── src/                        # Frontend React
│   ├── components/            # Composants UI
│   ├── hooks/                 # Custom hooks
│   ├── store/                 # State management (Zustand)
│   └── lib/                   # Utilitaires
├── src-tauri/                  # Backend Rust
│   └── src/
│       ├── lib.rs            # Point d'entrée
│       ├── commands.rs       # Commandes Tauri
│       ├── storage.rs        # Gestion JSON
│       ├── shortcuts.rs      # Raccourcis globaux
│       └── updater.rs        # Auto-update
├── web/                        # Infrastructure web
│   ├── landing/              # Landing page React
│   └── updates/              # Serveur de mises à jour
├── docs/                       # Documentation technique
├── scripts/                    # Scripts utilitaires
└── .github/workflows/         # CI/CD GitHub Actions
```

## 🔑 Configuration Auto-Update (Important)

Pour que les mises à jour automatiques fonctionnent, tu DOIS générer les clés de signature :

**➡️ Suis le guide : [docs/GENERER_CLES.md](docs/GENERER_CLES.md)**

Sans les clés :
- ❌ L'auto-update ne fonctionnera pas
- ❌ Le workflow GitHub Actions échouera à la signature
- ✅ Mais les binaires seront quand même générés et fonctionnels

## 🌐 URLs du Projet

- **Landing Page** : https://simcmoi.github.io/todo-overlay/
- **Repository** : https://github.com/simcmoi/todo-overlay
- **Releases** : https://github.com/simcmoi/todo-overlay/releases
- **Actions** : https://github.com/simcmoi/todo-overlay/actions

## 📝 Workflow de Release

**➡️ UTILISE LE SCRIPT AUTOMATIQUE : [docs/RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md)**

### Commande Rapide (Tout Automatique)

```bash
npm run release          # Patch: 0.2.1 → 0.2.2
npm run release:minor    # Minor: 0.2.1 → 0.3.0
npm run release:major    # Major: 0.2.1 → 1.0.0
```

Le script fait TOUT automatiquement :
- ✅ Bump `package.json` + `src-tauri/tauri.conf.json`
- ✅ Met à jour `CHANGELOG.md`
- ✅ Crée le commit et le tag
- ✅ Push sur GitHub
- ✅ Déclenche le build automatique

### Ce Qui Se Passe Ensuite

GitHub Actions va automatiquement :
- Builder les binaires pour macOS, Windows, Linux
- Les signer (si les clés sont configurées)
- Créer une release GitHub
- La landing page se mettra à jour automatiquement

## 🧪 Tests

```bash
npm test              # Tests unitaires
npm run test:run      # Tests sans watch
npm run test:coverage # Coverage
```

## 🐛 Problèmes Courants

### "Missing comment in secret key" dans GitHub Actions

→ Les clés de signature ne sont pas configurées. Suis [docs/GENERER_CLES.md](docs/GENERER_CLES.md)

### La landing page est blanche

→ Vérifie que `base: '/todo-overlay/'` est dans `web/landing/vite.config.ts`

### L'app ne détecte pas les mises à jour

→ Vérifie que la clé publique dans `src-tauri/tauri.conf.json` est correcte

## 🤝 Contribuer

1. Fork le projet
2. Crée une branche (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'feat: add amazing'`)
4. Push (`git push origin feature/amazing`)
5. Ouvre une Pull Request

## 📄 License

MIT © Simon Fessy

---

**Questions ?** Ouvre une issue sur GitHub !
