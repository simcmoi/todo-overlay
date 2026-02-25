# Étapes Suivantes - Todo Overlay Cloud Storage

## Action Immédiate Requise

**Vous devez appliquer le schéma SQL corrigé dans votre projet Supabase** avant que l'application puisse sauvegarder des données dans le cloud.

### Étape 1: Appliquer le Schéma (5 minutes)

1. **Ouvrez votre dashboard Supabase**
   - URL: https://supabase.com/dashboard
   - Sélectionnez votre projet Todo Overlay

2. **Accédez au SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Créez une nouvelle requête

3. **Exécutez le script de correction**
   - Ouvrez le fichier `scripts/fix-schema-quick.sql`
   - Copiez **tout** le contenu
   - Collez-le dans le SQL Editor de Supabase
   - Cliquez sur "Run" (ou Cmd+Enter)

4. **Vérifiez que c'est appliqué**
   - À la fin du script, vous verrez une requête de vérification
   - Le résultat doit montrer que toutes les colonnes `id` sont de type `text`

### Étape 2: Tester l'Application

1. **Rechargez l'application**
   - Si elle tourne déjà: appuyez sur Cmd+R dans la fenêtre Tauri
   - Sinon: `npm run tauri dev`

2. **Ouvrez DevTools**
   - Cmd+Option+I (Mac) ou Ctrl+Shift+I (Windows/Linux)
   - Allez dans l'onglet Console

3. **Créez une tâche**
   - Dans l'application, tapez une nouvelle tâche
   - Appuyez sur Entrée

4. **Vérifiez les logs**
   - Dans la console DevTools, vous devriez voir:
     ```
     [CloudStorage] Upserting lists: [...]
     [CloudStorage] Lists upserted successfully
     [CloudStorage] Upserting labels: [...]
     [CloudStorage] Labels upserted successfully
     [CloudStorage] Upserting settings: [...]
     [CloudStorage] Settings upserted successfully
     ```

5. **Vérifiez dans Supabase**
   - Allez dans Table Editor → `lists`
   - Vous devriez voir votre liste "Mes tâches" avec `id: "default"`
   - Allez dans Table Editor → `todos`
   - Vous devriez voir votre nouvelle tâche

### Étape 3: Si Ça Ne Fonctionne Toujours Pas

Si vous voyez toujours une erreur, **copiez le message d'erreur complet** depuis la console DevTools.

Les logs améliorés vous donneront maintenant des informations précises:
- Le message d'erreur exact
- Le code d'erreur PostgreSQL
- Les données qui ont causé l'erreur
- Des indices sur comment corriger

## Fichiers Créés pour Vous Aider

### 📄 DEBUGGING_GUIDE.md
Guide complet de débogage avec:
- Explication détaillée du problème
- Instructions pas à pas pour le diagnostic
- Solutions pour les erreurs courantes
- Comment accéder aux logs

### 📄 scripts/check-supabase-schema.sql
Script de diagnostic pour vérifier votre schéma actuel:
- Types de colonnes
- Contraintes de clés primaires
- Contraintes de clés étrangères

### 📄 scripts/fix-schema-quick.sql
Script complet pour corriger le schéma en une seule exécution:
- Supprime les tables existantes (⚠️ perte de données)
- Recrée toutes les tables avec les bons types
- Configure tous les index et RLS policies
- Active Realtime
- Inclut une requête de vérification

## Améliorations Apportées au Code

### 1. Logging Détaillé (src/lib/storage/cloud-storage.ts)

Chaque opération d'upsert logue maintenant:
```typescript
console.log('[CloudStorage] Upserting lists:', JSON.stringify(dbLists, null, 2))
// ... opération ...
console.log('[CloudStorage] Lists upserted successfully')
```

En cas d'erreur:
```typescript
console.error('[CloudStorage] Lists upsert error:', {
  message: listsError.message,
  details: listsError.details,
  hint: listsError.hint,
  code: listsError.code
})
```

### 2. Paramètre onConflict Explicite

Tous les upserts spécifient maintenant explicitement la colonne de conflit:
```typescript
.upsert(dbLists, { onConflict: 'id' })
```

Ceci suit les meilleures pratiques Supabase et évite les ambiguïtés.

### 3. Schéma SQL Corrigé (supabase/schema.sql)

Le schéma utilise maintenant `TEXT` pour toutes les clés primaires générées par l'application:
- `lists.id: TEXT` (au lieu de UUID)
- `labels.id: TEXT` (au lieu de UUID)
- `todos.id: TEXT` (au lieu de UUID)
- `user_settings.user_id: UUID` (reste UUID car référence auth.users)

## Prochaines Étapes de Développement

Une fois que le cloud storage fonctionne:

### Tests à Effectuer
- [ ] Créer/modifier/supprimer des tâches
- [ ] Tester la synchronisation temps réel (ouvrir dans 2 fenêtres)
- [ ] Tester la déconnexion/reconnexion
- [ ] Tester le passage Local → Cloud avec migration
- [ ] Tester le passage Cloud → Local avec migration

### Fonctionnalités Futures Potentielles
- [ ] Gestion des conflits multi-device plus sophistiquée
- [ ] Historique des modifications
- [ ] Synchronisation sélective (certaines listes uniquement)
- [ ] Mode hors ligne avec queue de synchronisation
- [ ] Partage de listes entre utilisateurs

## Besoin d'Aide ?

Si après avoir suivi ces étapes le problème persiste:

1. Vérifiez la console DevTools (tous les logs commencent par `[CloudStorage]`)
2. Vérifiez les Postgres Logs dans Supabase Dashboard
3. Copiez l'erreur complète et partagez-la

## Rappel Important

⚠️ **Le script `fix-schema-quick.sql` supprime toutes les données existantes !**

Si vous avez déjà des données de test dans Supabase que vous voulez conserver, exportez-les d'abord via:
- Dashboard Supabase → Table Editor → Export to CSV

---

**Prêt à tester ?** Suivez l'Étape 1 ci-dessus pour appliquer le schéma !
