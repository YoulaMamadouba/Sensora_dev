"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import * as Haptics from "expo-haptics"

const { width } = Dimensions.get("window")

interface Course {
  id: string
  title: string
  description: string
  progress: number
  lessons: number
  icon: string
  color: string
}

interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

const EducationScreen: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const progressAnimation = useSharedValue(0)

  const courses: Course[] = [
    {
      id: "1",
      title: "Alphabet LSF",
      description: "Apprenez l'alphabet en langue des signes française",
      progress: 75,
      lessons: 26,
      icon: "hand-right",
      color: "#00E0B8",
    },
    {
      id: "2",
      title: "Nombres et Chiffres",
      description: "Maîtrisez les nombres en LSF",
      progress: 45,
      lessons: 15,
      icon: "calculator",
      color: "#4ECDC4",
    },
    {
      id: "3",
      title: "Expressions Courantes",
      description: "Phrases utiles du quotidien",
      progress: 20,
      lessons: 30,
      icon: "chatbubbles",
      color: "#45B7D1",
    },
    {
      id: "4",
      title: "Famille et Relations",
      description: "Vocabulaire familial et social",
      progress: 60,
      lessons: 20,
      icon: "people",
      color: "#96CEB4",
    },
  ]

  const sampleQuiz: Quiz = {
    id: "1",
    question: 'Comment dit-on "Bonjour" en LSF ?',
    options: ["Main ouverte vers le haut", "Pouce levé", "Main qui salue", "Index pointé vers soi"],
    correctAnswer: 2,
  }

  const handleCourseSelect = (course: Course) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedCourse(course)
    progressAnimation.value = withTiming(course.progress / 100)
  }

  const startQuiz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setCurrentQuiz(sampleQuiz)
    setShowResult(false)
  }

  const handleQuizAnswer = (selectedOption: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const isCorrect = selectedOption === currentQuiz!.correctAnswer
    setQuizScore(isCorrect ? 100 : 0)
    setShowResult(true)

    setTimeout(() => {
      setCurrentQuiz(null)
      setShowResult(false)
    }, 3000)
  }

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }))

  if (currentQuiz) {
    return (
      <LinearGradient colors={["#182825", "#0f1f1c"]} style={styles.container}>
        <View style={styles.quizContainer}>
          <Text style={styles.quizTitle}>Quiz Interactif</Text>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>{currentQuiz.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentQuiz.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  showResult && index === currentQuiz.correctAnswer && styles.correctOption,
                  showResult && index !== currentQuiz.correctAnswer && styles.wrongOption,
                ]}
                onPress={() => !showResult && handleQuizAnswer(index)}
                disabled={showResult}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {showResult && (
            <View style={styles.resultContainer}>
              <Ionicons
                name={quizScore > 0 ? "checkmark-circle" : "close-circle"}
                size={48}
                color={quizScore > 0 ? "#4ECDC4" : "#FF6B6B"}
              />
              <Text style={styles.resultText}>{quizScore > 0 ? "Correct !" : "Incorrect !"}</Text>
              <Text style={styles.scoreText}>Score: {quizScore}%</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#182825", "#0f1f1c"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Modules Éducatifs</Text>
          <Text style={styles.subtitle}>Apprenez la langue des signes</Text>
        </View>

        {selectedCourse ? (
          <View style={styles.courseDetailContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedCourse(null)}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>

            <View style={styles.courseDetail}>
              <LinearGradient
                colors={[selectedCourse.color, `${selectedCourse.color}CC`]}
                style={styles.courseDetailGradient}
              >
                <Ionicons name={selectedCourse.icon as any} size={48} color="#FFFFFF" />
                <Text style={styles.courseDetailTitle}>{selectedCourse.title}</Text>
                <Text style={styles.courseDetailDescription}>{selectedCourse.description}</Text>

                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progression: {selectedCourse.progress}%</Text>
                  <View style={styles.progressBarContainer}>
                    <Animated.View
                      style={[styles.progressBarFill, progressAnimatedStyle, { backgroundColor: "#FFFFFF" }]}
                    />
                  </View>
                </View>

                <Text style={styles.lessonsCount}>{selectedCourse.lessons} leçons disponibles</Text>
              </LinearGradient>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={startQuiz}>
                <LinearGradient colors={["#00E0B8", "#00c4a0"]} style={styles.actionButtonGradient}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Commencer Quiz</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient colors={["#45B7D1", "#3498db"]} style={styles.actionButtonGradient}>
                  <Ionicons name="videocam" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Voir Démo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Avatar de démonstration */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarTitle}>Avatar de Démonstration</Text>
              <View style={styles.avatarPlaceholder}>
                <LinearGradient
                  colors={["rgba(0, 224, 184, 0.1)", "rgba(0, 224, 184, 0.05)"]}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="person" size={60} color="#00E0B8" />
                  <Text style={styles.avatarText}>Avatar 3D</Text>
                  <Text style={styles.avatarSubtext}>Démonstration des gestes en temps réel</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.coursesContainer}>
            <Text style={styles.sectionTitle}>Cours Disponibles</Text>

            {courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => handleCourseSelect(course)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[`${course.color}20`, `${course.color}10`]} style={styles.courseCardGradient}>
                  <View style={styles.courseCardHeader}>
                    <View style={[styles.courseIcon, { backgroundColor: course.color }]}>
                      <Ionicons name={course.icon as any} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      <Text style={styles.courseDescription}>{course.description}</Text>
                    </View>
                  </View>

                  <View style={styles.courseStats}>
                    <Text style={styles.courseProgress}>{course.progress}% complété</Text>
                    <Text style={styles.courseLessons}>{course.lessons} leçons</Text>
                  </View>

                  <View style={styles.courseProgressBar}>
                    <View
                      style={[
                        styles.courseProgressFill,
                        {
                          width: `${course.progress}%`,
                          backgroundColor: course.color,
                        },
                      ]}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  coursesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 20,
  },
  courseCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  courseCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  courseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: "#999",
  },
  courseStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  courseProgress: {
    fontSize: 14,
    color: "#00E0B8",
    fontWeight: "bold",
  },
  courseLessons: {
    fontSize: 14,
    color: "#999",
  },
  courseProgressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  courseProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  courseDetailContainer: {
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  courseDetail: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 30,
  },
  courseDetailGradient: {
    padding: 30,
    alignItems: "center",
  },
  courseDetailTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  courseDetailDescription: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 24,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  lessonsCount: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatarTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
  },
  avatarGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.3)",
  },
  avatarText: {
    fontSize: 18,
    color: "#00E0B8",
    fontWeight: "bold",
    marginTop: 12,
  },
  avatarSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  quizContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  quizTitle: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  questionContainer: {
    backgroundColor: "rgba(0, 224, 184, 0.1)",
    padding: 24,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.3)",
  },
  question: {
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  correctOption: {
    backgroundColor: "rgba(78, 205, 196, 0.2)",
    borderColor: "#4ECDC4",
  },
  wrongOption: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderColor: "#FF6B6B",
  },
  optionText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
  resultContainer: {
    alignItems: "center",
  },
  resultText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 16,
  },
  scoreText: {
    fontSize: 18,
    color: "#00E0B8",
    marginTop: 8,
  },
})

export default EducationScreen
