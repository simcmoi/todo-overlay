# Setup Supabase pour Todo Overlay

Ce guide vous explique comment configurer Supabase Cloud pour activer le mode cloud dans Todo Overlay.

## 📋 Étape 1: Créer un Projet Supabase

1. Allez sur https://supabase.com
2. Cliquez sur "Start your project"
3. Créez un compte (ou connectez-vous)
4. Cliquez sur "New Project"
5. Remplissez les informations:
   - **Name**: `todo-overlay` (ou ce que vous voulez)
   - **Database Password**: Choisissez un mot de passe fort (notez-le!)
   - **Region**: Choisissez la région la plus proche de vous
   - **Pricing Plan**: Free (suffisant pour commencer)
6. Cliquez sur "Create new project"
7. Attendez 1-2 minutes que le projet soit prêt

## 📋 Étape 2: Récupérer les Credentials

1. Une fois le projet créé, allez dans **Settings** (icône d'engrenage) → **API**
2. Vous verrez 2 informations importantes:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: Une longue clé commençant par `eyJhbGci...`
3. Gardez ces informations pour l'étape suivante

## 📋 Étape 3: Configurer la Base de Données

1. Dans votre projet Supabase, allez dans **SQL Editor** (icône de base de données)
2. Cliquez sur "+ New query"
3. Copiez tout le contenu du fichier `supabase/schema.sql` de ce projet
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" (ou Ctrl/Cmd + Enter)
6. Vous devriez voir "Success. No rows returned" - c'est normal!

## 📋 Étape 4: Configurer l'Application

### Option A: Variables d'environnement (Développement)

1. Créez un fichier `.env.local` à la racine du projet:
   ```bash
   cp .env.local.example .env.local
   ```

2. Modifiez `.env.local` avec vos credentials:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

3. Redémarrez l'application:
   ```bash
   npm run tauri dev
   ```

### Option B: Build de production

Pour un build de production, vous devez passer les variables d'environnement au moment du build:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJhbGci... \
npm run tauri build
```

## 📋 Étape 5: Configurer l'Authentification

1. Dans Supabase, allez dans **Authentication** → **Providers**
2. **Email** devrait être activé par défaut
3. Configurez les paramètres:
   - **Enable email confirmations**: ❌ Désactivé pour le MVP (simplifie le flow)
   - **Secure email change**: ✅ Activé
   - **Secure password change**: ✅ Activé

4. (Optionnel) Pour la production, vous pouvez activer:
   - **Enable email confirmations**: Pour plus de sécurité
   - Configurer SMTP custom pour les emails de confirmation

## ✅ Vérification

Pour vérifier que tout fonctionne:

1. Lancez l'application: `npm run tauri dev`
2. Allez dans **Settings** → **Mode de stockage**
3. Sélectionnez **Cloud**
4. Créez un compte avec un email et mot de passe
5. Créez une todo
6. Dans Supabase Dashboard → **Table Editor** → `todos`, vous devriez voir votre todo!

## 🔐 Sécurité

### ⚠️ Important pour la Production

1. **N'exposez JAMAIS votre `service_role` key** - utilisez uniquement la clé `anon public`
2. Les clés sont déjà protégées par Row Level Security (RLS)
3. Chaque utilisateur ne peut voir que ses propres données
4. Pour la production, activez les confirmations d'email

### Vérifier la Sécurité RLS

Testez que RLS fonctionne:

1. Créez 2 comptes différents
2. Créez des todos avec chaque compte
3. Vérifiez que chaque compte ne voit QUE ses propres todos

## 🐛 Troubleshooting

### "Supabase credentials not configured"

**Cause:** Les variables d'environnement ne sont pas définies.

**Solution:** 
- Vérifiez que `.env.local` existe
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez l'application

### "Invalid login credentials"

**Cause:** Email ou mot de passe incorrect, ou compte non confirmé.

**Solution:**
- Vérifiez vos credentials
- Si email confirmations est activé, vérifiez votre boîte mail
- Essayez de réinitialiser le mot de passe

### Les todos ne se synchronisent pas

**Cause:** Realtime n'est pas activé.

**Solution:**
- Vérifiez que vous avez bien exécuté `ALTER PUBLICATION supabase_realtime ADD TABLE...` dans le script SQL
- Allez dans Database → Replication et vérifiez que les tables sont dans la liste

### "Row Level Security policy violation"

**Cause:** Les policies RLS bloquent l'accès.

**Solution:**
- Vérifiez que toutes les policies ont été créées (script SQL complet)
- Vérifiez que l'utilisateur est bien authentifié
- Vérifiez dans Table Editor → Policies que les 4 policies (SELECT, INSERT, UPDATE, DELETE) existent pour chaque table

## 📚 Ressources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

## 💬 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs de l'application (Settings → Logs)
2. Vérifiez les logs Supabase (Dashboard → Logs)
3. Ouvrez une issue sur GitHub avec les détails

---

**Prochaines étapes:** Une fois Supabase configuré, vous pouvez utiliser le mode cloud dans l'application et synchroniser vos todos entre appareils! 🎉
