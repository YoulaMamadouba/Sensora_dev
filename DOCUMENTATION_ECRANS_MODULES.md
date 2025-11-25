# Documentation des Écrans - Modules Sensora

## Vue d'ensemble
Cette documentation présente les fonctionnalités de tous les écrans du dossier `modules` de l'application Sensora, conçue pour faciliter la communication avec la communauté sourde et malentendante.

---

## 1. EducationScreen.tsx - Module Éducation

### 🎯 Objectif
Plateforme d'apprentissage complète de la langue des signes française (LSF) avec système de progression et gamification.

### 📚 Fonctionnalités principales

#### **Profil utilisateur avec progression**
- Affichage du niveau d'utilisateur (système de niveaux)
- Barre d'expérience (XP) avec progression vers le niveau suivant
- Compteur de jours consécutifs d'apprentissage (streak)
- Interface visuelle attractive avec animations

#### **Système de catégories de cours**
- **Tout** : Vue d'ensemble de tous les cours disponibles
- **Débutant** : Cours adaptés aux nouveaux apprenants
- **Intermédiaire** : Niveau intermédiaire d'apprentissage
- **Avancé** : Cours pour utilisateurs expérimentés

#### **Catalogue de cours LSF**
- **Alphabet LSF** : Apprentissage de l'alphabet en langue des signes (85% de progression)
- **Conversation** : Dialogues de base et expressions courantes (60% de progression)
- **Vocabulaire** : Mots essentiels et expressions quotidiennes (45% de progression)
- **Grammaire** : Structure des phrases et règles grammaticales (25% de progression)
- **Culture Sourde** : Histoire et culture de la communauté sourde (90% de progression)
- **Langage Professionnel** : Vocabulaire pour le monde du travail (30% de progression)

#### **Informations détaillées par cours**
- Durée estimée d'apprentissage
- Nombre de leçons disponibles
- Niveau de difficulté
- Pourcentage de progression
- Description détaillée

#### **Système de récompenses (Achievements)**
- **Premier Pas** : Récompense pour la première leçon complétée
- **Déterminé** : 7 jours consécutifs d'apprentissage
- **Maître de l'Alphabet** : Maîtrise complète de l'alphabet LSF
- **Expert en Conversation** : Complétion du module conversation

#### **Statistiques d'apprentissage**
- Temps total d'apprentissage (12h 30min)
- Nombre de cours complétés (8)
- Taux de réussite (95%)

#### **Système de simulation d'apprentissage**
- Simulation de progression lors du clic sur une leçon
- Gain d'expérience automatique (+50 XP)
- Système de montée de niveau (tous les 2000 XP)
- Animations de feedback visuel

---

## 2. HealthScreen.tsx - Module Surveillance Santé

### 🎯 Objectif
Monitoring en temps réel des paramètres vitaux avec alertes intelligentes et conseils de santé.

### 🏥 Fonctionnalités principales

#### **Surveillance en temps réel**
- **Bouton de contrôle** : Démarrer/Arrêter le monitoring
- **Mise à jour automatique** : Données simulées toutes les 2 secondes
- **Interface responsive** : Adaptée aux différents états de surveillance

#### **Métriques de santé surveillées**
- **Fréquence cardiaque** : Battements par minute (60-100 bpm normal)
- **Niveau de stress** : Pourcentage de stress (0-100%)
- **Niveau sonore** : Décibels environnementaux (0-100 dB)
- **Nombre de pas** : Compteur de pas quotidiens
- **Pression artérielle** : Valeurs systolique/diastolique (110-140/80)
- **Niveau d'oxygène** : Saturation en oxygène (95-100%)
- **Température corporelle** : Température en Celsius (36-37.5°C)
- **Qualité du sommeil** : Pourcentage de qualité (70-100%)

#### **Système d'alertes intelligentes**
- **Alerte stress élevé** : Notification automatique si stress > 70%
- **Codes couleur** : Vert (normal), Bleu (attention), Rouge (alerte)
- **Animations visuelles** : Pulsations et effets de glow pour les alertes

#### **Graphique de tendance 24h**
- Visualisation de l'activité cardiaque sur 24 heures
- Graphique en barres animé
- Description des tendances ("Activité cardiaque stable")

#### **Conseils de santé personnalisés**
- **Hydratation** : "Buvez 8 verres d'eau par jour"
- **Sommeil** : "7-9 heures de sommeil recommandées"
- **Exercice** : "30 min d'activité quotidienne"

#### **Fonctionnalités multi-modules**
- **Module Voix → Signes** : Intégration de la traduction vocale
- **Module Insertion Pro** : Outils pour le monde professionnel
- **Basculement dynamique** entre les différents modules

---

## 3. ProfessionalScreen.tsx - Module Insertion Professionnelle

### 🎯 Objectif
Plateforme complète d'outils professionnels pour l'intégration en entreprise avec focus sur l'accessibilité.

### 💼 Fonctionnalités principales

#### **Gestion des réunions en temps réel**
- **Contrôle de réunion** : Démarrer/Arrêter les réunions
- **Compteur de durée** : Affichage du temps écoulé en temps réel
- **Statut visuel** : Indicateurs d'état (Prêt/En cours)

#### **Système de participants**
- **Liste des participants** : Affichage des membres de la réunion
- **Indicateur de parole** : Détection de qui parle actuellement
- **Informations détaillées** : Nom, rôle, statut de communication
- **Avatars personnalisés** : Initiales avec indicateurs visuels

#### **Transcription automatique en temps réel**
- **Transcription live** : Conversion automatique de la parole en texte
- **Contrôles d'enregistrement** : Enregistrer, sauvegarder, partager
- **Indicateur de progression** : Barre de progression de l'enregistrement
- **Simulation de contenu** : Phrases types de réunion d'entreprise

#### **Gestion des réunions à venir**
- **Planning Sprint Sensora** : Réunion en cours (4 participants, 45min)
- **Rétrospective Équipe** : À venir (6 participants, 30min)
- **Démo Produit** : À venir (8 participants, 60min)
- **Types de réunion** : Vidéo, audio, hybride

#### **Boîte à outils professionnelle**
- **Prise de Notes** : Notes automatiques et résumés (85% d'utilisation)
- **Planification** : Gestion d'agenda intelligent (72% d'utilisation)
- **Communication** : Emails et messages adaptés (68% d'utilisation)
- **Collaboration** : Travail d'équipe optimisé (91% d'utilisation)
- **Analytics** : Statistiques et rapports (45% d'utilisation)
- **Présentations** : Création de slides adaptées (78% d'utilisation)

#### **Système de récompenses professionnelles**
- **Première Réunion** : Participation à la première réunion
- **Régulier** : 5 réunions consécutives
- **Leader d'Équipe** : Animation de 10 réunions (70% de progression)
- **Efficacité** : 100% de réunions à l'heure (85% de progression)

#### **Statistiques professionnelles**
- **Réunions ce mois** : 24 réunions
- **Temps total** : 18 heures
- **Participants** : 156 participants

---

## 4. SignToVoiceModule.tsx - Module Signes → Voix

### 🎯 Objectif
Conversion des signes en parole avec détection par caméra ou saisie manuelle.

### 🤟 Fonctionnalités principales

#### **Modes de détection**
- **Mode Caméra** : Détection automatique via caméra
- **Mode Manuel** : Saisie manuelle des signes
- **Basculement dynamique** entre les modes

#### **Interface de détection caméra**
- **Zone de détection** : Cadre visuel pour la capture
- **Animations de caméra** : Rotation et pulsations pendant la détection
- **Cadre de détection** : Bordures animées pendant l'analyse
- **Indicateur de traitement** : "Analyse en cours..."

#### **Système de détection manuelle**
- **Icône de main** : Représentation visuelle des gestes
- **Animations de pulsation** : Feedback visuel pendant la détection
- **Effets de glow** : Halos lumineux pour l'engagement

#### **Avatar 3D LSF**
- **Simulation 3D** : Avatar animé pour les signes détectés
- **Intégration SignLanguageAvatar** : Composant spécialisé
- **Rotation dynamique** : Animations lors de la détection
- **Description contextuelle** : "Simulation 3D des signes détectés"

#### **Traitement et analyse**
- **Barre de progression** : Indicateur de confiance (0-100%)
- **Animation de traitement** : Icône de synchronisation
- **Simulation intelligente** : Contenu contextuel ("Bonjour, comment allez-vous ?")
- **Niveau de confiance** : 95% de précision

#### **Sortie vocale**
- **Bouton de lecture** : Écouter la traduction vocale
- **Indicateur de qualité** : "95% de précision"
- **Description** : "Écouter la traduction"

#### **Conseils de détection**
- **Éclairage** : "Placez-vous dans un bon éclairage"
- **Visibilité** : "Gardez vos mains visibles"
- **Clarté** : "Effectuez des gestes clairs"
- **Distance** : "Maintenez une distance appropriée"

#### **Statistiques de session**
- **Précision** : 95% de précision moyenne
- **Signes détectés** : 12 signes dans la session
- **Temps moyen** : 2.8 secondes par détection

---

## 5. TranslationScreen.tsx - Module Langues Locales

### 🎯 Objectif
Traduction vers les langues guinéennes avec support vocal et historique.

### 🌍 Fonctionnalités principales

#### **Sélection de langues guinéennes**
- **Pular** : 4.2M locuteurs, région Fouta Djallon, difficulté Facile
- **Malinké** : 3.1M locuteurs, région Haute Guinée, difficulté Moyen
- **Soussou** : 2.8M locuteurs, région Basse Guinée, difficulté Facile
- **Kissi** : 1.2M locuteurs, région Guinée Forestière, difficulté Difficile
- **Toma** : 0.8M locuteurs, région Guinée Forestière, difficulté Difficile
- **Guerzé** : 0.6M locuteurs, région Guinée Forestière, difficulté Difficile
- **Landuma** : 0.4M locuteurs, région Guinée Forestière, difficulté Difficile
- **Nalu** : 0.3M locuteurs, région Basse Guinée, difficulté Difficile

#### **Informations détaillées par langue**
- **Nom natif** : Affichage dans l'écriture originale
- **Région** : Zone géographique d'utilisation
- **Nombre de locuteurs** : Statistiques démographiques
- **Niveau de difficulté** : Badges colorés (Facile/Moyen/Difficile)
- **Sélection visuelle** : Indicateurs de choix avec animations

#### **Système de saisie avancé**
- **Saisie texte** : Zone de texte multilignes
- **Saisie vocale** : Enregistrement vocal avec animation
- **Contrôles d'édition** : Supprimer le texte, basculer les modes
- **Validation intelligente** : Vérification avant traduction

#### **Moteur de traduction**
- **Traduction en temps réel** : Conversion automatique
- **Barre de progression** : Indicateur de traitement
- **Simulation de contenu** : Traductions contextuelles en langues locales
- **Gestion d'erreurs** : Fallback vers mode simulation

#### **Fonctionnalités de sortie**
- **Lecture audio** : Écouter la traduction
- **Copie** : Copier le texte traduit
- **Partage** : Partager la traduction
- **Interface multilingue** : Support des caractères spéciaux

#### **Historique intelligent**
- **Traductions récentes** : Dernières 3 traductions
- **Informations contextuelles** : Langue, horodatage
- **Accès rapide** : Réutilisation des traductions précédentes

#### **Système de récompenses**
- **Première Traduction** : Récompense de démarrage
- **Polyglotte** : Traduction dans 5 langues différentes (60% de progression)
- **Maître Vocal** : 10 utilisations de la saisie vocale (70% de progression)
- **Expert Traduction** : 100 traductions effectuées (25% de progression)

#### **Statistiques globales**
- **Total traductions** : Compteur de traductions effectuées
- **Langues disponibles** : 8 langues guinéennes
- **Langue favorite** : Sélection automatique de la langue préférée

#### **Informations culturelles**
- **Diversité linguistique** : "La Guinée compte plus de 40 langues locales"
- **Répartition** : Pular (40%), Malinké (30%), Soussou (20%)
- **Contexte culturel** : "Chaque langue reflète une culture et une histoire unique"

---

## 6. VoiceToSignModule.tsx - Module Voix → Signes

### 🎯 Objectif
Conversion de la parole en langue des signes avec transcription automatique et avatar 3D.

### 🎤 Fonctionnalités principales

#### **Enregistrement vocal avancé**
- **Contrôle d'enregistrement** : Démarrer/Arrêter avec animations
- **Permissions audio** : Gestion automatique des autorisations
- **Qualité haute définition** : Enregistrement en haute qualité
- **Ondes sonores animées** : Visualisation de l'audio en temps réel

#### **Intégration OpenAI**
- **Transcription automatique** : Conversion parole → texte via OpenAI
- **Gestion des erreurs** : Fallback intelligent en cas d'échec
- **Statuts de configuration** : Actif, Quota épuisé, Non configuré
- **Notifications utilisateur** : Alertes sur le statut du service

#### **Upload et stockage**
- **Upload Supabase** : Stockage sécurisé des fichiers audio
- **Statistiques d'upload** : Suivi des succès/échecs
- **Gestion des erreurs** : Messages explicites pour l'utilisateur
- **Nommage automatique** : Fichiers avec timestamp unique

#### **Avatar 3D LSF**
- **SignLanguageAvatar** : Composant 3D spécialisé
- **Animations de signes** : Simulation des gestes LSF
- **Rotation dynamique** : Mouvements lors de la traduction
- **Intégration contextuelle** : Adaptation au texte transcrit

#### **Traitement et traduction**
- **Transcription en temps réel** : Affichage progressif du texte
- **Traduction LSF** : Conversion vers la langue des signes
- **Génération d'emojis** : Représentation visuelle des signes
- **Niveau de confiance** : Indicateur de précision (0-100%)

#### **Interface utilisateur premium**
- **Animations fluides** : Transitions et effets visuels
- **Ondes sonores** : Visualisation de l'enregistrement
- **Pulsations** : Effets de feedback tactile
- **Gradients dynamiques** : Couleurs adaptatives

#### **Sous-titres en temps réel**
- **Affichage live** : Texte transcrit pendant l'enregistrement
- **Interface dédiée** : Zone spécialisée pour les sous-titres
- **États contextuels** : "Écoute en cours..." / "Aucun texte détecté"

#### **Statistiques de session**
- **Uploads totaux** : Nombre de fichiers uploadés
- **Précision moyenne** : Pourcentage de précision
- **Uploads réussis** : Succès d'upload vers Supabase

#### **Gestion des erreurs robuste**
- **Mode simulation** : Fonctionnement sans OpenAI
- **Messages explicites** : Explications claires des erreurs
- **Fallback intelligent** : Contenu simulé de qualité
- **Conseils utilisateur** : Instructions pour résoudre les problèmes

#### **Optimisation des performances**
- **FlatList/ScrollView** : Basculement automatique selon les besoins
- **Animations optimisées** : Performance fluide sur tous appareils
- **Gestion mémoire** : Nettoyage automatique des ressources

---

## 🎨 Caractéristiques communes à tous les modules

### **Design et UX**
- **Palette de couleurs cohérente** : Vert (#146454) et Bleu (#029ED6)
- **Animations fluides** : Transitions avec React Native Reanimated
- **Gradients dynamiques** : Effets visuels avec LinearGradient
- **Feedback tactile** : Vibrations avec Expo Haptics

### **Accessibilité**
- **Interface adaptative** : Support des différents besoins
- **Textes descriptifs** : Descriptions pour les utilisateurs malvoyants
- **Contrastes élevés** : Lisibilité optimisée
- **Navigation intuitive** : Parcours utilisateur simplifié

### **Performance**
- **Lazy loading** : Chargement optimisé des composants
- **Gestion d'état** : State management efficace
- **Animations optimisées** : Performance 60fps
- **Gestion mémoire** : Nettoyage automatique des ressources

### **Fonctionnalités techniques**
- **TypeScript** : Code typé et maintenable
- **Architecture modulaire** : Composants réutilisables
- **Gestion d'erreurs** : Try-catch et fallbacks
- **Logging détaillé** : Console logs pour le debugging

---

## 📱 Utilisation pour la présentation PowerPoint

### **Points clés à mettre en avant :**

1. **Innovation technologique** : Intégration IA, reconnaissance vocale, avatar 3D
2. **Accessibilité** : Solutions complètes pour la communauté sourde
3. **Éducation** : Plateforme d'apprentissage gamifiée
4. **Intégration professionnelle** : Outils d'entreprise adaptés
5. **Diversité culturelle** : Support des langues guinéennes
6. **Expérience utilisateur** : Interface moderne et intuitive

### **Démonstrations recommandées :**

1. **Module Éducation** : Progression et gamification
2. **Module Santé** : Monitoring temps réel et alertes
3. **Module Professionnel** : Réunions et transcription
4. **Module Signes→Voix** : Détection et conversion
5. **Module Langues** : Traduction multilingue
6. **Module Voix→Signes** : Avatar 3D et IA

Cette documentation fournit une base solide pour présenter les capacités complètes de l'application Sensora dans un contexte de présentation professionnelle.
