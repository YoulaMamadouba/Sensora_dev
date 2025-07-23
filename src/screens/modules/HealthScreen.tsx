"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated"

const { width } = Dimensions.get("window")

interface HealthData {
  heartRate: number
  stress: number
  soundLevel: number
  steps: number
}

const HealthScreen: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData>({
    heartRate: 72,
    stress: 25,
    soundLevel: 45,
    steps: 8432,
  })

  const heartScale = useSharedValue(1)
  const alertOpacity = useSharedValue(0)

  useEffect(() => {
    // Animation du cœur
    heartScale.value = withRepeat(
      withSequence(withTiming(1.2, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      false,
    )

    // Simulation de données en temps réel
    const interval = setInterval(() => {
      setHealthData((prev) => ({
        heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
        stress: Math.max(0, Math.min(100, prev.stress + (Math.random() - 0.5) * 10)),
        soundLevel: Math.max(0, Math.min(100, prev.soundLevel + (Math.random() - 0.5) * 15)),
        steps: prev.steps + Math.floor(Math.random() * 3),
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

  const getStressColor = (level: number) => {
    if (level < 30) return "#4ECDC4"
    if (level < 60) return "#FFE066"
    return "#FF6B6B"
  }

  const getSoundLevelColor = (level: number) => {
    if (level < 40) return "#4ECDC4"
    if (level < 70) return "#FFE066"
    return "#FF6B6B"
  }

  return (
    <LinearGradient colors={["#182825", "#0f1f1c"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Surveillance Santé</Text>
          <Text style={styles.subtitle}>Paramètres vitaux en temps réel</Text>
        </View>

        {/* Alerte stress */}
        <Animated.View style={[styles.alertContainer, alertAnimatedStyle]}>
          <LinearGradient colors={["#FF6B6B", "#FF5252"]} style={styles.alertGradient}>
            <Ionicons name="warning" size={24} color="#FFFFFF" />
            <Text style={styles.alertText}>Niveau de stress élevé détecté</Text>
          </LinearGradient>
        </Animated.View>

        {/* Rythme cardiaque */}
        <View style={styles.cardContainer}>
          <LinearGradient colors={["rgba(255, 107, 107, 0.1)", "rgba(255, 107, 107, 0.05)"]} style={styles.card}>
            <View style={styles.cardHeader}>
              <Animated.View style={heartAnimatedStyle}>
                <Ionicons name="heart" size={32} color="#FF6B6B" />
              </Animated.View>
              <Text style={styles.cardTitle}>Rythme Cardiaque</Text>
            </View>
            <Text style={styles.cardValue}>{Math.round(healthData.heartRate)}</Text>
            <Text style={styles.cardUnit}>BPM</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(healthData.heartRate / 100) * 100}%`,
                    backgroundColor: "#FF6B6B",
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Niveau de stress */}
        <View style={styles.cardContainer}>
          <LinearGradient colors={["rgba(255, 224, 102, 0.1)", "rgba(255, 224, 102, 0.05)"]} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={32} color={getStressColor(healthData.stress)} />
              <Text style={styles.cardTitle}>Niveau de Stress</Text>
            </View>
            <Text style={styles.cardValue}>{Math.round(healthData.stress)}</Text>
            <Text style={styles.cardUnit}>%</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${healthData.stress}%`,
                    backgroundColor: getStressColor(healthData.stress),
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Niveau sonore */}
        <View style={styles.cardContainer}>
          <LinearGradient colors={["rgba(0, 224, 184, 0.1)", "rgba(0, 224, 184, 0.05)"]} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="volume-high" size={32} color={getSoundLevelColor(healthData.soundLevel)} />
              <Text style={styles.cardTitle}>Niveau Sonore</Text>
            </View>
            <Text style={styles.cardValue}>{Math.round(healthData.soundLevel)}</Text>
            <Text style={styles.cardUnit}>dB</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${healthData.soundLevel}%`,
                    backgroundColor: getSoundLevelColor(healthData.soundLevel),
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Activité physique */}
        <View style={styles.cardContainer}>
          <LinearGradient colors={["rgba(150, 206, 180, 0.1)", "rgba(150, 206, 180, 0.05)"]} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="walk" size={32} color="#96CEB4" />
              <Text style={styles.cardTitle}>Pas Aujourd'hui</Text>
            </View>
            <Text style={styles.cardValue}>{healthData.steps.toLocaleString()}</Text>
            <Text style={styles.cardUnit}>pas</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((healthData.steps / 10000) * 100, 100)}%`,
                    backgroundColor: "#96CEB4",
                  },
                ]}
              />
            </View>
            <Text style={styles.goalText}>Objectif: 10,000 pas</Text>
          </LinearGradient>
        </View>

        {/* Graphique simulé */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Évolution du rythme cardiaque</Text>
          <View style={styles.chart}>
            <LinearGradient
              colors={["rgba(255, 107, 107, 0.1)", "rgba(255, 107, 107, 0.05)"]}
              style={styles.chartGradient}
            >
              <View style={styles.chartLine}>
                {[...Array(10)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.chartBar,
                      {
                        height: Math.random() * 60 + 20,
                        backgroundColor: "#FF6B6B",
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.chartLabel}>Dernières 24h</Text>
            </LinearGradient>
          </View>
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
  },
  alertContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  alertGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  alertText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 12,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 12,
  },
  cardValue: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  cardUnit: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  goalText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 16,
  },
  chart: {
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
  },
  chartGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  chartLine: {
    flexDirection: "row",
    alignItems: "end",
    justifyContent: "space-between",
    height: 80,
    marginBottom: 12,
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
})

export default HealthScreen
