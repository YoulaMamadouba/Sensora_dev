/**
 * Configuration des APIs externes
 * IMPORTANT: Ne jamais commiter les vraies clés API dans le code source
 */

export interface ApiConfig {
  openai: {
    apiKey: string;
    baseUrl: string;
  };
  // Autres APIs peuvent être ajoutées ici
  google?: {
    apiKey: string;
  };
}

// Configuration par défaut (à remplacer par les vraies valeurs)
export const defaultApiConfig: ApiConfig = {
  openai: {
    // ⚠️ REMPLACER PAR VOTRE VRAIE CLÉ API OPENAI
    // Obtenir une clé sur: https://platform.openai.com/api-keys
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'sk-your-openai-api-key-here',
    baseUrl: 'https://api.openai.com/v1',
  },
};

/**
 * Valide la configuration des APIs
 */
export const validateApiConfig = (config: ApiConfig): boolean => {
  // Vérifier la clé OpenAI
  if (!config.openai.apiKey || config.openai.apiKey === 'sk-your-openai-api-key-here') {
    console.warn('⚠️ Clé API OpenAI non configurée');
    return false;
  }

  if (!config.openai.apiKey.startsWith('sk-')) {
    console.warn('⚠️ Format de clé API OpenAI invalide');
    return false;
  }

  return true;
};

/**
 * Instructions pour configurer les clés API
 */
export const getApiSetupInstructions = (): string => {
  return `
🔑 CONFIGURATION DES CLÉS API

Pour utiliser la reconnaissance vocale, vous devez configurer une clé API OpenAI :

1. Créez un compte sur https://platform.openai.com
2. Générez une clé API dans la section "API Keys"
3. Ajoutez la clé dans un fichier .env à la racine du projet :
   EXPO_PUBLIC_OPENAI_API_KEY=sk-votre-cle-api-ici

4. Ou modifiez directement le fichier src/config/apiConfig.ts

⚠️ IMPORTANT : Ne partagez jamais votre clé API publiquement !
  `;
};

/**
 * Vérifie si OpenAI est configuré correctement
 */
export const isOpenAIConfigured = (): boolean => {
  return validateApiConfig(defaultApiConfig);
};

export default defaultApiConfig;
