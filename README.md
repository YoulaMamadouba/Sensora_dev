# Sensora App

Application mobile pour la traduction en langue des signes avec intégration OpenAI et Supabase.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Implémentées

- **Authentification complète** avec Supabase
- **Enregistrement audio** avec expo-av
- **Transcription en temps réel** avec OpenAI Whisper
- **Traduction en langue des signes** avec IA
- **Upload automatique** vers Supabase Storage
- **Gestion des fichiers audio** dans la base de données
- **Interface utilisateur moderne** avec animations
- **Gestion des rôles utilisateur** (sourd/entendant)
- **Tests et diagnostics** automatisés

### 🔧 Corrections Récentes

#### Problème de Rôle Utilisateur
- ✅ **Correction automatique** du rôle utilisateur lors de l'inscription
- ✅ **Diagnostic intelligent** des problèmes de rôle
- ✅ **Force mise à jour** du rôle si nécessaire
- ✅ **Vérification post-inscription** du rôle enregistré

#### Améliorations Techniques
- ✅ **Gestion d'erreurs robuste** pour l'upload audio
- ✅ **Logging détaillé** pour le debugging
- ✅ **Tests automatisés** de la structure de base de données
- ✅ **Correction automatique** des rôles utilisateur incorrects

## 🏗️ Architecture

### Backend (Supabase)
- **Authentification** : Supabase Auth
- **Base de données** : PostgreSQL avec RLS
- **Stockage** : Supabase Storage (bucket `audio-recordings`)
- **Tables principales** :
  - `users` : Profils utilisateurs avec rôle (sourd/entendant)
  - `audio_files` : Métadonnées des fichiers audio

### Frontend (React Native + Expo)
- **Navigation** : React Navigation v6
- **Animations** : React Native Reanimated
- **Formulaires** : React Hook Form
- **Audio** : expo-av
- **Stockage** : AsyncStorage

### Services Externes
- **OpenAI** : Transcription (Whisper) et traduction (GPT-3.5)
- **Supabase** : Backend-as-a-Service

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# OpenAI
EXPO_PUBLIC_OPENAI_API_KEY=votre_cle_api_openai
```

### Configuration Supabase

Exécutez le script SQL dans votre dashboard Supabase :

```sql
-- Voir le fichier supabase-setup.sql pour la configuration complète
```

## 🧪 Tests et Diagnostics

### Tests Automatisés

```typescript
import TestUtils from './src/utils/testUtils'

const testUtils = new TestUtils()

// Exécuter tous les tests
const results = await testUtils.runAllTests()
console.log(testUtils.generateTestReport(results))
```

### Diagnostic des Problèmes

```typescript
// Diagnostiquer un problème de rôle utilisateur
const diagnosis = await supabaseService.diagnoseUserRole(userId)

// Corriger automatiquement tous les rôles
const fixResult = await supabaseService.fixAllUserRoles()
```

## 🐛 Résolution des Problèmes

### Problème : Rôle Utilisateur Incorrect

**Symptôme** : L'utilisateur sélectionne "sourd" mais apparaît comme "entendant" dans la base de données.

**Solutions** :

1. **Correction automatique** (recommandée) :
   ```typescript
   // La correction est automatique lors de l'inscription
   // Vérifiez les logs pour voir les détails
   ```

2. **Correction manuelle** :
   ```typescript
   // Utiliser la méthode de force mise à jour
   await supabaseService.forceUpdateUserRole(userId, 'sourd')
   ```

3. **Correction en masse** :
   ```typescript
   // Corriger tous les utilisateurs
   const result = await supabaseService.fixAllUserRoles()
   ```

### Problème : Upload Audio Échoue

**Solutions** :
- Vérifiez les permissions microphone
- Vérifiez la configuration Supabase Storage
- Consultez les logs pour les erreurs détaillées

### Problème : Transcription OpenAI Échoue

**Solutions** :
- Vérifiez la clé API OpenAI
- Vérifiez les quotas OpenAI
- L'application utilise un fallback automatique

## 📁 Structure du Projet

```
sensora-app/
├── src/
│   ├── config/           # Configuration (Supabase, OpenAI)
│   ├── context/          # Contextes React (Auth, Supabase)
│   ├── navigation/       # Navigation
│   ├── screens/          # Écrans de l'application
│   │   └── modules/      # Modules fonctionnels
│   ├── services/         # Services (Supabase, OpenAI)
│   └── utils/            # Utilitaires et tests
├── assets/               # Ressources statiques
└── docs/                 # Documentation
```

## 🚀 Démarrage Rapide

1. **Cloner le projet** :
   ```bash
   git clone <repository-url>
   cd sensora-app
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer l'environnement** :
   ```bash
   cp .env.example .env
   # Éditer .env avec vos clés
   ```

4. **Lancer l'application** :
   ```bash
   npx expo start
   ```

## 📊 Monitoring et Logs

L'application inclut un système de logging détaillé :

- **Logs de développement** : Console et React Native Debugger
- **Logs de production** : Supabase Logs
- **Métriques** : Dashboard Supabase

## 🔄 Mise à Jour

Pour mettre à jour l'application :

1. **Puller les changements** :
   ```bash
   git pull origin main
   ```

2. **Mettre à jour les dépendances** :
   ```bash
   npm install
   ```

3. **Tester les changements** :
   ```bash
   npx expo start --clear
   ```

## 📞 Support

Pour toute question ou problème :

1. **Vérifiez les logs** de l'application
2. **Consultez la documentation** Supabase et OpenAI
3. **Utilisez les outils de diagnostic** intégrés
4. **Créez une issue** sur le repository

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 
