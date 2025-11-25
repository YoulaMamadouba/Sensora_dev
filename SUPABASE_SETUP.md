# 🚀 Guide d'installation Supabase pour Sensora

## 📋 Prérequis

Vous avez déjà créé votre projet Supabase avec les tables `users` et `audio_files`. Voici les étapes pour finaliser l'intégration.

## 🔧 Configuration étape par étape

### 1. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet en copiant `.env.example` :

```bash
cp .env.example .env
```

Puis modifiez le fichier `.env` avec vos vraies valeurs :

```env
# Configuration des clés API pour Sensora

# OpenAI API Key pour Whisper (reconnaissance vocale)
EXPO_PUBLIC_OPENAI_API_KEY=sk-votre-vraie-cle-openai-ici

# Supabase Configuration (Backend)
EXPO_PUBLIC_SUPABASE_URL=https://zjeqdelguqnqckqmrbvi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZXFkZWxndXFucWNrcW1yYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTA0MTUsImV4cCI6MjA2OTMyNjQxNX0.UZEBIiGa4cobDfvP4Rv7MCkf_dpVcEseg9GZ4bU5N5s
```

### 2. **Configurer Supabase Storage et les politiques de sécurité**

Dans votre dashboard Supabase :

1. Allez dans **Storage** → **Create a new bucket**
2. Nom du bucket : `audio-recordings`
3. Cochez **Public bucket** pour permettre l'accès aux fichiers

Ou exécutez le script SQL fourni dans `supabase-setup.sql` dans l'éditeur SQL de Supabase.

### 3. **Vérifier les tables existantes**

Vos tables sont déjà créées, mais assurez-vous qu'elles ont les bonnes structures :

```sql
-- Table users
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Table audio_files
CREATE TABLE public.audio_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT audio_files_pkey PRIMARY KEY (id),
  CONSTRAINT audio_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## 🎯 Fonctionnalités intégrées

### ✅ **Ce qui fonctionne maintenant :**

1. **Enregistrement audio réel** avec permissions microphone
2. **Reconnaissance vocale OpenAI Whisper** (nécessite clé API)
3. **Conversion texte → gestes** avec dictionnaire d'emojis
4. **Sauvegarde automatique** des fichiers audio dans Supabase
5. **Authentification utilisateur** avec Supabase Auth
6. **Interface utilisateur** avec indicateurs de statut

### 🔄 **Flux complet :**

```
🎤 Enregistrement → 🤖 Whisper API → 📝 Transcription → 🤟 Gestes → ☁️ Sauvegarde Supabase
```

## 🧪 Test de l'intégration

### 1. **Démarrer l'application**

```bash
npm start
# ou
npx expo start
```

### 2. **Tester le module VoiceToSign**

1. Naviguez vers le module "Voix vers Signes"
2. Appuyez sur le bouton d'enregistrement
3. Parlez en français
4. Vérifiez que :
   - Le texte est transcrit correctement
   - Les gestes s'affichent
   - L'indicateur "Sauvegardé dans le cloud" apparaît

### 3. **Vérifier dans Supabase**

Dans votre dashboard Supabase :
- **Storage** → `audio-recordings` : vos fichiers audio
- **Table Editor** → `audio_files` : métadonnées des fichiers
- **Table Editor** → `users` : profils utilisateurs

## 🔧 Dépannage

### **Problème : "API non configurée"**
- Vérifiez que votre clé OpenAI est correcte dans `.env`
- Redémarrez l'application après modification du `.env`

### **Problème : "Supabase non disponible"**
- Vérifiez l'URL et la clé anonyme Supabase
- Assurez-vous que le bucket `audio-recordings` existe

### **Problème : "Permission microphone refusée"**
- Autorisez l'accès au microphone dans les paramètres de l'appareil
- Sur iOS : Paramètres → Expo Go → Microphone

## 📱 Utilisation

### **Pour les utilisateurs :**
1. **S'inscrire/Se connecter** (optionnel pour la sauvegarde)
2. **Enregistrer sa voix** en français
3. **Voir la transcription** et les gestes correspondants
4. **Fichiers sauvegardés automatiquement** si connecté

### **Mode hors ligne :**
- Fonctionne sans connexion Supabase (pas de sauvegarde)
- Nécessite toujours la clé OpenAI pour la reconnaissance vocale

## 🔐 Sécurité

- ✅ Clés API dans variables d'environnement
- ✅ Politiques RLS (Row Level Security) activées
- ✅ Utilisateurs ne peuvent voir que leurs propres fichiers
- ✅ Authentification requise pour la sauvegarde

## 🚀 Prochaines étapes

1. **Tester avec de vrais utilisateurs**
2. **Ajouter plus de mots au dictionnaire de signes**
3. **Implémenter la gestion des fichiers sauvegardés**
4. **Ajouter des statistiques d'utilisation**

---

**🎉 Félicitations ! Votre application Sensora est maintenant équipée d'un backend Supabase complet avec sauvegarde automatique des enregistrements vocaux !**
