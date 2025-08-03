# 📱 Sensora - Application de Traduction et Communication

Une application mobile premium de traduction voix ↔ langue des signes avec des modules spécialisés pour la santé, l'éducation et l'insertion professionnelle.

## 🎨 Palette de Couleurs

- **Fond :** `#FFFFFF` (blanc)
- **Couleur primaire :** `#146454` (vert foncé)
- **Couleur secondaire :** `#029ED6` (bleu)

## 🏗️ Architecture du Projet

### 📁 Structure des Fichiers

```
sensora-app/
├── 📱 Interface Utilisateur
│   ├── src/screens/
│   │   ├── IntroScreen.tsx (22KB) - Écran d'introduction avec carousel
│   │   ├── AuthScreen.tsx (16KB) - Connexion/inscription
│   │   ├── UserTypeScreen.tsx (8.6KB) - Sélection du type d'utilisateur
│   │   ├── HomeScreen.tsx (18KB) - Écran d'accueil principal
│   │   └── ProfileScreen.tsx (12KB) - Gestion du profil utilisateur
│   │
│   └── src/screens/modules/
│       ├── VoiceToSignModule.tsx (20KB) - Traduction voix → signes
│       ├── SignToVoiceModule.tsx (26KB) - Traduction signes → voix
│       ├── HealthScreen.tsx (26KB) - Surveillance santé
│       ├── EducationScreen.tsx (25KB) - Contenu éducatif
│       ├── ProfessionalScreen.tsx (34KB) - Outils professionnels
│       └── TranslationScreen.tsx (33KB) - Traduction langues locales
│
├── 🧭 Navigation
│   └── src/navigation/MainTabNavigator.tsx (3.8KB) - Configuration navigation
│
├── 🔐 Authentification
│   └── src/context/AuthContext.tsx (2.3KB) - Gestion état global
│
├── ⚙️ Configuration
│   ├── App.tsx (1.8KB) - Point d'entrée principal
│   ├── package.json (1.2KB) - Dépendances et scripts
│   ├── app.json (754B) - Configuration Expo
│   ├── tsconfig.json (67B) - Configuration TypeScript
│   └── babel.config.js (155B) - Configuration Babel
│
├── 🌐 Support Web
│   └── app/page.tsx (2.3KB) - Version web
│
└── 🖼️ Assets
    └── assets/logo.png (45KB) - Logo principal
```

## 📱 Écrans Principaux

### 🎬 **IntroScreen.tsx** (22KB - 824 lignes)
**Rôle :** Écran d'introduction avec carousel animé
- **Fonctionnalités :**
  - Carousel avec 3 slides animées
  - Animations Reanimated avancées
  - Navigation vers l'authentification
  - Design premium avec palette de couleurs

### 🔐 **AuthScreen.tsx** (16KB - 485 lignes)
**Rôle :** Écran de connexion et inscription
- **Fonctionnalités :**
  - Formulaire de connexion avec validation
  - Animations d'entrée fluides
  - Gestion des erreurs
  - Navigation vers la sélection du type d'utilisateur

### 👤 **UserTypeScreen.tsx** (8.6KB - 323 lignes)
**Rôle :** Sélection du profil utilisateur
- **Fonctionnalités :**
  - Choix entre différents types d'utilisateurs
  - Animations de sélection interactives
  - Navigation vers l'écran d'accueil

### 🏠 **HomeScreen.tsx** (18KB - 644 lignes)
**Rôle :** Écran d'accueil principal
- **Fonctionnalités :**
  - Navigation vers tous les modules
  - Logo animé et header centré
  - Cards de modules interactives
  - Citation avec icône de message
  - Profil utilisateur avec avatar
  - Design premium avec palette de couleurs

### 👤 **ProfileScreen.tsx** (12KB - 449 lignes)
**Rôle :** Gestion complète du profil utilisateur
- **Fonctionnalités :**
  - Informations utilisateur détaillées
  - Statistiques personnelles
  - Menu de paramètres complet
  - Animations d'avatar et effets de glow
  - Design premium avec gradients

## 🧩 Modules Fonctionnels

### 🗣️ **VoiceToSignModule.tsx** (20KB - 705 lignes)
**Rôle :** Traduction voix → langue des signes en temps réel
- **Fonctionnalités :**
  - Enregistrement vocal avec animations de micro
  - Ondes sonores animées pendant l'enregistrement
  - Barre de progression de confiance
  - Affichage des signes traduits avec émojis
  - Statistiques de session (durée, précision, sessions)
  - Sous-titres en temps réel
  - Design premium avec avatar 3D et animations

### 🤟 **SignToVoiceModule.tsx** (26KB - 888 lignes)
**Rôle :** Traduction langue des signes → voix
- **Fonctionnalités :**
  - Mode caméra et mode manuel
  - Détection de signes avec précision
  - Conversion en texte et synthèse vocale
  - Animations d'avatar 3D avec rotation
  - Statistiques de précision détaillées
  - Conseils et astuces
  - Design premium avec palette de couleurs

### ❤️ **HealthScreen.tsx** (26KB - 901 lignes)
**Rôle :** Surveillance complète de la santé
- **Fonctionnalités :**
  - Métriques en temps réel (rythme cardiaque, stress, niveau sonore, tension artérielle, oxygène, température)
  - Cartes interactives avec animations
  - Graphiques de tendances
  - Conseils de santé personnalisés
  - Animations de cœur pulsant
  - Valeurs affichées avec 2 décimales
  - Design premium avec palette de couleurs

### 📚 **EducationScreen.tsx** (25KB - 888 lignes)
**Rôle :** Contenu éducatif et formation
- **Fonctionnalités :**
  - Profil utilisateur avec niveau et barre d'expérience
  - Catégories de cours avec filtrage
  - Liste détaillée des cours avec descriptions
  - Section achievements avec badges
  - Animations de progression
  - Design premium avec palette de couleurs

### 💼 **ProfessionalScreen.tsx** (34KB - 1181 lignes)
**Rôle :** Outils professionnels et réunions
- **Fonctionnalités :**
  - Statut de réunion en temps réel
  - Liste de participants avec indicateurs de parole
  - Transcription en temps réel avec enregistrement
  - Réunions à venir avec notifications
  - Outils professionnels spécialisés
  - Section achievements professionnels
  - Design premium avec palette de couleurs

### 🌍 **TranslationScreen.tsx** (33KB - 1152 lignes)
**Rôle :** Traduction des langues locales
- **Fonctionnalités :**
  - Grille de sélection de langues avec détails
  - Input texte et voix
  - Résultats de traduction avec lecture audio
  - Historique des traductions
  - Langues favorites
  - Section achievements
  - Design premium avec palette de couleurs

## 🧭 Navigation et État Global

### 🧭 **MainTabNavigator.tsx** (3.8KB - 120 lignes)
**Rôle :** Configuration de la navigation principale
- **Fonctionnalités :**
  - Stack Navigator pour les modules spécialisés
  - Tab Navigator pour les écrans principaux
  - Navigation directe vers les modules depuis HomeScreen
  - Configuration des routes et transitions

### 🔐 **AuthContext.tsx** (2.3KB - 95 lignes)
**Rôle :** Gestion globale de l'état d'authentification
- **Fonctionnalités :**
  - État de connexion utilisateur
  - Type d'utilisateur (étudiant, professionnel, etc.)
  - Fonctions de connexion et déconnexion
  - Provider pour l'application entière

## ⚙️ Configuration et Support

### 📱 **App.tsx** (1.8KB - 49 lignes)
**Rôle :** Point d'entrée principal de l'application
- **Fonctionnalités :**
  - Provider AuthContext
  - Navigation principale
  - Gestion des états globaux
  - Configuration initiale

### 🌐 **app/page.tsx** (2.3KB - 93 lignes)
**Rôle :** Version web de l'application
- **Fonctionnalités :**
  - Interface web responsive
  - Navigation web adaptée
  - Design optimisé pour le web

### 📦 **package.json** (1.2KB - 42 lignes)
**Rôle :** Configuration des dépendances et scripts
- **Dépendances principales :**
  - React Native et Expo
  - React Native Reanimated
  - expo-linear-gradient
  - @expo/vector-icons
  - expo-haptics
  - @react-navigation/native

### ⚙️ **app.json** (754B - 32 lignes)
**Rôle :** Configuration Expo et métadonnées
- **Contenu :**
  - Nom et version de l'app
  - Orientation et permissions
  - Configuration du splash screen

## 🎨 Technologies Utilisées

### 📱 **Framework Principal**
- **React Native** : Framework cross-platform
- **Expo** : Plateforme de développement simplifiée
- **TypeScript** : Typage statique pour la robustesse

### 🎨 **UI/UX et Animations**
- **React Native Reanimated** : Animations avancées et performantes
- **expo-linear-gradient** : Dégradés et effets visuels
- **@expo/vector-icons** : Icônes Ionicons
- **expo-haptics** : Retour haptique pour l'interaction

### 🧭 **Navigation**
- **@react-navigation/native** : Navigation principale
- **@react-navigation/stack** : Navigation par pile
- **@react-navigation/bottom-tabs** : Navigation par onglets

## 📊 Statistiques du Projet

### 📈 **Métriques**
- **Total de fichiers :** 16 fichiers de code
- **Lignes de code :** ~15,000+ lignes
- **Modules principaux :** 6 modules fonctionnels
- **Écrans :** 12 écrans principaux
- **Animations :** Animations Reanimated sur tous les écrans

### 🎯 **Fonctionnalités Principales**
- ✅ Traduction voix ↔ langue des signes en temps réel
- ✅ Surveillance santé complète avec métriques
- ✅ Contenu éducatif et formation
- ✅ Outils professionnels et réunions
- ✅ Traduction des langues locales
- ✅ Profil utilisateur complet
- ✅ Design premium avec animations avancées

## 🚀 Installation et Démarrage

```bash
# Nettoyage complet pour éviter les conflits
rm -rf node_modules
rm package-lock.json
npm cache clean --force

# Installation des dépendances
npm install

# Installation avec toutes les dépendances (deps)
npm install --save-dev

# Installation en évitant les conflits de dépendances peer
npm install --legacy-peer-deps

# Démarrage en mode développement
npm start

# Démarrage avec tunnel pour test mobile
npx expo start --tunnel

# Démarrage en mode local
npx expo start --localhost
```

## 📱 Compatibilité

- **iOS :** 12.0+
- **Android :** 6.0+
- **Web :** Navigateurs modernes
- **Expo Go :** Compatible

---

**Sensora** - Donnez une voix au silence 🚀✨ 
