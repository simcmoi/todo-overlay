#!/bin/bash

# Script pour générer les clés de signature Tauri
# Ce script doit être exécuté UNE SEULE FOIS lors de la configuration initiale

set -e

echo "🔐 Génération des clés de signature Tauri..."
echo ""

# Vérifie si tauri-cli est installé
if ! command -v cargo-tauri &> /dev/null; then
    echo "❌ tauri-cli n'est pas installé globalement."
    echo "Installation avec npm..."
    npm install -g @tauri-apps/cli
fi

# Crée le dossier pour stocker les clés localement (ne jamais commiter!)
mkdir -p .tauri-keys

# Génère les clés
echo "📝 Génération des clés de signature..."
echo ""
echo "⚠️  IMPORTANT: Entrez un mot de passe fort pour protéger la clé privée"
echo "              Vous devrez entrer ce mot de passe 2 fois"
echo ""

# Génère les clés dans le dossier .tauri-keys
cd .tauri-keys
npx @tauri-apps/cli signer generate -w keys.key

echo ""
echo "✅ Clés générées avec succès dans .tauri-keys/"
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Copie la clé PUBLIQUE et mets-la à jour dans src-tauri/tauri.conf.json:"
echo "   Fichier: .tauri-keys/keys.key.pub"
echo ""
cat keys.key.pub
echo ""
echo ""
echo "2. Ajoute les secrets dans GitHub (Settings > Secrets and variables > Actions):"
echo ""
echo "   Nom: TAURI_SIGNING_PRIVATE_KEY"
echo "   Valeur: (contenu complet du fichier .tauri-keys/keys.key)"
echo ""
echo "   Nom: TAURI_SIGNING_PRIVATE_KEY_PASSWORD"  
echo "   Valeur: (le mot de passe que tu viens d'entrer)"
echo ""
echo "3. ⚠️  GARDE CES FICHIERS EN SÉCURITÉ ET NE LES COMMITE JAMAIS!"
echo "   Le dossier .tauri-keys/ est déjà dans .gitignore"
echo ""
