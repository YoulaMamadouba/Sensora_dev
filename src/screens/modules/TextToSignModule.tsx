"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import signDictionary from "../../../assets/data/signs_dictionary_clean.json";

const { width } = Dimensions.get("window");

const TextToSignModule: React.FC = () => {
  const navigation = useNavigation();
  const [inputText, setInputText] = useState("");
  const [convertedSequence, setConvertedSequence] = useState<string | null>(
    null
  );
  const [displayedEmojis, setDisplayedEmojis] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [showProcessingMessage, setShowProcessingMessage] = useState(false);
  const [conversionResult, setConversionResult] = useState<string[]>([]);

  const avatarScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const conversionOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);

  useEffect(() => {
    if (isConverting) {
      setShowProcessingMessage(true);
      avatarScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1,
        true
      );
      conversionOpacity.value = withTiming(1, { duration: 300 });
    }
    // Ne pas faire disparaitre le résultat automatiquement après conversion
    // Le résultat reste visible jusqu'à réinitialisation
  }, [isConverting]);

  useEffect(() => {
    if (displayedEmojis.length > 0) {
      emojiScale.value = withTiming(1, { duration: 500 });
    }
  }, [displayedEmojis]);

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const conversionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: conversionOpacity.value,
  }));

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const handleConvert = async () => {
    if (isConverting) return;
    setIsConverting(true);
    setShowProcessingMessage(true);

    const cleanedText = inputText
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .trim();

    const outputEmojis: string[] = [];

    const expressions = Object.keys(signDictionary).filter((key) =>
      key.includes(" ")
    );
    let remainingText = cleanedText;

    expressions.forEach((expr) => {
      if (remainingText.includes(expr)) {
        const emojiList = signDictionary[expr];
        if (Array.isArray(emojiList)) {
          outputEmojis.push(...emojiList);
        } else {
          outputEmojis.push(emojiList); // fallback si erreur
        }
        remainingText = remainingText.replace(expr, "");
      }
    });

    const words = remainingText.split(/\s+/);
    words.forEach((word) => {
      if (word in signDictionary) {
        const emojiList = signDictionary[word];
        if (Array.isArray(emojiList)) {
          outputEmojis.push(...emojiList);
        } else {
          outputEmojis.push(emojiList);
        }
      } else if (word !== "") {
        outputEmojis.push("❓");
      }
    });

    setConvertedSequence(outputEmojis.join(" "));
    setConversionResult(outputEmojis);
    setDisplayedEmojis([]);

    // Attendre 3 secondes puis animer la disparition du message
    setTimeout(async () => {
      // Animation de disparition
      conversionOpacity.value = withTiming(0, { duration: 500 });
      // Attendre la fin de l'animation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Afficher les emojis un par un
      for (const emoji of outputEmojis) {
        setDisplayedEmojis((prev) => [...prev, emoji]);
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
      setIsConverting(false);
      setShowProcessingMessage(false);
      // Remettre l'opacité à 1 pour la prochaine conversion
      conversionOpacity.value = withTiming(1, { duration: 300 });
    }, 3000);
  };


  const handleReset = () => {
    setInputText("");
    setConvertedSequence(null);
    setDisplayedEmojis([]);
    setConversionResult([]);
    setIsConverting(false);
    setShowProcessingMessage(false);
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#FFFFFF", "#FFFFFF"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <LinearGradient
            colors={["#146454", "#029ED6"]}
            style={styles.backButtonGradient}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Texte → Langue des Signes</Text>
          <Text style={styles.subtitle}>
            Entrez du texte et voyez la traduction en signes
          </Text>
        </View>
      </View>

      {/* Avatar with glow */}
      <View style={styles.avatarContainer}>
        <Animated.View style={[styles.avatar, avatarAnimatedStyle]}>
          <LinearGradient
            colors={["#146454", "#029ED6"]}
            style={styles.avatarGradient}
          >
            <Ionicons name="hand-right" size={60} color="#FFFFFF" />
          </LinearGradient>
          <Animated.View style={[styles.avatarGlow, glowAnimatedStyle]} />
        </Animated.View>
      </View>

      {/* Input */}
      <TextInput
        style={styles.input}
        placeholder="Entrez le texte à convertir"
        value={inputText}
        onChangeText={setInputText}
        multiline
        editable={!isConverting}
      />

      {/* Buttons */}
      {!showProcessingMessage ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, isConverting && styles.buttonDisabled]}
            onPress={handleConvert}
            disabled={!inputText.trim() || isConverting}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Convertir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
            disabled={isConverting}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.processingContainer}>
          <LinearGradient
            colors={["rgba(20, 100, 84, 0.1)", "rgba(2, 158, 214, 0.05)"]}
            style={styles.processingGradient}
          >
            <Ionicons name="sync" size={20} color="#146454" />
            <Text style={styles.processingText}>Conversion en cours...</Text>
          </LinearGradient>
        </View>
      )}

      {/* Conversion result with fade in and scale */}
      <Animated.View style={[styles.resultContainer, conversionAnimatedStyle]}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <Animated.Text style={[styles.resultText, emojiAnimatedStyle]}>
            {displayedEmojis.join(" ")}
          </Animated.Text>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#146454",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginRight: 16,
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    color: "#146454",
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#146454",
    opacity: 0.8,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    position: "relative",
  },
  avatarGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#146454",
    opacity: 0.3,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  input: {
    height: 100,
    borderColor: "#146454",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    backgroundColor: "#146454",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  resetButton: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  resultContainer: {
    flex: 1,
  },
  resultScroll: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  resultText: {
    fontSize: 50,
    color: "#029ED6",
    textAlign: "center",
  },
  processingContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  processingGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(20, 100, 84, 0.3)",
    borderRadius: 20,
    backgroundColor: "rgba(20, 100, 84, 0.1)",
  },
  processingText: {
    color: "#146454",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});

export default TextToSignModule;
