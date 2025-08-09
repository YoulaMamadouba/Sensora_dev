/**
 * Utilitaires de test pour l'application Sensora
 */

import { ENV_CONFIG } from '../config/envConfig'
import SupabaseService from '../services/SupabaseService'
import OpenAIService from '../services/OpenAIService'

export interface TestResult {
  success: boolean
  message: string
  details?: any
}

export class TestUtils {
  private supabaseService: SupabaseService | null = null
  private openAIService: OpenAIService | null = null

  constructor() {
    // Initialiser les services si les configurations sont disponibles
    if (ENV_CONFIG.SUPABASE_URL && ENV_CONFIG.SUPABASE_ANON_KEY) {
      this.supabaseService = new SupabaseService({
        url: ENV_CONFIG.SUPABASE_URL,
        anonKey: ENV_CONFIG.SUPABASE_ANON_KEY,
      })
    }

    if (ENV_CONFIG.OPENAI_API_KEY) {
      this.openAIService = new OpenAIService()
    }
  }

  /**
   * Tester la configuration des variables d'environnement
   */
  async testEnvironmentConfig(): Promise<TestResult> {
    const missingVars: string[] = []
    
    if (!ENV_CONFIG.SUPABASE_URL) missingVars.push('EXPO_PUBLIC_SUPABASE_URL')
    if (!ENV_CONFIG.SUPABASE_ANON_KEY) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY')
    if (!ENV_CONFIG.OPENAI_API_KEY) missingVars.push('EXPO_PUBLIC_OPENAI_API_KEY')
    
    if (missingVars.length > 0) {
      return {
        success: false,
        message: `Variables d'environnement manquantes: ${missingVars.join(', ')}`,
        details: { missingVars }
      }
    }

    return {
      success: true,
      message: 'Configuration des variables d\'environnement OK',
      details: {
        supabaseConfigured: !!ENV_CONFIG.SUPABASE_URL,
        openaiConfigured: !!ENV_CONFIG.OPENAI_API_KEY
      }
    }
  }

  /**
   * Tester la connexion Supabase
   */
  async testSupabaseConnection(): Promise<TestResult> {
    if (!this.supabaseService) {
      return {
        success: false,
        message: 'Service Supabase non initialisé'
      }
    }

    try {
      const isConnected = await this.supabaseService.testConnection()
      
      if (isConnected) {
        return {
          success: true,
          message: 'Connexion Supabase réussie'
        }
      } else {
        return {
          success: false,
          message: 'Échec de la connexion Supabase'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur connexion Supabase: ${error}`,
        details: error
      }
    }
  }

  /**
   * Tester la connexion OpenAI
   */
  async testOpenAIConnection(): Promise<TestResult> {
    if (!this.openAIService) {
      return {
        success: false,
        message: 'Service OpenAI non initialisé'
      }
    }

    try {
      const isConnected = await this.openAIService.testConnection()
      
      if (isConnected) {
        return {
          success: true,
          message: 'Connexion OpenAI réussie'
        }
      } else {
        return {
          success: false,
          message: 'Échec de la connexion OpenAI'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur connexion OpenAI: ${error}`,
        details: error
      }
    }
  }

  /**
   * Tester toutes les fonctionnalités
   */
  async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = []
    
    // Test de la configuration
    results.push(await this.testEnvironmentConfig())
    
    // Test Supabase
    results.push(await this.testSupabaseConnection())
    
    // Test OpenAI
    results.push(await this.testOpenAIConnection())
    
    return results
  }

  /**
   * Générer un rapport de test
   */
  generateTestReport(results: TestResult[]): string {
    const passed = results.filter(r => r.success).length
    const total = results.length
    
    let report = `📊 Rapport de test - ${passed}/${total} tests réussis\n\n`
    
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      report += `${status} Test ${index + 1}: ${result.message}\n`
      if (result.details) {
        report += `   Détails: ${JSON.stringify(result.details)}\n`
      }
      report += '\n'
    })
    
    return report
  }
}

export default TestUtils
