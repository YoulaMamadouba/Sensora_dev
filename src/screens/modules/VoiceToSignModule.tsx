"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated"
import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system"
import { useAuth } from "../../context/AuthContext"
import { useSupabaseAuth } from "../../context/SupabaseAuthContext"
import OpenAIService from "../../services/OpenAIService"
import { impactAsync } from "../../utils/platformUtils"
import { useNavigation } from "@react-navigation/native"
import SignLanguageAvatar from "../../components/SignLanguageAvatar"

const { width, height } = Dimensions.get("window")

const VoiceToSignModule: React.FC = () => {
  const navigation = useNavigation()
  const { user } = useAuth()
  const { supabaseService } = useSupabaseAuth()
  const openAIService = new OpenAIService()
  
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [currentSign, setCurrentSign] = useState("")
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [signEmojis, setSignEmojis] = useState("")
  const [signTranslation, setSignTranslation] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [openAINotification, setOpenAINotification] = useState<string | null>(null)
  const [uploadStats, setUploadStats] = useState({
    totalUploads: 0,
    successfulUploads: 0,
    failedUploads: 0
  })

  // Animations values
  const micScale = useSharedValue(1)
  const waveOpacity = useSharedValue(0)
  const avatarRotation = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const backgroundScale = useSharedValue(1)
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const waveScale = useSharedValue(0)
  const glowOpacity = useSharedValue(0)
  const progressValue = useSharedValue(0)

  // Demander les permissions audio et tester la configuration
  useEffect(() => {
    (async () => {
      // Demander les permissions audio
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'accès au microphone est nécessaire pour enregistrer l\'audio.')
      }

      // Tester la configuration OpenAI
      try {
        const isOpenAIConfigured = await openAIService.testConnection()
        if (!isOpenAIConfigured) {
          console.warn('⚠️ OpenAI non configuré ou non accessible')
          showOpenAINotification('OpenAI non configuré - Mode simulation activé')
        }
      } catch (error) {
        console.warn('⚠️ Erreur test OpenAI:', error)
        showOpenAINotification('Erreur configuration OpenAI - Mode simulation activé')
      }
    })()
  }, [])

  // Animation d'entrée
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 })
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 1000 }))
    backgroundScale.value = withSpring(1, { damping: 15, stiffness: 100 })
  }, [])

  useEffect(() => {
    if (isRecording) {
      // Animation du micro pendant l'enregistrement
      micScale.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        ),
        -1,
        false,
      )
      
      // Animation des ondes sonores
      waveOpacity.value = withTiming(1, { duration: 300 })
      waveScale.value = withRepeat(
        withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(0.8, { damping: 12 })
        ),
        -1,
        false,
      )
    } else {
      // Arrêter les animations
      micScale.value = withSpring(1, { damping: 15 })
      waveOpacity.value = withTiming(0, { duration: 300 })
      waveScale.value = withSpring(0, { damping: 15 })
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      console.log('🎤 Début de l\'enregistrement...')
      
      // Configurer l'audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      // Créer un nouvel enregistrement
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      
      setRecording(newRecording)
      setIsRecording(true)
      setConfidence(0)
      
      console.log('✅ Enregistrement démarré')
    } catch (err) {
      console.error('❌ Erreur lors du démarrage de l\'enregistrement:', err)
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement')
    }
  }

  const stopRecording = async () => {
    try {
      console.log('🛑 Arrêt de l\'enregistrement...')
      
      if (!recording) return

      setIsRecording(false)
      setIsProcessing(true)
      setIsTranscribing(true)
      
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setRecording(null)
      
      if (uri) {
        setAudioUri(uri)
        console.log('✅ Enregistrement terminé:', uri)
        
        // Upload vers Supabase
        let audioFile = null
        try {
          const timestamp = Date.now()
          const fileName = `recording_${timestamp}.m4a`
          audioFile = await uploadAudioToSupabase(uri)
          
          if (audioFile) {
            console.log('✅ Fichier audio uploadé avec succès:', audioFile.id)
            
            // Mettre à jour les statistiques d'upload
            setUploadStats(prev => ({
              ...prev,
              totalUploads: prev.totalUploads + 1,
              successfulUploads: prev.successfulUploads + 1
            }))
            
            // Transcription avec OpenAI
            try {
              console.log('🎤 Début de la transcription avec OpenAI...')
              const transcription = await openAIService.transcribeAudio(audioFile.public_url, 'fr')
              
              if (transcription.text) {
                setTranscribedText(transcription.text)
                setConfidence(transcription.confidence ? transcription.confidence * 100 : 95)
                
                // Traduction en langue des signes
                try {
                  console.log('🤟 Début de la traduction LSF...')
                  const translation = await openAIService.translateToSignLanguage(transcription.text)
                  setSignTranslation(translation.text)
                  
                  // Génération d'emojis
                  const emojis = await openAIService.generateSignEmojis(transcription.text)
                  setSignEmojis(emojis)
                  
                } catch (translationError) {
                  console.error('❌ Erreur traduction LSF:', translationError)
                  
                  // Gestion spécifique des erreurs OpenAI pour la traduction
                  let errorMessage = 'Erreur de traduction'
                  if (translationError instanceof Error) {
                    if (translationError.message.includes('quota')) {
                      errorMessage = 'Quota OpenAI dépassé. Utilisation de la traduction simulée.'
                    } else if (translationError.message.includes('Clé API')) {
                      errorMessage = 'Configuration OpenAI manquante. Utilisation de la traduction simulée.'
                    } else {
                      errorMessage = 'Erreur de traduction. Utilisation de la traduction simulée.'
                    }
                  }
                  
                  // Afficher une notification informatif à l'utilisateur
                  showOpenAINotification(errorMessage)
                  
                  // Fallback vers la génération locale d'emojis
                  const localEmojis = generateSignEmojis(transcription.text)
                  setSignEmojis(localEmojis)
                  setSignTranslation('Traduction LSF non disponible')
                }
                
              } else {
                throw new Error('Transcription vide')
              }
              
            } catch (transcriptionError) {
              console.error('❌ Erreur transcription OpenAI:', transcriptionError)
              
              // Gestion spécifique des erreurs OpenAI
              let errorMessage = 'Erreur de transcription'
              if (transcriptionError instanceof Error) {
                if (transcriptionError.message.includes('quota')) {
                  errorMessage = 'Quota OpenAI dépassé. Utilisation de la transcription simulée.'
                } else if (transcriptionError.message.includes('Clé API')) {
                  errorMessage = 'Configuration OpenAI manquante. Utilisation de la transcription simulée.'
                } else {
                  errorMessage = 'Erreur de transcription. Utilisation de la transcription simulée.'
                }
              }
              
              // Afficher une notification informatif à l'utilisateur
              showOpenAINotification(errorMessage)
              
              // Fallback vers la transcription simulée
              const mockTranscription = "Bonjour, comment allez-vous aujourd'hui ?"
              setTranscribedText(mockTranscription)
              setConfidence(95)
              
              const localEmojis = generateSignEmojis(mockTranscription)
              setSignEmojis(localEmojis)
              setSignTranslation('Traduction LSF non disponible')
            }
            
          } else {
            throw new Error('Échec de l\'upload du fichier audio')
          }
          
        } catch (uploadError) {
          console.error('❌ Erreur upload:', uploadError)
          
          // Gestion spécifique des erreurs d'upload
          let errorMessage = 'Impossible d\'uploader le fichier audio'
          if (uploadError instanceof Error) {
            if (uploadError.message.includes('non connecté')) {
              errorMessage = 'Vous devez être connecté pour enregistrer des fichiers audio'
            } else if (uploadError.message.includes('permission')) {
              errorMessage = 'Permissions insuffisantes pour uploader le fichier'
            } else {
              errorMessage = uploadError.message
            }
          }
          
          showOpenAINotification(`Upload échoué: ${errorMessage}`)
          
          // Mettre à jour les statistiques d'upload
          setUploadStats(prev => ({
            ...prev,
            totalUploads: prev.totalUploads + 1,
            failedUploads: prev.failedUploads + 1
          }))
          
          // Fallback vers la transcription simulée
          const mockTranscription = "Bonjour, comment allez-vous aujourd'hui ?"
          setTranscribedText(mockTranscription)
          setConfidence(95)
          
          const localEmojis = generateSignEmojis(mockTranscription)
          setSignEmojis(localEmojis)
          setSignTranslation('Traduction LSF non disponible')
        }
          
        // Animation de l'avatar
        avatarRotation.value = withSequence(
          withSpring(8, { damping: 8 }),
          withSpring(-8, { damping: 8 }),
          withSpring(0, { damping: 12 })
        )
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'arrêt de l\'enregistrement:', err)
      Alert.alert('Erreur', 'Impossible d\'arrêter l\'enregistrement')
    } finally {
      setIsProcessing(false)
      setIsTranscribing(false)
    }
  }

  const uploadAudioToSupabase = async (uri: string) => {
    try {
      if (!supabaseService || !user) {
        console.warn('⚠️ Service Supabase ou utilisateur non disponible')
        return null
      }

      console.log('📤 Upload du fichier audio vers Supabase...')
      
      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const fileName = `recording_${timestamp}.m4a`
      
      // Upload vers Supabase
      const audioFile = await supabaseService.uploadAudioFile(uri, fileName, 'audio/m4a')
      
      if (audioFile) {
        console.log('✅ Fichier audio uploadé avec succès:', audioFile.id)
        
        // Créer un objet avec l'URL publique pour OpenAI
        return {
          ...audioFile,
          public_url: audioFile.file_path // L'URL publique est dans file_path
        }
      } else {
        console.error('❌ Échec de l\'upload du fichier audio')
        return null
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error)
      Alert.alert('Erreur', 'Impossible d\'uploader le fichier audio')
      return null
    }
  }

  const showOpenAINotification = (message: string) => {
    setOpenAINotification(message)
    // Effacer la notification après 5 secondes
    setTimeout(() => {
      setOpenAINotification(null)
    }, 5000)
  }

  const generateSignEmojis = (text: string) => {
    // Mapping simple de mots vers des emojis de signes
    const signMapping: { [key: string]: string } = {
      'bonjour': '👋',
      'salut': '👋',
      'hello': '👋',
      'merci': '🙏',
      'oui': '👍',
      'non': '👎',
      'bien': '👍',
      'mal': '👎',
      'comment': '🤔',
      'aller': '🚶',
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

  const handleRecordToggle = async () => {
    impactAsync()

    if (!isRecording) {
      await startRecording()
    } else {
      await stopRecording()
    }
  }

  const handleBackPress = () => {
    impactAsync()
    navigation.goBack()
  }

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }))

  const waveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
    transform: [{ scale: waveScale.value }],
  }))

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarRotation.value}deg` }],
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
          <LinearGradient colors={["#146454", "#029ED6"]} style={styles.backButtonGradient}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Voix → Langue des Signes</Text>
          <Text style={styles.subtitle}>Parlez et voyez la traduction en signes en temps réel</Text>
        </View>
      </Animated.View>

      {/* Notification OpenAI */}
      {openAINotification && (
        <Animated.View style={styles.openAINotification}>
          <LinearGradient
            colors={["rgba(255, 193, 7, 0.9)", "rgba(255, 152, 0, 0.9)"]}
            style={styles.notificationGradient}
          >
            <Ionicons name="information-circle" size={20} color="#FFFFFF" />
            <Text style={styles.notificationText}>{openAINotification}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Avatar 3D Premium avec Avatar LSF */}
          <View style={styles.avatarContainer}>
            <Animated.View style={[styles.avatarGlow, glowAnimatedStyle]} />
            
            {/* Avatar 3D LSF qui remplace l'icône utilisateur */}
            {transcribedText && !isProcessing ? (
              <Animated.View style={[styles.avatar3D, avatarAnimatedStyle]}>
                <SignLanguageAvatar
                  isSigning={!!transcribedText && !isProcessing}
                  signText={transcribedText}
                  currentSign={currentSign}
                  style={styles.avatar3DMain}
                />
              </Animated.View>
            ) : (
              <Animated.View style={[styles.avatar, avatarAnimatedStyle]}>
                <LinearGradient 
                  colors={["#146454", "#029ED6"]} 
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="person" size={60} color="#FFFFFF" />
                </LinearGradient>
                <Animated.View style={[styles.avatarPulse, pulseAnimatedStyle]} />
              </Animated.View>
            )}

            {isProcessing && (
              <View style={styles.processingIndicator}>
                <LinearGradient
                  colors={["rgba(20, 100, 84, 0.15)", "rgba(2, 158, 214, 0.1)"]}
                  style={styles.processingGradient}
                >
                  <Animated.View style={styles.processingIcon}>
                    <Ionicons name="sync" size={20} color="#146454" />
                  </Animated.View>
                  <Text style={styles.processingText}>Traduction en cours...</Text>
                </LinearGradient>
              </View>
            )}
          </View>



          {/* Barre de progression */}
          {isRecording && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
              </View>
              <Text style={styles.progressText}>{Math.round(confidence)}% de confiance</Text>
            </View>
          )}

          {/* Texte transcrit */}
          {transcribedText ? (
            <View style={styles.textContainer}>
              <LinearGradient
                colors={["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]}
                style={styles.textGradient}
              >
                <Text style={styles.transcribedText}>{transcribedText}</Text>
                <View style={styles.confidenceIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#146454" />
                  <Text style={styles.confidenceText}>{Math.round(confidence)}% de précision</Text>
                </View>
              </LinearGradient>

              {/* Traduction LSF */}
              {signTranslation && (
                <View style={styles.signTranslationContainer}>
                  <LinearGradient
                    colors={["rgba(2, 158, 214, 0.08)", "rgba(20, 100, 84, 0.04)"]}
                    style={styles.signTranslationGradient}
                  >
                    <Text style={styles.signTranslationTitle}>Traduction LSF</Text>
                    <Text style={styles.signTranslationText}>{signTranslation}</Text>
                  </LinearGradient>
                </View>
              )}

              <View style={styles.signTranslation}>
                <Text style={styles.signText}>{signEmojis || "🤟 👋 ✋ 👍 🤝"}</Text>
                <Text style={styles.signDescription}>Représentation en emojis</Text>
              </View>
            </View>
          ) : null}

          {/* Contrôles d'enregistrement */}
          <View style={styles.controlsContainer}>
            {/* Ondes sonores animées */}
            {isRecording && (
              <Animated.View style={[styles.soundWaves, waveAnimatedStyle]}>
                {[...Array(7)].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.wave,
                      {
                        height: 15 + index * 8,
                        backgroundColor: "#146454",
                        opacity: interpolate(waveOpacity.value, [0, 1], [0.3, 1]),
                      },
                    ]}
                  />
                ))}
              </Animated.View>
            )}

            {/* Bouton micro premium */}
            <Animated.View style={micAnimatedStyle}>
              <TouchableOpacity
                style={[styles.micButton, isRecording && styles.micButtonActive]}
                onPress={handleRecordToggle}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isRecording ? ["#FF4757", "#FF3742"] : ["#146454", "#029ED6"]}
                  style={styles.micButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={isRecording ? "stop" : "mic"} size={40} color="#FFFFFF" />
                </LinearGradient>
                {isRecording && <Animated.View style={[styles.pulseCircle, pulseAnimatedStyle]} />}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.instructionText}>
              {isRecording ? "Parlez maintenant..." : "Appuyez pour commencer l'enregistrement"}
            </Text>
          </View>

          {/* Sous-titres en temps réel */}
          <View style={styles.subtitlesContainer}>
            <Text style={styles.subtitlesTitle}>Sous-titres en temps réel</Text>
            <LinearGradient 
              colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} 
              style={styles.subtitlesBox}
            >
              <Text style={styles.subtitlesText}>
                {isRecording ? "Écoute en cours..." : transcribedText || "Aucun texte détecté"}
              </Text>
            </LinearGradient>
          </View>

          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Statistiques de session</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="cloud-upload" size={24} color="#146454" />
                  <Text style={styles.statNumber}>{uploadStats.totalUploads}</Text>
                  <Text style={styles.statLabel}>Uploads</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="checkmark-circle" size={24} color="#029ED6" />
                  <Text style={styles.statNumber}>{Math.round(confidence)}%</Text>
                  <Text style={styles.statLabel}>Précision</Text>
                </LinearGradient>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statGradient}>
                  <Ionicons name="mic" size={24} color="#146454" />
                  <Text style={styles.statNumber}>{uploadStats.successfulUploads}</Text>
                  <Text style={styles.statLabel}>Réussis</Text>
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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(20, 100, 84, 0.1)",
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
  avatarContainer: {
    alignItems: "center",
    marginVertical: 8,
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
    borderColor: "rgba(20, 100, 84, 0.3)",
  },
  processingIcon: {
    marginRight: 8,
  },
  processingText: {
    color: "#146454",
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#146454",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#146454",
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
  confidenceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceText: {
    fontSize: 12,
    color: "#146454",
    marginLeft: 6,
    fontWeight: "500",
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
  signTranslationContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  signTranslationGradient: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  signTranslationTitle: {
    fontSize: 14,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  signTranslationText: {
    fontSize: 16,
    color: "#146454",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  soundWaves: {
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
    position: "relative",
  },
  micButtonActive: {
    shadowColor: "#FF4757",
  },
  micButtonGradient: {
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
    color: "#146454",
    marginTop: 20,
    opacity: 0.8,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitlesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  subtitlesTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitlesBox: {
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
  subtitlesText: {
    fontSize: 16,
    color: "#146454",
    textAlign: "center",
    lineHeight: 24,
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
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statNumber: {
    fontSize: 20,
    color: "#146454",
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
  openAINotification: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  avatar3D: {
    width: 240,
    height: 240,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  avatar3DMain: {
    transform: [{ scale: 1.2 }],
    backgroundColor: 'transparent',
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.1)",
    minHeight: 200,
    justifyContent: "center",
  },
  avatarDescription: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
})

export default VoiceToSignModule 
