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

interface Course {
  id: string
  title: string
  description: string
  icon: string
  progress: number
  difficulty: "Débutant" | "Intermédiaire" | "Avancé"
  duration: string
  lessons: number
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

const EducationScreen: React.FC = () => {
  const navigation = useNavigation()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentLesson, setCurrentLesson] = useState<string>("")
  const [isLearning, setIsLearning] = useState(false)
  const [userLevel, setUserLevel] = useState(5)
  const [experience, setExperience] = useState(1250)
  const [streak, setStreak] = useState(7)

  // Animations values
  const backgroundScale = useSharedValue(1)
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)
  const lessonScale = useSharedValue(1)
  const progressScale = useSharedValue(1)
  const achievementScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0)
  const pulseScale = useSharedValue(1)

  // Animation d'entrée
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 })
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 1000 }))
    backgroundScale.value = withSpring(1, { damping: 15, stiffness: 100 })
  }, [])

  useEffect(() => {
    // Animation de pulsation continue
    pulseScale.value = withRepeat(
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
  }, [])

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedCategory(category)
  }

  const handleLessonPress = (lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setCurrentLesson(lessonId)
    setIsLearning(true)
    
    // Simulation d'apprentissage
    setTimeout(() => {
      setIsLearning(false)
      setExperience(prev => prev + 50)
      if (experience >= 2000) {
        setUserLevel(prev => prev + 1)
        setExperience(0)
      }
    }, 3000)
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

  const lessonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lessonScale.value }],
  }))

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressScale.value }],
  }))

  const achievementAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: achievementScale.value }],
  }))

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const courses: Course[] = [
    {
      id: "alphabet",
      title: "Alphabet LSF",
      description: "Apprenez l'alphabet en langue des signes française",
      icon: "school",
      progress: 85,
      difficulty: "Débutant",
      duration: "2h 30min",
      lessons: 12,
      color: "#146454",
    },
    {
      id: "conversation",
      title: "Conversation",
      description: "Dialogues de base et expressions courantes",
      icon: "chatbubbles",
      progress: 60,
      difficulty: "Intermédiaire",
      duration: "4h 15min",
      lessons: 18,
      color: "#029ED6",
    },
    {
      id: "vocabulary",
      title: "Vocabulaire",
      description: "Mots essentiels et expressions quotidiennes",
      icon: "book",
      progress: 45,
      difficulty: "Intermédiaire",
      duration: "3h 45min",
      lessons: 15,
      color: "#146454",
    },
    {
      id: "grammar",
      title: "Grammaire",
      description: "Structure des phrases et règles grammaticales",
      icon: "library",
      progress: 25,
      difficulty: "Avancé",
      duration: "5h 20min",
      lessons: 22,
      color: "#029ED6",
    },
    {
      id: "culture",
      title: "Culture Sourde",
      description: "Histoire et culture de la communauté sourde",
      icon: "people",
      progress: 90,
      difficulty: "Débutant",
      duration: "1h 45min",
      lessons: 8,
      color: "#146454",
    },
    {
      id: "profession",
      title: "Langage Professionnel",
      description: "Vocabulaire pour le monde du travail",
      icon: "briefcase",
      progress: 30,
      difficulty: "Avancé",
      duration: "6h 10min",
      lessons: 25,
      color: "#029ED6",
    },
  ]

  const achievements: Achievement[] = [
    {
      id: "first_lesson",
      title: "Premier Pas",
      description: "Complétez votre première leçon",
      icon: "star",
      unlocked: true,
      progress: 100,
    },
    {
      id: "week_streak",
      title: "Déterminé",
      description: "7 jours consécutifs d'apprentissage",
      icon: "flame",
      unlocked: true,
      progress: 100,
    },
    {
      id: "alphabet_master",
      title: "Maître de l'Alphabet",
      description: "Maîtrisez l'alphabet LSF",
      icon: "school",
      unlocked: false,
      progress: 85,
    },
    {
      id: "conversation_expert",
      title: "Expert en Conversation",
      description: "Complétez le module conversation",
      icon: "chatbubbles",
      unlocked: false,
      progress: 60,
    },
  ]

  const categories = [
    { id: "all", name: "Tout", icon: "grid" },
    { id: "beginner", name: "Débutant", icon: "school" },
    { id: "intermediate", name: "Intermédiaire", icon: "library" },
    { id: "advanced", name: "Avancé", icon: "trophy" },
  ]

  const filteredCourses = selectedCategory === "all" 
    ? courses 
    : courses.filter(course => {
        if (selectedCategory === "beginner") return course.difficulty === "Débutant"
        if (selectedCategory === "intermediate") return course.difficulty === "Intermédiaire"
        if (selectedCategory === "advanced") return course.difficulty === "Avancé"
        return true
      })

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
          <Text style={styles.title}>Éducation</Text>
          <Text style={styles.subtitle}>Apprenez la langue des signes à votre rythme</Text>
        </View>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Profil utilisateur */}
          <View style={styles.profileContainer}>
            <Animated.View style={[styles.profileGlow, glowAnimatedStyle]} />
            <Animated.View style={[styles.profileCard, pulseAnimatedStyle]}>
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.profileGradient}>
                <View style={styles.profileInfo}>
                  <View style={styles.levelContainer}>
                    <LinearGradient colors={["#146454", "#029ED6"]} style={styles.levelGradient}>
                      <Text style={styles.levelText}>{userLevel}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.profileDetails}>
                    <Text style={styles.profileName}>Apprenant</Text>
                    <Text style={styles.profileSubtitle}>Niveau {userLevel} • {streak} jours de suite</Text>
                  </View>
                </View>
                <View style={styles.experienceContainer}>
                  <Text style={styles.experienceText}>{experience}/2000 XP</Text>
                  <View style={styles.experienceBar}>
                    <View style={[styles.experienceFill, { width: `${(experience / 2000) * 100}%` }]} />
                  </View>
                </View>
            </LinearGradient>
          </Animated.View>
        </View>

          {/* Catégories */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Catégories</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, selectedCategory === category.id && styles.categoryCardSelected]}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.8}
                >
          <LinearGradient
                    colors={selectedCategory === category.id ? ["#146454", "#029ED6"] : ["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} 
                    style={styles.categoryGradient}
          >
                    <Ionicons 
                      name={category.icon as any} 
                      size={24} 
                      color={selectedCategory === category.id ? "#FFFFFF" : "#146454"} 
                    />
                    <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextSelected]}>
                      {category.name}
                    </Text>
            </LinearGradient>
          </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cours */}
          <View style={styles.coursesContainer}>
            <Text style={styles.sectionTitle}>Cours disponibles</Text>
            <View style={styles.coursesGrid}>
              {filteredCourses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() => handleLessonPress(course.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.courseGradient}>
                    <View style={styles.courseHeader}>
                      <View style={[styles.courseIcon, { backgroundColor: course.color }]}>
                        <Ionicons name={course.icon as any} size={24} color="#FFFFFF" />
                      </View>
                      <View style={styles.courseInfo}>
                        <Text style={styles.courseTitle}>{course.title}</Text>
                        <Text style={styles.courseDescription}>{course.description}</Text>
        </View>
        </View>

                    <View style={styles.courseDetails}>
                      <View style={styles.courseStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="time" size={12} color="#146454" />
                          <Text style={styles.statText}>{course.duration}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="book" size={12} color="#146454" />
                          <Text style={styles.statText}>{course.lessons} leçons</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="trophy" size={12} color="#146454" />
                          <Text style={styles.statText}>{course.difficulty}</Text>
                        </View>
          </View>

                      <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{course.progress}%</Text>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
                        </View>
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

          {/* Statistiques d'apprentissage */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statCard}>
                <Ionicons name="time" size={24} color="#146454" />
                <Text style={styles.statNumber}>12h 30min</Text>
                <Text style={styles.statLabel}>Temps d'apprentissage</Text>
              </LinearGradient>
              
              <LinearGradient colors={["rgba(2, 158, 214, 0.1)", "rgba(20, 100, 84, 0.05)"]} style={styles.statCard}>
                <Ionicons name="trophy" size={24} color="#029ED6" />
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Cours complétés</Text>
              </LinearGradient>
              
              <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statCard}>
                <Ionicons name="star" size={24} color="#146454" />
                <Text style={styles.statNumber}>95%</Text>
                <Text style={styles.statLabel}>Taux de réussite</Text>
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
  profileContainer: {
    paddingHorizontal: 20,
    marginVertical: 20,
    position: "relative",
  },
  profileGlow: {
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
  profileCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  profileGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  levelContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginRight: 16,
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  levelGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  levelText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: "#146454",
    opacity: 0.7,
  },
  experienceContainer: {
    marginTop: 8,
  },
  experienceText: {
    fontSize: 12,
    color: "#146454",
    marginBottom: 8,
    fontWeight: "500",
  },
  experienceBar: {
    height: 6,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  experienceFill: {
    height: "100%",
    backgroundColor: "#146454",
    borderRadius: 3,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  categoryCardSelected: {
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryGradient: {
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
  categoryText: {
    fontSize: 12,
    color: "#146454",
    fontWeight: "600",
    marginTop: 8,
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  coursesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  coursesGrid: {
    gap: 16,
  },
  courseCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  courseGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
  },
  courseHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  courseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    lineHeight: 16,
  },
  courseDetails: {
    gap: 12,
  },
  courseStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 10,
    color: "#146454",
    marginLeft: 4,
    fontWeight: "500",
  },
  progressContainer: {
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#146454",
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
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

export default EducationScreen
