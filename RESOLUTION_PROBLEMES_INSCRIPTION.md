# 🔧 Résolution des Problèmes d'Inscription - Sensora

## 📋 Problèmes Identifiés

D'après les logs d'erreur, voici les problèmes rencontrés lors de l'inscription :

### 1. **Erreur 406** - Problème de requête
```
zjeqdelguqnqckqmrbvi.supabase.co/rest/v1/users?select=*&email=eq.mamadoubayoula240%40gmail.com:1 
Failed to load resource: the server responded with a status of 406 ()
```

### 2. **Erreur 409** - Conflit d'utilisateur
```
zjeqdelguqnqckqmrbvi.supabase.co/rest/v1/users:1 
Failed to load resource: the server responded with a status of 409 ()
```

### 3. **Erreur 403** - Permissions insuffisantes
```
zjeqdelguqnqckqmrbvi.supabase.co/auth/v1/admin/users/38d75567-7129-46f3-a8bc-0a83a6f0d66f:1 
Failed to load resource: the server responded with a status of 403 ()
```

### 4. **Utilisateur créé mais pas d'accès à l'espace**
L'utilisateur se crée dans `auth.users` et `public.users` mais n'accède pas à son espace.

---

## ✅ Solutions Implémentées

### 1. **Amélioration du Service Supabase**

#### **Gestion d'erreurs robuste**
- Utilisation de `maybeSingle()` au lieu de `single()` pour éviter les erreurs 406
- Gestion spécifique des codes d'erreur PostgreSQL
- Fallback automatique vers la connexion si l'utilisateur existe déjà

#### **Vérification améliorée des utilisateurs existants**
```typescript
// Avant (problématique)
const { data: existingUser } = await this.supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single() // ❌ Erreur 406 si pas trouvé

// Après (corrigé)
const { data: existingUser, error: checkError } = await this.supabase
  .from('users')
  .select('id, email')
  .eq('email', email)
  .maybeSingle() // ✅ Pas d'erreur si pas trouvé
```

#### **Gestion des conflits d'utilisateur**
```typescript
if (profileError.code === '23505') {
  console.log('🔄 Utilisateur existe déjà, tentative de connexion...')
  const signInResult = await this.signIn(email, password)
  if (signInResult) {
    return signInResult
  }
}
```

### 2. **Amélioration du Contexte d'Authentification**

#### **Vérification de session après inscription**
```typescript
// Vérifier que l'utilisateur a bien une session active
const currentSession = await supabaseService.getCurrentSession()
if (!currentSession) {
  console.warn('⚠️ Aucune session active après inscription, tentative de connexion...')
  // Essayer de se connecter automatiquement
  const signInResult = await supabaseService.signIn(email, password)
}
```

#### **Sauvegarde complète des données**
```typescript
await AsyncStorage.setItem('user', JSON.stringify(mappedUser))
await AsyncStorage.setItem('userType', type)
await AsyncStorage.setItem('isAuthenticated', 'true')
```

### 3. **Outils de Maintenance**

#### **Script de nettoyage automatique**
```bash
npm run fix-users
```

Ce script :
- ✅ Vérifie l'intégrité de la base de données
- ✅ Supprime les utilisateurs en double
- ✅ Corrige les rôles invalides
- ✅ Génère un rapport détaillé

#### **Utilitaires de maintenance intégrés**
- `cleanupUsers()` : Nettoie les doublons
- `checkDatabaseIntegrity()` : Vérifie l'intégrité
- `performMaintenance()` : Maintenance complète

---

## 🚀 Instructions de Résolution

### **Étape 1 : Nettoyer la base de données**

```bash
# Exécuter le script de nettoyage
npm run fix-users
```

### **Étape 2 : Vérifier la configuration**

Assurez-vous que votre fichier `.env` contient :
```bash
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### **Étape 3 : Tester l'inscription**

1. **Redémarrer l'application** :
   ```bash
   npx expo start --clear
   ```

2. **Tester l'inscription** avec un nouvel email

3. **Vérifier les logs** pour s'assurer qu'il n'y a plus d'erreurs

### **Étape 4 : Si le problème persiste**

#### **Option A : Nettoyage manuel**
```sql
-- Dans le dashboard Supabase SQL Editor
-- Supprimer les utilisateurs en double
DELETE FROM users 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
    FROM users
  ) t WHERE rn > 1
);

-- Corriger les rôles invalides
UPDATE users 
SET user_role = 'entendant' 
WHERE user_role IS NULL OR user_role NOT IN ('entendant', 'sourd');
```

#### **Option B : Réinitialisation complète**
```sql
-- ATTENTION : Ceci supprime TOUS les utilisateurs
TRUNCATE TABLE users CASCADE;
```

---

## 🔍 Diagnostic des Problèmes

### **Vérifier l'état de la base de données**

```typescript
// Dans la console du navigateur
import { performMaintenance } from './src/utils/userCleanup'

// Exécuter la maintenance
const result = await performMaintenance(supabaseService)
console.log('Résultat de la maintenance:', result)
```

### **Logs à surveiller**

#### **✅ Inscription réussie**
```
✅ Compte d'authentification créé: [user-id]
✅ Profil utilisateur créé avec succès
✅ Contexte utilisateur mis à jour avec succès
```

#### **❌ Problèmes à surveiller**
```
❌ Erreur création profil: [détails]
⚠️ Aucune session active après inscription
❌ Impossible de corriger le rôle utilisateur
```

---

## 📊 Structure de la Base de Données

### **Table `users`**
```sql
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  user_role text DEFAULT 'entendant'::text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT users_user_role_check CHECK (
    user_role = ANY (ARRAY['entendant'::text, 'sourd'::text])
  )
);
```

### **Contraintes importantes**
- ✅ **Clé primaire** : `id` (UUID)
- ✅ **Contrainte unique** : `email`
- ✅ **Clé étrangère** : `id` → `auth.users(id)`
- ✅ **Contrainte de rôle** : `user_role` ∈ `['entendant', 'sourd']`

---

## 🎯 Bonnes Pratiques

### **1. Gestion des erreurs**
- Toujours utiliser `maybeSingle()` pour les requêtes optionnelles
- Gérer spécifiquement les codes d'erreur PostgreSQL
- Implémenter des fallbacks automatiques

### **2. Vérification de session**
- Vérifier la session après chaque inscription
- Implémenter une reconnexion automatique si nécessaire
- Sauvegarder l'état d'authentification localement

### **3. Maintenance préventive**
- Exécuter régulièrement le script de nettoyage
- Surveiller les logs d'erreur
- Vérifier l'intégrité de la base de données

### **4. Tests**
- Tester l'inscription avec différents emails
- Vérifier la persistance de la session
- Tester la gestion des rôles utilisateur

---

## 📞 Support

Si les problèmes persistent après avoir suivi ces étapes :

1. **Vérifiez les logs** de l'application
2. **Exécutez le script de nettoyage** : `npm run fix-users`
3. **Consultez les logs Supabase** dans le dashboard
4. **Vérifiez les permissions** RLS (Row Level Security)
5. **Testez avec un nouvel email** pour isoler le problème

---

## 🔄 Mise à Jour

Les corrections apportées incluent :

- ✅ **Gestion d'erreurs robuste** dans `SupabaseService.signUp()`
- ✅ **Vérification de session** dans `AuthContext.register()`
- ✅ **Script de nettoyage** automatique
- ✅ **Utilitaires de maintenance** intégrés
- ✅ **Fallbacks automatiques** pour les cas d'erreur

Ces améliorations garantissent une inscription plus fiable et une meilleure gestion des cas d'erreur.

