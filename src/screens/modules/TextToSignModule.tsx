import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as Haptics from "expo-haptics"
import signDictionary from "../../../assets/data/signs_dictionary_clean.json"

const TextToSignModule: React.FC = () => {
  const navigation = useNavigation()
  const [inputText, setInputText] = useState("")
  const [convertedSequence, setConvertedSequence] = useState<string | null>(null)
  const [displayedEmojis, setDisplayedEmojis] = useState<string[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const handleConvert = async () => {
    if (isConverting) return
    setIsConverting(true)

    const cleanedText = inputText.toLowerCase().replace(/[.,!?]/g, "").trim()
    const outputEmojis: string[] = []

    const expressions = Object.keys(signDictionary).filter((key) => key.includes(" "))
    let remainingText = cleanedText

    expressions.forEach((expr) => {
      if (remainingText.includes(expr)) {
        outputEmojis.push(signDictionary[expr])
        remainingText = remainingText.replace(expr, "")
      }
    })

    const words = remainingText.split(/\s+/)
    words.forEach((word) => {
      if (word in signDictionary) {
        outputEmojis.push(signDictionary[word])
      } else if (word !== "") {
        outputEmojis.push("❓")
      }
    })

    setConvertedSequence(outputEmojis.join(" "))
    setDisplayedEmojis([])

    for (const emoji of outputEmojis) {
      setDisplayedEmojis((prev) => [...prev, emoji])
      await new Promise((resolve) => setTimeout(resolve, 700))
    }

    setIsConverting(false)
  }

  const handleReset = () => {
    setInputText("")
    setConvertedSequence(null)
    setDisplayedEmojis([])
    setIsConverting(false)
  }

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <LinearGradient colors={["#146454", "#029ED6"]} style={styles.backButtonGradient}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.title}>Texte → Langue des Signes</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Entrez le texte à convertir"
        value={inputText}
        onChangeText={setInputText}
        multiline
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, isConverting && { backgroundColor: "#999" }]}
          onPress={handleConvert}
          disabled={!inputText.trim() || isConverting}
        >
          <Text style={styles.buttonText}>
            {isConverting ? "Conversion..." : "Convertir"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#888" }]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        <Text style={styles.resultText}>{displayedEmojis.join(" ")}</Text>
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
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
    shadowRadius: 8
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#146454"
  },
  input: {
    height: 100,
    borderColor: "#146454",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: "top"
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  button: {
    flex: 1,
    backgroundColor: "#146454",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600"
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center", // centre verticalement
    alignItems: "center",     // centre horizontalement
    paddingVertical: 20,
  },
  resultText: {
    fontSize: 50,              // taille des emojis
    color: "#029ED6",
    textAlign: "center",
  },

})

export default TextToSignModule
