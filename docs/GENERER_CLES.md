# 🔑 Générer les Clés de Signature - Guide Simple

## 📝 Pourquoi ?

Les clés de signature permettent de sécuriser les mises à jour automatiques de l'application. Sans clés, les binaires de la v0.2.0 fonctionneront mais **l'auto-update ne marchera pas**.

## 🚀 Génération des Clés (À FAIRE UNE SEULE FOIS)

### Étape 1 : Génère les clés

Ouvre ton terminal dans le dossier du projet et lance :

```bash
# Crée le dossier pour les clés (déjà dans .gitignore)
mkdir -p .tauri-keys

# Génère les clés
npx @tauri-apps/cli signer generate -w .tauri-keys/keys.key
```

**Important :** Le terminal va te demander un mot de passe **2 fois**.
- Choisis un mot de passe FORT et **note-le quelque part de sûr** (gestionnaire de mots de passe)
- Tu en auras besoin pour configurer GitHub

### Étape 2 : Vérifie que les clés existent

```bash
ls -la .tauri-keys/
```

Tu devrais voir :
```
keys.key       ← Clé PRIVÉE (secret, ne JAMAIS commiter)
keys.key.pub   ← Clé PUBLIQUE (à mettre dans tauri.conf.json)
```

### Étape 3 : Copie la clé publique

```bash
cat .tauri-keys/keys.key.pub
```

**Copie TOUT le contenu** (ça ressemble à ça) :
```
dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEVGMTcyQkQzN0I5MzU2RkIKUld...
```

### Étape 4 : Mets à jour tauri.conf.json

Ouvre `src-tauri/tauri.conf.json` et colle la clé publique ici :

```json
{
  "plugins": {
    "updater": {
      "pubkey": "COLLE_ICI_LE_CONTENU_DE_keys.key.pub"
    }
  }
}
```

### Étape 5 : Configure les secrets GitHub

Va sur : **https://github.com/simcmoi/todo-overlay/settings/secrets/actions**

Clique sur **"New repository secret"** et ajoute 2 secrets :

**SECRET 1**
- Name : `TAURI_SIGNING_PRIVATE_KEY`
- Secret : Contenu COMPLET de `.tauri-keys/keys.key`

```bash
# Pour copier le contenu :
cat .tauri-keys/keys.key
# Copie TOUT et colle dans GitHub
```

**SECRET 2**
- Name : `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- Secret : Le mot de passe que tu as choisi à l'étape 1

### Étape 6 : Commit la clé publique

```bash
git add src-tauri/tauri.conf.json
git commit -m "chore: add updater public key for signed releases"
git push
```

### Étape 7 : Teste avec une nouvelle release

```bash
# Crée une nouvelle version
npm version patch  # 0.2.0 → 0.2.1

# Push le tag
git push && git push --tags
```

Le workflow GitHub Actions va maintenant créer des binaires **signés** avec auto-update fonctionnel.

---

## ✅ Vérification

Une fois la release v0.2.1 publiée, vérifie :

1. Va sur https://github.com/simcmoi/todo-overlay/releases
2. Télécharge le `.tar.gz` (updater artifact)
3. Il devrait y avoir un fichier `.sig` avec la signature

## ⚠️ SÉCURITÉ IMPORTANT

**À FAIRE :**
- ✅ Garde `.tauri-keys/` en local uniquement (déjà dans .gitignore)
- ✅ Sauvegarde les clés dans un gestionnaire de mots de passe
- ✅ Note le mot de passe dans un endroit sûr

**À NE JAMAIS FAIRE :**
- ❌ Commiter les fichiers `.tauri-keys/*` dans Git
- ❌ Partager la clé privée ou le mot de passe
- ❌ Pousser les clés sur GitHub

---

## 🐛 Problèmes Courants

### "Missing comment in secret key"
→ Les secrets GitHub ne sont pas configurés ou la clé privée est incorrecte

### "Incorrect password"
→ Le mot de passe dans `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` est incorrect

### Les mises à jour ne fonctionnent pas
→ Vérifie que la clé publique dans `tauri.conf.json` correspond à `.tauri-keys/keys.key.pub`

---

**Besoin d'aide ?** Ouvre une issue sur GitHub
