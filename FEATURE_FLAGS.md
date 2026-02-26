# Feature Flags

Ce document explique comment activer/désactiver certaines fonctionnalités de l'application via des feature flags.

## 🔧 Configuration

Fichier: `src/config/features.ts`

## ☁️ Fonctionnalités Cloud (`ENABLE_CLOUD_FEATURES`)

**Valeur actuelle:** `false` (désactivé pour la production)

### Quand `false` (mode production actuel)
- ✅ L'application fonctionne en **mode 100% local uniquement**
- ❌ Aucune option cloud n'est visible dans l'interface
- ❌ Pas de choix cloud dans l'onboarding
- ❌ Pas de section "Mode de stockage" dans les settings
- ❌ Pas d'authentification Supabase
- ❌ Pas de synchronisation temps réel
- Le code cloud reste présent mais complètement dormant

### Quand `true` (pour une future version)
- ✅ L'utilisateur peut choisir entre mode local et mode cloud
- ✅ Option cloud visible dans l'onboarding
- ✅ Section "Mode de stockage" visible dans les settings
- ✅ Authentification email/password fonctionnelle
- ✅ Synchronisation temps réel entre appareils via Supabase
- ✅ Migration de données entre local et cloud possible

## 🚀 Comment activer le cloud pour une future version

1. Ouvrir `src/config/features.ts`
2. Changer `export const ENABLE_CLOUD_FEATURES = false` en `true`
3. Rebuild l'application
4. Publier une nouvelle version

**Note:** Le code cloud est déjà complet et testé. Il suffit de changer ce flag!

## 📦 Fonctionnalités cloud implémentées (dormantes)

Voici tout ce qui est déjà codé et prêt à être activé:

### Backend (Supabase)
- ✅ Base de données PostgreSQL avec RLS (Row Level Security)
- ✅ Schéma complet (todos, lists, labels, settings)
- ✅ Authentification email/password
- ✅ Synchronisation temps réel via WebSockets
- ✅ Détection réseau (online/offline)
- ✅ Résolution de conflits avec device_id

### Frontend
- ✅ Composant d'authentification (AuthForm)
- ✅ Indicateur de statut sync (SyncStatusIndicator)
- ✅ Dialog de migration de données (MigrationDialog)
- ✅ Settings de stockage (StorageSettings)
- ✅ Onboarding avec choix local/cloud
- ✅ Support multilingue (5 langues)

### Architecture
- ✅ Provider abstraction (LocalStorageProvider & CloudStorageProvider)
- ✅ State management Zustand
- ✅ Optimistic updates
- ✅ Error handling complet
- ✅ Type safety TypeScript

## 🔒 Sécurité

Même avec le cloud désactivé:
- Le code Supabase est toujours importé dans le bundle
- Les clés d'API Supabase (si présentes dans .env) ne sont jamais utilisées
- Aucune connexion réseau vers Supabase n'est effectuée
- Les données restent 100% locales sur l'appareil

## 📝 Impact sur la taille du bundle

Le code cloud représente environ:
- **~3,500 lignes de code** (dormantes)
- **~150 KB** dans le bundle de production (Supabase client + code cloud)

Pour réduire la taille du bundle en production, on pourrait:
1. Utiliser le tree-shaking avec des imports conditionnels
2. Créer deux builds séparés (avec/sans cloud)
3. Lazy-load les composants cloud

Pour l'instant, le coût est acceptable pour la flexibilité gagnée.

## 🎯 Roadmap

### Version actuelle (0.2.7+)
- Mode local uniquement
- Feature flag `ENABLE_CLOUD_FEATURES = false`

### Version future (0.3.0 ou 0.4.0)
- Activer le cloud en option
- Feature flag `ENABLE_CLOUD_FEATURES = true`
- Marketing: "Nouvelle fonctionnalité: Sync cloud!"

### Version future (0.5.0+)
- Peut-être ajouter d'autres providers cloud (Dropbox, Google Drive)
- Garder le même système de feature flags
