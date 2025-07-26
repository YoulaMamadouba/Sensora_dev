"use client"

import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  withSequence,
  withDelay,
} from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import * as Haptics from "expo-haptics"

const { width, height } = Dimensions.get("window")

const UserTypeScreen = () => {
  const navigation = useNavigation()
  const { setUserType } = useAuth()

  const leftCardScale = useSharedValue(1)
  const rightCardScale = useSharedValue(1)
  const leftCardOpacity = useSharedValue(1)
  const rightCardOpacity = useSharedValue(1)
  const leftCardY = useSharedValue(0)
  const rightCardY = useSharedValue(0)
  const titleOpacity = useSharedValue(0)
  const cardsOpacity = useSharedValue(0)

  // Animation d'entrée
  titleOpacity.value = withTiming(1, { duration: 800 })
  cardsOpacity.value = withDelay(400, withTiming(1, { duration: 1000 }))

  const handleUserTypeSelection = (type: "hearing" | "deaf") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setUserType(type)

    // Animation de sélection
    if (type === "hearing") {
      leftCardScale.value = withSequence(withSpring(1.05, { damping: 8 }), withSpring(0.98, { damping: 12 }))
      leftCardY.value = withSpring(-15, { damping: 10 })
      rightCardOpacity.value = withTiming(0.4, { duration: 500 })
      rightCardY.value = withSpring(15, { damping: 10 })
    } else {
      rightCardScale.value = withSequence(withSpring(1.05, { damping: 8 }), withSpring(0.98, { damping: 12 }))
      rightCardY.value = withSpring(-15, { damping: 10 })
      leftCardOpacity.value = withTiming(0.4, { duration: 500 })
      leftCardY.value = withSpring(15, { damping: 10 })
    }

    setTimeout(() => {
      runOnJS(() => navigation.navigate("Auth" as never))()
    }, 1200)
  }

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleOpacity.value === 0 ? -30 : 0 }],
  }))

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }))

  const leftCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftCardScale.value }, { translateY: leftCardY.value }],
    opacity: leftCardOpacity.value,
  }))

  const rightCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightCardScale.value }, { translateY: rightCardY.value }],
    opacity: rightCardOpacity.value,
  }))

  return (
    <LinearGradient colors={["#FFFFFF", "#F1F9F9", "#E8F6F9"]} style={styles.container}>
      {/* Thème innovant : Inclusion universelle */}
      <View style={styles.backgroundPatterns}>
        <View style={styles.universalSigns} />
        <View style={styles.bridgeElements} />
        <View style={styles.harmonyNodes} />
        <View style={styles.connectionPaths} />
        <View style={styles.inclusionSpheres} />
      </View>

      <Animated.View style={[styles.header, titleAnimatedStyle]}>
        <Text style={styles.welcomeText}>Choisissez votre profil</Text>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.subtitle}>Pour une expérience personnalisée</Text>
      </Animated.View>

      <Animated.View style={[styles.cardsContainer, cardsAnimatedStyle]}>
        {/* Carte Entendant */}
        <Animated.View style={[styles.cardWrapper, leftCardAnimatedStyle]}>
          <TouchableOpacity style={styles.card} onPress={() => handleUserTypeSelection("hearing")} activeOpacity={0.9}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                                    <Ionicons name="mic" size={40} color="#029ED6" />
              </View>
              <Text style={[styles.cardTitle, { color: "#029ED6" }]}>Entendant</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Carte Sourd */}
        <Animated.View style={[styles.cardWrapper, rightCardAnimatedStyle]}>
          <TouchableOpacity style={styles.card} onPress={() => handleUserTypeSelection("deaf")} activeOpacity={0.9}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="hand-left" size={40} color="#00E0B8" />
              </View>
              <Text style={styles.cardTitle}>Sourd</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>💡 Modifiable dans les paramètres</Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  decorativeElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  decorativeCircle: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.1)",
    borderRadius: 1000,
  },
  circle1: {
    width: 200,
    height: 200,
    top: 100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 200,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 300,
    left: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 15,
    opacity: 1,
  },
  logoContainer: {
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.3)",
  },
  logo: {
    width: 300,
    height: 180,
  },
  subtitle: {
    fontSize: 16,
    color: "#146454",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 22,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    gap: 20,
  },
  cardWrapper: {
    flex: 1,
    alignItems: "center",
  },
  card: {
    width: "100%",
    height: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(20, 100, 84, 0.3)",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(20, 100, 84, 0.3)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#146454",
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
  },
  // Thème innovant : Inclusion universelle
  backgroundPatterns: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
    pointerEvents: "none",
  },
  universalSigns: {
    position: "absolute",
    top: "8%",
    left: "10%",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(2, 158, 214, 0.08)",
    borderWidth: 2,
    borderColor: "rgba(2, 158, 214, 0.2)",
    pointerEvents: "none",
  },
  bridgeElements: {
    position: "absolute",
    top: "15%",
    right: "12%",
    width: 120,
    height: 3,
    backgroundColor: "rgba(20, 100, 84, 0.06)",
    borderRadius: 1.5,
    transform: [{ rotate: "20deg" }],
    pointerEvents: "none",
  },
  harmonyNodes: {
    position: "absolute",
    bottom: "30%",
    left: "8%",
    width: 20,
    height: 20,
    backgroundColor: "rgba(2, 158, 214, 0.1)",
    borderRadius: 10,
    pointerEvents: "none",
  },
  connectionPaths: {
    position: "absolute",
    bottom: "25%",
    right: "10%",
    width: 100,
    height: 4,
    backgroundColor: "rgba(20, 100, 84, 0.05)",
    borderRadius: 2,
    transform: [{ rotate: "-15deg" }],
    pointerEvents: "none",
  },
  inclusionSpheres: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(20, 100, 84, 0.03)",
    transform: [{ translateX: -75 }, { translateY: -75 }],
    pointerEvents: "none",
  },
})

export default UserTypeScreen
