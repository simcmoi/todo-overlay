# Système de Mise à Jour Automatique

## Configuration Terminée ✅

Le système de mise à jour automatique est maintenant installé et configuré pour ToDo Overlay.

## Comment ça fonctionne ?

### 1. Vérification automatique
- Au démarrage de l'application, une vérification des mises à jour est effectuée en arrière-plan
- Si une nouvelle version est disponible, une bannière apparaît en haut de l'interface

### 2. Installation
- L'utilisateur clique sur le bouton "Installer" dans la bannière
- Le téléchargement et l'installation se font automatiquement
- L'application redémarre avec la nouvelle version

### 3. Sécurité
- Toutes les mises à jour sont signées cryptographiquement avec minisign
- La clé publique est intégrée dans l'application
- La clé privée est stockée dans `~/.tauri/todo-overlay.key` (**À NE JAMAIS PARTAGER !**)

## Publication d'une Nouvelle Version

### Étape 1 : Préparer la Release

1. **Mettre à jour le numéro de version** dans les fichiers suivants :
   - `src-tauri/tauri.conf.json` : ligne `"version": "0.1.0"` → `"version": "0.2.0"`
   - `src-tauri/Cargo.toml` : ligne `version = "0.1.0"` → `version = "0.2.0"`

2. **Commit les changements** :
   ```bash
   git add .
   git commit -m "chore: bump version to 0.2.0"
   git push
   ```

### Étape 2 : Build avec Signature

Compiler l'application avec la signature activée :

```bash
# Définir les variables d'environnement pour la signature
export TAURI_SIGNING_PRIVATE_KEY_PATH="$HOME/.tauri/todo-overlay.key"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""

# Build de production
npm run tauri build
```

Les fichiers générés se trouveront dans `src-tauri/target/release/bundle/` :
- **macOS** : `.dmg` et `.app.tar.gz` + `.sig`
- **Windows** : `.msi` et `.nsis.zip` + `.sig`
- **Linux** : `.AppImage` et `.deb` + `.sig`

### Étape 3 : Créer une GitHub Release

1. **Créer un tag Git** :
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

2. **Aller sur GitHub** : https://github.com/simonfessy/todo-overlay/releases/new

3. **Remplir les informations** :
   - **Tag** : `v0.2.0`
   - **Title** : `v0.2.0 - Description de la version`
   - **Description** : Notes de version (nouveautés, corrections, etc.)

4. **Uploader les fichiers** :
   - Pour **macOS** :
     - `ToDo Overlay.app.tar.gz`
     - `ToDo Overlay.app.tar.gz.sig`
   - Pour **Windows** :
     - `ToDo Overlay_0.2.0_x64_en-US.msi`
     - `ToDo Overlay_0.2.0_x64_en-US.msi.zip`
     - `ToDo Overlay_0.2.0_x64_en-US.msi.zip.sig`
   - Pour **Linux** :
     - `todo-overlay_0.2.0_amd64.AppImage`
     - `todo-overlay_0.2.0_amd64.AppImage.tar.gz`
     - `todo-overlay_0.2.0_amd64.AppImage.tar.gz.sig`

5. **Publier la release** : Cliquer sur "Publish release"

### Étape 4 : Créer le fichier `latest.json`

Tauri génère automatiquement le fichier `latest.json` lors du build. Il se trouve dans :
- `src-tauri/target/release/bundle/macos/latest.json` (macOS)
- `src-tauri/target/release/bundle/msi/latest.json` (Windows)
- `src-tauri/target/release/bundle/appimage/latest.json` (Linux)

**Important** : Uploader aussi ce fichier `latest.json` sur la release GitHub !

## Architecture du Système

### Frontend (TypeScript/React)

```
src/
├── components/
│   └── update-banner.tsx          # Composant UI de la bannière de mise à jour
├── store/
│   └── use-update-store.ts        # État Zustand pour gérer les mises à jour
└── lib/
    └── tauri.ts                   # Fonctions pour appeler les commandes Rust
```

### Backend (Rust)

```
src-tauri/src/
└── updater.rs                     # Commandes Rust pour vérifier/installer
```

### Configuration

```
src-tauri/
├── tauri.conf.json               # Config updater avec URL et clé publique
└── Cargo.toml                    # Dépendance tauri-plugin-updater
```

## Workflow de Vérification

```
1. App démarre
   ↓
2. useEffect() appelle checkForUpdate()
   ↓
3. Appel Rust : check_for_update()
   ↓
4. Tauri télécharge latest.json depuis GitHub
   ↓
5. Comparaison des versions
   ↓
6. Si nouvelle version → UpdateBanner s'affiche
   ↓
7. Utilisateur clique "Installer"
   ↓
8. Appel Rust : install_update()
   ↓
9. Téléchargement + vérification signature
   ↓
10. Installation + redémarrage automatique
```

## Sécurité & Bonnes Pratiques

### ⚠️ IMPORTANT : Protection de la Clé Privée

La clé privée (`~/.tauri/todo-overlay.key`) permet de signer les mises à jour :

1. **NE JAMAIS** commit cette clé dans Git
2. **NE JAMAIS** partager cette clé publiquement
3. **Backup sécurisé** : Sauvegarder dans un gestionnaire de mots de passe
4. **CI/CD** : Stocker comme secret dans GitHub Actions

Si la clé est perdue ou compromise :
- Vous devrez générer une nouvelle clé
- Mettre à jour la clé publique dans `tauri.conf.json`
- Publier une nouvelle version avec la nouvelle clé
- Les anciennes versions ne pourront plus se mettre à jour automatiquement

### Configuration GitHub Actions (Recommandé)

Pour automatiser les builds signés, créer `.github/workflows/release.yml` :

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm install
      
      - name: Build with signing
        env:
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
        run: npm run tauri build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.os }}-build
          path: src-tauri/target/release/bundle/
```

Puis ajouter le secret `TAURI_SIGNING_PRIVATE_KEY` dans Settings → Secrets → Actions.

## Dépannage

### L'updater ne détecte pas les mises à jour

1. Vérifier que `latest.json` est bien publié sur la release GitHub
2. Vérifier l'URL dans `tauri.conf.json` : 
   ```json
   "endpoints": [
     "https://github.com/simonfessy/todo-overlay/releases/latest/download/latest.json"
   ]
   ```
3. Vérifier les logs Rust : `npm run tauri dev` et regarder la console

### Erreur de signature

1. Vérifier que la clé publique dans `tauri.conf.json` correspond à la clé privée utilisée pour signer
2. S'assurer que les fichiers `.sig` sont bien uploadés avec les binaires

### L'app ne redémarre pas après installation

C'est normal ! Sur macOS, après l'installation, l'utilisateur doit redémarrer manuellement l'app.

## Ressources

- [Documentation officielle Tauri Updater](https://v2.tauri.app/plugin/updater/)
- [Minisign](https://jedisct1.github.io/minisign/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
