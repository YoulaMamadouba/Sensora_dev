import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensora</Text>
        <Text style={styles.subtitle}>Application de communication accessible</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.info}>
          Bienvenue dans Sensora, votre application de communication accessible.
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featureTitle}>Fonctionnalités :</Text>
          <Text style={styles.feature}>• Traduction en temps réel</Text>
          <Text style={styles.feature}>• Reconnaissance vocale</Text>
          <Text style={styles.feature}>• Interface adaptée</Text>
          <Text style={styles.feature}>• Support multilingue</Text>
        </View>
        
        <Text style={styles.mobileNote}>
          💡 Pour une expérience complète, utilisez Expo Go sur votre téléphone mobile.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#182825',
    //minHeight: '100vh',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#1a2f2c',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
  },
  features: {
    marginBottom: 30,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  feature: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 8,
    textAlign: 'center',
  },
  mobileNote: {
    fontSize: 14,
    color: '#aaaaaa',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
})
