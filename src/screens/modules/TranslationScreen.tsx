"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, StatusBar, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useNavigation } from "@react-navigation/native"

const { width, height } = Dimensions.get("window")

interface Language {
  id: string
  name: string
  nativeName: string
  flag: string
  color: string
  region: string
  speakers: string
  difficulty: "Facile" | "Moyen" | "Difficile"
}

interface TranslationHistory {
  id: string
  originalText: string
  translatedText: string
  language: string
  timestamp: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
}

const TranslationScreen: React.FC = () => {
  const navigation = useNavigation()
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const [translationHistory, setTranslationHistory] = useState<TranslationHistory[]>([])
  const [totalTranslations, setTotalTranslations] = useState(0)
  const [favoriteLanguage, setFavoriteLanguage] = useState<string>("")

  // Animations values
  const backgroundScale = useSharedValue(1)
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const languageScale = useSharedValue(1)
  const translateScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0)
  const progressValue = useSharedValue(0)
  const voiceScale = useSharedValue(1)

  // Animation d'entrée
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 })
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 1000 }))
    backgroundScale.value = withSpring(1, { damping: 15, stiffness: 100 })
  }, [])

  useEffect(() => {
    // Animation de pulsation continue
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true,
    )
  }, [])

  const handleLanguageSelect = (language: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedLanguage(language)
    setFavoriteLanguage(language.id)
    
    languageScale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 12 })
    )
  }

  const handleTranslate = async () => {
    if (!inputText.trim() || !selectedLanguage) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsTranslating(true)
    translateScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 8 }),
        withSpring(1, { damping: 12 })
      ),
      -1,
      false,
    )
    progressValue.value = withTiming(1, { duration: 2000 })

    // Simulation de traduction
    setTimeout(() => {
      const mockTranslations: { [key: string]: string } = {
        pular: "A jaraama e jam tan! No mbadda? Miɗo yiɗi e jam tan.",
        malinke: "I ni ce! I ka kene wa? N'ka diya i ka kene.",
        soussou: "Bara mu! I bɛrɛ naxan na? N'ka diya i ka kene.",
        kissi: "Busu! U ma numu? N'ka diya u ka kene.",
        toma: "Kɛlɛ! U bɛ di? N'ka diya u ka kene.",
        guerze: "Kɛlɛ gbɛɛ! U ma numu? N'ka diya u ka kene.",
        landuma: "Kɛlɛ! U bɛ di? N'ka diya u ka kene.",
        nalu: "Kɛlɛ! U bɛ di? N'ka diya u ka kene.",
      }

      const translation = mockTranslations[selectedLanguage.id] || "Traduction non disponible"
      setTranslatedText(translation)
      setIsTranslating(false)
      translateScale.value = withSpring(1, { damping: 15 })
      progressValue.value = withTiming(0, { duration: 200 })

      // Ajouter à l'historique
      const newHistory: TranslationHistory = {
        id: Date.now().toString(),
        originalText: inputText,
        translatedText: translation,
        language: selectedLanguage.name,
        timestamp: new Date().toLocaleTimeString(),
      }
      setTranslationHistory(prev => [newHistory, ...prev.slice(0, 9)])
      setTotalTranslations(prev => prev + 1)
    }, 2000)
  }

  const handlePlayAudio = () => {
    if (!translatedText) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsPlaying(true)

    // Simulation de lecture audio
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }

  const handleVoiceInput = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setInputMode("voice")
    voiceScale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 12 })
      ),
      -1,
      false,
    )

    // Simulation d'enregistrement vocal
    setTimeout(() => {
      setInputText("Bonjour, comment allez-vous ? J'espère que vous allez bien.")
      setInputMode("text")
      voiceScale.value = withSpring(1, { damping: 15 })
    }, 3000)
  }

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }))

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [-30, 0], Extrapolate.CLAMP) }],
  }))

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: interpolate(contentOpacity.value, [0, 1], [50, 0], Extrapolate.CLAMP) }],
  }))

  const languageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: languageScale.value }],
  }))

  const translateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: translateScale.value }],
  }))

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }))

  const voiceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voiceScale.value }],
  }))

  const guineaLanguages: Language[] = [
    {
      id: "pular",
      name: "Pular",
      nativeName: "𞤆𞤵𞤤𞤢𞤪",
      flag: "🇬🇳",
      color: "#146454",
      region: "Fouta Djallon",
      speakers: "4.2M",
      difficulty: "Facile",
    },
    {
      id: "malinke",
      name: "Malinké",
      nativeName: "ߡߊ߲ߞߊ߲",
      flag: "🇬🇳",
      color: "#029ED6",
      region: "Haute Guinée",
      speakers: "3.1M",
      difficulty: "Moyen",
    },
    {
      id: "soussou",
      name: "Soussou",
      nativeName: "Sɔsɔ",
      flag: "🇬🇳",
      color: "#146454",
      region: "Basse Guinée",
      speakers: "2.8M",
      difficulty: "Facile",
    },
    {
      id: "kissi",
      name: "Kissi",
      nativeName: "Kissi",
      flag: "🇬🇳",
      color: "#029ED6",
      region: "Guinée Forestière",
      speakers: "1.2M",
      difficulty: "Difficile",
    },
    {
      id: "toma",
      name: "Toma",
      nativeName: "Toma",
      flag: "🇬🇳",
      color: "#146454",
      region: "Guinée Forestière",
      speakers: "0.8M",
      difficulty: "Difficile",
    },
    {
      id: "guerze",
      name: "Guerzé",
      nativeName: "Kpɛlɛ",
      flag: "🇬🇳",
      color: "#029ED6",
      region: "Guinée Forestière",
      speakers: "0.6M",
      difficulty: "Difficile",
    },
    {
      id: "landuma",
      name: "Landuma",
      nativeName: "Landuma",
      flag: "🇬🇳",
      color: "#146454",
      region: "Guinée Forestière",
      speakers: "0.4M",
      difficulty: "Difficile",
    },
    {
      id: "nalu",
      name: "Nalu",
      nativeName: "Nalu",
      flag: "🇬🇳",
      color: "#029ED6",
      region: "Basse Guinée",
      speakers: "0.3M",
      difficulty: "Difficile",
    },
  ]

  const achievements: Achievement[] = [
    {
      id: "first_translation",
      title: "Première Traduction",
      description: "Effectuez votre première traduction",
      icon: "language",
      unlocked: true,
      progress: 100,
    },
    {
      id: "polyglot",
      title: "Polyglotte",
      description: "Traduisez dans 5 langues différentes",
      icon: "globe",
      unlocked: false,
      progress: 60,
    },
    {
      id: "voice_master",
      title: "Maître Vocal",
      description: "Utilisez 10 fois la saisie vocale",
      icon: "mic",
      unlocked: false,
      progress: 70,
    },
    {
      id: "translation_expert",
      title: "Expert Traduction",
      description: "100 traductions effectuées",
      icon: "trophy",
      unlocked: false,
      progress: 25,
    },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Background animé */}
      <Animated.View style={[styles.backgroundGradient, backgroundAnimatedStyle]}>
        <LinearGradient 
          colors={["#FFFFFF", "#F8F9FA", "#FFFFFF"]} 
          style={styles.gradient}
        />
      </Animated.View>

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <LinearGradient colors={["#146454", "#029ED6"]} style={styles.backButtonGradient}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Langues Locales</Text>
          <Text style={styles.subtitle}>Traduisez vers les langues guinéennes</Text>
        </View>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <Animated.View style={[styles.statsGlow, glowAnimatedStyle]} />
            <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="language" size={24} color="#146454" />
                  <Text style={styles.statNumber}>{totalTranslations}</Text>
                  <Text style={styles.statLabel}>Traductions</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="globe" size={24} color="#029ED6" />
                  <Text style={styles.statNumber}>{guineaLanguages.length}</Text>
                  <Text style={styles.statLabel}>Langues</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={24} color="#146454" />
                  <Text style={styles.statNumber}>{favoriteLanguage ? "1" : "0"}</Text>
                  <Text style={styles.statLabel}>Favori</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Sélection de langue */}
          <View style={styles.languageContainer}>
            <Text style={styles.sectionTitle}>Choisir une langue</Text>
            <View style={styles.languagesGrid}>
              {guineaLanguages.map((language) => (
                <TouchableOpacity
                  key={language.id}
                  style={[styles.languageCard, selectedLanguage?.id === language.id && styles.languageCardSelected]}
                  onPress={() => handleLanguageSelect(language)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      selectedLanguage?.id === language.id
                        ? ["rgba(20, 100, 84, 0.15)", "rgba(2, 158, 214, 0.1)"]
                        : ["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]
                    }
                    style={styles.languageGradient}
                  >
                    <View style={styles.languageHeader}>
                      <Text style={styles.languageFlag}>{language.flag}</Text>
                      {selectedLanguage?.id === language.id && (
                        <Animated.View style={[styles.selectedIndicator, glowAnimatedStyle]}>
                          <Ionicons name="checkmark-circle" size={16} color="#146454" />
                        </Animated.View>
                      )}
                    </View>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageNative}>{language.nativeName}</Text>
                    <View style={styles.languageDetails}>
                      <Text style={styles.languageRegion}>{language.region}</Text>
                      <Text style={styles.languageSpeakers}>{language.speakers} locuteurs</Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: language.difficulty === "Facile" ? "#146454" : language.difficulty === "Moyen" ? "#029ED6" : "#FF4757" }]}>
                        <Text style={styles.difficultyText}>{language.difficulty}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Zone de saisie */}
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Texte à traduire</Text>
            <LinearGradient colors={["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]} style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="Tapez votre texte ici..."
                placeholderTextColor="#146454"
                multiline
                value={inputText}
                onChangeText={setInputText}
                editable={inputMode === "text"}
              />
              
              <View style={styles.inputControls}>
                <TouchableOpacity
                  style={[styles.inputButton, inputMode === "voice" && styles.inputButtonActive]}
                  onPress={handleVoiceInput}
                  disabled={inputMode === "voice"}
                >
                  <Animated.View style={voiceAnimatedStyle}>
                    <LinearGradient
                      colors={inputMode === "voice" ? ["#FF4757", "#FF3742"] : ["#146454", "#029ED6"]}
                      style={styles.inputButtonGradient}
                    >
                      <Ionicons name={inputMode === "voice" ? "stop" : "mic"} size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.inputButton} onPress={() => setInputText("")}>
                  <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.inputButtonGradient}>
                    <Ionicons name="trash" size={20} color="#146454" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Bouton de traduction */}
          <View style={styles.translateContainer}>
            <Animated.View style={[translateAnimatedStyle, languageAnimatedStyle]}>
              <TouchableOpacity
                style={[
                  styles.translateButton,
                  (!inputText.trim() || !selectedLanguage) && styles.translateButtonDisabled,
                ]}
                onPress={handleTranslate}
                disabled={isTranslating || !inputText.trim() || !selectedLanguage}
              >
                <LinearGradient
                  colors={
                    isTranslating || !inputText.trim() || !selectedLanguage 
                      ? ["#999", "#666"] 
                      : ["#146454", "#029ED6"]
                  }
                  style={styles.translateButtonGradient}
                >
                  {isTranslating && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
                      </View>
                    </View>
                  )}
                  <Ionicons name={isTranslating ? "sync" : "language"} size={24} color="#FFFFFF" />
                  <Text style={styles.translateButtonText}>
                    {isTranslating ? "Traduction..." : "Traduire"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Résultat de traduction */}
          {translatedText && (
            <View style={styles.resultContainer}>
              <Text style={styles.sectionTitle}>Traduction en {selectedLanguage?.name}</Text>
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.resultBox}>
                <Text style={styles.resultText}>{translatedText}</Text>
                
                <View style={styles.resultControls}>
                  <TouchableOpacity style={styles.resultButton} onPress={handlePlayAudio} disabled={isPlaying}>
                    <LinearGradient
                      colors={isPlaying ? ["#999", "#666"] : ["#146454", "#029ED6"]}
                      style={styles.resultButtonGradient}
                    >
                      <Ionicons name={isPlaying ? "volume-high" : "play"} size={20} color="#FFFFFF" />
                      <Text style={styles.resultButtonText}>
                        {isPlaying ? "Lecture..." : "Écouter"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.resultButton}>
                    <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.resultButtonGradient}>
                      <Ionicons name="copy" size={20} color="#146454" />
                      <Text style={[styles.resultButtonText, { color: "#146454" }]}>Copier</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.resultButton}>
                    <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.resultButtonGradient}>
                      <Ionicons name="share" size={20} color="#146454" />
                      <Text style={[styles.resultButtonText, { color: "#146454" }]}>Partager</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Historique des traductions */}
          {translationHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.sectionTitle}>Historique récent</Text>
              <View style={styles.historyList}>
                {translationHistory.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <LinearGradient colors={["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]} style={styles.historyGradient}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyLanguage}>{item.language}</Text>
                        <Text style={styles.historyTime}>{item.timestamp}</Text>
                      </View>
                      <Text style={styles.historyOriginal} numberOfLines={2}>{item.originalText}</Text>
                      <Text style={styles.historyTranslated} numberOfLines={2}>{item.translatedText}</Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Récompenses */}
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Récompenses</Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <TouchableOpacity
                  key={achievement.id}
                  style={[styles.achievementCard, achievement.unlocked && styles.achievementUnlocked]}
                  activeOpacity={0.8}
                >
                  <LinearGradient 
                    colors={achievement.unlocked ? ["rgba(20, 100, 84, 0.15)", "rgba(2, 158, 214, 0.1)"] : ["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]} 
                    style={styles.achievementGradient}
                  >
                    <View style={[styles.achievementIcon, achievement.unlocked && styles.achievementIconUnlocked]}>
                      <Ionicons 
                        name={achievement.icon as any} 
                        size={24} 
                        color={achievement.unlocked ? "#FFFFFF" : "#146454"} 
                      />
                    </View>
                    <Text style={[styles.achievementTitle, achievement.unlocked && styles.achievementTitleUnlocked]}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    {!achievement.unlocked && (
                      <View style={styles.achievementProgress}>
                        <View style={styles.achievementProgressBar}>
                          <View style={[styles.achievementProgressFill, { width: `${achievement.progress}%` }]} />
                        </View>
                        <Text style={styles.achievementProgressText}>{achievement.progress}%</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Informations sur les langues */}
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>À propos des langues guinéennes</Text>
            <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.infoBox}>
              <View style={styles.infoIcon}>
                <Ionicons name="information-circle" size={32} color="#146454" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Diversité linguistique</Text>
                <Text style={styles.infoText}>
                  La Guinée compte plus de 40 langues locales. Les principales sont le Pular (40%), le Malinké (30%), le Soussou (20%) et d'autres langues forestières. Chaque langue reflète une culture et une histoire unique.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(20, 100, 84, 0.1)",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 16,
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#146454",
    opacity: 0.7,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginVertical: 20,
    position: "relative",
  },
  statsGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#146454",
    opacity: 0.1,
    top: -40,
    left: -40,
    zIndex: -1,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    color: "#146454",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
  languageContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 16,
  },
  languagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  languageCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  languageCardSelected: {
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  languageGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
  },
  languageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  languageFlag: {
    fontSize: 24,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  languageName: {
    fontSize: 16,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  languageNative: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 8,
  },
  languageDetails: {
    gap: 4,
  },
  languageRegion: {
    fontSize: 10,
    color: "#146454",
    fontWeight: "600",
    textAlign: "center",
  },
  languageSpeakers: {
    fontSize: 9,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 4,
  },
  difficultyText: {
    fontSize: 8,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  textInput: {
    fontSize: 16,
    color: "#146454",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
    fontWeight: "500",
  },
  inputControls: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputButtonActive: {
    elevation: 8,
    shadowColor: "#FF4757",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  inputButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  translateContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  translateButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  translateButtonDisabled: {
    opacity: 0.5,
  },
  translateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    position: "relative",
  },
  progressContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  translateButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 12,
  },
  resultContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  resultBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  resultText: {
    fontSize: 18,
    color: "#146454",
    lineHeight: 26,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  resultControls: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  resultButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  resultButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  resultButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  historyContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyLanguage: {
    fontSize: 14,
    color: "#146454",
    fontWeight: "bold",
  },
  historyTime: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
  },
  historyOriginal: {
    fontSize: 12,
    color: "#146454",
    marginBottom: 4,
    fontStyle: "italic",
  },
  historyTranslated: {
    fontSize: 12,
    color: "#029ED6",
    fontWeight: "500",
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  achievementUnlocked: {
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  achievementGradient: {
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementIconUnlocked: {
    backgroundColor: "#146454",
  },
  achievementTitle: {
    fontSize: 14,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  achievementTitleUnlocked: {
    color: "#146454",
  },
  achievementDescription: {
    fontSize: 10,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 14,
  },
  achievementProgress: {
    marginTop: 8,
    width: "100%",
  },
  achievementProgressBar: {
    height: 3,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: "100%",
    backgroundColor: "#146454",
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 8,
    color: "#146454",
    textAlign: "center",
    fontWeight: "500",
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#146454",
    opacity: 0.7,
    lineHeight: 20,
  },
})

export default TranslationScreen
