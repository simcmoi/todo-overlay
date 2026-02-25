# Guide de Débogage - Todo Overlay Cloud Storage

## Problème Identifié

**Erreur**: "Échec de sauvegarde: Impossible de sauvegarder les données dans le cloud"

**Cause probable**: Mismatch entre le schéma SQL dans votre base de données Supabase et le code TypeScript.

## Diagnostic Étape par Étape

### 1. Vérifier le Schéma Actuel dans Supabase

1. Ouvrez votre dashboard Supabase: https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (icône SQL dans le menu de gauche)
4. Créez une nouvelle requête et collez le contenu de `scripts/check-supabase-schema.sql`
5. Exécutez la requête

**Attendu**: Les colonnes `id` doivent être de type `TEXT`, pas `UUID`

Si vous voyez `UUID` pour les colonnes `id`, c'est le problème !

### 2. Appliquer le Schéma Corrigé

Si le schéma est incorrect (colonnes id en UUID):

1. **Sauvegardez vos données existantes** (si vous en avez)
2. Dans le SQL Editor de Supabase, exécutez:

```sql
-- ATTENTION: Cela supprimera toutes les données existantes !
DROP TABLE IF EXISTS public.todos CASCADE;
DROP TABLE IF EXISTS public.lists CASCADE;
DROP TABLE IF EXISTS public.labels CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
```

3. Ensuite, copiez-collez **tout le contenu** de `supabase/schema.sql` et exécutez-le

### 3. Vérifier les Logs Améliorés

Avec les améliorations de logging, vous verrez maintenant dans la console de développement:

```
[CloudStorage] Upserting lists: [...]
[CloudStorage] Lists upserted successfully
[CloudStorage] Upserting labels: [...]
[CloudStorage] Labels upserted successfully
[CloudStorage] Upserting settings: [...]
```

Si une erreur survient, vous verrez:

```
[CloudStorage] Lists upsert error: {
  message: "...",
  details: "...",
  hint: "...",
  code: "..."
}
```

### 4. Erreurs Courantes et Solutions

#### Erreur: `invalid input syntax for type uuid: "default"`

**Cause**: La colonne `id` est encore en UUID dans Supabase
**Solution**: Appliquez le schéma corrigé (voir étape 2)

#### Erreur: `406 Not Acceptable` sur user_settings

**Cause**: Aucun enregistrement user_settings n'existe pour l'utilisateur
**Solution**: Normal pour le premier chargement, les settings seront créés automatiquement

#### Erreur: `JWT expired`

**Cause**: Votre session a expiré
**Solution**: Déconnectez-vous et reconnectez-vous

#### Erreur: Foreign key constraint

**Cause**: Vous essayez d'insérer un todo avec `list_id: 'default'` mais la liste 'default' n'existe pas encore
**Solution**: Les listes et labels sont insérés en premier, ce problème ne devrait pas arriver avec le code actuel

## Améliorations Apportées

### 1. Logging Détaillé

Tous les appels `upsert` loggent maintenant:
- Les données envoyées (JSON formaté)
- Les erreurs détaillées (message, code, details, hint)
- Le statut de succès

**Localisation**: `src/lib/storage/cloud-storage.ts` lignes 325-440

### 2. Paramètre onConflict Explicite

Tous les appels `.upsert()` incluent maintenant `{ onConflict: 'id' }` comme recommandé par la documentation Supabase.

**Pourquoi ?** Pour indiquer explicitement quelle colonne utiliser pour détecter les conflits lors d'un upsert.

```typescript
.upsert(dbLists, { onConflict: 'id' })
```

### 3. Schéma SQL Corrigé

Le fichier `supabase/schema.sql` utilise maintenant:
- `id TEXT PRIMARY KEY` au lieu de `id UUID PRIMARY KEY`
- Foreign keys en TEXT: `list_id TEXT`, `label_id TEXT`, etc.
- `user_id UUID` reste inchangé (référence auth.users)

## Vérification Post-Fix

Après avoir appliqué le schéma:

1. Rechargez l'application (Cmd+R dans Tauri)
2. Essayez de créer une nouvelle tâche
3. Vérifiez les logs dans la console (Cmd+Option+I)
4. Vous devriez voir:
   ```
   [CloudStorage] Upserting lists: [...]
   [CloudStorage] Lists upserted successfully
   [CloudStorage] Upserting labels: [...]
   [CloudStorage] Labels upserted successfully
   [CloudStorage] Upserting settings: [...]
   [CloudStorage] Settings upserted successfully
   ```

5. Allez dans Supabase → Table Editor → `lists`
   - Vous devriez voir votre liste "Mes tâches" avec `id: "default"`

## Tests Recommandés

1. **Créer une tâche**: Devrait apparaître dans la table `todos`
2. **Modifier une tâche**: Le champ `updated_at` doit changer
3. **Compléter une tâche**: Le champ `completed_at` doit être rempli
4. **Ouvrir dans un autre appareil**: Les changements doivent se synchroniser en temps réel
5. **Se déconnecter/reconnecter**: Les données doivent persister

## Accès aux Logs de Développement

### Dans Tauri (Desktop App)

1. Lancez l'app: `npm run tauri dev`
2. Ouvrez DevTools: **Cmd+Option+I** (Mac) ou **Ctrl+Shift+I** (Windows/Linux)
3. Allez dans l'onglet **Console**
4. Filtrez par `[CloudStorage]` pour voir uniquement les logs de synchronisation

### Dans Supabase Dashboard

1. Allez dans **Logs** dans le menu de gauche
2. Sélectionnez **Postgres Logs** pour voir les erreurs SQL
3. Sélectionnez **API Logs** pour voir les requêtes HTTP

## Ressources

- **Schéma SQL**: `supabase/schema.sql`
- **Code de Storage**: `src/lib/storage/cloud-storage.ts`
- **Script de Diagnostic**: `scripts/check-supabase-schema.sql`
- **Documentation Supabase JS**: https://supabase.com/docs/reference/javascript

## Besoin d'Aide ?

Si le problème persiste après avoir suivi ce guide:

1. Vérifiez les logs de la console (DevTools)
2. Vérifiez les logs Postgres dans Supabase Dashboard
3. Vérifiez que le schéma est correct avec le script de diagnostic
4. Partagez les messages d'erreur complets pour un diagnostic plus précis
