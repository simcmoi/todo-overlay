# Configuration GitHub Actions

Ce document explique comment configurer les secrets nécessaires pour les workflows GitHub Actions.

## Secrets Requis

### 1. TAURI_SIGNING_PRIVATE_KEY

La clé privée pour signer les releases Tauri et activer les mises à jour automatiques.

**Génération :**

```bash
cd src-tauri
tauri signer generate -w ~/.tauri/todo-overlay.key
```

Cette commande va :
1. Générer une paire de clés (publique + privée)
2. Afficher la clé publique (à mettre dans `tauri.conf.json`)
3. Sauvegarder la clé privée dans `~/.tauri/todo-overlay.key`

**Configuration dans GitHub :**

1. Aller dans **Settings** → **Secrets and variables** → **Actions**
2. Cliquer sur **New repository secret**
3. Nom : `TAURI_SIGNING_PRIVATE_KEY`
4. Valeur : Contenu du fichier `~/.tauri/todo-overlay.key`
   ```bash
   cat ~/.tauri/todo-overlay.key
   ```
5. Sauvegarder

### 2. TAURI_SIGNING_PRIVATE_KEY_PASSWORD (Optionnel)

Si tu as protégé ta clé privée par mot de passe lors de la génération.

**Configuration :**

1. Nom : `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
2. Valeur : Le mot de passe choisi lors de la génération

### 3. Mettre à jour la clé publique

Copier la clé publique affichée lors de la génération et la mettre dans `src-tauri/tauri.conf.json` :

```json
{
  "plugins": {
    "updater": {
      "pubkey": "VOTRE_CLE_PUBLIQUE_ICI"
    }
  }
}
```

## Workflows Disponibles

### 1. Release (`release.yml`)

**Déclenchement :**
- Automatique : Quand un tag `v*` est créé (ex: `v0.2.0`)
- Manuel : Via l'onglet "Actions" sur GitHub

**Ce qu'il fait :**
1. Crée une release GitHub en draft
2. Build l'application pour :
   - macOS (ARM64 + Intel)
   - Windows (x64)
   - Linux (x64)
3. Signe tous les artifacts avec la clé privée
4. Upload les artifacts sur la release
5. Publie la release

**Comment créer une release :**

```bash
# 1. Mettre à jour la version dans package.json et tauri.conf.json
npm version patch  # ou minor, ou major

# 2. Commit les changements
git add .
git commit -m "chore: bump version to 0.2.1"

# 3. Créer et pousser le tag
git tag v0.2.1
git push origin v0.2.1

# Le workflow se lance automatiquement !
```

### 2. Deploy Landing Page (`deploy-landing.yml`)

**Déclenchement :**
- Automatique : Quand des fichiers dans `web/landing/` sont modifiés sur `main`
- Manuel : Via l'onglet "Actions" sur GitHub

**Ce qu'il fait :**
1. Build la landing page React
2. Déploie sur GitHub Pages

**Activer GitHub Pages :**

1. Aller dans **Settings** → **Pages**
2. Source : **GitHub Actions**
3. Sauvegarder

La landing page sera accessible à : `https://simonfessy.github.io/todo-overlay/`

## Vérification

### Tester les clés localement

Avant de créer une release, tu peux tester la signature localement :

```bash
# Build l'app
npm run tauri build

# Trouver les artifacts (exemple macOS)
cd src-tauri/target/release/bundle/macos

# Signer un artifact
tauri signer sign Todo\ Overlay.app.tar.gz \
  --private-key ~/.tauri/todo-overlay.key

# Vérifier la signature
tauri signer verify Todo\ Overlay.app.tar.gz \
  --public-key "VOTRE_CLE_PUBLIQUE"
```

### Tester le workflow localement

Avec [act](https://github.com/nektos/act) :

```bash
# Installer act
brew install act

# Tester le workflow release
act push --job build-tauri
```

## Sécurité

⚠️ **IMPORTANT :**

- ❌ **JAMAIS** commiter la clé privée (`.key` ou `.pem`)
- ✅ La clé privée doit rester **uniquement** dans les GitHub Secrets
- ✅ Le `.gitignore` exclut déjà les fichiers `*.key` et `*.pem`
- ✅ Seule la clé publique va dans le code source

## Dépannage

### Erreur "Invalid signature"

- Vérifier que `TAURI_SIGNING_PRIVATE_KEY` contient bien la clé complète
- Vérifier que la clé publique dans `tauri.conf.json` correspond

### Workflow échoue sur macOS

- Vérifier que les targets sont installés :
  ```bash
  rustup target add aarch64-apple-darwin x86_64-apple-darwin
  ```

### Release ne se publie pas

- Vérifier que tous les jobs `build-tauri` ont réussi
- Consulter les logs du job `publish-release`

## Ressources

- [Documentation Tauri Updater](https://v2.tauri.app/plugin/updater/)
- [Documentation Tauri Signer](https://v2.tauri.app/reference/cli/#signer)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
