# 📚 Documentation Todo Overlay

Bienvenue dans la documentation complète de Todo Overlay ! Cette page est votre point d'entrée pour tout ce qui concerne l'utilisation, le développement et le déploiement de l'application.

---

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run tauri dev

# Build production
npm run tauri build
```

---

## 📖 Table des Matières

### Pour les Utilisateurs

- **[Installation et Configuration](../README.md#installation)** - Installation de l'application
- **[Fonctionnalités](../README.md#features)** - Vue d'ensemble des fonctionnalités

### Pour les Développeurs

#### Commencer

- **[Prérequis](../README.md#prerequisites--prérequis)** - Node.js, Rust, dépendances système
- **[Guide de Contribution](development/contributing.md)** - Comment contribuer au projet

#### Fonctionnalités

- **[Système de Mise à Jour Automatique](features/auto-update.md)** - Configuration et fonctionnement de l'auto-update
- **[Système de Changelog](features/CHANGELOG_SYSTEM.md)** - Comment le système de changelog fonctionne
- **[Synchronisation Cloud](features/cloud-sync.md)** - Architecture de la synchronisation Supabase

#### Déploiement

- **[CI/CD Pipeline](deployment/ci-cd.md)** ⭐ **NOUVEAU** - Tests automatisés, code coverage, Dependabot
- **[Workflow de Release](deployment/RELEASE_WORKFLOW.md)** - Comment créer une release (une seule commande !)
- **[Signature de Code](deployment/code-signing.md)** - Générer et configurer les clés de signature
- **[GitHub Actions](deployment/github-actions.md)** - Configuration CI/CD

---

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
│       ├── updater.rs        # Auto-update
│       └── changelog.rs      # Récupération changelog
├── web/                        # Infrastructure web
│   ├── landing/              # Landing page React
│   └── updates/              # Serveur de mises à jour
├── docs/                       # Documentation (vous êtes ici)
├── scripts/                    # Scripts utilitaires
└── .github/workflows/         # CI/CD GitHub Actions
```

---

## 🎯 Guides par Rôle

### Je suis un Développeur

**Première fois ici ?**
1. Lire [README.md](../README.md) pour la vue d'ensemble
2. Suivre [Guide de Contribution](development/contributing.md)
3. Lancer `npm run tauri dev`

**Je veux ajouter une fonctionnalité :**
1. Lire [Guide de Contribution](development/contributing.md)
2. Créer une branche feature
3. Développer et tester
4. Ouvrir une Pull Request

**Je veux corriger un bug :**
1. Ouvrir ou chercher une issue sur GitHub
2. Créer une branche fix
3. Corriger et tester
4. Ouvrir une Pull Request

### Je suis un Mainteneur

**Je veux créer une release :**
1. Lire [Workflow de Release](deployment/RELEASE_WORKFLOW.md)
2. Exécuter `npm run release`
3. C'est tout ! GitHub Actions s'occupe du reste

**Je veux configurer l'auto-update :**
1. Lire [Système de Mise à Jour](features/auto-update.md)
2. Générer les clés avec [Signature de Code](deployment/code-signing.md)
3. Configurer les secrets GitHub

**Je veux déployer la landing page :**
1. Lire [GitHub Actions](deployment/github-actions.md)
2. Le déploiement est automatique sur push

---

## 🔑 Configuration Important

### Auto-Update (À faire une seule fois)

Pour que les mises à jour automatiques fonctionnent, tu DOIS générer les clés de signature :

**➡️ Suis le guide : [Signature de Code](deployment/code-signing.md)**

Sans les clés :
- ❌ L'auto-update ne fonctionnera pas
- ❌ Le workflow GitHub Actions échouera à la signature
- ✅ Mais les binaires seront quand même générés et fonctionnels

### Cloud Sync (Optionnel)

Pour activer la synchronisation cloud :
1. Lire [Architecture Cloud Sync](features/cloud-sync.md)
2. Créer un projet Supabase
3. Configurer les variables d'environnement
4. Appliquer les migrations SQL

---

## 🌐 URLs du Projet

- **Landing Page** : https://simcmoi.github.io/todo-overlay/
- **Repository** : https://github.com/simcmoi/todo-overlay
- **Releases** : https://github.com/simcmoi/todo-overlay/releases
- **Actions** : https://github.com/simcmoi/todo-overlay/actions

---

## 📝 Workflow de Release (TL;DR)

```bash
# Une seule commande !
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

**Voir [Workflow de Release](deployment/RELEASE_WORKFLOW.md) pour les détails**

---

## 🧪 Tests

```bash
npm test              # Tests unitaires
npm run test:run      # Tests sans watch
npm run test:coverage # Coverage
```

---

## 🐛 Problèmes Courants

### "Missing comment in secret key" dans GitHub Actions

→ Les clés de signature ne sont pas configurées. Suis [Signature de Code](deployment/code-signing.md)

### La landing page est blanche

→ Vérifie que `base: '/todo-overlay/'` est dans `web/landing/vite.config.ts`

### L'app ne détecte pas les mises à jour

→ Vérifie que la clé publique dans `src-tauri/tauri.conf.json` est correcte

### L'overlay ne s'affiche pas

→ Vérifie que le raccourci global est configuré dans les Settings

---

## 🤝 Contribuer

Voir [Guide de Contribution](development/contributing.md) pour :
- Code of conduct
- Comment rapporter des bugs
- Comment proposer des fonctionnalités
- Standards de code
- Processus de Pull Request

---

## 📄 License

MIT © Simon Fessy

---

## 📞 Questions ?

- 💬 **GitHub Discussions** - Poser des questions, partager des idées
- 🐛 **GitHub Issues** - Rapporter des bugs, demander des fonctionnalités
- 📖 **Cette Documentation** - Chercher dans les guides ci-dessus

---

**Dernière mise à jour : 2026-02-25**
