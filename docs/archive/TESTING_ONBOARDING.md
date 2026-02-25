# Script pour tester l'onboarding

Pour tester l'onboarding, vous devez effacer la clé localStorage qui indique que l'utilisateur l'a déjà complété.

## Option 1: Via DevTools (Recommandé)

1. Ouvrez l'application : `npm run tauri dev`
2. Ouvrez DevTools : Cmd+Option+I (Mac) ou Ctrl+Shift+I (Windows/Linux)
3. Allez dans l'onglet **Console**
4. Tapez cette commande :

```javascript
localStorage.removeItem('todo-overlay-onboarding-completed')
```

5. Rechargez l'application : Cmd+R

L'onboarding devrait s'afficher !

## Option 2: Effacer toutes les données

Si vous voulez tout effacer (onboarding + tous les todos + paramètres) :

```javascript
localStorage.clear()
```

Puis rechargez avec Cmd+R.

## Flux de l'Onboarding

### Étape 1: Bienvenue
- Description de l'application
- 3 points forts
- Bouton "Commencer"

### Étape 2: Choix du mode de stockage

**Local** :
- Aucun compte requis
- Données 100% privées
- Fonctionne hors ligne
- Pas de synchronisation

**Cloud** :
- Compte gratuit requis
- Synchronisation en temps réel
- Accès depuis tous vos appareils
- Sauvegarde automatique

### Étape 3 (si Cloud): Création de compte
- Email
- Mot de passe (min 6 caractères)
- Confirmation du mot de passe
- Validation automatique
- Création du compte + passage en mode cloud

## Points de Validation

✅ Le mot de passe doit contenir au moins 6 caractères
✅ Le mot de passe et la confirmation doivent correspondre
✅ L'email doit être valide (contenir @)
✅ Les erreurs s'affichent clairement
✅ Le bouton "Retour" fonctionne à chaque étape
✅ Une fois complété, l'onboarding ne se réaffiche plus

## Tester le Mode Local

1. Effacez l'onboarding : `localStorage.removeItem('todo-overlay-onboarding-completed')`
2. Rechargez : Cmd+R
3. Choisissez **Stockage Local**
4. L'onboarding devrait se terminer immédiatement
5. Vous devriez voir l'application avec la liste "Mes tâches"

## Tester le Mode Cloud

1. Effacez l'onboarding : `localStorage.removeItem('todo-overlay-onboarding-completed')`
2. Rechargez : Cmd+R
3. Choisissez **Stockage Cloud**
4. Entrez un email et un mot de passe
5. Le compte devrait être créé
6. Vous devriez être connecté en mode cloud

⚠️ **Note** : Pour tester le mode cloud, assurez-vous que votre schéma Supabase est correctement appliqué (voir NEXT_STEPS.md).
