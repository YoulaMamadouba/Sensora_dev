/**
 * Utilitaires de test pour l'application Sensora
 */

import { ENV_CONFIG } from '../config/envConfig'
import SupabaseService from '../services/SupabaseService'

export class TestUtils {
  private supabaseService: SupabaseService | null = null

  constructor() {
    if (ENV_CONFIG.SUPABASE_URL && ENV_CONFIG.SUPABASE_ANON_KEY) {
      this.supabaseService = new SupabaseService({
        url: ENV_CONFIG.SUPABASE_URL,
        anonKey: ENV_CONFIG.SUPABASE_ANON_KEY
      })
    }
  }

  /**
   * Tester la configuration de l'environnement
   */
  async testEnvironmentConfig(): Promise<{
    success: boolean
    issues: string[]
    supabaseConfigured: boolean
    openaiConfigured: boolean
  }> {
    const issues: string[] = []
    let supabaseConfigured = false
    let openaiConfigured = false

    // Vérifier Supabase
    if (!ENV_CONFIG.SUPABASE_URL || !ENV_CONFIG.SUPABASE_ANON_KEY) {
      issues.push('Configuration Supabase manquante')
    } else {
      supabaseConfigured = true
    }

    // Vérifier OpenAI
    if (!ENV_CONFIG.OPENAI_API_KEY) {
      issues.push('Configuration OpenAI manquante')
    } else {
      openaiConfigured = true
    }

    return {
      success: issues.length === 0,
      issues,
      supabaseConfigured,
      openaiConfigured
    }
  }

  /**
   * Tester la connexion Supabase
   */
  async testSupabaseConnection(): Promise<{
    success: boolean
    issues: string[]
    connectionTest: boolean
    structureTest: boolean
  }> {
    const issues: string[] = []
    let connectionTest = false
    let structureTest = false

    if (!this.supabaseService) {
      issues.push('Service Supabase non initialisé')
      return { success: false, issues, connectionTest, structureTest }
    }

    try {
      // Test de connexion
      const connectionResult = await this.supabaseService.testConnection()
      if (connectionResult) {
        connectionTest = true
        console.log('✅ Connexion Supabase réussie')
      } else {
        issues.push('Échec de la connexion Supabase')
      }

      // Test de structure
      const structureResult = await this.supabaseService.testDatabaseStructure()
      if (structureResult.success) {
        structureTest = true
        console.log('✅ Structure de base de données correcte')
      } else {
        issues.push(...structureResult.issues)
      }

    } catch (error) {
      issues.push(`Erreur test Supabase: ${error}`)
    }

    return {
      success: issues.length === 0,
      issues,
      connectionTest,
      structureTest
    }
  }

  /**
   * Tester la connexion OpenAI
   */
  async testOpenAIConnection(): Promise<{
    success: boolean
    issues: string[]
  }> {
    const issues: string[] = []

    if (!ENV_CONFIG.OPENAI_API_KEY) {
      issues.push('Clé API OpenAI non configurée')
      return { success: false, issues }
    }

    try {
      // Test simple de la connexion OpenAI
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${ENV_CONFIG.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        console.log('✅ Connexion OpenAI réussie')
      } else {
        issues.push(`Échec de la connexion OpenAI: ${response.status}`)
      }
    } catch (error) {
      issues.push(`Erreur test OpenAI: ${error}`)
    }

    return {
      success: issues.length === 0,
      issues
    }
  }

  /**
   * Diagnostiquer le problème de rôle utilisateur
   */
  async diagnoseUserRoleIssue(userId?: string): Promise<{
    success: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    if (!this.supabaseService) {
      issues.push('Service Supabase non initialisé')
      return { success: false, issues, recommendations }
    }

    try {
      // Test de la structure de la base de données
      const structureTest = await this.supabaseService.testDatabaseStructure()
      if (!structureTest.success) {
        issues.push(...structureTest.issues)
        recommendations.push('Vérifiez la structure de la base de données')
      }

      // Si un userId est fourni, diagnostiquer le rôle spécifique
      if (userId) {
        const diagnosis = await this.supabaseService.diagnoseUserRole(userId)
        if (!diagnosis.success) {
          issues.push(...diagnosis.issues)
          recommendations.push('Utilisez la méthode forceUpdateUserRole pour corriger le rôle')
        }
      }

    } catch (error) {
      issues.push(`Erreur diagnostic: ${error}`)
    }

    return {
      success: issues.length === 0,
      issues,
      recommendations
    }
  }

  /**
   * Exécuter tous les tests
   */
  async runAllTests(): Promise<{
    success: boolean
    results: {
      environment: any
      supabase: any
      openai: any
      userRole: any
    }
  }> {
    console.log('🧪 Début des tests...')

    const environment = await this.testEnvironmentConfig()
    const supabase = await this.testSupabaseConnection()
    const openai = await this.testOpenAIConnection()
    const userRole = await this.diagnoseUserRoleIssue()

    const success = environment.success && supabase.success && openai.success && userRole.success

    return {
      success,
      results: {
        environment,
        supabase,
        openai,
        userRole
      }
    }
  }

  /**
   * Générer un rapport de test
   */
  generateTestReport(results: any): string {
    let report = '📊 RAPPORT DE TEST\n\n'

    // Test d'environnement
    report += '🔧 Configuration Environnement:\n'
    report += `  - Supabase configuré: ${results.environment.supabaseConfigured ? '✅' : '❌'}\n`
    report += `  - OpenAI configuré: ${results.environment.openaiConfigured ? '✅' : '❌'}\n`
    if (results.environment.issues.length > 0) {
      report += `  - Problèmes: ${results.environment.issues.join(', ')}\n`
    }

    // Test Supabase
    report += '\n🗄️ Test Supabase:\n'
    report += `  - Connexion: ${results.supabase.connectionTest ? '✅' : '❌'}\n`
    report += `  - Structure: ${results.supabase.structureTest ? '✅' : '❌'}\n`
    if (results.supabase.issues.length > 0) {
      report += `  - Problèmes: ${results.supabase.issues.join(', ')}\n`
    }

    // Test OpenAI
    report += '\n🤖 Test OpenAI:\n'
    report += `  - Connexion: ${results.openai.success ? '✅' : '❌'}\n`
    if (results.openai.issues.length > 0) {
      report += `  - Problèmes: ${results.openai.issues.join(', ')}\n`
    }

    // Test rôle utilisateur
    report += '\n👤 Test Rôle Utilisateur:\n'
    report += `  - Statut: ${results.userRole.success ? '✅' : '❌'}\n`
    if (results.userRole.issues.length > 0) {
      report += `  - Problèmes: ${results.userRole.issues.join(', ')}\n`
    }
    if (results.userRole.recommendations.length > 0) {
      report += `  - Recommandations: ${results.userRole.recommendations.join(', ')}\n`
    }

    return report
  }
}

export default TestUtils
