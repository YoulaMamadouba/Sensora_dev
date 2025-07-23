"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { useNavigation } from "@react-navigation/native"
import * as Haptics from "expo-haptics"

const ProfileScreen: React.FC = () => {
  const { user, logout, userType } = useAuth()
  const navigation = useNavigation()

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          logout()
          navigation.navigate("Intro" as never)
        },
      },
    ])
  }

  const menuItems = [
    {
      id: "settings",
      title: "Paramètres",
      icon: "settings",
      color: "#00E0B8",
    },
    {
      id: "accessibility",
      title: "Accessibilité",
      icon: "accessibility",
      color: "#4ECDC4",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "notifications",
      color: "#45B7D1",
    },
    {
      id: "help",
      title: "Aide & Support",
      icon: "help-circle",
      color: "#96CEB4",
    },
    {
      id: "about",
      title: "À propos",
      icon: "information-circle",
      color: "#FFEAA7",
    },
  ]

  const stats = [
    { label: "Traductions", value: "1,234" },
    { label: "Leçons", value: "56" },
    { label: "Jours actifs", value: "23" },
  ]

  return (
    <LinearGradient colors={["#182825", "#0f1f1c"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec profil */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={["#00E0B8", "#00c4a0"]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.userName}>{user?.name || "Utilisateur"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.userTypeContainer}>
            <LinearGradient
              colors={userType === "hearing" ? ["#00E0B8", "#00c4a0"] : ["#FFFFFF", "#f0f0f0"]}
              style={styles.userTypeBadge}
            >
              <Ionicons
                name={userType === "hearing" ? "ear" : "hand-left"}
                size={16}
                color={userType === "hearing" ? "#182825" : "#182825"}
              />
              <Text style={[styles.userTypeText, { color: userType === "hearing" ? "#182825" : "#182825" }]}>
                {userType === "hearing" ? "Personne entendante" : "Personne sourde"}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Vos Statistiques</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Menu</Text>

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Informations de l'app */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.sectionTitle}>Application</Text>

          <View style={styles.infoCard}>
            <LinearGradient
              colors={["rgba(0, 224, 184, 0.1)", "rgba(0, 224, 184, 0.05)"]}
              style={styles.infoCardGradient}
            >
              <View style={styles.appLogo}>
                <Text style={styles.appLogoText}>S</Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>SENSORA</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
                <Text style={styles.appDescription}>Connecter les mondes à travers la technologie</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <LinearGradient colors={["#FF6B6B", "#FF5252"]} style={styles.logoutButtonGradient}>
              <Ionicons name="log-out" size={24} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00E0B8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#182825",
  },
  userName: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#999",
    marginBottom: 16,
  },
  userTypeContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  userTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    color: "#00E0B8",
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
  },
  appInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  infoCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 224, 184, 0.3)",
  },
  appLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00E0B8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  appLogoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#182825",
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#00E0B8",
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 12,
    color: "#999",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  logoutButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  logoutButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 12,
  },
})

export default ProfileScreen
