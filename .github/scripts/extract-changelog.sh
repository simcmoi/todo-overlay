#!/bin/bash
# Script pour extraire le changelog d'une version spécifique depuis CHANGELOG.md

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# Extraire la section pour cette version depuis CHANGELOG.md
CHANGELOG=$(awk -v ver="$VERSION" '
  /^## \[/ { 
    if (found) exit;
    if ($0 ~ "\\[" ver "\\]") found=1;
    next;
  }
  found { 
    if (/^## \[/) exit;
    print;
  }
' CHANGELOG.md)

# Si aucun changelog trouvé, utiliser message par défaut
if [ -z "$CHANGELOG" ]; then
  CHANGELOG="Voir CHANGELOG.md pour les détails."
fi

# Ajouter instructions d'installation
cat << EOF
$CHANGELOG

---

📦 **Installation**

Téléchargez la version correspondant à votre système :
- **macOS (Apple Silicon)** : \`*_aarch64.dmg\`
- **macOS (Intel)** : \`*_x64.dmg\`  
- **Windows** : \`*.msi\`
- **Linux** : \`*.AppImage\` ou \`*.deb\`

🔄 **Mise à jour automatique**

Si vous avez déjà installé Todo Overlay, l'application vous notifiera automatiquement de cette mise à jour.
EOF
