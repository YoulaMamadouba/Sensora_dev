"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, StatusBar } from "react-native"
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

const VoiceToSignModule: React.FC = () => {
  const navigation = useNavigation()
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [currentSign, setCurrentSign] = useState("")

  // Animations values
  const micScale = useSharedValue(1)
  const waveOpacity = useSharedValue(0)
  const avatarRotation = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const backgroundScale = useSharedValue(1)
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const waveScale = useSharedValue(0)
  const glowOpacity = useSharedValue(0)
  const progressValue = useSharedValue(0)

  // Animation d'entrée
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 })
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 1000 }))
    backgroundScale.value = withSpring(1, { damping: 15, stiffness: 100 })
  }, [])

  useEffect(() => {
    if (isRecording) {
      // Animation du micro pendant l'enregistrement
      micScale.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        ),
        -1,
        false,
      )
      
      // Animation des ondes sonores
      waveOpacity.value = withTiming(1, { duration: 300 })
      waveScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(1.2, { duration: 600 })
        ),
        -1,
        true,
      )
      
      // Animation de pulsation
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 10 }),
          withSpring(1, { damping: 15 })
        ),
        -1,
        false,
      )

      // Animation du glow
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true,
      )

      // Simulation de progression
      progressValue.value = withTiming(1, { duration: 3000 })
    } else {
      micScale.value = withSpring(1, { damping: 15 })
      waveOpacity.value = withTiming(0, { duration: 200 })
      waveScale.value = withTiming(0, { duration: 200 })
      pulseScale.value = withSpring(1, { damping: 15 })
      glowOpacity.value = withTiming(0, { duration: 200 })
      progressValue.value = withTiming(0, { duration: 200 })
    }
  }, [isRecording])

  const handleRecordToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    if (!isRecording) {
      setIsRecording(true)
      setConfidence(0)
      
      // Simulation d'enregistrement avec progression
      const progressInterval = setInterval(() => {
        setConfidence(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)

      setTimeout(() => {
        setIsRecording(false)
        setIsProcessing(true)
        clearInterval(progressInterval)
        
        setTimeout(() => {
          setTranscribedText("Bonjour, comment allez-vous aujourd'hui ?")
          setIsProcessing(false)
          setConfidence(95)
          
          // Animation de l'avatar
          avatarRotation.value = withSequence(
            withSpring(8, { damping: 8 }),
            withSpring(-8, { damping: 8 }),
            withSpring(0, { damping: 12 })
          )
        }, 2000)
      }, 3000)
    } else {
      setIsRecording(false)
    }
  }

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }))

  const waveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
    transform: [{ scale: waveScale.value }],
  }))

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarRotation.value}deg` }],
  }))

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

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

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }))

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
          <Text style={styles.title}>Voix → Langue des Signes</Text>
          <Text style={styles.subtitle}>Parlez et voyez la traduction en signes en temps réel</Text>
        </View>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Avatar 3D Premium */}
          <View style={styles.avatarContainer}>
            <Animated.View style={[styles.avatarGlow, glowAnimatedStyle]} />
            <Animated.View style={[styles.avatar, avatarAnimatedStyle]}>
              <LinearGradient 
                colors={["#146454", "#029ED6"]} 
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person" size={60} color="#FFFFFF" />
              </LinearGradient>
              <Animated.View style={[styles.avatarPulse, pulseAnimatedStyle]} />
            </Animated.View>

            {isProcessing && (
              <View style={styles.processingIndicator}>
                <LinearGradient
                  colors={["rgba(20, 100, 84, 0.15)", "rgba(2, 158, 214, 0.1)"]}
                  style={styles.processingGradient}
                >
                  <Animated.View style={styles.processingIcon}>
                    <Ionicons name="sync" size={20} color="#146454" />
                  </Animated.View>
                  <Text style={styles.processingText}>Traduction en cours...</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Barre de progression */}
          {isRecording && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
              </View>
              <Text style={styles.progressText}>{Math.round(confidence)}% de confiance</Text>
            </View>
          )}

          {/* Texte transcrit */}
          {transcribedText ? (
            <View style={styles.textContainer}>
              <LinearGradient
                colors={["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]}
                style={styles.textGradient}
              >
                <Text style={styles.transcribedText}>{transcribedText}</Text>
                <View style={styles.confidenceIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#146454" />
                  <Text style={styles.confidenceText}>95% de précision</Text>
                </View>
              </LinearGradient>

              <View style={styles.signTranslation}>
                <Text style={styles.signText}>🤟 👋 ✋ 👍 🤝</Text>
                <Text style={styles.signDescription}>Traduction en langue des signes</Text>
              </View>
            </View>
          ) : null}

          {/* Contrôles d'enregistrement */}
          <View style={styles.controlsContainer}>
            {/* Ondes sonores animées */}
            {isRecording && (
              <Animated.View style={[styles.soundWaves, waveAnimatedStyle]}>
                {[...Array(7)].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.wave,
                                              {
                          height: 15 + index * 8,
                          backgroundColor: "#146454",
                          opacity: interpolate(waveOpacity.value, [0, 1], [0.3, 1]),
                        },
                    ]}
                  />
                ))}
              </Animated.View>
            )}

            {/* Bouton micro premium */}
            <Animated.View style={micAnimatedStyle}>
              <TouchableOpacity
                style={[styles.micButton, isRecording && styles.micButtonActive]}
                onPress={handleRecordToggle}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isRecording ? ["#FF4757", "#FF3742"] : ["#146454", "#029ED6"]}
                  style={styles.micButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={isRecording ? "stop" : "mic"} size={40} color="#FFFFFF" />
                </LinearGradient>
                {isRecording && <Animated.View style={[styles.pulseCircle, pulseAnimatedStyle]} />}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.instructionText}>
              {isRecording ? "Parlez maintenant..." : "Appuyez pour commencer l'enregistrement"}
            </Text>
          </View>

          {/* Sous-titres en temps réel */}
          <View style={styles.subtitlesContainer}>
            <Text style={styles.subtitlesTitle}>Sous-titres en temps réel</Text>
            <LinearGradient 
              colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} 
              style={styles.subtitlesBox}
            >
              <Text style={styles.subtitlesText}>
                {isRecording ? "Écoute en cours..." : transcribedText || "Aucun texte détecté"}
              </Text>
            </LinearGradient>
          </View>

          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Statistiques de session</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="time" size={24} color="#146454" />
                  <Text style={styles.statNumber}>3.2s</Text>
                  <Text style={styles.statLabel}>Durée moyenne</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="checkmark-circle" size={24} color="#029ED6" />
                  <Text style={styles.statNumber}>95%</Text>
                  <Text style={styles.statLabel}>Précision</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="mic" size={24} color="#146454" />
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </LinearGradient>
              </View>
            </View>
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
  avatarContainer: {
    alignItems: "center",
    marginVertical: 30,
    position: "relative",
  },
  avatarGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#146454",
    opacity: 0.15,
    top: -20,
    left: -20,
    zIndex: -1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    position: "relative",
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  avatarGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPulse: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#029ED6",
    opacity: 0.2,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  processingIndicator: {
    marginTop: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  processingGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.3)",
  },
  processingIcon: {
    marginRight: 8,
  },
  processingText: {
    color: "#146454",
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#146454",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#146454",
    textAlign: "center",
    fontWeight: "600",
  },
  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  textGradient: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  transcribedText: {
    fontSize: 18,
    color: "#146454",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "600",
    marginBottom: 12,
  },
  confidenceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceText: {
    fontSize: 12,
    color: "#146454",
    marginLeft: 6,
    fontWeight: "500",
  },
  signTranslation: {
    alignItems: "center",
  },
  signText: {
    fontSize: 36,
    marginBottom: 8,
  },
  signDescription: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  soundWaves: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    height: 60,
  },
  wave: {
    width: 3,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    elevation: 16,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    position: "relative",
  },
  micButtonActive: {
    shadowColor: "#FF4757",
  },
  micButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FF4757",
    opacity: 0.3,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  instructionText: {
    fontSize: 16,
    color: "#146454",
    marginTop: 20,
    opacity: 0.8,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitlesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  subtitlesTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitlesBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.2)",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  subtitlesText: {
    fontSize: 16,
    color: "#146454",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  statGradient: {
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
  statNumber: {
    fontSize: 20,
    color: "#146454",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
})

export default VoiceToSignModule 