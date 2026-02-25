#!/bin/bash

# Script de release automatique pour Todo Overlay
# Usage: npm run release [patch|minor|major]
# Par défaut: patch (0.2.1 → 0.2.2)

set -e  # Arrêter si une commande échoue

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Déterminer le type de version (patch par défaut)
VERSION_TYPE="${1:-patch}"

echo -e "${BLUE}🚀 Démarrage du processus de release (type: $VERSION_TYPE)${NC}"

# Vérifier qu'on est sur main et à jour
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${RED}❌ Erreur: Tu dois être sur la branche 'main' pour créer une release${NC}"
  exit 1
fi

echo -e "${BLUE}📥 Vérification des mises à jour...${NC}"
git fetch origin

if [ $(git rev-list HEAD...origin/main --count) -ne 0 ]; then
  echo -e "${RED}❌ Erreur: La branche locale n'est pas à jour avec origin/main${NC}"
  echo -e "${YELLOW}Exécute: git pull${NC}"
  exit 1
fi

# Vérifier qu'il n'y a pas de changements non commités
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}❌ Erreur: Il y a des changements non commités${NC}"
  echo -e "${YELLOW}Commit ou stash tes changements avant de créer une release${NC}"
  exit 1
fi

# Bump la version dans package.json
echo -e "${BLUE}📝 Bump de la version dans package.json...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# Récupérer la nouvelle version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ Nouvelle version: $NEW_VERSION${NC}"

# Mettre à jour src-tauri/tauri.conf.json
echo -e "${BLUE}📝 Synchronisation de src-tauri/tauri.conf.json...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS (BSD sed)
  sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
else
  # Linux (GNU sed)
  sed -i "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
fi

# Mettre à jour CHANGELOG.md (optionnel, si le fichier existe)
if [ -f "CHANGELOG.md" ]; then
  echo -e "${BLUE}📝 Mise à jour de CHANGELOG.md...${NC}"
  DATE=$(date +"%Y-%m-%d")
  
  # Créer une sauvegarde
  cp CHANGELOG.md CHANGELOG.md.bak
  
  # Insérer la nouvelle version après le titre
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "3i\\
\\
## [$NEW_VERSION] - $DATE\\
\\
### Added\\
- TODO: Décrire les nouvelles fonctionnalités\\
\\
### Changed\\
- TODO: Décrire les changements\\
\\
### Fixed\\
- TODO: Décrire les corrections\\
" CHANGELOG.md
  else
    sed -i "3i\\\\n## [$NEW_VERSION] - $DATE\\n\\n### Added\\n- TODO: Décrire les nouvelles fonctionnalités\\n\\n### Changed\\n- TODO: Décrire les changements\\n\\n### Fixed\\n- TODO: Décrire les corrections\\n" CHANGELOG.md
  fi
  
  echo -e "${YELLOW}⚠️  CHANGELOG.md mis à jour avec des placeholders TODO${NC}"
  echo -e "${YELLOW}   Édite le fichier pour décrire les changements avant de continuer${NC}"
  
  # Demander confirmation
  read -p "Appuie sur Entrée pour continuer ou Ctrl+C pour annuler..."
  
  # Supprimer la sauvegarde
  rm CHANGELOG.md.bak
fi

# Commit des changements
echo -e "${BLUE}💾 Commit des changements...${NC}"
git add package.json src-tauri/tauri.conf.json CHANGELOG.md 2>/dev/null || git add package.json src-tauri/tauri.conf.json
git commit -m "chore: release v$NEW_VERSION"

# Créer le tag
echo -e "${BLUE}🏷️  Création du tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Pousser sur GitHub
echo -e "${BLUE}📤 Push sur GitHub...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo -e "${GREEN}✨ Release v$NEW_VERSION créée avec succès !${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes:${NC}"
echo -e "  1. GitHub Actions va compiler les binaires (5-10 minutes)"
echo -e "  2. Vérifie le build: ${YELLOW}https://github.com/simcmoi/todo-overlay/actions${NC}"
echo -e "  3. La release sera publiée: ${YELLOW}https://github.com/simcmoi/todo-overlay/releases${NC}"
echo -e "  4. La landing page sera mise à jour automatiquement: ${YELLOW}https://simcmoi.github.io/todo-overlay/${NC}"
echo ""
