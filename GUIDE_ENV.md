# Guide d'Intégration des Variables d'Environnement - Projet Expo

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Configuration de Base](#configuration-de-base)
3. [Structure des Fichiers](#structure-des-fichiers)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Configuration TypeScript](#configuration-typescript)
6. [Utilisation dans le Code](#utilisation-dans-le-code)
7. [Déploiement](#déploiement)
8. [Bonnes Pratiques](#bonnes-pratiques)
9. [Dépannage](#dépannage)

## 🎯 Introduction

Ce guide explique comment intégrer et gérer les variables d'environnement dans un projet Expo de manière sécurisée et maintenable. Cette approche peut être réutilisée dans d'autres projets Expo.

## ⚙️ Configuration de Base

### 1. Installation des Dépendances

```bash
# Dépendances déjà incluses dans le projet
npm install expo
npm install @types/node  # Pour le support TypeScript
```

### 2. Structure des Fichiers

```
projet-expo/
├── .env                    # Variables d'environnement (local)
├── .env.example           # Template des variables
├── .gitignore            # Exclure .env du versioning
├── src/
│   └── config/
│       └── envConfig.ts   # Configuration centralisée
└── app.json              # Configuration Expo
```

## 🔧 Variables d'Environnement

### 1. Fichier .env (Créer à la racine)

```bash
# ===========================================
# CONFIGURATION SUPABASE
# ===========================================
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# ===========================================
# CONFIGURATION OPENAI
# ===========================================
EXPO_PUBLIC_OPENAI_API_KEY=sk-votre_cle_openai

# ===========================================
# CONFIGURATION APPLICATION
# ===========================================
NODE_ENV=development
EXPO_PUBLIC_APP_NAME=Sensora
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 2. Fichier .env.example (Template)

```bash
# ===========================================
# CONFIGURATION SUPABASE
# ===========================================
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# ===========================================
# CONFIGURATION OPENAI
# ===========================================
EXPO_PUBLIC_OPENAI_API_KEY=sk-votre_cle_openai

# ===========================================
# CONFIGURATION APPLICATION
# ===========================================
NODE_ENV=development
EXPO_PUBLIC_APP_NAME=MonApp
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 3. Mise à jour du .gitignore

```gitignore
# Variables d'environnement
.env
.env.local
.env.production
.env.staging

# Logs
*.log
npm-debug.log*

# Dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
```

## 📝 Configuration TypeScript

### Fichier envConfig.ts (Configuration Centralisée)

```typescript
/**
 * Configuration des variables d'environnement
 */

export const ENV_CONFIG = {
  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // OpenAI
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  
  // Configuration de l'application
  APP_ENV: process.env.NODE_ENV || 'development',
  DEBUG_MODE: process.env.NODE_ENV === 'development',
}

/**
 * Vérifier si toutes les variables d'environnement requises sont configurées
 */
export const validateEnvConfig = () => {
  const missingVars: string[] = []
  
  if (!ENV_CONFIG.SUPABASE_URL) missingVars.push('EXPO_PUBLIC_SUPABASE_URL')
  if (!ENV_CONFIG.SUPABASE_ANON_KEY) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY')
  if (!ENV_CONFIG.OPENAI_API_KEY) missingVars.push('EXPO_PUBLIC_OPENAI_API_KEY')
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Variables d\'environnement manquantes:', missingVars.join(', '))
    return false
  }
  
  return true
}

/**
 * Obtenir la configuration pour un service spécifique
 */
export const getServiceConfig = (service: 'supabase' | 'openai') => {
  switch (service) {
    case 'supabase':
      return {
        url: ENV_CONFIG.SUPABASE_URL,
        anonKey: ENV_CONFIG.SUPABASE_ANON_KEY,
      }
    case 'openai':
      return {
        apiKey: ENV_CONFIG.OPENAI_API_KEY,
      }
    default:
      throw new Error(`Service non reconnu: ${service}`)
  }
}

export default ENV_CONFIG
```

## 💡 Utilisation dans le Code

### 1. Dans un Service

```typescript
// src/services/OpenAIService.ts
import { ENV_CONFIG, getServiceConfig } from '../config/envConfig'

class OpenAIService {
  private apiKey: string
  
  constructor() {
    const config = getServiceConfig('openai')
    this.apiKey = config.apiKey
    
    if (!this.apiKey) {
      throw new Error('Clé API OpenAI manquante')
    }
  }
  
  async generateText(prompt: string): Promise<string> {
    // Utilisation de l'API OpenAI
  }
}
```

### 2. Dans un Composant

```typescript
// src/components/MyComponent.tsx
import React from 'react'
import { View, Text } from 'react-native'
import { ENV_CONFIG } from '../config/envConfig'

const MyComponent: React.FC = () => {
  return (
    <View>
      <Text>Mode: {ENV_CONFIG.APP_ENV}</Text>
      <Text>Debug: {ENV_CONFIG.DEBUG_MODE ? 'Oui' : 'Non'}</Text>
    </View>
  )
}
```

### 3. Validation au Démarrage

```typescript
// Dans App.tsx ou le point d'entrée principal
import { validateEnvConfig } from './src/config/envConfig'

// Valider la configuration au démarrage
const isValid = validateEnvConfig()

if (!isValid) {
  console.error('❌ Configuration invalide')
  // Afficher une erreur à l'utilisateur ou arrêter l'application
}
```

## 🚀 Déploiement

### 1. Configuration par Environnement

#### .env.development
```bash
NODE_ENV=development
EXPO_PUBLIC_APP_NAME=Sensora Dev
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
```

#### .env.production
```bash
NODE_ENV=production
EXPO_PUBLIC_APP_NAME=Sensora
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
```

### 2. Scripts de Déploiement

```json
// package.json
{
  "scripts": {
    "start": "expo start",
    "start:dev": "NODE_ENV=development expo start",
    "start:prod": "NODE_ENV=production expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

## 📚 Bonnes Pratiques

### 1. Convention de Nommage

```typescript
// ✅ Bonnes pratiques
EXPO_PUBLIC_SUPABASE_URL          // Variables publiques (préfixe EXPO_PUBLIC_)
EXPO_PUBLIC_OPENAI_API_KEY        // Variables publiques
NODE_ENV                          // Variables système

// ❌ À éviter
SUPABASE_URL                      // Manque le préfixe EXPO_PUBLIC_
expo_public_api_key              // Mauvaise casse
```

### 2. Sécurité

- **Ne jamais commiter** le fichier `.env`
- **Utiliser des clés différentes** pour chaque environnement
- **Valider les variables** au démarrage de l'application
- **Masquer les clés sensibles** dans les logs

### 3. Documentation

- **Créer un `.env.example`** avec des valeurs d'exemple
- **Documenter chaque variable** dans le code
- **Maintenir la cohérence** entre les environnements

## 🔧 Dépannage

### 1. Problèmes Courants

#### Variable non chargée
```bash
# Vérifier que le fichier .env existe
ls -la .env

# Vérifier le contenu
cat .env

# Redémarrer Expo
npx expo start --clear
```

#### Variable non accessible
```typescript
// Vérifier le préfixe EXPO_PUBLIC_
console.log(process.env.EXPO_PUBLIC_SUPABASE_URL) // ✅ Accessible
console.log(process.env.SUPABASE_URL)             // ❌ Non accessible
```

#### Problème de cache
```bash
# Nettoyer le cache
npx expo start --clear
rm -rf node_modules
npm install
```

### 2. Debug des Variables

```typescript
// Debug simple
console.log('Variables d\'environnement:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
```

## 📋 Checklist d'Intégration

### ✅ Configuration de Base
- [ ] Créer le fichier `.env` à la racine
- [ ] Créer le fichier `.env.example`
- [ ] Mettre à jour `.gitignore`
- [ ] Installer les dépendances nécessaires

### ✅ Configuration TypeScript
- [ ] Créer `src/config/envConfig.ts`
- [ ] Ajouter les types TypeScript
- [ ] Implémenter la validation

### ✅ Sécurité
- [ ] Valider les variables au démarrage
- [ ] Gérer les erreurs de configuration
- [ ] Ne pas commiter le fichier `.env`

### ✅ Documentation
- [ ] Documenter toutes les variables
- [ ] Créer des exemples d'utilisation
- [ ] Ajouter des commentaires dans le code

## 🎯 Conclusion

Cette approche fournit une base solide pour la gestion des variables d'environnement dans les projets Expo. Elle est :

- **Sécurisée** : Protection des données sensibles
- **Maintenable** : Configuration centralisée
- **Flexible** : Support multi-environnements
- **Robuste** : Validation et gestion d'erreurs
- **Documentée** : Exemples et bonnes pratiques

Cette structure peut être facilement adaptée et réutilisée dans d'autres projets Expo.


