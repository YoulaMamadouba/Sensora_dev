import type React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { View, StyleSheet } from "react-native"

import HomeScreen from "../screens/HomeScreen"
import VoiceToSignScreen from "../screens/modules/VoiceToSignScreen"
import SignToVoiceScreen from "../screens/modules/SignToVoiceScreen"
import HealthScreen from "../screens/modules/HealthScreen"
import EducationScreen from "../screens/modules/EducationScreen"
import ProfessionalScreen from "../screens/modules/ProfessionalScreen"
import TranslationScreen from "../screens/modules/TranslationScreen"
import ProfileScreen from "../screens/ProfileScreen"

const Tab = createBottomTabNavigator()

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline"
              break
            case "VoiceToSign":
              iconName = focused ? "mic" : "mic-outline"
              break
            case "SignToVoice":
              iconName = focused ? "hand-left" : "hand-left-outline"
              break
            case "Health":
              iconName = focused ? "heart" : "heart-outline"
              break
            case "Education":
              iconName = focused ? "school" : "school-outline"
              break
            case "Professional":
              iconName = focused ? "briefcase" : "briefcase-outline"
              break
            case "Translation":
              iconName = focused ? "language" : "language-outline"
              break
            case "Profile":
              iconName = focused ? "person" : "person-outline"
              break
            default:
              iconName = "circle"
          }

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              {focused && <View style={styles.iconGlow} />}
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          )
        },
        tabBarActiveTintColor: "#00E0B8",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#182825",
          borderTopColor: "rgba(0, 224, 184, 0.3)",
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Accueil" }} />
      <Tab.Screen name="VoiceToSign" component={VoiceToSignScreen} options={{ tabBarLabel: "Voix→Signes" }} />
      <Tab.Screen name="SignToVoice" component={SignToVoiceScreen} options={{ tabBarLabel: "Signes→Voix" }} />
      <Tab.Screen name="Health" component={HealthScreen} options={{ tabBarLabel: "Santé" }} />
      <Tab.Screen name="Education" component={EducationScreen} options={{ tabBarLabel: "Éducation" }} />
      <Tab.Screen name="Professional" component={ProfessionalScreen} options={{ tabBarLabel: "Pro" }} />
      <Tab.Screen name="Translation" component={TranslationScreen} options={{ tabBarLabel: "Langues" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profil" }} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    padding: 8,
    borderRadius: 12,
  },
  iconContainerFocused: {
    backgroundColor: "rgba(0, 224, 184, 0.15)",
  },
  iconGlow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    backgroundColor: "#00E0B8",
    borderRadius: 8,
    opacity: 0.2,
  },
})

export default MainTabNavigator
