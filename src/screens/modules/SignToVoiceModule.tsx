"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, StatusBar, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Audio } from 'expo-av'
import * as Speech from 'expo-speech'
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
  runOnJS,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useNavigation } from "@react-navigation/native"
import SignLanguageAvatar from "../../components/SignLanguageAvatar"

const { width, height } = Dimensions.get("window")

// Déclaration des types Web Speech API
declare const window: any

const SignToVoiceModule: React.FC = () => {
  const navigation = useNavigation()
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedSigns, setDetectedSigns] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [currentSign, setCurrentSign] = useState("")
  const [detectionMode, setDetectionMode] = useState<"camera" | "manual">("camera")
  
  // États pour la simulation réaliste
  const [permission, requestPermission] = useCameraPermissions()
  const [isRecording, setIsRecording] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [simulationTexts] = useState([
    "Salut ! Comment vas-tu ?",
    "Bonjour, ça va bien ?",
    "Hello, comment allez-vous ?",
    "Salut, tout va bien ?"
  ])
  const [currentSimulationIndex, setCurrentSimulationIndex] = useState(0)
  const [detectedEmojis, setDetectedEmojis] = useState("")

  // Animations values
  const handScale = useSharedValue(1)
  const pulseScale = useSharedValue(1)
  const backgroundScale = useSharedValue(1)
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const waveScale = useSharedValue(0)
  const glowOpacity = useSharedValue(0)
  const progressValue = useSharedValue(0)
  const cameraRotation = useSharedValue(0)
  const detectionFrameScale = useSharedValue(1)

  // Demander les permissions caméra au démarrage
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        if (!permission?.granted) {
          const result = await requestPermission()
          console.log('Permission caméra:', result)
        }
      } catch (error) {
        console.log('Erreur permission caméra:', error)
      }
    }
    requestCameraPermission()
  }, [permission, requestPermission])

  // Animation d'entrée
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 })
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 1000 }))
    backgroundScale.value = withSpring(1, { damping: 15, stiffness: 100 })
  }, [])

  // Cleanup audio resources
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error)
      }
    }
  }, [sound])

  useEffect(() => {
    if (isDetecting) {
      // Animation de la main pendant la détection
      handScale.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        ),
        -1,
        false,
      )
      
      // Animation des ondes de détection
      waveScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(1.2, { duration: 600 })
        ),
        -1,
        true,
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

      // Animation de la caméra
      cameraRotation.value = withRepeat(
        withSequence(
          withSpring(5, { damping: 8 }),
          withSpring(-5, { damping: 8 }),
          withSpring(0, { damping: 12 })
        ),
        -1,
        true,
      )

      // Animation du cadre de détection
      detectionFrameScale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 10 }),
          withSpring(1, { damping: 15 })
        ),
        -1,
        false,
      )

      // Simulation de progression
      progressValue.value = withTiming(1, { duration: 3000 })
    } else {
      handScale.value = withSpring(1, { damping: 15 })
      waveScale.value = withTiming(0, { duration: 200 })
      pulseScale.value = withSpring(1, { damping: 15 })
      glowOpacity.value = withTiming(0, { duration: 200 })
      cameraRotation.value = withSpring(0, { damping: 15 })
      detectionFrameScale.value = withSpring(1, { damping: 15 })
      progressValue.value = withTiming(0, { duration: 200 })
    }
  }, [isDetecting])

  // Fonction pour jouer le son de l'avatar avec le texte détecté
  const playAvatarSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync()
      }

      // Vérifier si on est sur web pour utiliser Web Speech API
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        console.log('🔊 Utilisation de Web Speech API pour prononcer:', detectedSigns)
        
        // Arrêter toute synthèse en cours
        window.speechSynthesis.cancel()
        
        // Créer une nouvelle synthèse vocale
        const utterance = new (window as any).SpeechSynthesisUtterance(detectedSigns) as any
        utterance.lang = 'fr-FR'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 0.8

        // Gérer les événements
        utterance.onstart = () => {
          console.log('🎤 Lecture vocale démarrée')
          setIsPlaying(true)
        }

        utterance.onend = () => {
          console.log('✅ Lecture vocale terminée')
          setIsPlaying(false)
        }

        utterance.onerror = (event: any) => {
          console.error('❌ Erreur lecture vocale:', event)
          setIsPlaying(false)
        }

        // Lancer la synthèse vocale
        window.speechSynthesis.speak(utterance)
      } else {
        // Mode mobile avec expo-speech
        console.log('📱 Mode mobile - utilisation de expo-speech')
        
        try {
          setIsPlaying(true)
          
          Speech.speak(detectedSigns, {
            language: 'fr-FR',
            pitch: 1.0,
            rate: 1.0,
            onDone: () => {
              console.log('✅ Synthèse vocale mobile terminée')
              setIsPlaying(false)
            },
            onStopped: () => {
              console.log('⏹️ Synthèse vocale mobile arrêtée')
              setIsPlaying(false)
            },
            onError: (error: any) => {
              console.error('❌ Erreur synthèse vocale mobile:', error)
              setIsPlaying(false)
            }
          })
        } catch (speechError) {
          console.error('❌ Erreur lors de la synthèse vocale:', speechError)
          setIsPlaying(false)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error)
      setIsPlaying(false)
    }
  }

  const handleDetectionToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    if (!isDetecting) {
      setIsDetecting(true)
      setIsRecording(true)
      setConfidence(0)
      
      // Simulation de détection avec progression
      const progressInterval = setInterval(() => {
        setConfidence(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)

      setTimeout(() => {
        setIsDetecting(false)
        setIsRecording(false)
        setIsProcessing(true)
        clearInterval(progressInterval)
        
        setTimeout(async () => {
          // Générer un texte aléatoire de la simulation
          const randomText = simulationTexts[currentSimulationIndex]
          setDetectedSigns(randomText)
          setCurrentSimulationIndex((prev) => (prev + 1) % simulationTexts.length)
          setIsProcessing(false)
          setConfidence(95)
          
          // Générer les emojis correspondants aux signes détectés
          const emojis = generateSignEmojis(randomText)
          setDetectedEmojis(emojis)
          
          // Faire parler l'avatar avec du son
          await playAvatarSound()
        }, 2000)
      }, 3000)
    } else {
      setIsDetecting(false)
      setIsRecording(false)
    }
  }

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }

  const handleModeSwitch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setDetectionMode(prev => prev === "camera" ? "manual" : "camera")
  }

  // Fonction pour générer les emojis des signes détectés
  const generateSignEmojis = (text: string) => {
    const signMapping: { [key: string]: string } = {
      'salut': '👋',
      'bonjour': '👋',
      'hello': '👋',
      'comment': '🤔',
      'vas': '🚶',
      'tu': '👤',
      'bien': '👍',
      'ça': '👌',
      'va': '🚶',
      'tout': '🤲',
      'allez': '🚶',
      'vous': '👥',
      'merci': '🙏',
      'oui': '👍',
      'non': '👎',
      'manger': '🍽️',
      'boire': '🥤',
      'dormir': '😴',
      'travail': '💼',
      'famille': '👨‍👩‍👧‍👦',
      'ami': '🤝',
      'amour': '❤️',
      'temps': '⏰',
      'jour': '☀️',
      'nuit': '🌙',
      'eau': '💧',
      'pain': '🍞',
      'maison': '🏠',
      'voiture': '🚗',
      'livre': '📚',
      'musique': '🎵',
      'sport': '⚽',
      'école': '🎓',
      'hôpital': '🏥',
      'magasin': '🛒'
    }

    const words = text.toLowerCase().split(' ')
    const emojis: string[] = []
    
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?]/g, '')
      if (signMapping[cleanWord]) {
        emojis.push(signMapping[cleanWord])
      }
    })

    // Ajouter des emojis génériques si aucun mapping n'est trouvé
    if (emojis.length === 0) {
      emojis.push('🤟', '👋', '✋', '👍', '🤝')
    }

    return emojis.join(' ')
  }

  const handAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: handScale.value }],
  }))

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
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

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }))

  const waveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveScale.value,
    transform: [{ scale: waveScale.value }],
  }))

  const cameraAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${cameraRotation.value}deg` }],
  }))

  const detectionFrameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: detectionFrameScale.value }],
  }))

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Background animé */}
      <Animated.View style={[styles.backgroundGradient, backgroundAnimatedStyle]}>
        <LinearGradient 
          colors={["#FFFFFF", "#F8F9FA", "#FFFFFF"]} 
          style={styles.gradient}
        />
      </Animated.View>

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <LinearGradient colors={["#029ED6", "#146454"]} style={styles.backButtonGradient}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Signes → Voix</Text>
          <Text style={styles.subtitle}>Détectez les signes et convertissez en voix en temps réel</Text>
        </View>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        nestedScrollEnabled={true}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Mode de détection */}
          <View style={styles.modeContainer}>
            <TouchableOpacity 
              style={[styles.modeButton, detectionMode === "camera" && styles.modeButtonActive]} 
              onPress={handleModeSwitch}
            >
              <LinearGradient 
                colors={detectionMode === "camera" ? ["#029ED6", "#146454"] : ["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} 
                style={styles.modeButtonGradient}
              >
                <Ionicons name="videocam" size={20} color={detectionMode === "camera" ? "#FFFFFF" : "#029ED6"} />
                <Text style={[styles.modeText, detectionMode === "camera" && styles.modeTextActive]}>Caméra</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modeButton, detectionMode === "manual" && styles.modeButtonActive]} 
              onPress={handleModeSwitch}
            >
              <LinearGradient 
                colors={detectionMode === "manual" ? ["#029ED6", "#146454"] : ["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} 
                style={styles.modeButtonGradient}
              >
                <Ionicons name="hand-left" size={20} color={detectionMode === "manual" ? "#FFFFFF" : "#029ED6"} />
                <Text style={[styles.modeText, detectionMode === "manual" && styles.modeTextActive]}>Manuel</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Zone de détection caméra */}
          <View style={styles.detectionContainer}>
            <Animated.View style={[styles.detectionGlow, glowAnimatedStyle]} />
            
            {detectionMode === "camera" ? (
              <Animated.View style={[styles.cameraView, cameraAnimatedStyle]}>
                {permission?.granted ? (
                  <View style={styles.cameraContainer}>
                    <CameraView
                      style={styles.camera}
                      facing="front"
                    >
                      {/* Indicateur de caméra active */}
                      <View style={styles.cameraActiveIndicator}>
                        <View style={styles.cameraActiveDot} />
                        <Text style={styles.cameraActiveText}>Caméra active</Text>
                      </View>
                      
                      {isRecording && (
                        <Animated.View style={[styles.recordingOverlay, detectionFrameAnimatedStyle]}>
                          <View style={styles.recordingIndicator}>
                            <View style={styles.recordingDot} />
                            <Text style={styles.recordingText}>Enregistrement...</Text>
                          </View>
                          <View style={styles.detectionFrame}>
                            <View style={styles.frameBorder} />
                            <Text style={styles.detectionText}>Analyse des signes...</Text>
                          </View>
                        </Animated.View>
                      )}
                    </CameraView>
                  </View>
                ) : (
                  <LinearGradient 
                    colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} 
                    style={styles.cameraGradient}
                  >
                    <Ionicons name="videocam" size={60} color="#029ED6" />
                    <Text style={styles.cameraText}>Permission caméra requise</Text>
                    <TouchableOpacity 
                      style={styles.permissionButton}
                      onPress={() => {
                        try {
                          requestPermission()
                        } catch (error) {
                          console.log('Erreur lors de la demande de permission:', error)
                        }
                      }}
                    >
                      <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
              </Animated.View>
            ) : (
              <Animated.View style={[styles.handIcon, handAnimatedStyle]}>
                <LinearGradient 
                  colors={["#029ED6", "#146454", "#029ED6"]} 
                  style={styles.handGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="hand-left" size={60} color="#FFFFFF" />
                </LinearGradient>
                <Animated.View style={[styles.handPulse, pulseAnimatedStyle]} />
              </Animated.View>
            )}

            {/* Avatar 3D pour simulation LSF */}
            {detectedSigns && (
              <View style={styles.avatarSection}>
                <SignLanguageAvatar
                  isSigning={!!detectedSigns && !isProcessing}
                  signText={detectedSigns}
                  currentSign={currentSign}
                  style={styles.avatar3D}
                />
                <Text style={styles.avatarDescription}>Simulation 3D des signes détectés</Text>
                
                {/* Emojis des signes détectés */}
                {detectedEmojis && (
                  <View style={styles.signEmojisContainer}>
                    <Text style={styles.signEmojisTitle}>Signes détectés :</Text>
                    <Text style={styles.signEmojis}>{detectedEmojis}</Text>
                  </View>
                )}
              </View>
            )}

            {isProcessing && (
              <View style={styles.processingIndicator}>
                <LinearGradient
                  colors={["rgba(2, 158, 214, 0.15)", "rgba(20, 100, 84, 0.1)"]}
                  style={styles.processingGradient}
                >
                  <Animated.View style={styles.processingIcon}>
                    <Ionicons name="sync" size={20} color="#029ED6" />
                  </Animated.View>
                  <Text style={styles.processingText}>Analyse en cours...</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Barre de progression */}
          {isDetecting && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
              </View>
              <Text style={styles.progressText}>{Math.round(confidence)}% de confiance</Text>
            </View>
          )}

          {/* Texte détecté */}
          {detectedSigns ? (
            <View style={styles.textContainer}>
              <LinearGradient
                colors={["rgba(2, 158, 214, 0.08)", "rgba(20, 100, 84, 0.04)"]}
                style={styles.textGradient}
              >
                <Text style={styles.detectedText}>{detectedSigns}</Text>
                <View style={styles.confidenceIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#029ED6" />
                  <Text style={styles.confidenceText}>95% de précision</Text>
                </View>
              </LinearGradient>

              <View style={styles.voiceOutput}>
                <TouchableOpacity 
                  style={styles.playButton} 
                  activeOpacity={0.8}
                  onPress={playAvatarSound}
                  disabled={isPlaying}
                >
                  <LinearGradient 
                    colors={isPlaying ? ["#999", "#666"] : ["#029ED6", "#146454"]} 
                    style={styles.playButtonGradient}
                  >
                    <Ionicons name={isPlaying ? "volume-high" : "play"} size={24} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.voiceDescription}>
                  {isPlaying ? "Lecture..." : "Écouter la traduction"}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Contrôles de détection */}
          <View style={styles.controlsContainer}>
            {/* Ondes de détection animées */}
            {isDetecting && (
              <Animated.View style={[styles.detectionWaves, waveAnimatedStyle]}>
                {[...Array(7)].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.wave,
                      {
                        height: 15 + index * 8,
                        backgroundColor: "#029ED6",
                        opacity: 0.3 + (index * 0.1),
                      },
                    ]}
                  />
                ))}
              </Animated.View>
            )}

            {/* Bouton détection premium */}
            <Animated.View style={handAnimatedStyle}>
              <TouchableOpacity
                style={[styles.detectButton, isDetecting && styles.detectButtonActive]}
                onPress={handleDetectionToggle}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDetecting ? ["#FF4757", "#FF3742"] : ["#029ED6", "#146454"]}
                  style={styles.detectButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={isDetecting ? "stop" : detectionMode === "camera" ? "videocam" : "hand-left"} size={40} color="#FFFFFF" />
                </LinearGradient>
                {isDetecting && <Animated.View style={[styles.pulseCircle, pulseAnimatedStyle]} />}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.instructionText}>
              {isDetecting ? "Détection en cours..." : `Appuyez pour commencer la détection ${detectionMode === "camera" ? "par caméra" : "manuelle"}`}
            </Text>
          </View>

          {/* Conseils */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Conseils de détection</Text>
            <LinearGradient 
              colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} 
              style={styles.tipsBox}
            >
              <Text style={styles.tipText}>• Placez-vous dans un bon éclairage</Text>
              <Text style={styles.tipText}>• Gardez vos mains visibles</Text>
              <Text style={styles.tipText}>• Effectuez des gestes clairs</Text>
              <Text style={styles.tipText}>• Maintenez une distance appropriée</Text>
            </LinearGradient>
          </View>

          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Statistiques de session</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="checkmark-circle" size={24} color="#029ED6" />
                  <Text style={styles.statNumber}>95%</Text>
                  <Text style={styles.statLabel}>Précision</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="hand-left" size={24} color="#146454" />
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Signes détectés</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="time" size={24} color="#029ED6" />
                  <Text style={styles.statNumber}>2.8s</Text>
                  <Text style={styles.statLabel}>Temps moyen</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
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
    maxHeight: height - 120,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(2, 158, 214, 0.1)",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 16,
    elevation: 8,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  modeContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginVertical: 20,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  modeButtonActive: {
    elevation: 8,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(2, 158, 214, 0.2)",
    backgroundColor: "#FFFFFF",
  },
  modeText: {
    fontSize: 14,
    color: "#029ED6",
    fontWeight: "600",
    marginLeft: 8,
  },
  modeTextActive: {
    color: "#FFFFFF",
  },
  detectionContainer: {
    alignItems: "center",
    marginVertical: 30,
    position: "relative",
  },
  detectionGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#029ED6",
    opacity: 0.1,
    top: -40,
    left: -40,
    zIndex: -1,
  },
  cameraView: {
    width: 200,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    elevation: 12,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 3,
    borderColor: "#029ED6",
  },
  cameraGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(2, 158, 214, 0.3)",
    backgroundColor: "#FFFFFF",
  },
  cameraText: {
    fontSize: 14,
    color: "#029ED6",
    marginTop: 8,
    fontWeight: "500",
  },
  detectionFrame: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  frameBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "#029ED6",
    borderRadius: 10,
  },
  detectionText: {
    fontSize: 12,
    color: "#029ED6",
    fontWeight: "600",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  handIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    position: "relative",
    elevation: 12,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  handGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  handPulse: {
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
    marginTop: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  processingGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(2, 158, 214, 0.3)",
  },
  processingIcon: {
    marginRight: 8,
  },
  processingText: {
    color: "#029ED6",
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(2, 158, 214, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#029ED6",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#029ED6",
    textAlign: "center",
    fontWeight: "600",
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
    borderColor: "rgba(2, 158, 214, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  detectedText: {
    fontSize: 18,
    color: "#029ED6",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "600",
    marginBottom: 12,
  },
  confidenceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceText: {
    fontSize: 12,
    color: "#029ED6",
    marginLeft: 6,
    fontWeight: "500",
  },
  voiceOutput: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 12,
    elevation: 4,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceDescription: {
    fontSize: 14,
    color: "#029ED6",
    opacity: 0.7,
    fontWeight: "500",
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  detectionWaves: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    height: 60,
  },
  wave: {
    width: 3,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  detectButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    elevation: 16,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    position: "relative",
  },
  detectButtonActive: {
    shadowColor: "#FF4757",
  },
  detectButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FF4757",
    opacity: 0.3,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  instructionText: {
    fontSize: 16,
    color: "#029ED6",
    marginTop: 20,
    opacity: 0.8,
    fontWeight: "600",
    textAlign: "center",
  },
  tipsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 12,
  },
  tipsBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(2, 158, 214, 0.2)",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tipText: {
    fontSize: 14,
    color: "#146454",
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: "500",
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 16,
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
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(2, 158, 214, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#029ED6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statNumber: {
    fontSize: 20,
    color: "#029ED6",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(2, 158, 214, 0.1)",
  },
  avatar3D: {
    marginBottom: 10,
  },
  avatarDescription: {
    fontSize: 12,
    color: "#029ED6",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
  signEmojisContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(2, 158, 214, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(2, 158, 214, 0.2)",
  },
  signEmojisTitle: {
    fontSize: 14,
    color: "#146454",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  signEmojis: {
    fontSize: 24,
    textAlign: "center",
    lineHeight: 32,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  recordingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  permissionButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#029ED6',
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraActiveIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cameraActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  cameraActiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
})

export default SignToVoiceModule 