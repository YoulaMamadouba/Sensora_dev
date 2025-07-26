"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, Text, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

const IntroScreen: React.FC = () => {
  const navigation = useNavigation()
  const [showCarousel, setShowCarousel] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Animation values
  const logoScale = useSharedValue(0)
  const logoRotation = useSharedValue(-180)
  const logoOpacity = useSharedValue(0)
  const glowScale = useSharedValue(0)
  const glowOpacity = useSharedValue(0)
  const blurIntensity = useSharedValue(100)
  const particleOpacity = useSharedValue(0)
  const backgroundScale = useSharedValue(1.2)
  const buttonOpacity = useSharedValue(0)
  const buttonScale = useSharedValue(0.8)
  const carouselOpacity = useSharedValue(0)
  const carouselScale = useSharedValue(0.8)

  const features = [
    {
      id: 1,
      title: "Traduction Intelligente",
      description: "IA avancée pour convertir instantanément la parole en langue des signes",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=90",
      icon: "mic"
    },
    {
      id: 2,
      title: "Santé Connectée",
      description: "Surveillance en temps réel de vos paramètres vitaux avec alertes intelligentes",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=90",
      icon: "heart"
    },
    {
      id: 3,
      title: "Éducation Interactive",
      description: "Modules d'apprentissage progressifs avec réalité augmentée",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=90",
      icon: "school"
    },
    {
      id: 4,
      title: "Insertion Professionnelle",
      description: "Outils spécialisés pour l'intégration dans le monde professionnel",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=90",
      icon: "briefcase"
    }
  ]

  const navigateToNext = () => {
    if (!showCarousel) {
      setShowCarousel(true)
      carouselOpacity.value = withTiming(1, { duration: 800 })
      carouselScale.value = withSpring(1, { damping: 12, stiffness: 100 })
    } else {
      navigation.navigate("UserType" as never)
    }
  }

  const nextSlide = () => {
    if (currentSlide < features.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      navigation.navigate("UserType" as never)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  useEffect(() => {
    // Séquence d'animation "crazy" du logo
    const startAnimation = () => {
      // Background zoom out
      backgroundScale.value = withTiming(1, { duration: 2000 })

      // Blur progressif
      blurIntensity.value = withTiming(0, { duration: 1500 })

      // Logo apparition avec rotation et zoom
      logoOpacity.value = withTiming(1, { duration: 800 })
      logoScale.value = withSequence(
        withTiming(0.3, { duration: 200 }),
        withSpring(1.3, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 150 }),
      )

      // Rotation "crazy"
      logoRotation.value = withSequence(
        withTiming(360, { duration: 1200 }),
        withTiming(720, { duration: 800 }),
        withSpring(0, { damping: 15 }),
      )

      // Glow effect
      setTimeout(() => {
        glowOpacity.value = withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.4, { duration: 400 }),
          withTiming(1, { duration: 600 }),
          withTiming(0.6, { duration: 400 }),
        )
        glowScale.value = withSequence(
          withSpring(1.5, { damping: 10 }),
          withSpring(1.2, { damping: 8 }),
          withSpring(1.8, { damping: 6 }),
          withSpring(1, { damping: 12 }),
        )
      }, 1000)

      // Particules
      setTimeout(() => {
        particleOpacity.value = withTiming(1, { duration: 800 })
      }, 1800)

      // Bouton apparaît après les animations
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, { duration: 600 })
        buttonScale.value = withSpring(1, { damping: 12, stiffness: 100 })
      }, 3000)
    }

    startAnimation()
  }, [])

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const logoRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoRotation.value}deg` }],
  }))

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }))

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }))

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }))

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(blurIntensity.value, [0, 100], [0, 1], Extrapolate.CLAMP),
  }))

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }))

  const carouselAnimatedStyle = useAnimatedStyle(() => ({
    opacity: carouselOpacity.value,
    transform: [{ scale: carouselScale.value }],
  }))

  if (showCarousel) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#FFFFFF", "#F3FAF8", "#E8F6F9"]} style={styles.container}>
          <View style={styles.carouselContainer}>
            {/* Motifs décoratifs subtils et émotionnellement positifs */}
            <View style={styles.backgroundPatterns}>
              <View style={styles.wavePattern1} />
              <View style={styles.wavePattern2} />
              <View style={styles.communicationCircles} />
              <View style={styles.inclusionDots} />
            </View>
            
            {/* Logo Sensora en haut */}
            <View style={styles.carouselLogoContainer}>
              <Image source={require("../../assets/logo.png")} style={styles.carouselLogo} resizeMode="contain" />
            </View>
            
            <Animated.View style={[styles.carousel, carouselAnimatedStyle]}>
              {/* Slide principal avec effet 3D */}
              <View style={styles.slideContainer}>
                <Image 
                  source={{ uri: features[currentSlide].image }} 
                  style={styles.featureImage}
                  resizeMode="cover"
                />
                
                {/* Overlay avec gradient moderne */}
                                  <LinearGradient
                    colors={["transparent", "rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.9)"]}
                    style={styles.slideGradient}
                  />
                
                {/* Contenu du slide */}
                <View style={styles.slideContent}>
                  {/* Icône flottante avec glow */}
                  <View style={styles.iconContainer}>
                    <View style={styles.iconGlow} />
                    <View style={styles.iconBackground}>
                      <Ionicons name={features[currentSlide].icon as any} size={36} color="#FFFFFF" />
                    </View>
                  </View>
                  
                  {/* Titre avec effet de texte */}
                  <Text style={styles.slideTitle}>{features[currentSlide].title}</Text>
                  <Text style={styles.slideDescription}>{features[currentSlide].description}</Text>
                </View>
              </View>

              {/* Indicateurs de progression modernes */}
              <View style={styles.progressContainer}>
                {features.map((_, index) => (
                  <View key={index} style={styles.progressItem}>
                    <View
                      style={[
                        styles.progressBar,
                        index === currentSlide && styles.progressBarActive
                      ]}
                    />
                    <Text style={styles.progressText}>{index + 1}</Text>
                  </View>
                ))}
              </View>

                            {/* Contrôles de navigation innovants */}
              <View style={styles.navigationContainer}>
                {/* Flèche de retour uniquement */}
                {currentSlide > 0 && (
                  <TouchableOpacity style={styles.backArrowButton} onPress={prevSlide} activeOpacity={0.8} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <LinearGradient
                      colors={["rgba(20, 100, 84, 0.2)", "rgba(20, 100, 84, 0.1)"]}
                      style={styles.backArrowGradient}
                    >
                      <Ionicons name="chevron-back" size={24} color="#146454" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Bouton principal avec design futuriste */}
                <TouchableOpacity style={styles.mainButton} onPress={nextSlide} activeOpacity={0.8} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <LinearGradient
                    colors={["#146454", "#0F4A3A", "#0A3A2A"]}
                    style={styles.mainButtonGradient}
                  >
                    <View style={styles.buttonGlow} />
                    <Text style={styles.mainButtonText}>
                      {currentSlide === features.length - 1 ? "Commencer l'Expérience" : "Découvrir la Suite"}
                    </Text>
                    <Ionicons 
                      name={currentSlide === features.length - 1 ? "rocket" : "arrow-forward"} 
                      size={24} 
                      color="#029ED6" 
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Background animé */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={["#FFFFFF", "#F3FAF8", "#E8F6F9", "#E0F4F7"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Blur overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, blurAnimatedStyle]}>
        <BlurView intensity={50} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Particules flottantes */}
      <Animated.View style={[styles.particlesContainer, particleAnimatedStyle]}>
        {[...Array(20)].map((_, index) => (
          <View
            key={index}
                          style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                },
              ]}
          />
        ))}
      </Animated.View>

      <View style={styles.content}>
        {/* Glow Effect */}
        <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
          <LinearGradient colors={["#146454", "rgba(20, 100, 84, 0.3)", "transparent"]} style={styles.glow} />
        </Animated.View>

        {/* Logo Container */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle, logoRotationStyle]}>
          <View style={styles.logoWrapper}>
            <Image source={require("../../assets/logo.png")} style={styles.logoImage} resizeMode="contain" />
          </View>
        </Animated.View>

        {/* Cercles décoratifs */}
        <Animated.View style={[styles.decorativeCircles, particleAnimatedStyle]}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </Animated.View>

        {/* Bouton Continuer */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity style={styles.continueButton} onPress={navigateToNext} activeOpacity={0.8}>
            <LinearGradient
              colors={["#146454", "#0F4A3A"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Découvrir Sensora</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glowContainer: {
    position: "absolute",
    width: 400,
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  logoContainer: {
    zIndex: 10,
  },
  logoWrapper: {
    width: 550,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    backgroundColor: "#029ED6",
    borderRadius: 2,
    opacity: 0.6,
  },
  decorativeCircles: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  circle: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(2, 158, 214, 0.2)",
    borderRadius: 1000,
  },
  circle1: {
    width: 400,
    height: 400,
    top: height / 2 - 200,
    left: width / 2 - 200,
  },
  circle2: {
    width: 600,
    height: 600,
    top: height / 2 - 300,
    left: width / 2 - 300,
  },
  circle3: {
    width: 200,
    height: 200,
    top: height / 2 - 100,
    left: width / 2 - 100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 100,
    zIndex: 20,
  },
  continueButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  // Carousel styles
  carouselContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
  },
  carouselLogoContainer: {
    marginBottom: 0,
    alignItems: "center",
    marginTop: 0,
  },
  carouselLogo: {
    width: 320,
    height: 190,
  },
  carousel: {
    width: "100%",
    maxWidth: 400,
    justifyContent: "flex-start",
  },
  slideContainer: {
    height: 280,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 10,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(2, 158, 214, 0.08)",
  },
  slideGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  featureImage: {
    width: "100%",
    height: "100%",
  },
  slideOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(24, 40, 37, 0.95)",
    padding: 25,
    alignItems: "center",
    zIndex: 2,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    minHeight: 120,
  },
  slideContentOld: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: "center",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 15,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(20, 100, 84, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#146454",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  slideDescription: {
    fontSize: 16,
    color: "#146454",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#00E0B8",
  },
  carouselButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  carouselButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  continueCarouselButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  continueCarouselGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  continueCarouselText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  navigationArrows: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    transform: [{ translateY: -25 }],
  },
  arrowButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  arrowGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backArrowButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginRight: 15,
    zIndex: 10,
  },
  backArrowGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  // Nouveaux styles pour le design innovant
  slideContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
    alignItems: "center",
    zIndex: 3,
  },
  iconGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 224, 184, 0.3)",
    top: -10,
    left: -10,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    paddingVertical: 6,
  },
  progressItem: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  progressBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(20, 100, 84, 0.3)",
    marginBottom: 8,
  },
  progressBarActive: {
    backgroundColor: "#146454",
    width: 60,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(20, 100, 84, 0.7)",
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 5,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    paddingVertical: 10,
  },
  arrowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainButton: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 15,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    minWidth: 200,
    zIndex: 10,
  },
  mainButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 35,
    paddingVertical: 18,
    position: "relative",
  },
  buttonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 30,
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  // Motifs décoratifs subtils et émotionnellement positifs
  backgroundPatterns: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
    pointerEvents: "none",
  },
  wavePattern1: {
    position: "absolute",
    top: "12%",
    left: "5%",
    width: 120,
    height: 3,
    backgroundColor: "rgba(20, 100, 84, 0.08)",
    borderRadius: 1.5,
    transform: [{ rotate: "15deg" }],
    pointerEvents: "none",
  },
  wavePattern2: {
    position: "absolute",
    top: "18%",
    right: "8%",
    width: 80,
    height: 2,
    backgroundColor: "rgba(2, 158, 214, 0.06)",
    borderRadius: 1,
    transform: [{ rotate: "-10deg" }],
    pointerEvents: "none",
  },
  communicationCircles: {
    position: "absolute",
    bottom: "25%",
    left: "15%",
    width: 8,
    height: 8,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 4,
    pointerEvents: "none",
  },
  inclusionDots: {
    position: "absolute",
    bottom: "20%",
    right: "15%",
    width: 6,
    height: 6,
    backgroundColor: "rgba(2, 158, 214, 0.08)",
    borderRadius: 3,
    pointerEvents: "none",
  },
})

export default IntroScreen
