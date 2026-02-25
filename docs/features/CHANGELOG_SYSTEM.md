# Système de Changelog Automatique

Ce document explique comment fonctionne le système de changelog automatique de Todo Overlay.

## 📋 Vue d'ensemble

Le système de changelog est entièrement automatisé et fonctionne en plusieurs étapes :

1. **Mise à jour manuelle de CHANGELOG.md** : Les développeurs ajoutent leurs modifications dans la section `[Non publié]`
2. **Génération automatique lors de la release** : GitHub Action extrait le changelog de la version et l'ajoute à la release
3. **Affichage dans l'app** : Quand une mise à jour est disponible, l'utilisateur peut cliquer sur "Nouveautés" pour voir le changelog

## 📝 Format du CHANGELOG.md

Le fichier `CHANGELOG.md` suit le format [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) :

```markdown
# Changelog

## [Non publié]

### Ajouté
- Nouvelle fonctionnalité A
- Nouvelle fonctionnalité B

### Modifié
- Amélioration X
- Amélioration Y

### Corrigé
- Bug fix 1
- Bug fix 2

## [0.2.3] - 2026-02-25

### Ajouté
- Fonctionnalité de la v0.2.3

...
```

### Catégories recommandées

- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Changements dans des fonctionnalités existantes
- **Déprécié** : Fonctionnalités qui seront retirées
- **Retiré** : Fonctionnalités retirées
- **Corrigé** : Corrections de bugs
- **Sécurité** : Corrections de vulnérabilités

## 🔄 Workflow de release

### 1. Avant la release

Mettre à jour `CHANGELOG.md` en déplaçant les changements de `[Non publié]` vers une nouvelle version :

```markdown
## [Non publié]

(Vide ou futurs changements)

## [0.2.4] - 2026-03-01

### Ajouté
- Toutes les nouvelles fonctionnalités depuis v0.2.3

### Corrigé
- Tous les bugs corrigés
```

### 2. Créer la release

```bash
# Mettre à jour la version dans package.json
npm version patch  # ou minor, ou major

# Créer le tag et pousser
git add .
git commit -m "chore: release v0.2.4"
git tag v0.2.4
git push origin main --tags
```

### 3. GitHub Action automatique

Le workflow `.github/workflows/release.yml` va :

1. Détecter le tag `v*`
2. Extraire le changelog de la version depuis `CHANGELOG.md` avec le script `.github/scripts/extract-changelog.sh`
3. Créer une release GitHub draft avec le changelog
4. Builder l'application pour toutes les plateformes
5. Uploader les binaires
6. Publier la release

### 4. Dans l'application

Quand l'utilisateur :
1. Lance l'app, elle vérifie automatiquement les mises à jour
2. Si une mise à jour est disponible, un banner s'affiche en haut
3. L'utilisateur peut cliquer sur **"Nouveautés"** pour voir le changelog
4. Un dialog s'ouvre avec le changelog formaté en Markdown
5. L'utilisateur peut ensuite cliquer sur **"Installer"** pour télécharger et installer la mise à jour

## 🛠️ Architecture technique

### Backend (Rust/Tauri)

**Fichier** : `src-tauri/src/changelog.rs`

- **Commande Tauri** : `get_changelog(version: String) -> Result<String, String>`
- **Stratégie** :
  1. Essaie d'abord de récupérer depuis l'API GitHub : `https://api.github.com/repos/simonfessy/todo-overlay/releases/tags/v{version}`
  2. En cas d'échec (offline, rate limit), lit depuis `CHANGELOG.md` embarqué avec `include_str!`

### Frontend (React/TypeScript)

**Composants** :

1. **`ChangelogDialog`** (`src/components/changelog-dialog.tsx`)
   - Dialog modal pour afficher le changelog
   - Utilise `react-markdown` pour formater le Markdown
   - Styles personnalisés pour les titres, listes, code, etc.

2. **`UpdateBanner`** (`src/components/update-banner.tsx`)
   - Banner compact en haut de l'app
   - Bouton "Nouveautés" qui ouvre `ChangelogDialog`
   - Bouton "Installer" qui télécharge et installe la mise à jour

**API** : `src/lib/tauri.ts`
```typescript
export async function getChangelog(version: string): Promise<string>
```

### GitHub Actions

**Script** : `.github/scripts/extract-changelog.sh`

Extrait automatiquement la section d'une version depuis `CHANGELOG.md` :

```bash
#!/bin/bash
VERSION=$1
awk -v ver="$VERSION" '
  /^## \[/ { 
    if (found) exit;
    if ($0 ~ "\\[" ver "\\]") found=1;
    next;
  }
  found { 
    if (/^## \[/) exit;
    print;
  }
' CHANGELOG.md
```

**Workflow** : `.github/workflows/release.yml`

```yaml
- name: Extract changelog for version
  run: |
    chmod +x .github/scripts/extract-changelog.sh
    CHANGELOG=$(.github/scripts/extract-changelog.sh "${PACKAGE_VERSION}")
    echo "CHANGELOG_BODY<<EOF" >> $GITHUB_ENV
    echo "$CHANGELOG" >> $GITHUB_ENV
    echo "EOF" >> $GITHUB_ENV

- name: Create release
  script: |
    github.rest.repos.createRelease({
      body: process.env.CHANGELOG_BODY || 'See CHANGELOG.md for details.',
      // ...
    })
```

## 🧪 Tests locaux

### Tester l'extraction du changelog

```bash
.github/scripts/extract-changelog.sh 0.2.3
```

### Tester la commande Tauri

```bash
# Lancer l'app en dev
npm run tauri dev

# Dans la console du navigateur
await window.__TAURI__.invoke('get_changelog', { version: '0.2.3' })
```

### Tester le dialog

1. Ouvrir l'app
2. Aller dans Paramètres
3. Cliquer sur "Vérifier les mises à jour"
4. Si une mise à jour est simulée (mode dev), cliquer sur "Nouveautés"

## 📚 Ressources

- [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
- [Semantic Versioning](https://semver.org/lang/fr/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)
- [react-markdown](https://github.com/remarkjs/react-markdown)

## 🔮 Améliorations futures

- [ ] Cache du changelog pour éviter les appels réseau répétés
- [ ] Support des images dans le changelog (depuis GitHub)
- [ ] Afficher le changelog lors de la première ouverture après mise à jour
- [ ] Historique des changelogs (voir plusieurs versions)
- [ ] Comparaison entre versions
