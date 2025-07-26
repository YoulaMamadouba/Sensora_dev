"use client"

import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from "react-native"
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
  const notificationScale = useSharedValue(1)

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

    // Animation de notification
    notificationScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true,
    )
  }, [])

  const handleModulePress = (moduleName: string, screenName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Navigation conditionnelle selon le module
    switch (moduleName) {
      case "voice-to-sign":
        // Naviguer directement vers le module VoiceToSign
        navigation.navigate("VoiceToSign" as never)
        break
      case "sign-to-voice":
        // Naviguer directement vers le module SignToVoice
        navigation.navigate("SignToVoice" as never)
        break
      case "health":
        navigation.navigate("Health" as never)
        break
      case "education":
        navigation.navigate("Education" as never)
        break
                  case "professional":
              navigation.navigate("Professional" as never)
              break
      case "translation":
        navigation.navigate("Translation" as never)
        break
      default:
        navigation.navigate(screenName as never)
    }
  }

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }, { translateY: floatingY.value }] as any,
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

  const notificationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: notificationScale.value }],
  }))

  const modules = [
    {
      id: "voice-to-sign",
      title: "Voix → Signes",
      description: "Convertir la parole en langue des signes avec précision",
      icon: "mic",
      color: "#146454", // Couleur primaire
      screen: "Health",
    },
    {
      id: "sign-to-voice",
      title: "Signes → Voix",
      description: "Traduire les signes en texte et voix claire",
      icon: "hand-left",
      color: "#029ED6", // Couleur secondaire
      screen: "Education",
    },
    {
      id: "health",
      title: "Santé Connectée",
      description: "Surveillance des paramètres vitaux",
      icon: "heart",
      color: "#146454", // Couleur primaire
      screen: "Health",
    },
    {
      id: "education",
      title: "Éducation",
      description: "Modules d'apprentissage interactifs",
      icon: "school",
      color: "#029ED6", // Couleur secondaire
      screen: "Education",
    },
    {
      id: "professional",
      title: "Insertion Pro",
      description: "Outils pour le monde professionnel",
      icon: "briefcase",
      color: "#146454", // Couleur primaire
      screen: "Health",
    },
    {
      id: "translation",
      title: "Langues Locales",
      description: "Traduction vers langues guinéennes",
      icon: "language",
      color: "#029ED6", // Couleur secondaire
      screen: "Education",
    },
  ]

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#FFFFFF", "#FFFFFF"]} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header avec logo et icônes premium */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          {/* Logo Sensora à gauche - PUSHÉ À GAUCHE */}
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Icônes premium à droite */}
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Animated.View style={[styles.notificationContainer, notificationAnimatedStyle]}>
                <Ionicons name="notifications" size={24} color="#146454" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>5</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings" size={24} color="#146454" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Avatar et informations utilisateur */}
        <Animated.View style={[styles.userSection, headerAnimatedStyle]}>
          <Animated.View style={[styles.avatarContainer, avatarAnimatedStyle]}>
            <LinearGradient colors={["#146454", "#029ED6"]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
            </LinearGradient>
            <View style={styles.avatarGlow} />
          </Animated.View>

          <Text style={styles.welcomeText}>Bienvenue,</Text>
          <Text style={styles.userName}>{user?.name || "Utilisateur"}</Text>

          <View style={styles.userTypeIndicator}>
            <Ionicons name={userType === "hearing" ? "ear" : "hand-left"} size={16} color="#146454" />
            <Text style={styles.userTypeText}>{userType === "hearing" ? "Mode Entendant" : "Mode Sourd"}</Text>
          </View>

          <Animated.View style={[styles.quoteContainer, quoteAnimatedStyle]}>
            <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.quoteGradient}>
              <Ionicons name="chatbubble" size={16} color="#146454" />
              <Text style={styles.quote}>"Donnez une voix au silence et ouvrez les portes de la communication"</Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Modules Grid Ultra Premium */}
        <Animated.View style={[styles.modulesContainer, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Modules Sensora</Text>

          <View style={styles.modulesGrid}>
            {modules.map((module, index) => (
              <Animated.View key={module.id} style={[styles.moduleCard, cardAnimatedStyle]}>
                <TouchableOpacity
                  style={styles.moduleCard}
                  onPress={() => handleModulePress(module.id, module.screen)}
                  activeOpacity={0.8}
                >
                  <View style={styles.moduleContent}>
                    <View style={styles.moduleIconContainer}>
                      <Ionicons name={module.icon as any} size={28} color={module.color} />
                    </View>
                    
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    
                    <Text style={styles.moduleDescription} numberOfLines={4}>{module.description}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Stats rapides */}
        <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Activité du jour</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["rgba(20, 100, 84, 0.1)", "rgba(20, 100, 84, 0.05)"]}
                style={styles.statGradient}
              >
                <Ionicons name="trending-up" size={24} color="#146454" />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Traductions</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={["rgba(2, 158, 214, 0.1)", "rgba(2, 158, 214, 0.05)"]}
                style={styles.statGradient}
              >
                <Ionicons name="school" size={24} color="#029ED6" />
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Leçons</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={["rgba(20, 100, 84, 0.1)", "rgba(20, 100, 84, 0.05)"]}
                style={styles.statGradient}
              >
                <Ionicons name="checkmark-circle" size={24} color="#146454" />
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
              <LinearGradient colors={["#FF0000", "#FF0000"]} style={styles.quickActionGradient}>
                <Ionicons name="warning" size={16} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Urgence</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleModulePress("quick-translate", "VoiceToSign")}
            >
              <LinearGradient colors={["#146454", "#029ED6"]} style={styles.quickActionGradient}>
                <Ionicons name="flash" size={16} color="#FFFFFF" />
                <Text style={styles.quickActionText}>Traduction Rapide</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  logoBackground: {
    position: "absolute",
    top: 40,
    left: -80,
    zIndex: -1,
    opacity: 0.15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginTop: 20,
  },
  logoContainer: {
    flex: 0,
    paddingLeft: -20, // PUSHÉ À GAUCHE
  },
  // LOGO DIMENSIONS EXACTES COMME CARROUSEL
  logo: {
    width: 320, // Même dimension que carouselLogo
    height: 190, // Même dimension que carouselLogo
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  notificationContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#029ED6",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  userSection: {
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
    backgroundColor: "#146454",
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
    color: "#146454",
    opacity: 0.8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 12,
  },
  userTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 20,
  },
  userTypeText: {
    fontSize: 12,
    color: "#146454",
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
    borderColor: "rgba(20, 100, 84, 0.3)",
  },
  quote: {
    fontSize: 14,
    color: "#146454",
    fontStyle: "italic",
    textAlign: "center",
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  modulesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#146454",
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
    height: 200,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#029ED6",
    shadowColor: "#146454",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
  },
  moduleGradient: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.1)",
  },
  moduleContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    minHeight: 200,
  },
  moduleIconContainer: {
    marginBottom: 12,
  },
  moduleSpacer: {
    height: 8,
  },
  moduleTopSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  moduleTextSection: {
    flex: 1,
    marginLeft: 12,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  moduleDescription: {
    fontSize: 15,
    color: "#146454",
    opacity: 0.9,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 8,
    flex: 1,
    paddingHorizontal: 4,
  },
  moduleIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    marginHorizontal: 6,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statGradient: {
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.1)",
  },
  statNumber: {
    fontSize: 24,
    color: "#146454",
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#146454",
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
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  quickActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: "100%",
    height: "100%",
  },
  quickActionText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 6,
  },
})

export default HomeScreen
