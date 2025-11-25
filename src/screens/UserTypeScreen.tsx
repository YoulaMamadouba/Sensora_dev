"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  withSequence,
} from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import { impactAsync } from "../utils/platformUtils"

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
    impactAsync()
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
    height: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(20, 100, 84, 0.15)",
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(20, 100, 84, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(20, 100, 84, 0.2)",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#146454",
    textAlign: "center",
    letterSpacing: 0.5,
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
})

export default UserTypeScreen
