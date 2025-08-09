/**
 * Configuration des variables d'environnement
 */

export const ENV_CONFIG = {
  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // OpenAI
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  
  // Configuration de l'application
  APP_ENV: process.env.NODE_ENV || 'development',
  DEBUG_MODE: process.env.NODE_ENV === 'development',
}

/**
 * Vérifier si toutes les variables d'environnement requises sont configurées
 */
export const validateEnvConfig = () => {
  const missingVars: string[] = []
  
  if (!ENV_CONFIG.SUPABASE_URL) missingVars.push('EXPO_PUBLIC_SUPABASE_URL')
  if (!ENV_CONFIG.SUPABASE_ANON_KEY) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY')
  if (!ENV_CONFIG.OPENAI_API_KEY) missingVars.push('EXPO_PUBLIC_OPENAI_API_KEY')
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Variables d\'environnement manquantes:', missingVars.join(', '))
    return false
  }
  
  return true
}

/**
 * Obtenir la configuration pour un service spécifique
 */
export const getServiceConfig = (service: 'supabase' | 'openai') => {
  switch (service) {
    case 'supabase':
      return {
        url: ENV_CONFIG.SUPABASE_URL,
        anonKey: ENV_CONFIG.SUPABASE_ANON_KEY,
      }
    case 'openai':
      return {
        apiKey: ENV_CONFIG.OPENAI_API_KEY,
      }
    default:
      throw new Error(`Service non reconnu: ${service}`)
  }
}

export default ENV_CONFIG
