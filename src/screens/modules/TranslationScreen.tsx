"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated"
import * as Haptics from "expo-haptics"

const { width } = Dimensions.get("window")

interface Language {
  id: string
  name: string
  nativeName: string
  flag: string
  color: string
}

const TranslationScreen: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")

  const translateOpacity = useSharedValue(0)
  const languageScale = useSharedValue(1)

  const guineaLanguages: Language[] = [
    {
      id: "pular",
      name: "Pular",
      nativeName: "𞤆𞤵𞤤𞤢𞤪",
      flag: "🇬🇳",
      color: "#FF6B6B",
    },
    {
      id: "malinke",
      name: "Malinké",
      nativeName: "ߡߊ߲ߞߊ߲",
      flag: "🇬🇳",
      color: "#4ECDC4",
    },
    {
      id: "soussou",
      name: "Soussou",
      nativeName: "Sɔsɔ",
      flag: "🇬🇳",
      color: "#45B7D1",
    },
    {
      id: "kissi",
      name: "Kissi",
      nativeName: "Kissi",
      flag: "🇬🇳",
      color: "#96CEB4",
    },
    {
      id: "toma",
      name: "Toma",
      nativeName: "Toma",
      flag: "🇬🇳",
      color: "#FFEAA7",
    },
    {
      id: "guerze",
      name: "Guerzé",
      nativeName: "Kpɛlɛ",
      flag: "🇬🇳",
      color: "#DDA0DD",
    },
  ]

  const handleLanguageSelect = (language: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedLanguage(language)
    languageScale.value = withSpring(1.1, { damping: 8 })
    setTimeout(() => {
      languageScale.value = withSpring(1, { damping: 12 })
    }, 200)
  }

  const handleTranslate = async () => {
    if (!inputText.trim() || !selectedLanguage) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsTranslating(true)
    translateOpacity.value = withTiming(0.7)

    // Simulation de traduction
    setTimeout(() => {
      const mockTranslations: { [key: string]: string } = {
        pular: "A jaraama e jam tan! No mbadda?",
        malinke: "I ni ce! I ka kene wa?",
        soussou: "Bara mu! I bɛrɛ naxan na?",
        kissi: "Busu! U ma numu?",
        toma: "Kɛlɛ! U bɛ di?",
        guerze: "Kɛlɛ gbɛɛ! U ma numu?",
      }

      setTranslatedText(mockTranslations[selectedLanguage.id] || "Traduction non disponible")
      setIsTranslating(false)
      translateOpacity.value = withTiming(1)
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

    // Simulation d'enregistrement vocal
    setTimeout(() => {
      setInputText("Bonjour, comment allez-vous ?")
      setInputMode("text")
    }, 3000)
  }

  const languageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: languageScale.value }],
  }))

  const translateAnimatedStyle = useAnimatedStyle(() => ({
    opacity: translateOpacity.value,
  }))

  return (
    <LinearGradient colors={["#182825", "#0f1f1c", "#182825"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Traduction Langues Locales</Text>
          <Text style={styles.subtitle}>Traduisez vers les langues guinéennes</Text>
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
                      ? [language.color, `${language.color}CC`]
                      : [`${language.color}20`, `${language.color}10`]
                  }
                  style={styles.languageGradient}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNative}>{language.nativeName}</Text>

                  {selectedLanguage?.id === language.id && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Zone de saisie */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Texte à traduire</Text>

          <View style={styles.inputBox}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]}
              style={styles.inputGradient}
            >
              <TextInput
                style={styles.textInput}
                placeholder="Tapez votre texte ici..."
                placeholderTextColor="#999"
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
                  <LinearGradient
                    colors={inputMode === "voice" ? ["#FF6B6B", "#FF5252"] : ["#00E0B8", "#00c4a0"]}
                    style={styles.inputButtonGradient}
                  >
                    <Ionicons name={inputMode === "voice" ? "stop" : "mic"} size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.inputButton} onPress={() => setInputText("")}>
                  <LinearGradient
                    colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]}
                    style={styles.inputButtonGradient}
                  >
                    <Ionicons name="trash" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Bouton de traduction */}
        <View style={styles.translateContainer}>
          <Animated.View style={translateAnimatedStyle}>
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
                  isTranslating || !inputText.trim() || !selectedLanguage ? ["#999", "#666"] : ["#00E0B8", "#00c4a0"]
                }
                style={styles.translateButtonGradient}
              >
                <Ionicons name={isTranslating ? "sync" : "language"} size={24} color="#FFFFFF" />
                <Text style={styles.translateButtonText}>{isTranslating ? "Traduction..." : "Traduire"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Résultat de traduction */}
        {translatedText && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Traduction en {selectedLanguage?.name}</Text>

            <LinearGradient
              colors={[`${selectedLanguage?.color}20`, `${selectedLanguage?.color}10`]}
              style={styles.resultBox}
            >
              <Text style={styles.resultText}>{translatedText}</Text>

              <View style={styles.resultControls}>
                <TouchableOpacity style={styles.resultButton} onPress={handlePlayAudio} disabled={isPlaying}>
                  <LinearGradient
                    colors={isPlaying ? ["#999", "#666"] : ["#00E0B8", "#00c4a0"]}
                    style={styles.resultButtonGradient}
                  >
                    <Ionicons name={isPlaying ? "volume-high" : "play"} size={20} color="#FFFFFF" />
                    <Text style={styles.resultButtonText}>{isPlaying ? "Lecture..." : "Écouter"}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resultButton}>
                  <LinearGradient
                    colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]}
                    style={styles.resultButtonGradient}
                  >
                    <Ionicons name="copy" size={20} color="#FFFFFF" />
                    <Text style={styles.resultButtonText}>Copier</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Informations sur les langues */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>À propos des langues guinéennes</Text>

          <LinearGradient colors={["rgba(0, 224, 184, 0.1)", "rgba(0, 224, 184, 0.05)"]} style={styles.infoBox}>
            <Ionicons name="information-circle" size={32} color="#00E0B8" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Diversité linguistique</Text>
              <Text style={styles.infoText}>
                La Guinée compte plus de 40 langues locales. Les principales sont le Pular (40%), le Malinké (30%), le
                Soussou (20%) et d'autres langues forestières.
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#00E0B8",
    opacity: 0.8,
    textAlign: "center",
  },
  languageContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 16,
  },
  languagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  languageCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  languageCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  languageGradient: {
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: 8,
  },
  languageName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  languageNative: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputBox: {
    borderRadius: 16,
    overflow: "hidden",
  },
  inputGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  textInput: {
    fontSize: 16,
    color: "#FFFFFF",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
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
  },
  inputButtonActive: {
    transform: [{ scale: 1.1 }],
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
  },
  translateButtonDisabled: {
    opacity: 0.5,
  },
  translateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
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
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  resultText: {
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 26,
    marginBottom: 20,
    textAlign: "center",
  },
  resultControls: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  resultButton: {
    flex: 1,
    marginHorizontal: 8,
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
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.3)",
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
})

export default TranslationScreen
