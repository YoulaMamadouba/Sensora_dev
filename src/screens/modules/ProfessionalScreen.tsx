"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"

const { width } = Dimensions.get("window")

const ProfessionalScreen: React.FC = () => {
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [realTimeText, setRealTimeText] = useState("")
  const [participants, setParticipants] = useState([
    { id: 1, name: "Marie Dupont", speaking: false },
    { id: 2, name: "Jean Martin", speaking: false },
    { id: 3, name: "Sophie Bernard", speaking: true },
  ])

  const meetingPulse = useSharedValue(1)
  const textOpacity = useSharedValue(0)

  useEffect(() => {
    if (isInMeeting) {
      // Animation de pulsation pour la réunion
      meetingPulse.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        false,
      )

      // Simulation de texte en temps réel
      const texts = [
        "Bonjour à tous, commençons la réunion...",
        "Le projet avance bien selon le planning.",
        "Nous devons finaliser les spécifications.",
        "Y a-t-il des questions sur ce point ?",
        "Parfait, passons au point suivant.",
      ]

      let textIndex = 0
      const interval = setInterval(() => {
        setRealTimeText(texts[textIndex])
        textOpacity.value = withSequence(withTiming(0, { duration: 200 }), withTiming(1, { duration: 400 }))
        textIndex = (textIndex + 1) % texts.length

        // Simulation de changement d'orateur
        setParticipants((prev) =>
          prev.map((p, index) => ({
            ...p,
            speaking: index === Math.floor(Math.random() * prev.length),
          })),
        )
      }, 3000)

      return () => clearInterval(interval)
    } else {
      meetingPulse.value = withTiming(1)
      textOpacity.value = withTiming(0)
    }
  }, [isInMeeting])

  const handleMeetingToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsInMeeting(!isInMeeting)
    if (!isInMeeting) {
      setRealTimeText("")
    }
  }

  const meetingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: meetingPulse.value }],
  }))

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  return (
    <LinearGradient colors={["#182825", "#0f1f1c", "#182825"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Insertion Professionnelle</Text>
          <Text style={styles.subtitle}>Outils pour le monde du travail</Text>
        </View>

        {/* État de la réunion */}
        <View style={styles.meetingStatusContainer}>
          <LinearGradient
            colors={
              isInMeeting
                ? ["rgba(0, 224, 184, 0.2)", "rgba(0, 224, 184, 0.1)"]
                : ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
            }
            style={styles.meetingStatusGradient}
          >
            <Animated.View style={[styles.meetingIndicator, meetingAnimatedStyle]}>
              <Ionicons
                name={isInMeeting ? "videocam" : "videocam-off"}
                size={32}
                color={isInMeeting ? "#00E0B8" : "#999"}
              />
            </Animated.View>
            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle}>{isInMeeting ? "Réunion en cours" : "Hors réunion"}</Text>
              <Text style={styles.meetingSubtitle}>{isInMeeting ? "Transcription active" : "Prêt à rejoindre"}</Text>
            </View>
            <TouchableOpacity style={styles.meetingToggle} onPress={handleMeetingToggle}>
              <LinearGradient
                colors={isInMeeting ? ["#FF6B6B", "#FF5252"] : ["#00E0B8", "#00c4a0"]}
                style={styles.toggleGradient}
              >
                <Ionicons name={isInMeeting ? "stop" : "play"} size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Participants */}
        {isInMeeting && (
          <View style={styles.participantsContainer}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <View style={styles.participantsList}>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantCard}>
                  <LinearGradient
                    colors={
                      participant.speaking
                        ? ["rgba(0, 224, 184, 0.2)", "rgba(0, 224, 184, 0.1)"]
                        : ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
                    }
                    style={styles.participantGradient}
                  >
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantInitial}>{participant.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>{participant.name}</Text>
                      <View style={styles.speakingIndicator}>
                        <View
                          style={[
                            styles.speakingDot,
                            {
                              backgroundColor: participant.speaking ? "#00E0B8" : "#999",
                            },
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
        <View style={styles.transcriptionContainer}>
          <Text style={styles.sectionTitle}>Transcription en temps réel</Text>
          <LinearGradient colors={["rgba(0, 0, 0, 0.6)", "rgba(0, 0, 0, 0.4)"]} style={styles.transcriptionBox}>
            <Animated.View style={textAnimatedStyle}>
              <Text style={styles.transcriptionText}>
                {isInMeeting && realTimeText ? realTimeText : "La transcription apparaîtra ici pendant la réunion"}
              </Text>
            </Animated.View>

            {isInMeeting && (
              <View style={styles.transcriptionControls}>
                <TouchableOpacity style={styles.transcriptionButton}>
                  <Ionicons name="download" size={16} color="#00E0B8" />
                  <Text style={styles.transcriptionButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transcriptionButton}>
                  <Ionicons name="share" size={16} color="#00E0B8" />
                  <Text style={styles.transcriptionButtonText}>Partager</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Avatar assistant */}
        <View style={styles.assistantContainer}>
          <Text style={styles.sectionTitle}>Assistant Virtuel</Text>
          <LinearGradient colors={["rgba(0, 224, 184, 0.1)", "rgba(0, 224, 184, 0.05)"]} style={styles.assistantBox}>
            <View style={styles.assistantAvatar}>
              <Ionicons name="person-circle" size={60} color="#00E0B8" />
            </View>
            <View style={styles.assistantInfo}>
              <Text style={styles.assistantName}>Assistant Sensora</Text>
              <Text style={styles.assistantDescription}>
                Je vous aide à suivre les réunions avec des sous-titres et des résumés automatiques
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Outils professionnels */}
        <View style={styles.toolsContainer}>
          <Text style={styles.sectionTitle}>Outils Professionnels</Text>

          <View style={styles.toolsGrid}>
            <TouchableOpacity style={styles.toolCard}>
              <LinearGradient
                colors={["rgba(69, 183, 209, 0.2)", "rgba(69, 183, 209, 0.1)"]}
                style={styles.toolGradient}
              >
                <Ionicons name="document-text" size={32} color="#45B7D1" />
                <Text style={styles.toolTitle}>Prise de Notes</Text>
                <Text style={styles.toolDescription}>Notes automatiques</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard}>
              <LinearGradient
                colors={["rgba(150, 206, 180, 0.2)", "rgba(150, 206, 180, 0.1)"]}
                style={styles.toolGradient}
              >
                <Ionicons name="calendar" size={32} color="#96CEB4" />
                <Text style={styles.toolTitle}>Planification</Text>
                <Text style={styles.toolDescription}>Gestion d'agenda</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard}>
              <LinearGradient
                colors={["rgba(255, 234, 167, 0.2)", "rgba(255, 234, 167, 0.1)"]}
                style={styles.toolGradient}
              >
                <Ionicons name="mail" size={32} color="#FFEAA7" />
                <Text style={styles.toolTitle}>Communication</Text>
                <Text style={styles.toolDescription}>Emails adaptés</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolCard}>
              <LinearGradient
                colors={["rgba(255, 107, 107, 0.2)", "rgba(255, 107, 107, 0.1)"]}
                style={styles.toolGradient}
              >
                <Ionicons name="people" size={32} color="#FF6B6B" />
                <Text style={styles.toolTitle}>Collaboration</Text>
                <Text style={styles.toolDescription}>Travail d'équipe</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  meetingStatusContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: "hidden",
  },
  meetingStatusGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  meetingIndicator: {
    marginRight: 16,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
  },
  meetingSubtitle: {
    fontSize: 14,
    color: "#999",
  },
  meetingToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
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
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 16,
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  participantGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00E0B8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  participantInitial: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
  },
  speakingIndicator: {
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
    color: "#999",
  },
  transcriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  transcriptionBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.3)",
    minHeight: 120,
  },
  transcriptionText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
    marginBottom: 16,
  },
  transcriptionControls: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  transcriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 224, 184, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  transcriptionButtonText: {
    fontSize: 12,
    color: "#00E0B8",
    marginLeft: 6,
    fontWeight: "500",
  },
  assistantContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  assistantBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.3)",
  },
  assistantAvatar: {
    marginRight: 16,
  },
  assistantInfo: {
    flex: 1,
  },
  assistantName: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 8,
  },
  assistantDescription: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  toolsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  toolCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  toolGradient: {
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  toolTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  toolDescription: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
})

export default ProfessionalScreen
