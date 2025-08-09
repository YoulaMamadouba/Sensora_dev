# Sensora App

Application mobile pour la traduction en temps réel entre la voix et la langue des signes.

## 🎯 Fonctionnalités

### ✅ Implémentées

- **Authentification complète** avec Supabase
  - Inscription avec sélection du type d'utilisateur (sourd/entendant)
  - Connexion sécurisée
  - Gestion des profils utilisateurs

- **Module Voice-to-Sign** 
  - Enregistrement audio en temps réel avec expo-av
  - Upload automatique vers Supabase Storage (bucket `audio-recordings`)
  - Transcription simulée avec génération d'emojis de signes
  - Interface utilisateur moderne avec animations

- **Architecture backend**
  - Base de données Supabase avec tables `users` et `audio_files`
  - Stockage sécurisé des fichiers audio
  - Politiques de sécurité RLS configurées

### 🔄 En cours

- Intégration d'une vraie API de transcription (OpenAI, Google Speech-to-Text)
- Traduction en langue des signes avec IA
- Synchronisation en temps réel

## 🏗️ Architecture

### Base de données

```sql
-- Table users
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  user_role text CHECK (user_role IN ('entendant', 'sourd')) DEFAULT 'entendant',
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table audio_files
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

### Stockage

- Bucket Supabase : `audio-recordings`
- Structure : `{user_id}/{timestamp}_{filename}.m4a`
- Politiques de sécurité configurées

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd sensora-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**
   - Créer un projet Supabase
   - Exécuter le script `supabase-setup.sql`
   - Configurer les variables d'environnement :
     ```env
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Lancer l'application**
```bash
npx expo start
```

## 📱 Utilisation

1. **Inscription/Connexion**
   - Choisir le type d'utilisateur (sourd/entendant)
   - Créer un compte ou se connecter

2. **Enregistrement audio**
   - Aller dans le module "Voix → Langue des Signes"
   - Appuyer sur le bouton micro pour commencer l'enregistrement
   - Parler clairement
   - Appuyer à nouveau pour arrêter

3. **Résultats**
   - Le fichier audio est automatiquement uploadé vers Supabase
   - La transcription apparaît avec des emojis de signes
   - Interface animée et moderne

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Permissions

L'application nécessite les permissions suivantes :
- Microphone (pour l'enregistrement audio)
- Stockage (pour sauvegarder les fichiers)

## 🐛 Correction des bugs

### Problème résolu : Type d'utilisateur incorrect

**Problème** : Le type d'utilisateur sélectionné (sourd) était enregistré comme "entendant" dans la base de données.

**Solution** : Correction du mapping dans `src/context/AuthContext.tsx` :
```typescript
// Avant (incorrect)
userType: userProfile.user_role === 'entendant' ? 'hearing' : 'deaf'
const userRole: 'entendant' | 'sourd' = type === 'hearing' ? 'entendant' : 'sourd'

// Après (correct)
userType: userProfile.user_role === 'sourd' ? 'deaf' : 'hearing'
const userRole: 'entendant' | 'sourd' = type === 'deaf' ? 'sourd' : 'entendant'
```

## 📊 Statut du projet

- ✅ Authentification Supabase
- ✅ Enregistrement audio
- ✅ Upload vers Supabase Storage
- ✅ Interface utilisateur moderne
- ✅ Gestion des types d'utilisateur
- 🔄 Transcription réelle (simulation actuelle)
- 🔄 Traduction en langue des signes
- 🔄 API de transcription intégrée

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 
