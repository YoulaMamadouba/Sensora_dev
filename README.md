# Sensora App

Application mobile pour la traduction en temps réel entre la voix et la langue des signes.

## 🎯 Fonctionnalités

### ✅ Implémentées

- **Authentification complète** avec Supabase
  - Inscription avec sélection du type d'utilisateur (sourd/entendant)
  - Connexion sécurisée
  - Gestion des profils utilisateurs
  - Correction automatique des types d'utilisateur

- **Module Voice-to-Sign** 
  - Enregistrement audio en temps réel avec expo-av
  - Upload automatique vers Supabase Storage (bucket `audio-recordings`)
  - **Transcription réelle avec OpenAI Whisper**
  - **Traduction en langue des signes avec GPT-3.5**
  - Génération d'emojis de signes intelligente
  - Interface utilisateur moderne avec animations

- **Architecture backend**
  - Base de données Supabase avec tables `users` et `audio_files`
  - Stockage sécurisé des fichiers audio
  - Politiques de sécurité RLS configurées
  - **API OpenAI intégrée pour la transcription et traduction**

- **Tests et validation**
  - Utilitaires de test pour valider les configurations
  - Tests de connexion Supabase et OpenAI
  - Validation des variables d'environnement

### 🔄 En cours

- Synchronisation en temps réel
- Tests unitaires complets
- Optimisation des performances

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

### Services

- **SupabaseService** : Gestion de l'authentification et du stockage
- **OpenAIService** : Transcription audio et traduction LSF
- **TestUtils** : Validation et tests des fonctionnalités

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

3. **Configuration des variables d'environnement**
   
   Créer un fichier `.env` à la racine :
   ```env
   # Supabase
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Configuration Supabase**
   - Créer un projet Supabase
   - Exécuter le script `supabase-setup.sql`
   - Configurer les politiques de sécurité

5. **Lancer l'application**
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
   - **Transcription réelle avec OpenAI Whisper**
   - **Traduction en langue des signes avec GPT-3.5**
   - Emojis de signes générés intelligemment
   - Interface animée et moderne

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### Permissions

L'application nécessite les permissions suivantes :
- Microphone (pour l'enregistrement audio)
- Stockage (pour sauvegarder les fichiers)

## 🐛 Corrections apportées

### ✅ Problème résolu : Type d'utilisateur incorrect

**Problème** : Le type d'utilisateur sélectionné (sourd) était enregistré comme "entendant" dans la base de données.

**Solution** : 
1. Correction du mapping dans `src/context/AuthContext.tsx`
2. Amélioration de la méthode `signUp` dans `SupabaseService`
3. Ajout d'une méthode `checkAndFixUserRole` pour corriger les types existants

```typescript
// Mapping correct
userType: userProfile.user_role === 'sourd' ? 'deaf' : 'hearing'
const userRole: 'entendant' | 'sourd' = type === 'deaf' ? 'sourd' : 'entendant'
```

### ✅ Problème résolu : Table audio_files non remplie

**Problème** : Les enregistrements audio n'étaient pas correctement enregistrés dans la table `audio_files`.

**Solution** :
1. Amélioration de la méthode `uploadAudioFile` dans `SupabaseService`
2. Ajout de logs détaillés pour le debugging
3. Gestion des erreurs et rollback en cas d'échec

## 🎤 Fonctionnalités OpenAI

### Transcription audio
- Utilisation d'OpenAI Whisper pour la transcription
- Support du français
- Gestion des erreurs et fallback

### Traduction LSF
- Traduction en langue des signes française avec GPT-3.5
- Descriptions détaillées des signes
- Génération d'emojis intelligente

### Gestion des erreurs
- Fallback vers la transcription simulée si OpenAI n'est pas disponible
- Messages d'erreur conviviaux
- Logs détaillés pour le debugging

## 📊 Statut du projet

- ✅ Authentification Supabase
- ✅ Enregistrement audio
- ✅ Upload vers Supabase Storage
- ✅ **Transcription réelle avec OpenAI**
- ✅ **Traduction en langue des signes**
- ✅ Interface utilisateur moderne
- ✅ Gestion des types d'utilisateur
- ✅ Tests et validation
- 🔄 Synchronisation en temps réel
- 🔄 Tests unitaires complets

## 🧪 Tests

### Exécuter les tests
```typescript
import TestUtils from './src/utils/testUtils'

const testUtils = new TestUtils()
const results = await testUtils.runAllTests()
const report = testUtils.generateTestReport(results)
console.log(report)
```

### Tests disponibles
- Configuration des variables d'environnement
- Connexion Supabase
- Connexion OpenAI
- Validation des fonctionnalités

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 
