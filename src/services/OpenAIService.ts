/**
 * Service OpenAI pour la transcription audio et la traduction
 */

import { ENV_CONFIG } from '../config/envConfig'

interface TranscriptionResponse {
  text: string
  confidence?: number
  language?: string
}

interface TranslationResponse {
  text: string
  sourceLanguage?: string
  targetLanguage?: string
}

class OpenAIService {
  private apiKey: string
  private baseUrl: string = 'https://api.openai.com/v1'

  constructor() {
    this.apiKey = ENV_CONFIG.OPENAI_API_KEY
    if (!this.apiKey) {
      console.warn('⚠️ Clé API OpenAI non configurée')
    }
  }

  /**
   * Transcrire un fichier audio en texte
   */
  async transcribeAudio(audioUrl: string, language: string = 'fr'): Promise<TranscriptionResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Clé API OpenAI non configurée')
      }

      console.log('🎤 Début de la transcription avec OpenAI...')

      // Télécharger le fichier audio depuis l'URL
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error('Impossible de télécharger le fichier audio')
      }

      const audioBlob = await audioResponse.blob()
      
      // Créer un FormData pour l'upload
      const formData = new FormData()
      formData.append('file', audioBlob)
      formData.append('model', 'whisper-1')
      formData.append('language', language)
      formData.append('response_format', 'json')

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || response.statusText
        
        // Gestion spécifique des erreurs de quota
        if (response.status === 429 || errorMessage.includes('quota')) {
          throw new Error('Quota OpenAI dépassé. Utilisation de la transcription simulée.')
        } else if (response.status === 401) {
          throw new Error('Clé API OpenAI invalide.')
        } else if (response.status === 403) {
          throw new Error('Accès refusé à l\'API OpenAI.')
        } else {
          throw new Error(`Erreur OpenAI: ${errorMessage}`)
        }
      }

      const data = await response.json()
      
      console.log('✅ Transcription réussie:', data.text)
      
      return {
        text: data.text,
        confidence: data.confidence || 0.95,
        language: data.language || language
      }

    } catch (error) {
      console.error('❌ Erreur transcription OpenAI:', error)
      throw error
    }
  }

  /**
   * Traduire du texte en langue des signes (simulation avec IA)
   */
  async translateToSignLanguage(text: string, targetLanguage: string = 'LSF'): Promise<TranslationResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Clé API OpenAI non configurée')
      }

      console.log('🤟 Traduction en langue des signes...')

      const prompt = `Traduis le texte français suivant en langue des signes française (LSF). 
      Retourne uniquement la description des signes à effectuer, sans explications supplémentaires.
      
      Texte: "${text}"
      
      Traduction LSF:`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en langue des signes française. Tu traduis le texte français en descriptions de signes LSF.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || response.statusText
        
        // Gestion spécifique des erreurs de quota
        if (response.status === 429 || errorMessage.includes('quota')) {
          throw new Error('Quota OpenAI dépassé. Utilisation de la traduction simulée.')
        } else if (response.status === 401) {
          throw new Error('Clé API OpenAI invalide.')
        } else if (response.status === 403) {
          throw new Error('Accès refusé à l\'API OpenAI.')
        } else {
          throw new Error(`Erreur OpenAI: ${errorMessage}`)
        }
      }

      const data = await response.json()
      const translation = data.choices[0]?.message?.content || ''

      console.log('✅ Traduction LSF réussie:', translation)

      return {
        text: translation.trim(),
        sourceLanguage: 'fr',
        targetLanguage: targetLanguage
      }

    } catch (error) {
      console.error('❌ Erreur traduction LSF:', error)
      throw error
    }
  }

  /**
   * Générer des emojis de signes basés sur le texte
   */
  async generateSignEmojis(text: string): Promise<string> {
    try {
      if (!this.apiKey) {
        // Fallback vers la génération locale
        return this.generateLocalSignEmojis(text)
      }

      console.log('🎨 Génération d\'emojis de signes...')

      const prompt = `Génère des emojis qui représentent les signes de la langue des signes française pour le texte suivant. 
      Retourne uniquement les emojis séparés par des espaces, sans texte.
      
      Texte: "${text}"
      
      Emojis:`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en langue des signes. Tu génères des emojis qui représentent les signes LSF.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || response.statusText
        
        // Gestion spécifique des erreurs de quota
        if (response.status === 429 || errorMessage.includes('quota')) {
          throw new Error('Quota OpenAI dépassé. Utilisation de la génération simulée.')
        } else if (response.status === 401) {
          throw new Error('Clé API OpenAI invalide.')
        } else if (response.status === 403) {
          throw new Error('Accès refusé à l\'API OpenAI.')
        } else {
          throw new Error(`Erreur OpenAI: ${errorMessage}`)
        }
      }

      const data = await response.json()
      const emojis = data.choices[0]?.message?.content || ''

      console.log('✅ Emojis générés:', emojis)

      return emojis.trim()

    } catch (error) {
      console.error('❌ Erreur génération emojis:', error)
      // Fallback vers la génération locale
      return this.generateLocalSignEmojis(text)
    }
  }

  /**
   * Tester la connexion à l'API OpenAI
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ Clé API OpenAI non configurée')
        return false
      }

      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        console.error('❌ Erreur test connexion OpenAI:', response.statusText)
        return false
      }

      console.log('✅ Connexion OpenAI réussie')
      return true
    } catch (error) {
      console.error('❌ Erreur test connexion OpenAI:', error)
      return false
    }
  }

  /**
   * Génération locale d'emojis (fallback)
   */
  private generateLocalSignEmojis(text: string): string {
    const signMapping: { [key: string]: string } = {
      'bonjour': '👋',
      'salut': '👋',
      'hello': '👋',
      'merci': '🙏',
      'oui': '👍',
      'non': '👎',
      'bien': '👍',
      'mal': '👎',
      'comment': '🤔',
      'aller': '🚶',
      'manger': '🍽️',
      'boire': '🥤',
      'dormir': '😴',
      'travail': '💼',
      'famille': '👨‍👩‍👧‍👦',
      'ami': '🤝',
      'amour': '❤️',
      'temps': '⏰',
      'jour': '☀️',
      'nuit': '🌙',
      'eau': '💧',
      'pain': '🍞',
      'maison': '🏠',
      'voiture': '🚗',
      'livre': '📚',
      'musique': '🎵',
      'sport': '⚽',
      'école': '🎓',
      'hôpital': '🏥',
      'magasin': '🛒'
    }

    const words = text.toLowerCase().split(' ')
    const emojis: string[] = []
    
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?]/g, '')
      if (signMapping[cleanWord]) {
        emojis.push(signMapping[cleanWord])
      }
    })

    // Ajouter des emojis génériques si aucun mapping n'est trouvé
    if (emojis.length === 0) {
      emojis.push('🤟', '👋', '✋', '👍', '🤝')
    }

    return emojis.join(' ')
  }
}

export default OpenAIService
