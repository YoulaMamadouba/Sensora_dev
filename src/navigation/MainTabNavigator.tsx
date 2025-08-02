import type React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { View, StyleSheet } from "react-native"

import HomeScreen from "../screens/HomeScreen"
import HealthScreen from "../screens/modules/HealthScreen"
import EducationScreen from "../screens/modules/EducationScreen"
import ProfessionalScreen from "../screens/modules/ProfessionalScreen"
import VoiceToSignModule from "../screens/modules/VoiceToSignModule"
import SignToVoiceModule from "../screens/modules/SignToVoiceModule"
import TranslationScreen from "../screens/modules/TranslationScreen"
import ProfileScreen from "../screens/ProfileScreen"
import TextToSignModule from "../screens/modules/TextToSignModule"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

export type RootStackParamList = {
  MainTabs: undefined
  VoiceToSign: undefined
  SignToVoice: undefined
  Translation: undefined
  Professional: undefined
  TextToSign: undefined
}

const MainTabNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="VoiceToSign" component={VoiceToSignModule} />
      <Stack.Screen name="SignToVoice" component={SignToVoiceModule} />
      <Stack.Screen name="Translation" component={TranslationScreen} />
      <Stack.Screen name="Professional" component={ProfessionalScreen} />
      <Stack.Screen name="TextToSign" component={TextToSignModule} />
    </Stack.Navigator>
  )
}

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline"
              break
            case "Health":
              iconName = focused ? "heart" : "heart-outline"
              break
            case "Education":
              iconName = focused ? "school" : "school-outline"
              break
            case "Profile":
              iconName = focused ? "person" : "person-outline"
              break

            // default:
            //   iconName = "circle"
          }

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              {focused && <View style={styles.iconGlow} />}
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          )
        },
        tabBarActiveTintColor: "#146454",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "rgba(20, 100, 84, 0.2)",
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 12,
          paddingTop: 12,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Accueil" }} />
      <Tab.Screen name="Health" component={HealthScreen} options={{ tabBarLabel: "Santé" }} />
      <Tab.Screen name="Education" component={EducationScreen} options={{ tabBarLabel: "Éducation" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profil" }} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    padding: 10,
    borderRadius: 16,
    marginBottom: 4,
  },
  iconContainerFocused: {
    backgroundColor: "rgba(20, 100, 84, 0.12)",
  },
  iconGlow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    backgroundColor: "#029ED6",
    borderRadius: 10,
    opacity: 0.15,
  },
})

export default MainTabNavigator
