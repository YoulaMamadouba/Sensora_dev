"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, StatusBar } from "react-native"
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
  runOnJS,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useNavigation } from "@react-navigation/native"

const { width, height } = Dimensions.get("window")

interface Meeting {
  id: string
  title: string
  participants: number
  duration: string
  status: "upcoming" | "ongoing" | "completed"
  type: "video" | "audio" | "hybrid"
}

interface Tool {
  id: string
  title: string
  description: string
  icon: string
  usage: number
  color: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
}

const ProfessionalScreen: React.FC = () => {
  const navigation = useNavigation()
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)
  const [meetingDuration, setMeetingDuration] = useState(0)
  const [participants, setParticipants] = useState([
    { id: 1, name: "Marie Dupont", role: "Manager", speaking: false, avatar: "M" },
    { id: 2, name: "Jean Martin", role: "Développeur", speaking: true, avatar: "J" },
    { id: 3, name: "Sophie Bernard", role: "Designer", speaking: false, avatar: "S" },
    { id: 4, name: "Alexandre Dubois", role: "Product Owner", speaking: false, avatar: "A" },
  ])
  const [transcription, setTranscription] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  // Animations values
  const backgroundScale = useSharedValue(1)
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const meetingPulse = useSharedValue(1)
  const recordingScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0)
  const progressValue = useSharedValue(0)

  // Animation d'entrée
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 })
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 1000 }))
    backgroundScale.value = withSpring(1, { damping: 15, stiffness: 100 })
  }, [])

  useEffect(() => {
    if (isInMeeting) {
      // Animation de pulsation pour la réunion
      meetingPulse.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 10 }),
          withSpring(1, { damping: 15 })
        ),
        -1,
        false,
      )

      // Animation du glow
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 })
        ),
        -1,
        true,
      )

      // Simulation de transcription en temps réel
      const phrases = [
        "Bonjour à tous, commençons la réunion de ce matin.",
        "Le projet Sensora avance très bien selon le planning.",
        "Nous devons finaliser les spécifications techniques.",
        "Y a-t-il des questions sur ce point ?",
        "Parfait, passons au point suivant de l'ordre du jour.",
        "La démo est prévue pour la semaine prochaine.",
        "Merci à tous pour votre participation.",
      ]

      let phraseIndex = 0
      const interval = setInterval(() => {
        setTranscription(phrases[phraseIndex])
        phraseIndex = (phraseIndex + 1) % phrases.length

        // Simulation de changement d'orateur
        setParticipants((prev) =>
          prev.map((p, index) => ({
            ...p,
            speaking: index === Math.floor(Math.random() * prev.length),
          })),
        )

        // Incrémenter la durée
        setMeetingDuration(prev => prev + 30)
      }, 3000)

      return () => clearInterval(interval)
    } else {
      meetingPulse.value = withSpring(1, { damping: 15 })
      glowOpacity.value = withTiming(0, { duration: 200 })
      setMeetingDuration(0)
      setTranscription("")
    }
  }, [isInMeeting])

  useEffect(() => {
    if (isRecording) {
      recordingScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 8 }),
          withSpring(1, { damping: 12 })
        ),
        -1,
        false,
      )
      progressValue.value = withTiming(1, { duration: 3000 })
    } else {
      recordingScale.value = withSpring(1, { damping: 15 })
      progressValue.value = withTiming(0, { duration: 200 })
    }
  }, [isRecording])

  const handleMeetingToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsInMeeting(!isInMeeting)
    
    if (!isInMeeting) {
      setCurrentMeeting({
        id: "1",
        title: "Réunion Sensora - Planning Sprint",
        participants: 4,
        duration: "45min",
        status: "ongoing",
        type: "video"
      })
    } else {
      setCurrentMeeting(null)
    }
  }

  const handleRecordingToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsRecording(!isRecording)
  }

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }

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

  const meetingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: meetingPulse.value }],
  }))

  const recordingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordingScale.value }],
  }))

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }))

  const meetings: Meeting[] = [
    {
      id: "1",
      title: "Planning Sprint Sensora",
      participants: 4,
      duration: "45min",
      status: "ongoing",
      type: "video"
    },
    {
      id: "2",
      title: "Rétrospective Équipe",
      participants: 6,
      duration: "30min",
      status: "upcoming",
      type: "hybrid"
    },
    {
      id: "3",
      title: "Démo Produit",
      participants: 8,
      duration: "60min",
      status: "upcoming",
      type: "video"
    },
  ]

  const tools: Tool[] = [
    {
      id: "notes",
      title: "Prise de Notes",
      description: "Notes automatiques et résumés",
      icon: "document-text",
      usage: 85,
      color: "#146454",
    },
    {
      id: "calendar",
      title: "Planification",
      description: "Gestion d'agenda intelligent",
      icon: "calendar",
      usage: 72,
      color: "#029ED6",
    },
    {
      id: "communication",
      title: "Communication",
      description: "Emails et messages adaptés",
      icon: "mail",
      usage: 68,
      color: "#146454",
    },
    {
      id: "collaboration",
      title: "Collaboration",
      description: "Travail d'équipe optimisé",
      icon: "people",
      usage: 91,
      color: "#029ED6",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Statistiques et rapports",
      icon: "analytics",
      usage: 45,
      color: "#146454",
    },
    {
      id: "presentation",
      title: "Présentations",
      description: "Création de slides adaptées",
      icon: "easel",
      usage: 78,
      color: "#029ED6",
    },
  ]

  const achievements: Achievement[] = [
    {
      id: "first_meeting",
      title: "Première Réunion",
      description: "Participez à votre première réunion",
      icon: "videocam",
      unlocked: true,
      progress: 100,
    },
    {
      id: "week_streak",
      title: "Régulier",
      description: "5 réunions consécutives",
      icon: "flame",
      unlocked: true,
      progress: 100,
    },
    {
      id: "team_leader",
      title: "Leader d'Équipe",
      description: "Animez 10 réunions",
      icon: "people-circle",
      unlocked: false,
      progress: 70,
    },
    {
      id: "efficiency",
      title: "Efficacité",
      description: "100% de réunions à l'heure",
      icon: "time",
      unlocked: false,
      progress: 85,
    },
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
          <Text style={styles.title}>Insertion Professionnelle</Text>
          <Text style={styles.subtitle}>Outils pour le monde du travail</Text>
        </View>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <Animated.View style={contentAnimatedStyle}>
        {/* État de la réunion */}
        <View style={styles.meetingStatusContainer}>
            <Animated.View style={[styles.meetingGlow, glowAnimatedStyle]} />
            <Animated.View style={[styles.meetingCard, meetingAnimatedStyle]}>
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.meetingGradient}>
                <View style={styles.meetingHeader}>
                  <View style={styles.meetingIcon}>
                    <LinearGradient colors={["#146454", "#029ED6"]} style={styles.meetingIconGradient}>
              <Ionicons
                name={isInMeeting ? "videocam" : "videocam-off"}
                        size={24} 
                        color="#FFFFFF" 
              />
                    </LinearGradient>
                  </View>
            <View style={styles.meetingInfo}>
                    <Text style={styles.meetingTitle}>
                      {isInMeeting ? "Réunion en cours" : "Prêt pour la réunion"}
                    </Text>
                    <Text style={styles.meetingSubtitle}>
                      {isInMeeting ? "Transcription active" : "Cliquez pour commencer"}
                    </Text>
                    {isInMeeting && (
                      <Text style={styles.meetingDuration}>
                        Durée: {formatTime(meetingDuration)}
                      </Text>
                    )}
            </View>
            <TouchableOpacity style={styles.meetingToggle} onPress={handleMeetingToggle}>
              <LinearGradient
                      colors={isInMeeting ? ["#FF4757", "#FF3742"] : ["#146454", "#029ED6"]}
                style={styles.toggleGradient}
              >
                <Ionicons name={isInMeeting ? "stop" : "play"} size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
                </View>
          </LinearGradient>
            </Animated.View>
        </View>

        {/* Participants */}
        {isInMeeting && (
          <View style={styles.participantsContainer}>
              <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
              <View style={styles.participantsGrid}>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantCard}>
                  <LinearGradient
                    colors={
                      participant.speaking
                          ? ["rgba(20, 100, 84, 0.15)", "rgba(2, 158, 214, 0.1)"]
                          : ["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]
                    }
                    style={styles.participantGradient}
                  >
                      <View style={[styles.participantAvatar, participant.speaking && styles.participantAvatarSpeaking]}>
                        <Text style={styles.participantInitial}>{participant.avatar}</Text>
                        {participant.speaking && (
                          <Animated.View style={[styles.speakingIndicator, glowAnimatedStyle]} />
                        )}
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>{participant.name}</Text>
                        <Text style={styles.participantRole}>{participant.role}</Text>
                        <View style={styles.speakingStatus}>
                        <View
                          style={[
                            styles.speakingDot,
                              { backgroundColor: participant.speaking ? "#146454" : "#999" },
                          ]}
                        />
                        <Text style={styles.speakingText}>
                          {participant.speaking ? "En train de parler" : "Silencieux"}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Transcription en temps réel */}
          {isInMeeting && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.sectionTitle}>Transcription en temps réel</Text>
              <LinearGradient colors={["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]} style={styles.transcriptionBox}>
              <Text style={styles.transcriptionText}>
                  {transcription || "La transcription apparaîtra ici pendant la réunion..."}
              </Text>

              <View style={styles.transcriptionControls}>
                  <TouchableOpacity style={styles.transcriptionButton} onPress={handleRecordingToggle}>
                    <LinearGradient colors={["#146454", "#029ED6"]} style={styles.transcriptionButtonGradient}>
                      <Ionicons name={isRecording ? "stop" : "mic"} size={16} color="#FFFFFF" />
                      <Text style={styles.transcriptionButtonText}>
                        {isRecording ? "Arrêter" : "Enregistrer"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                <TouchableOpacity style={styles.transcriptionButton}>
                    <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.transcriptionButtonGradient}>
                      <Ionicons name="download" size={16} color="#146454" />
                      <Text style={[styles.transcriptionButtonText, { color: "#146454" }]}>Sauvegarder</Text>
                    </LinearGradient>
                </TouchableOpacity>
                  
                <TouchableOpacity style={styles.transcriptionButton}>
                    <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.transcriptionButtonGradient}>
                      <Ionicons name="share" size={16} color="#146454" />
                      <Text style={[styles.transcriptionButtonText, { color: "#146454" }]}>Partager</Text>
                    </LinearGradient>
                </TouchableOpacity>
                </View>

                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <Animated.View style={[styles.recordingDot, recordingAnimatedStyle]} />
                    <Text style={styles.recordingText}>Enregistrement en cours...</Text>
                    <View style={styles.progressBar}>
                      <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
                    </View>
              </View>
            )}
          </LinearGradient>
        </View>
          )}

          {/* Réunions à venir */}
          <View style={styles.meetingsContainer}>
            <Text style={styles.sectionTitle}>Réunions à venir</Text>
            <View style={styles.meetingsGrid}>
              {meetings.map((meeting) => (
                <TouchableOpacity key={meeting.id} style={styles.meetingCard} activeOpacity={0.8}>
                  <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.meetingCardGradient}>
                    <View style={styles.meetingCardHeader}>
                      <View style={[styles.meetingTypeIcon, { backgroundColor: meeting.type === "video" ? "#146454" : "#029ED6" }]}>
                        <Ionicons 
                          name={meeting.type === "video" ? "videocam" : "call"} 
                          size={16} 
                          color="#FFFFFF" 
                        />
                      </View>
                      <View style={styles.meetingCardInfo}>
                        <Text style={styles.meetingCardTitle}>{meeting.title}</Text>
                        <Text style={styles.meetingCardDetails}>
                          {meeting.participants} participants • {meeting.duration}
                        </Text>
            </View>
                      <View style={[styles.meetingStatus, { backgroundColor: meeting.status === "ongoing" ? "#146454" : "#029ED6" }]}>
                        <Text style={styles.meetingStatusText}>
                          {meeting.status === "ongoing" ? "En cours" : "À venir"}
              </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
        </View>

        {/* Outils professionnels */}
        <View style={styles.toolsContainer}>
          <Text style={styles.sectionTitle}>Outils Professionnels</Text>
          <View style={styles.toolsGrid}>
              {tools.map((tool) => (
                <TouchableOpacity key={tool.id} style={styles.toolCard} activeOpacity={0.8}>
                  <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.toolGradient}>
                    <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
                      <Ionicons name={tool.icon as any} size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    <Text style={styles.toolDescription}>{tool.description}</Text>
                    <View style={styles.toolUsage}>
                      <Text style={styles.toolUsageText}>{tool.usage}% d'utilisation</Text>
                      <View style={styles.toolUsageBar}>
                        <View style={[styles.toolUsageFill, { width: `${tool.usage}%` }]} />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Récompenses */}
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Récompenses</Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <TouchableOpacity
                  key={achievement.id}
                  style={[styles.achievementCard, achievement.unlocked && styles.achievementUnlocked]}
                  activeOpacity={0.8}
                >
              <LinearGradient
                    colors={achievement.unlocked ? ["rgba(20, 100, 84, 0.15)", "rgba(2, 158, 214, 0.1)"] : ["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]} 
                    style={styles.achievementGradient}
              >
                    <View style={[styles.achievementIcon, achievement.unlocked && styles.achievementIconUnlocked]}>
                      <Ionicons 
                        name={achievement.icon as any} 
                        size={24} 
                        color={achievement.unlocked ? "#FFFFFF" : "#146454"} 
                      />
                    </View>
                    <Text style={[styles.achievementTitle, achievement.unlocked && styles.achievementTitleUnlocked]}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                    {!achievement.unlocked && (
                      <View style={styles.achievementProgress}>
                        <View style={styles.achievementProgressBar}>
                          <View style={[styles.achievementProgressFill, { width: `${achievement.progress}%` }]} />
                        </View>
                        <Text style={styles.achievementProgressText}>{achievement.progress}%</Text>
                      </View>
                    )}
              </LinearGradient>
            </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statCard}>
                <Ionicons name="videocam" size={24} color="#146454" />
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Réunions ce mois</Text>
              </LinearGradient>
              
              <LinearGradient colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} style={styles.statCard}>
                <Ionicons name="time" size={24} color="#029ED6" />
                <Text style={styles.statNumber}>18h</Text>
                <Text style={styles.statLabel}>Temps total</Text>
              </LinearGradient>
              
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statCard}>
                <Ionicons name="people" size={24} color="#146454" />
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>Participants</Text>
              </LinearGradient>
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
    paddingBottom: 20,
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
  meetingStatusContainer: {
    paddingHorizontal: 20,
    marginVertical: 20,
    position: "relative",
  },
  meetingGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#146454",
    opacity: 0.1,
    top: -40,
    left: -40,
    zIndex: -1,
  },
  meetingCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  meetingGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
  },
  meetingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  meetingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 16,
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  meetingIconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
  },
  meetingSubtitle: {
    fontSize: 14,
    color: "#146454",
    opacity: 0.7,
    marginBottom: 4,
  },
  meetingDuration: {
    fontSize: 12,
    color: "#029ED6",
    fontWeight: "600",
  },
  meetingToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  participantsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 16,
  },
  participantsGrid: {
    gap: 12,
  },
  participantCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  participantGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#146454",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  participantAvatarSpeaking: {
    backgroundColor: "#029ED6",
  },
  participantInitial: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  speakingIndicator: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#029ED6",
    opacity: 0.3,
    top: -5,
    left: -5,
    zIndex: -1,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    marginBottom: 4,
  },
  speakingStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  speakingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  speakingText: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
  },
  transcriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  transcriptionBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  transcriptionText: {
    fontSize: 16,
    color: "#146454",
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: "500",
  },
  transcriptionControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  transcriptionButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  transcriptionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  transcriptionButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 6,
    fontWeight: "600",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF4757",
    marginRight: 8,
  },
  recordingText: {
    fontSize: 12,
    color: "#146454",
    fontWeight: "600",
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
    width: 60,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#146454",
    borderRadius: 2,
  },
  meetingsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  meetingsGrid: {
    gap: 12,
  },
  meetingCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  meetingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  meetingTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  meetingCardInfo: {
    flex: 1,
  },
  meetingCardTitle: {
    fontSize: 14,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 2,
  },
  meetingCardDetails: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
  },
  meetingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  meetingStatusText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  toolsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  toolCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  toolGradient: {
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 14,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  toolDescription: {
    fontSize: 10,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 8,
  },
  toolUsage: {
    width: "100%",
  },
  toolUsageText: {
    fontSize: 10,
    color: "#146454",
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  toolUsageBar: {
    height: 3,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  toolUsageFill: {
    height: "100%",
    backgroundColor: "#146454",
    borderRadius: 2,
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  achievementUnlocked: {
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  achievementGradient: {
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
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementIconUnlocked: {
    backgroundColor: "#146454",
  },
  achievementTitle: {
    fontSize: 14,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  achievementTitleUnlocked: {
    color: "#146454",
  },
  achievementDescription: {
    fontSize: 10,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 14,
  },
  achievementProgress: {
    marginTop: 8,
    width: "100%",
  },
  achievementProgressBar: {
    height: 3,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: "100%",
    backgroundColor: "#146454",
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 8,
    color: "#146454",
    textAlign: "center",
    fontWeight: "500",
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
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
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
})

export default ProfessionalScreen
