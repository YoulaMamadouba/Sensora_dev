# 🚀 Configuration Rapide des Variables EAS

## ⚡ Configuration Rapide (2 méthodes)

### Méthode 1 : Dashboard EAS (Recommandé)

1. Allez sur https://expo.dev/accounts/youla_mamadouba/projects/sensora-app
2. Cliquez sur **Settings** → **Secrets**
3. Ajoutez ces 3 secrets pour le profil **"preview"** :

```
EXPO_PUBLIC_SUPABASE_URL = https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY = votre_clé_anon
EXPO_PUBLIC_OPENAI_API_KEY = sk-votre_clé_openai
```

4. Répétez pour le profil **"production"** si nécessaire

### Méthode 2 : Fichier eas.json

Ouvrez `eas.json` et remplacez les valeurs vides `""` par vos vraies valeurs :

```json
"env": {
  "EXPO_PUBLIC_SUPABASE_URL": "https://votre-projet.supabase.co",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "votre_clé_anon_supabase",
  "EXPO_PUBLIC_OPENAI_API_KEY": "sk-votre_clé_openai"
}
```

⚠️ **Ne commitez JAMAIS le fichier avec les vraies valeurs !**

---

## 📍 Où trouver vos valeurs ?

### Supabase
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. **Settings** → **API**
4. Copiez :
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### OpenAI
1. Allez sur https://platform.openai.com/api-keys
2. Créez ou copiez votre clé API
3. Utilisez-la pour `EXPO_PUBLIC_OPENAI_API_KEY`

---

## ✅ Vérification

Après configuration, lancez un build :

```bash
eas build --platform android --profile preview
```

Les variables seront injectées automatiquement dans l'APK généré.

---

## 🔍 Vérifier que ça fonctionne

Une fois l'APK installé, l'application devrait pouvoir :
- ✅ Se connecter à Supabase
- ✅ Authentifier les utilisateurs
- ✅ Utiliser les services OpenAI

Si ça ne fonctionne pas, vérifiez les logs de l'application pour voir si les variables sont bien chargées.

