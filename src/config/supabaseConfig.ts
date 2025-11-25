/**
 * Configuration Supabase pour l'application Sensora
 * Utilise Constants.expoConfig?.extra (injecté par EAS) avec fallback sur process.env
 */

import Constants from 'expo-constants';
import SupabaseService from '../services/SupabaseService'

// Récupération des variables d'environnement - Priorité: extra > process.env
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || 
                     process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || 
                          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

/**
 * Vérifier si Supabase est configuré
 */
export const isSupabaseConfigured = (): boolean => {
  const configured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
  
  if (!configured) {
    console.warn('⚠️ Supabase non configuré. Vérifiez vos variables d\'environnement:')
    console.warn('- EXPO_PUBLIC_SUPABASE_URL')
    console.warn('- EXPO_PUBLIC_SUPABASE_ANON_KEY')
    console.warn('Créez un fichier .env à partir de .env.example')
  }
  
  return configured
}

/**
 * Obtenir la configuration Supabase
 */
export const getSupabaseConfig = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase n\'est pas configuré correctement')
  }
  
  return {
    url: SUPABASE_URL!,
    anonKey: SUPABASE_ANON_KEY!,
  }
}

/**
 * Instance singleton du service Supabase
 */
let supabaseServiceInstance: SupabaseService | null = null

/**
 * Obtenir l'instance du service Supabase
 */
export const getSupabaseService = (): SupabaseService => {
  if (!supabaseServiceInstance) {
    if (!isSupabaseConfigured()) {
      throw new Error('Impossible d\'initialiser Supabase: configuration manquante')
    }
    
    const config = getSupabaseConfig()
    supabaseServiceInstance = new SupabaseService(config)
    console.log('✅ Service Supabase initialisé')
  }
  
  return supabaseServiceInstance
}

/**
 * Informations sur la configuration actuelle
 */
export const getConfigInfo = () => {
  return {
    configured: isSupabaseConfigured(),
    url: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'Non définie',
    hasAnonKey: !!SUPABASE_ANON_KEY,
    projectId: SUPABASE_URL ? SUPABASE_URL.split('//')[1]?.split('.')[0] : 'Inconnu',
  }
}

export default {
  isSupabaseConfigured,
  getSupabaseConfig,
  getSupabaseService,
  getConfigInfo,
}
