# Système de Mise à Jour Automatique

Ce document explique comment fonctionne le système de mise à jour automatique de Todo Overlay, de la création d'une release jusqu'à l'installation chez l'utilisateur.

## 📋 Vue d'ensemble

Todo Overlay utilise le plugin Tauri Updater pour fournir des mises à jour automatiques signées et sécurisées. Le processus est entièrement automatisé via GitHub Actions et GitHub Releases.

```
Développeur            GitHub Actions          GitHub Releases         Application Utilisateur
    |                        |                        |                          |
    |--[1] npm run release-->|                        |                          |
    |   (bump version)       |                        |                          |
    |                        |                        |                          |
    |--[2] git push tag----->|                        |                          |
    |                        |                        |                          |
    |                        |--[3] Build & Sign----->|                          |
    |                        |   (macOS, Win, Linux)  |                          |
    |                        |                        |                          |
    |                        |--[4] Create Release--->|                          |
    |                        |   + latest.json        |                          |
    |                        |                        |                          |
    |                        |                        |<--[5] Check for update---|
    |                        |                        |   (every 24h + startup)  |
    |                        |                        |                          |
    |                        |                        |----[6] latest.json------>|
    |                        |                        |   (version, signatures)  |
    |                        |                        |                          |
    |                        |                        |<--[7] Download .tar.gz---|
    |                        |                        |   (signed update)        |
    |                        |                        |                          |
    |                        |                        |                          |--[8] Verify signature
    |                        |                        |                          |    Extract & Install
    |                        |                        |                          |    Restart app
```

---

## 🔐 Architecture de Sécurité

### Clés de Signature (Minisign)

Les mises à jour sont signées avec **Minisign** pour garantir leur authenticité.

**Localisation des clés :**
```
~/.tauri/
├── todo-overlay.key       # Clé privée (GARDÉE SECRÈTE)
└── todo-overlay.key.pub   # Clé publique (dans tauri.conf.json)
```

**Clé publique (dans le code) :**
```json
{
  "plugins": {
    "updater": {
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDBEQUE4NjAwMTFGMDcyMjUKUldRbGN2QVJBSWFxRGVqelNHYVJuRnFZalNZSDkzaHlPNWZHclF6Rkd1NU9nZWNXeXlLbG9jRzYK"
    }
  }
}
```

**Clé privée (GitHub Secret) :**
- Nom : `TAURI_SIGNING_PRIVATE_KEY`
- Contenu : Le contenu exact de `~/.tauri/todo-overlay.key`
- ⚠️ Ne JAMAIS commit cette clé dans le code

### Vérification des Signatures

Lors de l'installation d'une mise à jour :
1. L'app télécharge le fichier `.tar.gz` et son `.sig`
2. Vérifie la signature avec la clé publique intégrée
3. ✅ Si valide → Installation
4. ❌ Si invalide → Rejet et erreur

---

## 🚀 Processus de Release (Développeur)

### Option 1 : Script Automatique (Recommandé)

```bash
# Patch release (0.2.1 → 0.2.2)
npm run release

# Minor release (0.2.1 → 0.3.0)
npm run release:minor

# Major release (0.2.1 → 1.0.0)
npm run release:major
```

**Ce que fait le script (`scripts/release.sh`) :**
1. ✅ Vérifie que Git est propre (pas de changements non commités)
2. ✅ Tire les dernières modifications (`git pull`)
3. ✅ Bump la version dans `package.json`
4. ✅ Synchronise `src-tauri/tauri.conf.json` avec la même version
5. ✅ Met à jour `CHANGELOG.md` avec la nouvelle version
6. ⏸️ Pause pour éditer le CHANGELOG (décrit les changements)
7. ✅ Commit automatique : `chore: release v0.X.X`
8. ✅ Crée le tag Git : `v0.X.X`
9. ✅ Push vers GitHub (commit + tag)
10. 🎉 GitHub Actions se déclenche automatiquement

### Option 2 : Manuelle

```bash
# 1. Bump les versions
npm version patch  # ou minor, ou major

# 2. Sync tauri.conf.json manuellement
# Édite src-tauri/tauri.conf.json → "version": "0.X.X"

# 3. Édite CHANGELOG.md
# Ajoute les changements de cette version

# 4. Commit et tag
git add .
git commit -m "chore: release v0.X.X"
git tag v0.X.X
git push && git push --tags
```

---

## ⚙️ Build Automatique (GitHub Actions)

### Déclenchement

Le workflow `.github/workflows/release.yml` se déclenche sur :
```yaml
on:
  push:
    tags:
      - 'v*'
```

### Étapes du Build

**Pour chaque plateforme (macOS Intel, macOS ARM, Windows, Linux) :**

1. **Setup** : Installe Node, Rust, dépendances système
2. **Install** : `npm install`
3. **Build** : `npm run tauri build -- --target <platform>`
4. **Sign** : Signe les binaires avec `TAURI_SIGNING_PRIVATE_KEY`
5. **Generate updater artifacts** :
   - `.tar.gz` (macOS/Linux) ou `.msi.zip` (Windows)
   - `.sig` (signature Minisign)
6. **Upload** : Upload vers GitHub Releases

### Artifacts Générés

**macOS :**
```
ToDo.Overlay_0.2.2_aarch64.dmg          # Installeur ARM (Apple Silicon)
ToDo.Overlay_0.2.2_x64.dmg              # Installeur Intel
ToDo.Overlay_aarch64.app.tar.gz         # Update ARM (signé)
ToDo.Overlay_aarch64.app.tar.gz.sig     # Signature ARM
ToDo.Overlay_x64.app.tar.gz             # Update Intel (signé)
ToDo.Overlay_x64.app.tar.gz.sig         # Signature Intel
```

**Windows :**
```
ToDo.Overlay_0.2.2_x64-setup.exe        # Installeur
ToDo.Overlay_0.2.2_x64_en-US.msi        # MSI installer
ToDo.Overlay_0.2.2_x64_en-US.msi.zip    # Update (signé)
ToDo.Overlay_0.2.2_x64_en-US.msi.zip.sig # Signature
```

**Linux :**
```
ToDo.Overlay_0.2.2_amd64.AppImage       # AppImage
ToDo.Overlay_0.2.2_amd64.deb            # Debian package
ToDo.Overlay-0.2.2-1.x86_64.rpm         # RPM package
ToDo.Overlay_0.2.2_amd64.AppImage.tar.gz     # Update (signé)
ToDo.Overlay_0.2.2_amd64.AppImage.tar.gz.sig # Signature
```

### Fichier `latest.json`

Le workflow génère automatiquement `latest.json` :

```json
{
  "version": "0.2.2",
  "notes": "See CHANGELOG.md for details.",
  "pub_date": "2026-02-25T13:45:23.123Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVRbGN2QVJBSWFxRGV...",
      "url": "https://github.com/simcmoi/todo-overlay/releases/download/v0.2.2/ToDo.Overlay_aarch64.app.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVRbGN2QVJBSWFxRGV...",
      "url": "https://github.com/simcmoi/todo-overlay/releases/download/v0.2.2/ToDo.Overlay_x64.app.tar.gz"
    },
    "windows-x86_64": {
      "signature": "...",
      "url": "https://github.com/.../ToDo.Overlay_0.2.2_x64_en-US.msi.zip"
    },
    "linux-x86_64": {
      "signature": "...",
      "url": "https://github.com/.../ToDo.Overlay_0.2.2_amd64.AppImage.tar.gz"
    }
  }
}
```

**Endpoint :**
```
https://github.com/simcmoi/todo-overlay/releases/latest/download/latest.json
```

---

## 📱 Détection des Mises à Jour (Application)

### Configuration Tauri

**`src-tauri/tauri.conf.json` :**
```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://github.com/simcmoi/todo-overlay/releases/latest/download/latest.json"
      ],
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDBEQUE4NjAwMTFGMDcyMjUKUldRbGN2QVJBSWFxRGVqelNHYVJuRnFZalNZSDkzaHlPNWZHclF6Rkd1NU9nZWNXeXlLbG9jRzYK",
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

### Vérification Automatique

**Quand l'app vérifie les mises à jour :**
1. ✅ Au démarrage de l'application (`App.tsx` → `useEffect`)
2. ✅ Toutes les 24 heures (interval dans `App.tsx`)
3. ✅ Manuellement (bouton dans Settings)

**Code (`src/App.tsx`) :**
```tsx
// Au démarrage
useEffect(() => {
  if (hydrated) {
    void checkForUpdate()
  }
}, [hydrated, checkForUpdate])

// Toutes les 24h
useEffect(() => {
  if (!hydrated) return
  
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
  const interval = setInterval(() => {
    void checkForUpdate()
  }, TWENTY_FOUR_HOURS)
  
  return () => clearInterval(interval)
}, [hydrated, checkForUpdate])
```

### Flux de Vérification

**1. Requête vers `latest.json` :**
```rust
// src-tauri/src/updater.rs
pub async fn check_for_update() -> Result<UpdateInfo, String> {
    let update = app_handle
        .updater_builder()
        .build()?
        .check()
        .await?;
    
    Ok(UpdateInfo {
        available: update.is_update_available(),
        current_version: update.current_version().to_string(),
        latest_version: update.latest_version().to_string(),
    })
}
```

**2. Comparaison des versions :**
```
Version courante : 0.2.1
Version disponible : 0.2.2
→ Mise à jour disponible ! ✅
```

**3. État UI (`useUpdateStore`) :**
```
state: 'idle' → 'checking' → 'available'
```

---

## 🎨 Interface Utilisateur

### Badge de Mise à Jour

**Quand une mise à jour est disponible, un badge apparaît en haut de l'interface :**

```tsx
// src/components/update-banner.tsx
<motion.div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-blue-200/50 bg-blue-50/50 px-2.5 py-1.5">
  <div className="flex items-center gap-1.5 text-blue-700">
    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
    <span className="font-medium">v0.2.2</span>
  </div>
  <div className="flex items-center gap-1">
    <Button onClick={installUpdate}>
      <Download className="h-2.5 w-2.5" />
      Installer
    </Button>
    <Button onClick={dismissUpdate}>
      <X className="h-3 w-3" />
    </Button>
  </div>
</motion.div>
```

**Design minimaliste :**
- ✅ Intégré en haut de l'interface (pas de popup)
- ✅ Petit point bleu qui pulse
- ✅ Numéro de version
- ✅ Bouton "Installer" discret
- ✅ Bouton "X" pour dismisser

### Notifications Toast

**Pendant le téléchargement/installation :**
```tsx
// Download progress
toast({
  title: 'Téléchargement de la mise à jour',
  description: `Version 0.2.2 - 45%`,
})

// Installation
toast({
  title: 'Installation en cours',
  description: 'L\'application va redémarrer dans un instant...',
})
```

---

## 💾 Installation de la Mise à Jour

### Processus Complet

**1. L'utilisateur clique sur "Installer" :**
```tsx
const installUpdate = async () => {
  setState('downloading')
  
  try {
    await installUpdate() // Rust backend
    // App redémarre automatiquement
  } catch (error) {
    setState('error')
  }
}
```

**2. Téléchargement du fichier :**
```
URL: https://github.com/simcmoi/todo-overlay/releases/download/v0.2.2/ToDo.Overlay_aarch64.app.tar.gz
+ signature: ToDo.Overlay_aarch64.app.tar.gz.sig
```

**3. Vérification de la signature :**
```rust
// Tauri vérifie automatiquement avec la pubkey
if !verify_signature(update_file, signature, pubkey) {
    return Err("Invalid signature")
}
```

**4. Extraction et remplacement :**
```
macOS: /Applications/ToDo Overlay.app
Windows: C:\Program Files\ToDo Overlay\
Linux: ~/.local/share/applications/
```

**5. Redémarrage automatique :**
```
L'app se ferme → Installation → Relance automatique
```

**6. Vérification post-installation :**
```
Version: 0.2.2 ✅
```

---

## 🐛 Débogage

### Logs de Mise à Jour

**Localisation des logs :**
```
macOS: ~/Library/Logs/com.simon.todooverlay/todo-overlay.log
Windows: %APPDATA%\com.simon.todooverlay\logs\todo-overlay.log
Linux: ~/.local/share/com.simon.todooverlay/logs/todo-overlay.log
```

**Exemple de logs :**
```
[2026-02-25][13:45:12][app_lib::updater][INFO] Vérification des mises à jour...
[2026-02-25][13:45:13][app_lib::updater][INFO] Mise à jour disponible: 0.2.2
[2026-02-25][13:45:15][tauri_plugin_updater][INFO] Downloading update from https://github.com/...
[2026-02-25][13:45:18][tauri_plugin_updater][INFO] Verifying signature...
[2026-02-25][13:45:18][tauri_plugin_updater][INFO] Signature valid ✓
[2026-02-25][13:45:19][tauri_plugin_updater][INFO] Installing update...
[2026-02-25][13:45:20][tauri_plugin_updater][INFO] Update installed, restarting app...
```

### Tester en Dev

**Forcer une vérification :**
```tsx
// Dans l'app en mode dev
Settings → "Vérifier les mises à jour"
```

**Simuler une mise à jour disponible :**
```tsx
// src/store/use-update-store.ts (temporairement)
checkForUpdate: async () => {
  set({ 
    state: 'available', 
    updateInfo: { 
      available: true, 
      latestVersion: '0.2.2',
      currentVersion: '0.2.1'
    }
  })
}
```

### Erreurs Communes

**1. Signature invalide :**
```
ERROR: failed to decode pubkey: failed to decode base64 key
```
→ La clé publique dans `tauri.conf.json` ne correspond pas à `~/.tauri/todo-overlay.key.pub`

**2. Endpoint non disponible :**
```
ERROR: update endpoint did not respond with a successful status code
```
→ Le build GitHub Actions n'est pas terminé ou a échoué

**3. Format `latest.json` invalide :**
```
ERROR: Could not fetch a valid release JSON from the remote
```
→ Le fichier `latest.json` est corrompu ou mal formaté

---

## 📊 Monitoring

### Métriques à Surveiller

**GitHub Actions :**
- ✅ Tous les builds passent (macOS, Windows, Linux)
- ✅ Durée du build < 20 minutes
- ✅ Signature des binaires réussie

**GitHub Releases :**
- ✅ `latest.json` présent et valide
- ✅ Tous les artifacts uploadés
- ✅ Signatures `.sig` présentes

**Application :**
- ✅ Détection automatique fonctionne
- ✅ Badge s'affiche correctement
- ✅ Installation sans erreur
- ✅ Redémarrage automatique

### Vérifier Manuellement

**1. Tester `latest.json` :**
```bash
curl https://github.com/simcmoi/todo-overlay/releases/latest/download/latest.json | jq
```

**2. Vérifier les signatures :**
```bash
# Download update + signature
curl -LO https://github.com/.../ToDo.Overlay_aarch64.app.tar.gz
curl -LO https://github.com/.../ToDo.Overlay_aarch64.app.tar.gz.sig

# Verify with minisign
minisign -Vm ToDo.Overlay_aarch64.app.tar.gz -P <pubkey>
```

---

## 🎯 Checklist de Release

**Avant de créer une release :**
- [ ] Tous les tests passent (`npm test`)
- [ ] L'app fonctionne en dev (`npm run tauri dev`)
- [ ] Changements documentés dans CHANGELOG.md
- [ ] Version bumped dans `package.json` et `tauri.conf.json`

**Pendant le build :**
- [ ] GitHub Actions build réussit pour toutes les plateformes
- [ ] Aucune erreur de signature
- [ ] `latest.json` généré et uploadé

**Après la release :**
- [ ] Tester l'installation du DMG/MSI/AppImage
- [ ] Vérifier la détection de mise à jour depuis une version précédente
- [ ] Tester l'installation de la mise à jour
- [ ] Vérifier que l'app redémarre correctement

---

## 🔗 Références

- [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/)
- [Minisign](https://jedisct1.github.io/minisign/)
- [GitHub Actions - Tauri](https://tauri.app/v1/guides/building/github-actions)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Dernière mise à jour : 2026-02-25**
