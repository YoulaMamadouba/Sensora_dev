# 🔧 Configuration des Variables d'Environnement pour EAS Build

## ⚠️ IMPORTANT : Configuration Requise

Pour que votre APK fonctionne correctement avec Supabase et OpenAI, vous devez configurer les variables d'environnement dans EAS.

## 📋 Méthode 1 : Configuration via Dashboard EAS (Recommandé - Plus Sécurisé)

### Étapes :

1. **Accéder au Dashboard EAS** :
   - Allez sur https://expo.dev
   - Connectez-vous avec votre compte
   - Sélectionnez votre projet `sensora-app`

2. **Configurer les Variables d'Environnement** :
   - Allez dans **Settings** → **Secrets**
   - Cliquez sur **Create Secret** pour chaque variable :

   **Pour le profil "preview"** :
   - Nom : `EXPO_PUBLIC_SUPABASE_URL`
   - Valeur : `https://votre-projet.supabase.co`
   - Visibilité : Sélectionnez "preview"
   
   - Nom : `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Valeur : `votre_clé_anon_supabase`
   - Visibilité : Sélectionnez "preview"
   
   - Nom : `EXPO_PUBLIC_OPENAI_API_KEY`
   - Valeur : `sk-votre_clé_openai`
   - Visibilité : Sélectionnez "preview"

   **Pour le profil "production"** :
   - Répétez les mêmes étapes mais avec la visibilité "production"

### Avantages :
- ✅ Les valeurs ne sont pas dans le code source
- ✅ Plus sécurisé
- ✅ Facile à mettre à jour sans modifier le code

---

## 📋 Méthode 2 : Configuration Directe dans eas.json

Si vous préférez configurer directement dans `eas.json`, remplacez les valeurs vides par vos vraies valeurs :

```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://votre-projet.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "votre_clé_anon_supabase",
        "EXPO_PUBLIC_OPENAI_API_KEY": "sk-votre_clé_openai"
      }
    }
  }
}
```

### ⚠️ Attention :
- Ne commitez JAMAIS le fichier `eas.json` avec les vraies valeurs dans Git
- Utilisez `.gitignore` pour exclure les modifications sensibles
- Ou utilisez la Méthode 1 (Dashboard) qui est plus sécurisée

---

## 🔍 Vérification

Après avoir configuré les variables, vérifiez qu'elles sont bien prises en compte :

1. **Lancez un build** :
   ```bash
   eas build --platform android --profile preview
   ```

2. **Vérifiez dans les logs** :
   - Les variables doivent apparaître dans la phase "Read app config"
   - L'application doit pouvoir se connecter à Supabase une fois installée

---

## 🛠️ Dépannage

### Problème : Les variables ne sont pas prises en compte

**Solution 1** : Vérifiez que les noms des variables commencent par `EXPO_PUBLIC_`
- ✅ Correct : `EXPO_PUBLIC_SUPABASE_URL`
- ❌ Incorrect : `SUPABASE_URL`

**Solution 2** : Vérifiez que vous avez bien configuré les variables pour le bon profil
- Pour un build `preview`, les variables doivent être configurées pour "preview"
- Pour un build `production`, les variables doivent être configurées pour "production"

**Solution 3** : Redémarrez le build après avoir ajouté les variables
- Les variables sont injectées au moment du build
- Un build en cours ne prendra pas en compte les nouvelles variables

---

## 📝 Variables Requises

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | Dashboard Supabase → Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme Supabase | Dashboard Supabase → Settings → API → anon public key |
| `EXPO_PUBLIC_OPENAI_API_KEY` | Clé API OpenAI | Dashboard OpenAI → API Keys |

---

## ✅ Checklist

Avant de lancer un build, vérifiez :

- [ ] Les variables sont configurées dans le Dashboard EAS OU dans `eas.json`
- [ ] Les noms des variables commencent par `EXPO_PUBLIC_`
- [ ] Les variables sont configurées pour le bon profil (preview/production)
- [ ] Les valeurs sont correctes (pas d'espaces, pas de guillemets supplémentaires)
- [ ] Le fichier `app.config.ts` lit bien `process.env.EXPO_PUBLIC_*`

---

## 🚀 Après Configuration

Une fois les variables configurées, lancez votre build :

```bash
eas build --platform android --profile preview
```

L'APK généré contiendra les variables d'environnement et pourra se connecter à Supabase et OpenAI.

