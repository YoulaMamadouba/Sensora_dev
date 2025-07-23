"use client"

import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
} from "react-native-reanimated"
import { useAuth } from "../context/AuthContext"
import { useNavigation } from "@react-navigation/native"
import * as Haptics from "expo-haptics"

const { width } = Dimensions.get("window")

const HomeScreen: React.FC = () => {
  const { user, userType } = useAuth()
  const navigation = useNavigation()

  const avatarScale = useSharedValue(1)
  const cardOpacity = useSharedValue(0)
  const floatingY = useSharedValue(0)
  const headerOpacity = useSharedValue(0)
  const statsOpacity = useSharedValue(0)
  const quoteOpacity = useSharedValue(0)

  useEffect(() => {
    // Séquence d'animations d'entrée
    headerOpacity.value = withTiming(1, { duration: 800 })
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 1000 }))
    statsOpacity.value = withDelay(600, withTiming(1, { duration: 800 }))
    quoteOpacity.value = withDelay(900, withTiming(1, { duration: 600 }))

    // Animation flottante continue
    floatingY.value = withRepeat(
      withSequence(withTiming(-8, { duration: 2000 }), withTiming(8, { duration: 2000 })),
      -1,
      true,
    )

    // Animation de pulsation de l'avatar
    avatarScale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 1500 }), withTiming(1, { duration: 1500 })),
      -1,
      true,
    )
  }, [])

  const handleModulePress = (moduleName: string, screenName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate(screenName as never)
  }

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }, { translateY: floatingY.value }],
  }))

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [-30, 0]) }],
  }))

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: interpolate(cardOpacity.value, [0, 1], [50, 0]) }],
  }))

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ scale: interpolate(statsOpacity.value, [0, 1], [0.9, 1]) }],
  }))

  const quoteAnimatedStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
  }))

  const modules = [
    {
      id: "voice-to-sign",
      title: "Voix → Signes",
      description: "Convertir la parole en langue des signes",
      icon: "mic",
      color: "#00E0B8",
      screen: "VoiceToSign",
    },
    {
      id: "sign-to-voice",
      title: "Signes → Voix",
      description: "Traduire les signes en texte/voix",
      icon: "hand-left",
      color: "#FF6B6B",
      screen: "SignToVoice",
    },
    {
      id: "health",
      title: "Santé Connectée",
      description: "Surveillance des paramètres vitaux",
      icon: "heart",
      color: "#4ECDC4",
      screen: "Health",
    },
    {
      id: "education",
      title: "Éducation",
      description: "Modules d'apprentissage interactifs",
      icon: "school",
      color: "#45B7D1",
      screen: "Education",
    },
    {
      id: "professional",
      title: "Insertion Pro",
      description: "Outils pour le monde professionnel",
      icon: "briefcase",
      color: "#96CEB4",
      screen: "Professional",
    },
    {
      id: "translation",
      title: "Langues Locales",
      description: "Traduction vers langues guinéennes",
      icon: "language",
      color: "#FFEAA7",
      screen: "Translation",
    },
  ]

  const quotes = [
    "La communication n'a pas de limites",
    "Connecter les mondes à travers la technologie",
    "L'innovation au service de l'accessibilité",
    "Ensemble, brisons les barrières",
  ]

  const todayQuote = quotes[new Date().getDate() % quotes.length]

  return (
    <LinearGradient colors={["#182825", "#0f1f1c", "#182825"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header avec avatar flottant */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
            <LinearGradient colors={["#00E0B8", "#00c4a0"]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
            </LinearGradient>
            <View style={styles.avatarGlow} />
          </Animated.View>

          <Text style={styles.welcomeText}>Bienvenue,</Text>
          <Text style={styles.userName}>{user?.name || "Utilisateur"}</Text>

          <View style={styles.userTypeIndicator}>
            <Ionicons name={userType === "hearing" ? "ear" : "hand-left"} size={16} color="#00E0B8" />
            <Text style={styles.userTypeText}>{userType === "hearing" ? "Mode Entendant" : "Mode Sourd"}</Text>
          </View>

          <Animated.View style={[styles.quoteContainer, quoteAnimatedStyle]}>
            <LinearGradient colors={["rgba(0, 224, 184, 0.1)", "rgba(0, 224, 184, 0.05)"]} style={styles.quoteGradient}>
              <Ionicons name="quote" size={16} color="#00E0B8" />
              <Text style={styles.quote}>"{todayQuote}"</Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Modules Grid */}
        <Animated.View style={[styles.modulesContainer, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Modules Sensora</Text>

          <View style={styles.modulesGrid}>
            {modules.map((module, index) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => handleModulePress(module.id, module.screen)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[`${module.color}20`, `${module.color}10`]} style={styles.moduleGradient}>
                  <View style={styles.moduleContent}>
                    <View style={[styles.moduleIcon, { backgroundColor: module.color }]}>
                      <Ionicons name={module.icon as any} size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>

                    <View style={styles.moduleArrow}>
                      <Ionicons name="arrow-forward" size={16} color={module.color} />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Stats rapides */}
        <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Activité du jour</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["rgba(0, 224, 184, 0.1)", "rgba(0, 224, 184, 0.05)"]}
                style={styles.statGradient}
              >
                <Ionicons name="trending-up" size={24} color="#00E0B8" />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Traductions</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={["rgba(69, 183, 209, 0.1)", "rgba(69, 183, 209, 0.05)"]}
                style={styles.statGradient}
              >
                <Ionicons name="school" size={24} color="#45B7D1" />
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Leçons</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={["rgba(150, 206, 180, 0.1)", "rgba(150, 206, 180, 0.05)"]}
                style={styles.statGradient}
              >
                <Ionicons name="checkmark-circle" size={24} color="#96CEB4" />
                <Text style={styles.statNumber}>95%</Text>
                <Text style={styles.statLabel}>Précision</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Actions rapides */}
        <Animated.View style={[styles.quickActionsContainer, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => handleModulePress("emergency", "Health")}>
              <LinearGradient colors={["#FF6B6B", "#FF5252"]} style={styles.quickActionGradient}>
                <Ionicons name="warning" size={20} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Urgence</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleModulePress("quick-translate", "VoiceToSign")}
            >
              <LinearGradient colors={["#00E0B8", "#00c4a0"]} style={styles.quickActionGradient}>
                <Ionicons name="flash" size={20} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Traduction Rapide</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  avatarGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#00E0B8",
    opacity: 0.2,
    top: -5,
    left: -5,
    zIndex: 1,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  welcomeText: {
    fontSize: 18,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 12,
  },
  userTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 224, 184, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 20,
  },
  userTypeText: {
    fontSize: 12,
    color: "#00E0B8",
    marginLeft: 6,
    fontWeight: "600",
  },
  quoteContainer: {
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 20,
  },
  quoteGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.3)",
  },
  quote: {
    fontSize: 14,
    color: "#FFFFFF",
    fontStyle: "italic",
    textAlign: "center",
    flex: 1,
    marginLeft: 8,
  },
  modulesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 20,
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  moduleCard: {
    width: (width - 60) / 2,
    height: 160,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  moduleGradient: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  moduleContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  moduleTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 16,
  },
  moduleArrow: {
    alignSelf: "flex-end",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
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
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statNumber: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 4,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  quickActionText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default HomeScreen
