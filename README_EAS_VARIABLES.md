# 🔐 Configuration des Variables d'Environnement EAS

## 📋 Vue d'ensemble

Les variables d'environnement sont configurées via le **Dashboard EAS** pour les builds, et via un fichier `.env` local pour le développement.

## 🚀 Configuration dans le Dashboard EAS

1. Allez sur : https://expo.dev/accounts/youla_mamadouba/projects/sensora-app
2. **Settings** → **Environment variables**
3. Ajoutez les 3 variables pour le profil **"preview"** :
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_OPENAI_API_KEY`

## 💻 Configuration Locale

Créez un fichier `.env` à la racine :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-votre_cle_openai
```

⚠️ **Ne commitez JAMAIS le fichier `.env`** (déjà dans `.gitignore`)

## 📝 Comment ça fonctionne

1. **Build EAS** : Variables injectées depuis le Dashboard → `process.env.EXPO_PUBLIC_*` → `app.config.ts` → `extra`
2. **Développement local** : Variables depuis `.env` → `process.env.EXPO_PUBLIC_*` → `app.config.ts` → `extra`
3. **Application** : Lit depuis `Constants.expoConfig?.extra` (priorité) ou `process.env.EXPO_PUBLIC_*`

## ✅ Vérification

Après configuration, lancez un build :

```bash
eas build --platform android --profile preview
```

Les variables seront automatiquement disponibles dans l'APK.

