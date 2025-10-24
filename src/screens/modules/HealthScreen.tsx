"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, StatusBar } from "react-native"
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
} from "react-native-reanimated"
import { useRoute } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"
import * as Haptics from "expo-haptics"

const { width, height } = Dimensions.get("window")

interface HealthData {
  heartRate: number
  stress: number
  soundLevel: number
  steps: number
  bloodPressure: number
  oxygenLevel: number
  temperature: number
  sleepQuality: number
}

const HealthScreen: React.FC = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const [currentModule, setCurrentModule] = useState("health")
  const [healthData, setHealthData] = useState<HealthData>({
    heartRate: 72,
    stress: 25,
    soundLevel: 45,
    steps: 8432,
    bloodPressure: 120,
    oxygenLevel: 98,
    temperature: 36.8,
    sleepQuality: 85,
  })
  const [selectedMetric, setSelectedMetric] = useState<string>("heartRate")
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Animations values
  const heartScale = useSharedValue(1)
  const alertOpacity = useSharedValue(0)
  const backgroundScale = useSharedValue(1)
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0)
  const progressValue = useSharedValue(0)
  const metricScale = useSharedValue(1)

  // Animation d'entrée
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 })
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 1000 }))
    backgroundScale.value = withSpring(1, { damping: 15, stiffness: 100 })
  }, [])

  useEffect(() => {
    // Animation du cœur
    heartScale.value = withRepeat(
      withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      ),
      -1,
      false,
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

    // Simulation de données en temps réel
    const interval = setInterval(() => {
      setHealthData((prev) => ({
        heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
        stress: Math.max(0, Math.min(100, prev.stress + (Math.random() - 0.5) * 10)),
        soundLevel: Math.max(0, Math.min(100, prev.soundLevel + (Math.random() - 0.5) * 15)),
        steps: prev.steps + Math.floor(Math.random() * 3),
        bloodPressure: Math.max(110, Math.min(140, prev.bloodPressure + (Math.random() - 0.5) * 6)),
        oxygenLevel: Math.max(95, Math.min(100, prev.oxygenLevel + (Math.random() - 0.5) * 2)),
        temperature: Math.max(36.0, Math.min(37.5, prev.temperature + (Math.random() - 0.5) * 0.3)),
        sleepQuality: Math.max(70, Math.min(100, prev.sleepQuality + (Math.random() - 0.5) * 5)),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Alerte si stress élevé
    if (healthData.stress > 70) {
      alertOpacity.value = withTiming(1)
    } else {
      alertOpacity.value = withTiming(0)
    }
  }, [healthData.stress])

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  const alertAnimatedStyle = useAnimatedStyle(() => ({
    opacity: alertOpacity.value,
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

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const metricAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: metricScale.value }],
  }))

  const getStressColor = (level: number) => {
    if (level < 30) return "#146454"
    if (level < 60) return "#029ED6"
    return "#FF4757"
  }

  const getSoundLevelColor = (level: number) => {
    if (level < 40) return "#146454"
    if (level < 70) return "#029ED6"
    return "#FF4757"
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "heartRate":
        return "#146454"
      case "stress":
        return "#029ED6"
      case "soundLevel":
        return "#146454"
      case "steps":
        return "#029ED6"
      case "bloodPressure":
        return "#146454"
      case "oxygenLevel":
        return "#029ED6"
      case "temperature":
        return "#146454"
      case "sleepQuality":
        return "#029ED6"
      default:
        return "#146454"
    }
  }

  const handleMetricPress = (metric: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedMetric(metric)
    metricScale.value = withSpring(1.1, { damping: 8 })
    setTimeout(() => {
      metricScale.value = withSpring(1, { damping: 12 })
    }, 200)
  }

  const handleMonitoringToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsMonitoring(!isMonitoring)
  }

  // Contenu pour le module Voix → Signes
  const renderVoiceToSign = () => (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[styles.backgroundGradient, backgroundAnimatedStyle]}>
        <LinearGradient colors={["#FFFFFF", "#F8F9FA", "#FFFFFF"]} style={styles.gradient} />
      </Animated.View>

      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <LinearGradient colors={["#146454", "#029ED6"]} style={styles.backButtonGradient}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Voix → Langue des Signes</Text>
          <Text style={styles.subtitle}>Parlez et voyez la traduction en signes en temps réel</Text>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={contentAnimatedStyle}>
          <View style={styles.avatarContainer}>
            <Animated.View style={[styles.avatarGlow, glowAnimatedStyle]} />
            <Animated.View style={[styles.avatar, heartAnimatedStyle]}>
              <LinearGradient colors={["#146454", "#029ED6"]} style={styles.avatarGradient}>
                <Ionicons name="person" size={60} color="#FFFFFF" />
              </LinearGradient>
              <Animated.View style={[styles.avatarPulse, pulseAnimatedStyle]} />
            </Animated.View>
          </View>

          <View style={styles.textContainer}>
            <LinearGradient
              colors={["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]}
              style={styles.textGradient}
            >
              <Text style={styles.transcribedText}>Bonjour, comment allez-vous aujourd'hui ?</Text>
            </LinearGradient>

            <View style={styles.signTranslation}>
              <Text style={styles.signText}>🤟 👋 ✋ 👍 🤝</Text>
              <Text style={styles.signDescription}>Traduction en langue des signes</Text>
            </View>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.micButton} activeOpacity={0.8}>
              <LinearGradient colors={["#146454", "#029ED6"]} style={styles.micButtonGradient}>
                <Ionicons name="mic" size={40} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.instructionText}>Appuyez pour commencer</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )

  // Contenu pour le module Insertion Pro
  const renderProfessional = () => (
    <LinearGradient colors={["#FFFFFF", "#FFFFFF", "#FFFFFF"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Insertion Professionnelle</Text>
          <Text style={styles.subtitle}>Outils pour le monde professionnel</Text>
        </View>

        <View style={styles.professionalContainer}>
          <View style={styles.professionalCard}>
            <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.cardGradient}>
              <Ionicons name="briefcase" size={32} color="#146454" />
              <Text style={styles.cardTitle}>CV Builder</Text>
              <Text style={styles.cardDescription}>Créer un CV adapté</Text>
            </LinearGradient>
          </View>

          <View style={styles.professionalCard}>
            <LinearGradient colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} style={styles.cardGradient}>
              <Ionicons name="chatbubbles" size={32} color="#029ED6" />
              <Text style={styles.cardTitle}>Entretien</Text>
              <Text style={styles.cardDescription}>Simulation d'entretien</Text>
            </LinearGradient>
          </View>

          <View style={styles.professionalCard}>
            <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.cardGradient}>
              <Ionicons name="school" size={32} color="#146454" />
              <Text style={styles.cardTitle}>Formation</Text>
              <Text style={styles.cardDescription}>Cours professionnels</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )

  // Contenu par défaut pour la santé
  const renderHealth = () => (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[styles.backgroundGradient, backgroundAnimatedStyle]}>
        <LinearGradient colors={["#FFFFFF", "#F8F9FA", "#FFFFFF"]} style={styles.gradient} />
      </Animated.View>

      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Surveillance Santé</Text>
          <Text style={styles.subtitle}>Paramètres vitaux en temps réel</Text>
        </View>
        
        <TouchableOpacity style={styles.monitoringButton} onPress={handleMonitoringToggle}>
          <LinearGradient 
            colors={isMonitoring ? ["#FF4757", "#FF3742"] : ["#146454", "#029ED6"]} 
            style={styles.monitoringButtonGradient}
          >
            <Ionicons name={isMonitoring ? "stop" : "play"} size={20} color="#FFFFFF" />
            <Text style={styles.monitoringText}>{isMonitoring ? "Arrêter" : "Démarrer"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={contentAnimatedStyle}>
          {/* Alerte stress */}
          <Animated.View style={[styles.alertContainer, alertAnimatedStyle]}>
            <LinearGradient colors={["#FF4757", "#FF3742"]} style={styles.alertGradient}>
              <Ionicons name="warning" size={24} color="#FFFFFF" />
              <Text style={styles.alertText}>Niveau de stress élevé détecté</Text>
            </LinearGradient>
          </Animated.View>

          {/* Métrique principale */}
          <View style={styles.mainMetricContainer}>
            <Animated.View style={[styles.mainMetricCard, metricAnimatedStyle]}>
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.mainMetricGradient}>
                <Animated.View style={[styles.heartIcon, heartAnimatedStyle]}>
                  <LinearGradient colors={["#146454", "#029ED6"]} style={styles.heartGradient}>
                    <Ionicons name="heart" size={40} color="#FFFFFF" />
                  </LinearGradient>
                  <Animated.View style={[styles.heartPulse, pulseAnimatedStyle]} />
                </Animated.View>
                <Text style={styles.mainMetricValue}>{healthData.heartRate.toFixed(2)}</Text>
                <Text style={styles.mainMetricLabel}>Battements/min</Text>
                <Text style={styles.mainMetricStatus}>Normal</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Grille de métriques */}
          <View style={styles.metricsGrid}>
                        {[
              { key: "stress", icon: "pulse", value: `${healthData.stress.toFixed(2)}%`, label: "Stress", color: getStressColor(healthData.stress) },
              { key: "soundLevel", icon: "volume-high", value: `${healthData.soundLevel.toFixed(2)}dB`, label: "Son", color: getSoundLevelColor(healthData.soundLevel) },
              { key: "steps", icon: "footsteps", value: healthData.steps.toLocaleString(), label: "Pas", color: "#146454" },
              { key: "bloodPressure", icon: "thermometer", value: `${healthData.bloodPressure.toFixed(2)}/80`, label: "Tension", color: "#029ED6" },
              { key: "oxygenLevel", icon: "leaf", value: `${healthData.oxygenLevel.toFixed(2)}%`, label: "Oxygène", color: "#146454" },
              { key: "temperature", icon: "thermometer", value: `${healthData.temperature.toFixed(2)}°C`, label: "Température", color: "#029ED6" },
            ].map((metric) => (
              <TouchableOpacity
                key={metric.key}
                style={[styles.metricCard, selectedMetric === metric.key && styles.metricCardSelected]}
                onPress={() => handleMetricPress(metric.key)}
                activeOpacity={0.8}
              >
                <LinearGradient 
                  colors={selectedMetric === metric.key ? ["rgba(20, 100, 84, 0.15)", "rgba(2, 158, 214, 0.1)"] : ["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]} 
                  style={styles.metricGradient}
                >
                  <Ionicons name={metric.icon as any} size={24} color={metric.color} />
                  <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Graphique de tendance */}
          <View style={styles.trendContainer}>
            <Text style={styles.trendTitle}>Tendance sur 24h</Text>
            <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.trendBox}>
              <View style={styles.trendChart}>
                {[...Array(24)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.trendBar,
                      {
                        height: 20 + Math.random() * 60,
                        backgroundColor: index % 2 === 0 ? "#146454" : "#029ED6",
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.trendDescription}>Activité cardiaque stable</Text>
            </LinearGradient>
          </View>

          {/* Conseils de santé */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Conseils de santé</Text>
            <View style={styles.tipsGrid}>
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.tipCard}>
                <Ionicons name="water" size={24} color="#146454" />
                <Text style={styles.tipTitle}>Hydratation</Text>
                <Text style={styles.tipText}>Buvez 8 verres d'eau par jour</Text>
              </LinearGradient>
              
              <LinearGradient colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} style={styles.tipCard}>
                <Ionicons name="bed" size={24} color="#029ED6" />
                <Text style={styles.tipTitle}>Sommeil</Text>
                <Text style={styles.tipText}>7-9 heures de sommeil recommandées</Text>
              </LinearGradient>
              
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.tipCard}>
                <Ionicons name="fitness" size={24} color="#146454" />
                <Text style={styles.tipTitle}>Exercice</Text>
                <Text style={styles.tipText}>30 min d'activité quotidienne</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )

  // Déterminer quel contenu afficher
  const renderContent = () => {
    switch (currentModule) {
      case "voice-to-sign":
        return renderVoiceToSign()
      case "professional":
        return renderProfessional()
      default:
        return renderHealth()
    }
  }

  return renderContent()
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(20, 100, 84, 0.1)",
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
  monitoringButton: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  monitoringButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  monitoringText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
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
  },
  micButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "#146454",
    marginTop: 20,
    opacity: 0.8,
    fontWeight: "600",
    textAlign: "center",
  },
  alertContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  alertGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  alertText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  mainMetricContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  mainMetricCard: {
    borderRadius: 20,
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  mainMetricGradient: {
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },
  heartIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  heartGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartPulse: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#029ED6",
    opacity: 0.2,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  mainMetricValue: {
    fontSize: 48,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 8,
  },
  mainMetricLabel: {
    fontSize: 16,
    color: "#146454",
    opacity: 0.7,
    marginBottom: 4,
  },
  mainMetricStatus: {
    fontSize: 14,
    color: "#146454",
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  metricCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 120,
  },
  metricCardSelected: {
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  metricGradient: {
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderRadius: 16,
    height: 120,
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
  trendContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  trendTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 12,
  },
  trendBox: {
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
  trendChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 80,
    marginBottom: 12,
  },
  trendBar: {
    width: 8,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  trendDescription: {
    fontSize: 14,
    color: "#146454",
    textAlign: "center",
    fontWeight: "500",
  },
  tipsContainer: {
    paddingHorizontal: 20,
  },
  tipsTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 16,
  },
  tipsGrid: {
    gap: 12,
  },
  tipCard: {
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
    alignItems: "center",
  },
  tipTitle: {
    fontSize: 16,
    color: "#146454",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 16,
  },
  professionalContainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  professionalCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.2)",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: "#146454",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
  },
  healthContent: {
    paddingHorizontal: 20,
  },
  healthText: {
    fontSize: 16,
    color: "#146454",
    textAlign: "center",
  },
})

export default HealthScreen
