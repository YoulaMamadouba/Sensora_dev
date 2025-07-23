"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated"
import * as Haptics from "expo-haptics"

const { width, height } = Dimensions.get("window")

const SignToVoiceScreen: React.FC = () => {
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedText, setDetectedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  const cameraScale = useSharedValue(1)
  const detectionOpacity = useSharedValue(0)

  const handleDetectionToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    if (!isDetecting) {
      setIsDetecting(true)
      cameraScale.value = withSpring(1.1)
      detectionOpacity.value = withTiming(1)

      // Simulation de détection
      setTimeout(() => {
        setDetectedText("Bonjour, merci beaucoup !")
        setIsDetecting(false)
        cameraScale.value = withSpring(1)
        detectionOpacity.value = withTiming(0)
      }, 3000)
    } else {
      setIsDetecting(false)
      cameraScale.value = withSpring(1)
      detectionOpacity.value = withTiming(0)
    }
  }

  const handlePlayAudio = () => {
    if (!detectedText) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsPlaying(true)

    // Simulation de lecture audio
    setTimeout(() => {
      setIsPlaying(false)
    }, 2000)
  }

  const cameraAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cameraScale.value }],
  }))

  const detectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: detectionOpacity.value,
  }))

  return (
    <LinearGradient colors={["#182825", "#0f1f1c"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Signes → Texte / Voix</Text>
        <Text style={styles.subtitle}>Montrez vos signes pour les traduire</Text>
      </View>

      {/* Zone de détection caméra */}
      <View style={styles.cameraContainer}>
        <Animated.View style={[styles.cameraView, cameraAnimatedStyle]}>
          <LinearGradient colors={["rgba(0, 224, 184, 0.1)", "rgba(0, 224, 184, 0.05)"]} style={styles.cameraGradient}>
            <Ionicons name="videocam" size={60} color="#00E0B8" />
            <Text style={styles.cameraText}>Zone de détection</Text>

            {isDetecting && (
              <Animated.View style={[styles.detectionOverlay, detectionAnimatedStyle]}>
                <View style={styles.detectionFrame} />
                <Text style={styles.detectionText}>Analyse en cours...</Text>
              </Animated.View>
            )}
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Texte détecté */}
      {detectedText ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Traduction détectée :</Text>
          <View style={styles.textBox}>
            <Text style={styles.detectedTextStyle}>{detectedText}</Text>
          </View>

          <TouchableOpacity style={styles.playButton} onPress={handlePlayAudio} disabled={isPlaying}>
            <LinearGradient
              colors={isPlaying ? ["#999", "#666"] : ["#00E0B8", "#00c4a0"]}
              style={styles.playButtonGradient}
            >
              <Ionicons name={isPlaying ? "volume-high" : "play"} size={24} color="#FFFFFF" />
              <Text style={styles.playButtonText}>{isPlaying ? "Lecture..." : "Écouter"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Contrôles */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.detectionButton, isDetecting && styles.detectionButtonActive]}
          onPress={handleDetectionToggle}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDetecting ? ["#FF6B6B", "#FF5252"] : ["#00E0B8", "#00c4a0"]}
            style={styles.detectionButtonGradient}
          >
            <Ionicons name={isDetecting ? "stop" : "hand-left"} size={32} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.instructionText}>
          {isDetecting ? "Détection en cours..." : "Appuyez pour détecter les signes"}
        </Text>
      </View>

      {/* Conseils */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Conseils :</Text>
        <Text style={styles.tipText}>• Placez-vous dans un bon éclairage</Text>
        <Text style={styles.tipText}>• Gardez vos mains visibles</Text>
        <Text style={styles.tipText}>• Effectuez des gestes clairs</Text>
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
  cameraContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  cameraView: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#00E0B8",
  },
  cameraGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraText: {
    fontSize: 16,
    color: "#00E0B8",
    marginTop: 12,
  },
  detectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 224, 184, 0.1)",
  },
  detectionFrame: {
    width: 100,
    height: 100,
    borderWidth: 3,
    borderColor: "#00E0B8",
    borderRadius: 8,
    marginBottom: 12,
  },
  detectionText: {
    fontSize: 14,
    color: "#00E0B8",
    fontWeight: "bold",
  },
  resultContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 12,
  },
  textBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detectedTextStyle: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
  playButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  playButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  detectionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 16,
  },
  detectionButtonActive: {
    shadowColor: "#FF6B6B",
  },
  detectionButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
  },
  tipsContainer: {
    paddingHorizontal: 20,
  },
  tipsTitle: {
    fontSize: 16,
    color: "#00E0B8",
    fontWeight: "bold",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
    marginBottom: 4,
  },
})

export default SignToVoiceScreen
