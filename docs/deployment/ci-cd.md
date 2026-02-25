# CI/CD Pipeline

Ce document explique l'infrastructure CI/CD complète de Todo Overlay.

## 🔄 Workflows GitHub Actions

### 1. CI Workflow (`ci.yml`)

**Déclenché sur:** Push vers `main`, Pull Requests, manuel

**Jobs:**

#### ✅ Frontend Tests
- Exécute les tests unitaires avec Vitest
- Génère un rapport de couverture
- Upload vers Codecov

#### ✅ Lint
- Vérifie le code avec ESLint
- Applique les règles de style

#### ✅ TypeScript
- Type checking avec `tsc --noEmit`
- Détecte les erreurs de typage

#### ✅ Backend Tests
- Exécute les tests Rust sur 3 OS (Ubuntu, macOS, Windows)
- Vérifie avec Clippy (linter Rust)
- Vérifie le formatage avec `cargo fmt`

#### ✅ Build Check
- Vérifie que le frontend compile
- Vérifie que Tauri build fonctionne
- Exécuté uniquement si tous les tests passent

#### ✅ CI Success
- Job final qui valide que tout a réussi
- Utilisé pour la protection de branche

**Optimisations:**
- ✅ Cache npm pour ~3x plus rapide
- ✅ Cache Cargo pour ~5x plus rapide
- ✅ Exécution parallèle des jobs
- ✅ Annulation automatique des runs obsolètes

---

### 2. Release Workflow (`release.yml`)

**Déclenché sur:** Tag `v*`, manuel

**Jobs:**

#### 1️⃣ Pre-Release Tests
**NOUVEAU!** Exécute tous les tests avant de créer la release:
- Tests frontend
- Linter
- Type checking
- Tests Rust

**Bénéfice:** Aucune release ne sera publiée si les tests échouent

#### 2️⃣ Create Release
- Crée une release GitHub en draft
- Extrait le changelog pour cette version
- Ne démarre que si les tests passent ✅

#### 3️⃣ Build Tauri
- Build pour macOS (Intel + ARM), Windows, Linux
- Signe les binaires avec la clé privée
- Upload vers la release
- Cache Cargo pour vitesse

#### 4️⃣ Publish Release
- Publie la release (passe de draft → public)

---

### 3. Deploy Landing Page (`deploy-landing.yml`)

**Déclenché sur:** Push vers `main` dans `web/landing/`, manuel

**Jobs:**
- Build de la landing page React
- Déploiement sur GitHub Pages

---

## 🤖 Dependabot

**Fichier:** `.github/dependabot.yml`

**Mises à jour automatiques pour:**
- 📦 npm (frontend) - hebdomadaire
- 🦀 Cargo (backend) - hebdomadaire
- 🌐 npm (landing page) - hebdomadaire
- 🔧 GitHub Actions - mensuel

**Configuration:**
- Max 5 PRs ouvertes simultanément
- Labels automatiques (`dependencies`, `frontend`, `backend`)
- Reviews assignées automatiquement
- Commits préfixés (`chore(deps):`)

**Dépendances ignorées:**
- React/React-DOM (maj majeures uniquement)

---

## 📊 Code Coverage

**Service:** Codecov (gratuit pour open-source)

**Configuration:** `codecov.yml`

**Fonctionnalités:**
- ✅ Rapport de couverture sur chaque PR
- ✅ Badge de couverture dans le README
- ✅ Commentaires automatiques sur les PRs
- ✅ Détection de baisse de couverture
- ✅ Seuil: 60-95% de couverture

**Comment voir les rapports:**
1. Va sur https://codecov.io/gh/simcmoi/todo-overlay
2. Ou regarde les commentaires sur les PRs

---

## 🛡️ Protection des Branches

**Recommandation:** Configure la protection sur `main`:

1. Va dans **Settings** → **Branches**
2. Ajoute une règle pour `main`
3. Active:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Status checks requis:
     - `CI Success` (du workflow ci.yml)
     - `Pre-Release Tests` (du workflow release.yml)

**Résultat:** Impossible de merger si les tests échouent

---

## 🚀 Utilisation

### Pour un développeur

#### Créer une Pull Request

```bash
# 1. Crée une branche
git checkout -b feature/ma-feature

# 2. Fais tes changements
# ...

# 3. Commit
git commit -m "feat: add amazing feature"

# 4. Push
git push origin feature/ma-feature
```

**Ce qui se passe:**
1. ✅ GitHub Actions exécute le workflow CI automatiquement
2. ✅ Tous les tests doivent passer (frontend + backend + lint + typecheck)
3. ✅ Un commentaire avec la couverture est ajouté
4. ✅ Si tout passe → merge autorisé ✅
5. ❌ Si un test échoue → merge bloqué ❌

#### Créer une Release

```bash
# Utilise le script automatique
npm run release          # patch (0.2.5 → 0.2.6)
npm run release:minor    # minor (0.2.5 → 0.3.0)
npm run release:major    # major (0.2.5 → 1.0.0)
```

**Ce qui se passe:**
1. ✅ Pre-release tests s'exécutent
2. ✅ Si tests passent → création de la release
3. ✅ Build multi-plateforme
4. ✅ Publication automatique

---

## 📈 Métriques

### Temps d'exécution moyen

| Workflow | Durée | Fréquence |
|----------|-------|-----------|
| CI (tous tests) | ~8 min | Chaque push |
| Release (build) | ~60 min | 2x/mois |
| Landing deploy | ~3 min | Selon besoin |

**Total estimé:** ~400 min/mois → **Gratuit!** ✅

### Minutes économisées avec cache

| Sans cache | Avec cache | Gain |
|------------|------------|------|
| ~15 min | ~5 min | 66% |

---

## 🔧 Configuration Requise

### Secrets GitHub

**Déjà configurés:**
- ✅ `TAURI_SIGNING_PRIVATE_KEY`
- ✅ `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- ✅ `GITHUB_TOKEN` (automatique)

**À configurer:**
- ⚠️ `CODECOV_TOKEN` - Pour upload des rapports de couverture

**Comment obtenir `CODECOV_TOKEN`:**
1. Va sur https://codecov.io
2. Connecte-toi avec GitHub
3. Ajoute le repo `simcmoi/todo-overlay`
4. Copie le token
5. Ajoute-le dans **Settings** → **Secrets** → **Actions**

---

## 🐛 Dépannage

### CI échoue sur "test-frontend"

```bash
# Vérifie localement
npm run test:run
```

### CI échoue sur "lint"

```bash
# Vérifie localement
npm run lint

# Fix automatiquement (si possible)
npm run lint -- --fix
```

### CI échoue sur "typecheck"

```bash
# Vérifie localement
npx tsc --noEmit
```

### CI échoue sur "test-backend"

```bash
# Vérifie localement
cd src-tauri
cargo test
cargo clippy
cargo fmt --check
```

### Dependabot PRs qui échouent

C'est normal! Dependabot crée des PRs qui passent par le CI. Si une dépendance casse les tests, le CI va échouer et tu sauras qu'il ne faut pas merger.

---

## 📚 Ressources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Codecov Docs](https://docs.codecov.com)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [Cargo Test](https://doc.rust-lang.org/cargo/commands/cargo-test.html)
- [Vitest Docs](https://vitest.dev)

---

**Dernière mise à jour:** 2026-02-25
