import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Variables d'environnement avec fallbacks
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  const openAIApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  
  return {
    ...config,
    name: "Sensora",
    slug: "sensora-app",
    owner: "youla_mamadouba",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#182825"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sensora.app",
      infoPlist: {
        NSMicrophoneUsageDescription: "Cette application a besoin d'accéder à votre microphone pour enregistrer votre voix et la traduire en langue des signes.",
        UIBackgroundModes: ["audio"]
      }
    },
    android: {
      package: "com.sensora.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#182825"
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.FOREGROUND_SERVICE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-av",
      [
        "expo-build-properties",
        {
          android: {
            kotlinVersion: "2.0.0",
          },
        },
      ],
    ],
    extra: {
      supabaseUrl,
      supabaseAnonKey,
      openAIApiKey,
      eas: {
        projectId: "14b742e5-9073-4378-a4a7-65f5977da601"
      }
    }
  };
};

