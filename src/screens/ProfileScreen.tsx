"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { useNavigation } from "@react-navigation/native"
import { impactAsync } from "../utils/platformUtils"

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
          impactAsync()
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
      subtitle: "Personnalisez votre expérience",
      icon: "settings",
      color: "#146454",
    },
    {
      id: "accessibility",
      title: "Accessibilité",
      subtitle: "Adaptez l'interface à vos besoins",
      icon: "accessibility",
      color: "#029ED6",
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Gérez vos alertes",
      icon: "notifications",
      color: "#146454",
    },
    {
      id: "help",
      title: "Aide & Support",
      subtitle: "Besoin d'assistance ?",
      icon: "help-circle",
      color: "#029ED6",
    },
    {
      id: "about",
      title: "À propos",
      subtitle: "En savoir plus sur Sensora",
      icon: "information-circle",
      color: "#146454",
    },
  ]

  const stats = [
    { label: "Traductions", value: "1,234", icon: "language", color: "#146454" },
    { label: "Leçons", value: "56", icon: "school", color: "#029ED6" },
    { label: "Jours actifs", value: "23", icon: "calendar", color: "#146454" },
  ]

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Header avec profil */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={["#146454", "#029ED6"]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.userName}>{user?.name || "Utilisateur"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.userTypeContainer}>
            <LinearGradient
              colors={userType === "hearing" ? ["#146454", "#029ED6"] : ["#029ED6", "#146454"]}
              style={styles.userTypeBadge}
            >
              <Ionicons
                name={userType === "hearing" ? "ear" : "hand-left"}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.userTypeText}>
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
                <LinearGradient colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]} style={styles.statGradient}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                    <Ionicons name={stat.icon as any} size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
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
              onPress={() => impactAsync()}
              activeOpacity={0.8}
            >
              <LinearGradient colors={["rgba(20, 100, 84, 0.08)", "rgba(2, 158, 214, 0.04)"]} style={styles.menuItemGradient}>
                <View style={styles.menuItemContent}>
                  <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.menuItemTexts}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#146454" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Informations de l'app */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.sectionTitle}>Application</Text>

          <View style={styles.infoCard}>
            <LinearGradient
              colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]}
              style={styles.infoCardGradient}
            >
              <View style={styles.appLogo}>
                <LinearGradient colors={["#146454", "#029ED6"]} style={styles.appLogoGradient}>
                  <Text style={styles.appLogoText}>S</Text>
                </LinearGradient>
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
            <LinearGradient colors={["#FF4757", "#FF3742"]} style={styles.logoutButtonGradient}>
              <Ionicons name="log-out" size={24} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 28,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#146454",
    opacity: 0.7,
    marginBottom: 20,
  },
  userTypeContainer: {
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  userTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#FFFFFF",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statGradient: {
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    textAlign: "center",
    fontWeight: "500",
  },
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuItem: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItemGradient: {
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemTexts: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
  },
  appInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  infoCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.15)",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  appLogo: {
    marginRight: 16,
  },
  appLogoGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appLogoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#029ED6",
    marginBottom: 4,
    fontWeight: "600",
  },
  appDescription: {
    fontSize: 12,
    color: "#146454",
    opacity: 0.7,
    lineHeight: 16,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#FF4757",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  logoutButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  logoutButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 12,
  },
})

export default ProfileScreen
