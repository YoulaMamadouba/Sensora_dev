"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useForm, Controller } from "react-hook-form"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../context/AuthContext"
import { impactAsync, notificationAsync } from "../utils/platformUtils"
import { ImpactFeedbackStyle, NotificationFeedbackType } from "expo-haptics"

interface FormData {
  email: string
  password: string
  name?: string
  confirmPassword?: string
}

const AuthScreen: React.FC = () => {
  const navigation = useNavigation()
  const { login, register, userType } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const formOpacity = useSharedValue(0)
  const buttonScale = useSharedValue(1)
  const headerY = useSharedValue(-50)
  const inputsY = useSharedValue(30)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  // Animation d'entrée
  useEffect(() => {
    headerY.value = withTiming(0, { duration: 800 })
    formOpacity.value = withTiming(1, { duration: 1000 })
    inputsY.value = withTiming(0, { duration: 800 })
  }, [])

  const toggleAuthMode = () => {
    impactAsync()
    setIsLogin(!isLogin)
    setShowForgotPassword(false)
    reset()
  }

  const handleForgotPassword = () => {
    impactAsync()
    setShowForgotPassword(true)
    // Simulation d'envoi d'email
    setTimeout(() => {
      setShowForgotPassword(false)
      Alert.alert("Email envoyé", "Un email de réinitialisation a été envoyé à votre adresse email.")
    }, 2000)
  }

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerY.value }],
  }))

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }))

  const inputsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: inputsY.value }],
  }))

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  return (
    <LinearGradient colors={["#FFFFFF", "#F8F9FA", "#FFFFFF"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <LinearGradient colors={["#146454", "#0F4A3A"]} style={styles.titleGradient}>
                <Text style={styles.title}>{isLogin ? "Connexion" : "Inscription"}</Text>
              </LinearGradient>

              <View style={styles.userTypeBadge}>
                <Ionicons name={userType === "hearing" ? "ear" : "hand-left"} size={16} color="#146454" />
                <Text style={styles.userTypeText}>
                  {userType === "hearing" ? "Personne entendante" : "Personne sourde"}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <Animated.View style={inputsAnimatedStyle}>
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nom complet</Text>
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Le nom est requis" }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                        <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Votre nom complet"
                          placeholderTextColor="#999"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Adresse email</Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "L'email est requis",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Email invalide",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                      <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="votre@email.com"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 caractères",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    rules={{ required: "Confirmez le mot de passe" }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor="#999"
                          secureTextEntry={true}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
                </View>
              )}
            </Animated.View>

            {/* Submit Button */}
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                disabled={isLoading}
                onPress={handleSubmit(async (data: FormData) => {
                  if (!userType) {
                    Alert.alert("Erreur", "Veuillez sélectionner un type d'utilisateur (sourd/entendant)")
                    return
                  }

                  setIsLoading(true)
                  impactAsync()
                  
                  try {
                    if (isLogin) {
                      // Connexion
                      const success = await login(data.email, data.password, userType)
                      if (success) {
                        notificationAsync(NotificationFeedbackType.Success)
                        // Redirection vers l'écran principal après connexion réussie
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Main' as never }],
                        })
                      } else {
                        notificationAsync(NotificationFeedbackType.Error)
                        Alert.alert("Erreur", "Email ou mot de passe incorrect")
                      }
                    } else {
                      // Inscription
                      if (data.password !== data.confirmPassword) {
                        Alert.alert("Erreur", "Les mots de passe ne correspondent pas")
                        return
                      }
                      
                      const success = await register(data.email, data.password, data.name || "", userType)
                      
                      if (success) {
                        // Si l'inscription et la connexion automatique réussissent
                        notificationAsync(NotificationFeedbackType.Success)
                        // Redirection vers l'écran principal
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Main' as never }],
                        })
                      }
                      // Si l'inscription nécessite une confirmation par email
                      // La méthode register affichera déjà une alerte
                    }
                  } catch (err) {
                    console.error('Erreur lors de l\'authentification:', err)
                    // Ne pas afficher d'alerte ici, car les erreurs sont déjà gérées dans les méthodes login/register
                  } finally {
                    setIsLoading(false)
                    formOpacity.value = withTiming(1)
                    buttonScale.value = withSpring(1)
                  }
                })}
              >
                <LinearGradient
                  colors={isLoading ? ["#999", "#666"] : ["#146454", "#0F4A3A"]}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.submitButtonText}>Chargement...</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name={isLogin ? "log-in-outline" : "person-add-outline"} size={20} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>{isLogin ? "Se connecter" : "S'inscrire"}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Forgot Password */}
            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                disabled={showForgotPassword}
              >
                <Text style={[styles.forgotPasswordText, showForgotPassword && styles.forgotPasswordDisabled]}>
                  {showForgotPassword ? "Envoi en cours..." : "Mot de passe oublié ?"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Switch Mode */}
            <TouchableOpacity style={styles.switchMode} onPress={toggleAuthMode}>
              <Text style={styles.switchModeText}>
                {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
                <Text style={styles.switchModeLink}>{isLogin ? "S'inscrire" : "Se connecter"}</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 10,
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: "center",
  },
  titleGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  userTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 100, 84, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.3)",
  },
  userTypeText: {
    fontSize: 14,
    color: "#146454",
    marginLeft: 8,
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: "#146454",
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.2)",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#146454",
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 32,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  forgotPassword: {
    alignItems: "center",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#146454",
    fontSize: 14,
    fontWeight: "500",
  },
  forgotPasswordDisabled: {
    opacity: 0.5,
  },
  switchMode: {
    alignItems: "center",
    paddingBottom: 40,
  },
  switchModeText: {
    color: "#146454",
    fontSize: 14,
    opacity: 0.8,
  },
  switchModeLink: {
    color: "#029ED6",
    fontWeight: "600",
  },
})

export default AuthScreen
