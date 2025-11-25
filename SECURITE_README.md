# 🔐 Système de Sécurité - Sensora App

## 📋 Vue d'ensemble

L'application Sensora utilise un système de sécurité multicouche basé sur **Supabase** pour l'authentification, l'autorisation et la protection des données utilisateur.

## 🏗️ Architecture de Sécurité

### **1. Authentification (Supabase Auth)**
- **Gestion des sessions** : JWT tokens avec expiration automatique
- **Inscription/Connexion** : Email + mot de passe sécurisé
- **Validation des rôles** : `entendant` ou `sourd`
- **Gestion des erreurs** : Fallback automatique et correction des rôles

### **2. Autorisation (Row Level Security - RLS)**
- **Isolation des données** : Chaque utilisateur ne voit que ses propres données
- **Politiques granulaires** : Contrôle d'accès au niveau des lignes
- **Protection des fichiers** : Accès restreint aux fichiers audio personnels

### **3. Stockage Sécurisé (Supabase Storage)**
- **Bucket privé** : `audio-recordings` avec politiques d'accès
- **Structure organisée** : Fichiers organisés par utilisateur (`user_id/timestamp_filename`)
- **Contrôle d'accès** : Upload, lecture et suppression limités au propriétaire

## 🔧 Configuration de Sécurité

### **Variables d'Environnement**
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# OpenAI API (pour la transcription)
EXPO_PUBLIC_OPENAI_API_KEY=sk-votre-cle-openai
```

### **Structure de la Base de Données**
```sql
-- Table users avec contraintes de sécurité
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  user_role text CHECK (user_role IN ('entendant', 'sourd')) DEFAULT 'entendant',
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table audio_files avec isolation par utilisateur
CREATE TABLE public.audio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

## 🛡️ Politiques de Sécurité (RLS)

### **Table `users`**
```sql
-- Les utilisateurs ne peuvent voir que leur propre profil
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Les utilisateurs ne peuvent modifier que leur propre profil
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);
```

### **Table `audio_files`**
```sql
-- Lecture : Seulement ses propres fichiers
CREATE POLICY "Users can view own audio files" ON public.audio_files
FOR SELECT USING (auth.uid() = user_id);

-- Insertion : Seulement pour ses propres fichiers
CREATE POLICY "Users can insert own audio files" ON public.audio_files
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Suppression : Seulement ses propres fichiers
CREATE POLICY "Users can delete own audio files" ON public.audio_files
FOR DELETE USING (auth.uid() = user_id);
```

### **Storage `audio-recordings`**
```sql
-- Upload : Seulement dans son propre dossier
CREATE POLICY "Users can upload their own audio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Lecture : Seulement ses propres fichiers
CREATE POLICY "Users can view their own audio files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Suppression : Seulement ses propres fichiers
CREATE POLICY "Users can delete their own audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔐 Gestion des Sessions

### **Contexte d'Authentification**
```typescript
// AuthContext.tsx - Gestion centralisée de l'état d'authentification
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, userType: "hearing" | "deaf") => Promise<boolean>
  register: (email: string, password: string, name: string, userType: "hearing" | "deaf") => Promise<boolean>
  logout: () => void
  userType: "hearing" | "deaf" | null
}
```

### **Service Supabase**
```typescript
// SupabaseService.ts - Interface sécurisée avec Supabase
class SupabaseService {
  // Inscription avec validation des rôles
  async signUp(email: string, password: string, fullName: string, userRole: 'entendant' | 'sourd')
  
  // Connexion avec gestion d'erreurs
  async signIn(email: string, password: string)
  
  // Upload sécurisé des fichiers audio
  async uploadAudioFile(fileUri: string, fileName: string, mimeType: string)
  
  // Récupération des fichiers de l'utilisateur
  async getUserAudioFiles(userId?: string)
}
```

## 🚨 Mesures de Sécurité Implémentées

### **1. Protection des Données**
- ✅ **Chiffrement en transit** : HTTPS/TLS pour toutes les communications
- ✅ **Isolation des données** : RLS empêche l'accès croisé entre utilisateurs
- ✅ **Validation des entrées** : Contraintes de base de données et validation côté client
- ✅ **Gestion des erreurs** : Messages d'erreur sécurisés sans exposition d'informations sensibles

### **2. Authentification Robuste**
- ✅ **Validation des rôles** : Vérification automatique et correction des rôles utilisateur
- ✅ **Gestion des sessions** : Tokens JWT avec expiration automatique
- ✅ **Fallback sécurisé** : Mode hors ligne sans compromettre la sécurité
- ✅ **Diagnostic automatique** : Détection et correction des problèmes de rôles

### **3. Protection des Fichiers**
- ✅ **Structure organisée** : Fichiers organisés par utilisateur (`user_id/timestamp_filename`)
- ✅ **Contrôle d'accès** : Politiques RLS sur le storage
- ✅ **Validation des types** : Vérification des types MIME et tailles de fichiers
- ✅ **Nettoyage automatique** : Suppression des fichiers orphelins

### **4. Gestion des Erreurs**
- ✅ **Logging sécurisé** : Logs détaillés sans exposition de données sensibles
- ✅ **Récupération automatique** : Correction automatique des problèmes de rôles
- ✅ **Messages utilisateur** : Messages d'erreur conviviaux et sécurisés
- ✅ **Tests automatisés** : Scripts de test et de maintenance

## 🔧 Scripts de Maintenance

### **Test de la Structure de Base de Données**
```bash
npm run test-db-structure
```

### **Correction des Rôles Utilisateur**
```bash
npm run fix-users
```

### **Test d'Inscription**
```bash
npm run test-registration
```

## 📊 Monitoring et Logs

### **Logs de Sécurité**
- 🔐 **Authentification** : Suivi des connexions/déconnexions
- 📝 **Inscription** : Validation des rôles et création de profils
- 📤 **Upload** : Suivi des fichiers uploadés avec métadonnées
- 🔍 **Diagnostic** : Détection automatique des problèmes de rôles

### **Indicateurs de Sécurité**
- ✅ **Session active** : Vérification de la validité des tokens
- ✅ **Rôle correct** : Validation des rôles utilisateur
- ✅ **Accès autorisé** : Vérification des permissions RLS
- ✅ **Fichiers sécurisés** : Contrôle d'accès aux fichiers audio

## 🚀 Bonnes Pratiques

### **1. Développement**
- Toujours utiliser les politiques RLS pour les nouvelles tables
- Valider les entrées utilisateur côté client et serveur
- Implémenter des tests de sécurité automatisés
- Documenter les changements de sécurité

### **2. Déploiement**
- Vérifier la configuration des variables d'environnement
- Tester les politiques RLS en production
- Monitorer les logs de sécurité
- Maintenir les dépendances à jour

### **3. Maintenance**
- Exécuter régulièrement les scripts de maintenance
- Surveiller les tentatives d'accès non autorisées
- Vérifier l'intégrité des données
- Nettoyer les fichiers orphelins

## 🔍 Audit de Sécurité

### **Points de Contrôle**
1. **Authentification** : Vérification des tokens et sessions
2. **Autorisation** : Test des politiques RLS
3. **Données** : Validation de l'isolation des données
4. **Fichiers** : Contrôle d'accès au storage
5. **Logs** : Analyse des événements de sécurité

### **Tests de Sécurité**
```bash
# Test complet du système de sécurité
npm run security-test

# Vérification des politiques RLS
npm run test-rls-policies

# Audit des permissions
npm run audit-permissions
```

## 📞 Support Sécurité

En cas de problème de sécurité :

1. **Vérifiez les logs** de l'application et Supabase
2. **Exécutez les scripts de diagnostic** : `npm run fix-users`
3. **Consultez les politiques RLS** dans le dashboard Supabase
4. **Testez avec un nouvel utilisateur** pour isoler le problème
5. **Contactez l'équipe de développement** avec les logs détaillés

---

**🔐 Le système de sécurité de Sensora est conçu pour protéger les données utilisateur tout en offrant une expérience fluide et sécurisée.**

