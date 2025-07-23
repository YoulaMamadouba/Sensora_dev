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
    <LinearGradient colors={["#182825", "#0f1f1c", "#182825"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voix → Langue des Signes</Text>
        <Text style={styles.subtitle}>Parlez et voyez la traduction en signes</Text>
      </View>

      {/* Avatar 3D Placeholder */}
      <View style={styles.avatarContainer}>
        <Animated.View style={[styles.avatar, avatarAnimatedStyle]}>
          <LinearGradient colors={["#00E0B8", "#00c4a0"]} style={styles.avatarGradient}>
            <Ionicons name="person" size={60} color="#182825" />
          </LinearGradient>

          {/* Glow effect pour l'avatar */}
          <Animated.View style={[styles.avatarGlow, pulseAnimatedStyle]} />
        </Animated.View>

        {isProcessing && (
          <View style={styles.processingIndicator}>
            <LinearGradient
              colors={["rgba(0, 224, 184, 0.2)", "rgba(0, 224, 184, 0.1)"]}
              style={styles.processingGradient}
            >
              <Ionicons name="sync" size={16} color="#00E0B8" />
              <Text style={styles.processingText}>Traduction en cours...</Text>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Texte transcrit */}
      {transcribedText ? (
        <View style={styles.textContainer}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]}
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
                    backgroundColor: "#00E0B8",
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
              colors={isRecording ? ["#FF6B6B", "#FF5252"] : ["#00E0B8", "#00c4a0"]}
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
        <LinearGradient colors={["rgba(0, 0, 0, 0.6)", "rgba(0, 0, 0, 0.4)"]} style={styles.subtitlesBox}>
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
    backgroundColor: "#00E0B8",
    opacity: 0.3,
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
    borderColor: "rgba(0, 224, 184, 0.3)",
  },
  processingText: {
    color: "#00E0B8",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  textGradient: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  transcribedText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
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
    color: "#999",
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
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    position: "relative",
  },
  micButtonActive: {
    shadowColor: "#FF6B6B",
  },
  micButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF6B6B",
    opacity: 0.3,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  instructionText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 16,
    opacity: 0.8,
  },
  subtitlesContainer: {
    paddingHorizontal: 20,
  },
  subtitlesTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitlesBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.3)",
  },
  subtitlesText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
  },
})

export default VoiceToSignScreen
