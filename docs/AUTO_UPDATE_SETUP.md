# 🔄 Configuration de l'Auto-Update

Ce guide explique comment configurer le système de mise à jour automatique de Todo Overlay.

## 📋 Vue d'ensemble

Le système d'auto-update utilise :
- **GitHub Releases** comme source de vérité pour les binaires
- **Tauri Updater** pour télécharger et installer les mises à jour
- **Signatures cryptographiques** pour sécuriser les mises à jour

## 🔑 Génération des clés de signature

### Étape 1 : Générer les clés

Exécute le script de génération :

```bash
./scripts/generate-signing-keys.sh
```

Ce script va :
1. Vérifier que `@tauri-apps/cli` est installé
2. Créer un dossier `.tauri-keys/` (déjà dans .gitignore)
3. Générer une paire de clés privée/publique
4. Te demander un mot de passe pour protéger la clé privée

**⚠️ IMPORTANT : Note ce mot de passe, tu en auras besoin !**

### Étape 2 : Configurer la clé publique

Copie le contenu de `.tauri-keys/keys.key.pub` et mets-le à jour dans `src-tauri/tauri.conf.json` :

```json
{
  "plugins": {
    "updater": {
      "pubkey": "COLLE_ICI_LE_CONTENU_DE_keys.key.pub"
    }
  }
}
```

### Étape 3 : Ajouter les secrets GitHub

Va sur : https://github.com/simcmoi/todo-overlay/settings/secrets/actions

Ajoute 2 nouveaux secrets :

**Secret 1 :**
- Nom : `TAURI_SIGNING_PRIVATE_KEY`
- Valeur : Contenu COMPLET du fichier `.tauri-keys/keys.key`

**Secret 2 :**
- Nom : `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- Valeur : Le mot de passe que tu as entré lors de la génération

### Étape 4 : Commit et push

```bash
git add src-tauri/tauri.conf.json
git commit -m "chore: configure updater with public key"
git push
```

**⚠️ NE JAMAIS commiter les fichiers dans `.tauri-keys/` !**

## 🚀 Comment ça fonctionne

### 1. Build et Release

Quand tu crées un tag `v*.*.*` :

```bash
git tag v0.2.1
git push origin v0.2.1
```

Le workflow GitHub Actions :
1. Build les binaires pour macOS, Windows, Linux
2. Signe chaque binaire avec la clé privée
3. Génère un fichier `latest.json` avec les métadonnées
4. Upload tout sur GitHub Releases

### 2. Vérification des mises à jour

L'application vérifie automatiquement les mises à jour :
- Au démarrage de l'app
- Toutes les 24 heures
- Manuellement depuis les Paramètres

L'app appelle : `https://github.com/simcmoi/todo-overlay/releases/latest/download/latest.json`

Exemple de réponse :

```json
{
  "version": "0.2.1",
  "notes": "Corrections de bugs et améliorations",
  "pub_date": "2026-02-25T12:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIH...",
      "url": "https://github.com/simcmoi/todo-overlay/releases/download/v0.2.1/Todo_Overlay_0.2.1_aarch64.app.tar.gz"
    },
    "darwin-x86_64": { ... },
    "windows-x86_64": { ... },
    "linux-x86_64": { ... }
  }
}
```

### 3. Installation de la mise à jour

Si une nouvelle version est disponible :
1. L'app affiche un banner de notification
2. L'utilisateur clique sur "Installer"
3. Le binaire est téléchargé
4. La signature est vérifiée avec la clé publique
5. La mise à jour est installée
6. L'app redémarre

## 🌐 Landing Page

La landing page récupère automatiquement les releases via l'API GitHub :

```typescript
// Hook useGitHubReleases
const GITHUB_API = 'https://api.github.com/repos/simcmoi/todo-overlay/releases/latest'

// Récupère la dernière release
const response = await fetch(GITHUB_API)
const data = await response.json()

// Parse les assets pour chaque plateforme
// Génère les liens de téléchargement automatiquement
```

Les boutons de téléchargement pointent directement vers :
```
https://github.com/simcmoi/todo-overlay/releases/download/v0.2.0/Todo_Overlay_0.2.0_aarch64.dmg
```

## 🔒 Sécurité

### Pourquoi signer les binaires ?

Sans signature, un attaquant pourrait :
1. Créer une fausse release sur GitHub
2. Injecter du code malveillant dans le binaire
3. Distribuer une version compromise

Avec signature :
- Seul toi (avec la clé privée) peux créer des releases valides
- L'app vérifie la signature avant d'installer
- Si la signature est invalide, l'installation échoue

### Protéger tes clés

**✅ À FAIRE :**
- Garder `.tauri-keys/` en local uniquement
- Utiliser un mot de passe fort
- Sauvegarder les clés dans un endroit sécurisé (gestionnaire de mots de passe)
- Ne partager les clés avec personne

**❌ NE JAMAIS :**
- Commiter les fichiers `.key` dans Git
- Partager la clé privée publiquement
- Stocker le mot de passe en clair
- Utiliser les mêmes clés pour plusieurs projets

## 🧪 Tester l'auto-update

### 1. Build une version signée

```bash
# S'assurer que les secrets sont configurés dans GitHub Actions
git tag v0.2.1
git push origin v0.2.1

# Attendre que le workflow se termine
# Télécharger le binaire depuis GitHub Releases
```

### 2. Installer la version actuelle

Installe la version `v0.2.0` sur ta machine.

### 3. Créer une nouvelle release

```bash
# Mettre à jour la version
npm version patch  # ou minor, ou major

# Créer le tag
git tag v0.2.1
git push origin v0.2.1
```

### 4. Vérifier la mise à jour

1. Ouvre l'app `v0.2.0`
2. Va dans Paramètres
3. La mise à jour `v0.2.1` devrait apparaître
4. Clique sur "Installer"
5. L'app devrait se mettre à jour et redémarrer

## 📊 Workflow complet

```
┌─────────────────┐
│  Developer      │
│  - Edit code    │
│  - npm version  │
│  - git tag      │
│  - git push     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ GitHub Actions  │
│  - Build        │
│  - Sign         │
│  - Release      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ GitHub Releases │
│  - Binaries     │
│  - latest.json  │
└────────┬────────┘
         │
         ├─────────────────────┐
         ↓                     ↓
┌─────────────────┐   ┌─────────────────┐
│  Landing Page   │   │   Tauri App     │
│  - Fetch API    │   │  - Check update │
│  - Show links   │   │  - Verify sig   │
│  - Auto DL      │   │  - Install      │
└─────────────────┘   └─────────────────┘
```

## 🐛 Troubleshooting

### L'app ne détecte pas les mises à jour

1. Vérifie que `latest.json` existe sur GitHub Releases
2. Vérifie l'URL dans `tauri.conf.json`
3. Regarde les logs de l'app (Paramètres > Logs de débogage)

### Erreur "Invalid signature"

1. La clé publique dans `tauri.conf.json` est incorrecte
2. Le binaire n'a pas été signé (secrets GitHub manquants)
3. Le fichier a été modifié après signature

### Le build GitHub Actions échoue

1. Vérifie que les secrets sont configurés correctement
2. Vérifie que le mot de passe est correct
3. Regarde les logs du workflow

## 📚 Ressources

- [Tauri Updater Documentation](https://tauri.app/v1/guides/distribution/updater/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)
- [Tauri Signing](https://tauri.app/v1/guides/distribution/sign-macos/)

---

**Besoin d'aide ?** Ouvre une issue sur GitHub !
