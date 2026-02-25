# 🚀 Workflow de Release

Guide complet pour créer une nouvelle release de Todo Overlay.

## 🎯 TL;DR - Commande Rapide

```bash
npm run release
```

C'est tout ! Le script automatique s'occupe de :
- ✅ Bump les versions (package.json + tauri.conf.json)
- ✅ Mise à jour du CHANGELOG.md
- ✅ Création du commit et du tag
- ✅ Push sur GitHub
- ✅ Déclenchement du build automatique

## 📋 Prérequis

Avant de créer une release, assure-toi que :
- Tu es sur la branche `main`
- Tous les changements sont commités
- La branche locale est à jour avec `origin/main`
- Les tests passent (`npm test`)

## 🔢 Types de Release

### Patch (0.2.1 → 0.2.2)
Pour les corrections de bugs et petits changements :
```bash
npm run release
```

### Minor (0.2.1 → 0.3.0)
Pour les nouvelles fonctionnalités :
```bash
npm run release:minor
```

### Major (0.2.1 → 1.0.0)
Pour les breaking changes :
```bash
npm run release:major
```

## 🛠️ Ce que Fait le Script Automatique

### 1. Vérifications de Sécurité
- ✅ Vérifie que tu es sur `main`
- ✅ Vérifie qu'il n'y a pas de changements non commités
- ✅ Vérifie que la branche est à jour avec GitHub

### 2. Bump des Versions
- Met à jour `package.json`
- Synchronise `src-tauri/tauri.conf.json` automatiquement
- ⚠️ **Plus besoin de le faire manuellement !**

### 3. Mise à Jour du CHANGELOG
- Ajoute automatiquement une nouvelle section avec la date
- Crée des placeholders `TODO` pour documenter les changements
- **Te demande de remplir les changements avant de continuer**

### 4. Git Operations
- Commit avec message standardisé : `chore: release vX.Y.Z`
- Crée le tag : `vX.Y.Z`
- Push sur GitHub (commit + tag)

### 5. Build Automatique
- GitHub Actions détecte le nouveau tag
- Compile pour toutes les plateformes (5-10 minutes)
- Publie la release automatiquement
- Met à jour la landing page

## 📝 Exemple de Session Complète

```bash
# 1. S'assurer que tout est à jour
git pull
npm test

# 2. Lancer la release (exemple: patch)
npm run release

# Le script va :
# - Bumper 0.2.1 → 0.2.2
# - Ouvrir CHANGELOG.md avec des TODO
# - Attendre que tu documentes les changements

# 3. Éditer CHANGELOG.md
# Remplacer les TODO par les vrais changements

# 4. Appuyer sur Entrée pour continuer
# Le script push automatiquement sur GitHub

# 5. Vérifier le build
open https://github.com/simcmoi/todo-overlay/actions

# 6. Une fois le build terminé, vérifier la release
open https://github.com/simcmoi/todo-overlay/releases

# 7. Vérifier la landing page
open https://simcmoi.github.io/todo-overlay/
```

## 🎬 Workflow Complet (Automatisé)

```
Developer                 GitHub                  Landing Page            Utilisateurs
    │                        │                         │                        │
    │  npm run release       │                         │                        │
    ├───────────────────────>│                         │                        │
    │                        │                         │                        │
    │                        │  GitHub Actions         │                        │
    │                        │  (5-10 minutes)         │                        │
    │                        │  - Build macOS          │                        │
    │                        │  - Build Windows        │                        │
    │                        │  - Build Linux          │                        │
    │                        │  - Sign binaries        │                        │
    │                        │  - Generate latest.json │                        │
    │                        │  - Create release       │                        │
    │                        │                         │                        │
    │                        │  Release published      │                        │
    │                        ├────────────────────────>│                        │
    │                        │                         │                        │
    │                        │                         │  Fetch latest release  │
    │                        │                         │  (useGitHubReleases)   │
    │                        │                         │                        │
    │                        │                         │  Update download links │
    │                        │                         ├───────────────────────>│
    │                        │                         │                        │
    │                        │                         │                        │  Download
    │                        │<───────────────────────────────────────────────────┤
    │                        │                         │                        │
    │                        │  latest.json            │                        │  Check update
    │                        │<───────────────────────────────────────────────────┤
    │                        │                         │                        │
    │                        │  Download + Install     │                        │
    │                        ├────────────────────────────────────────────────────>│
```

## 🔐 Signature des Binaires

Les binaires sont automatiquement signés si les clés sont configurées :
- Voir `docs/GENERER_CLES.md` pour générer les clés
- Les secrets GitHub doivent être configurés
- Sans clés : binaires fonctionnels mais **pas d'auto-update**

## ❌ Annuler une Release (Si Erreur)

### Si le tag n'a pas encore été poussé
```bash
git reset --hard HEAD~1
git tag -d vX.Y.Z
```

### Si le tag a été poussé mais le build échoue
```bash
# Supprimer le tag distant
git push origin :refs/tags/vX.Y.Z

# Supprimer le tag local
git tag -d vX.Y.Z

# Corriger le problème, puis relancer
npm run release
```

### Si la release est déjà publiée
- Supprimer manuellement sur GitHub : https://github.com/simcmoi/todo-overlay/releases
- Créer une nouvelle version corrective (patch)

## 🐛 Dépannage

### "Erreur: Tu dois être sur la branche 'main'"
```bash
git checkout main
```

### "Erreur: Il y a des changements non commités"
```bash
git status
git add .
git commit -m "fix: describe changes"
```

### "Erreur: La branche locale n'est pas à jour"
```bash
git pull
```

### Le build GitHub Actions échoue
1. Vérifier les logs : https://github.com/simcmoi/todo-overlay/actions
2. Si c'est un problème de signature, voir `docs/GENERER_CLES.md`
3. Si c'est un problème de compilation, tester localement :
   ```bash
   npm run tauri build
   ```

## 📚 Ressources

- **Configuration Auto-Update** : `docs/AUTO_UPDATE_SETUP.md`
- **Génération des Clés** : `docs/GENERAR_CLES.md`
- **CI/CD Setup** : `.github/GITHUB_ACTIONS_SETUP.md`
- **Landing Page** : `web/landing/README.md`

## 🎯 Checklist Avant Release

- [ ] Tous les tests passent (`npm test`)
- [ ] Le build local fonctionne (`npm run tauri build`)
- [ ] Les changements sont documentés dans le commit message
- [ ] La branche `main` est à jour avec `origin/main`
- [ ] Aucun changement non commité

## 🔄 Cycle de Release Recommandé

### Développement
1. Créer une branche : `git checkout -b feature/nouvelle-fonctionnalite`
2. Développer et tester
3. Merge dans `main` : PR ou `git merge`

### Release
1. Sur `main`, lancer `npm run release`
2. Documenter les changements dans CHANGELOG
3. Attendre le build GitHub Actions
4. Vérifier que la landing page est à jour

### Post-Release
1. Tester l'application téléchargée
2. Vérifier l'auto-update (si clés configurées)
3. Annoncer la release aux utilisateurs

---

**Note** : Ce workflow est 100% automatisé. Une seule commande suffit pour tout faire ! 🚀
