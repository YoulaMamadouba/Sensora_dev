"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"

const { width, height } = Dimensions.get("window")

const VoiceToSignScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const micScale = useSharedValue(1)
  const waveOpacity = useSharedValue(0)
  const avatarRotation = useSharedValue(0)
  const pulseScale = useSharedValue(1)

  useEffect(() => {
    if (isRecording) {
      // Animation du micro pendant l'enregistrement
      micScale.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        false,
      )

      // Animation des ondes sonores
      waveOpacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true)

      // Animation de pulsation
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        false,
      )
    } else {
      micScale.value = withTiming(1)
      waveOpacity.value = withTiming(0)
      pulseScale.value = withTiming(1)
    }
  }, [isRecording])

  const handleRecordToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    if (!isRecording) {
      setIsRecording(true)
      // Simulation d'enregistrement
      setTimeout(() => {
        setIsRecording(false)
        setIsProcessing(true)

        // Simulation de transcription
        setTimeout(() => {
          setTranscribedText("Bonjour, comment allez-vous aujourd'hui ?")
          setIsProcessing(false)

          // Animation de l'avatar
          avatarRotation.value = withSequence(
            withTiming(10, { duration: 200 }),
            withTiming(-10, { duration: 400 }),
            withTiming(0, { duration: 200 }),
          )
        }, 2000)
      }, 3000)
    } else {
      setIsRecording(false)
    }
  }

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }))

  const waveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
  }))

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarRotation.value}deg` }],
  }))

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  return (
    <LinearGradient colors={["#FFFFFF", "#FFFFFF", "#FFFFFF"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voix → Langue des Signes</Text>
        <Text style={styles.subtitle}>Parlez et voyez la traduction en signes</Text>
      </View>

      {/* Avatar 3D Placeholder */}
      <View style={styles.avatarContainer}>
        <Animated.View style={[styles.avatar, avatarAnimatedStyle]}>
          <LinearGradient colors={["#146454", "#029ED6"]} style={styles.avatarGradient}>
            <Ionicons name="person" size={60} color="#FFFFFF" />
          </LinearGradient>

          {/* Glow effect pour l'avatar */}
          <Animated.View style={[styles.avatarGlow, pulseAnimatedStyle]} />
        </Animated.View>

        {isProcessing && (
          <View style={styles.processingIndicator}>
            <LinearGradient
              colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]}
              style={styles.processingGradient}
            >
              <Ionicons name="sync" size={16} color="#146454" />
              <Text style={styles.processingText}>Traduction en cours...</Text>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Texte transcrit */}
      {transcribedText ? (
        <View style={styles.textContainer}>
          <LinearGradient
            colors={["rgba(20, 100, 84, 0.05)", "rgba(2, 158, 214, 0.02)"]}
            style={styles.textGradient}
          >
            <Text style={styles.transcribedText}>{transcribedText}</Text>
          </LinearGradient>

          <View style={styles.signTranslation}>
            <Text style={styles.signText}>🤟 👋 ✋ 👍 🤝</Text>
            <Text style={styles.signDescription}>Traduction approximative en signes</Text>
          </View>
        </View>
      ) : null}

      {/* Contrôles d'enregistrement */}
      <View style={styles.controlsContainer}>
        {/* Ondes sonores animées */}
        {isRecording && (
          <Animated.View style={[styles.soundWaves, waveAnimatedStyle]}>
            {[...Array(5)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.wave,
                  {
                    height: 20 + index * 10,
                    backgroundColor: "#146454",
                    opacity: interpolate(waveOpacity.value, [0, 1], [0.3, 1]),
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}

        {/* Bouton micro */}
        <Animated.View style={micAnimatedStyle}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPress={handleRecordToggle}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isRecording ? ["#FF0000", "#FF0000"] : ["#146454", "#029ED6"]}
              style={styles.micButtonGradient}
            >
              <Ionicons name={isRecording ? "stop" : "mic"} size={40} color="#FFFFFF" />
            </LinearGradient>

            {/* Cercle de pulsation */}
            {isRecording && <Animated.View style={[styles.pulseCircle, pulseAnimatedStyle]} />}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.instructionText}>{isRecording ? "Parlez maintenant..." : "Appuyez pour commencer"}</Text>
      </View>

      {/* Sous-titres */}
      <View style={styles.subtitlesContainer}>
        <Text style={styles.subtitlesTitle}>Sous-titres en temps réel</Text>
        <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.subtitlesBox}>
          <Text style={styles.subtitlesText}>
            {isRecording ? "Écoute en cours..." : transcribedText || "Aucun texte détecté"}
          </Text>
        </LinearGradient>
      </View>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#146454",
    opacity: 0.8,
    textAlign: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  avatarGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#146454",
    opacity: 0.2,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  processingIndicator: {
    borderRadius: 20,
    overflow: "hidden",
  },
  processingGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.3)",
  },
  processingText: {
    color: "#146454",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  textGradient: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.2)",
    backgroundColor: "#FFFFFF",
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transcribedText: {
    fontSize: 18,
    color: "#146454",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  signTranslation: {
    alignItems: "center",
  },
  signText: {
    fontSize: 32,
    marginBottom: 8,
  },
  signDescription: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  soundWaves: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    height: 60,
  },
  wave: {
    width: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  micButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    position: "relative",
  },
  micButtonActive: {
    shadowColor: "#FF0000",
  },
  micButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FF0000",
    opacity: 0.3,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  instructionText: {
    fontSize: 16,
    color: "#146454",
    marginTop: 16,
    opacity: 0.8,
    fontWeight: "500",
  },
  subtitlesContainer: {
    paddingHorizontal: 20,
  },
  subtitlesTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitlesBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.2)",
    backgroundColor: "#FFFFFF",
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subtitlesText: {
    fontSize: 16,
    color: "#146454",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
})

export default VoiceToSignScreen
