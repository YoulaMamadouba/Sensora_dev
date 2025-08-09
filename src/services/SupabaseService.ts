/**
 * Service Supabase pour la gestion des utilisateurs et des fichiers audio
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js'

// Types pour les tables de la base de données
export interface DatabaseUser {
  id: string
  email: string
  full_name: string
  user_role: 'entendant' | 'sourd'
  created_at: string
  updated_at: string
}

export interface AudioFile {
  id: string
  user_id: string | null
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_at: string
}

export interface SupabaseConfig {
  url: string
  anonKey: string
}

class SupabaseService {
  private supabase: SupabaseClient
  private currentUser: User | null = null

  // Public getter for the Supabase client
  get client(): SupabaseClient {
    return this.supabase
  }

  constructor(config: SupabaseConfig) {
    this.supabase = createClient(config.url, config.anonKey)
    
    // Écouter les changements d'authentification
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email)
      this.currentUser = session?.user || null
    })
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async signUp(email: string, password: string, fullName: string, userRole: 'entendant' | 'sourd' = 'entendant') {
    try {
      console.log('📝 Inscription utilisateur:', email, 'avec le rôle:', userRole)
      
      // Vérifier d'abord si l'utilisateur existe déjà
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà')
      }

      // Créer d'abord le compte d'authentification
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_role: userRole
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      // Créer l'entrée dans la table users
      if (data.user) {
        const { error: profileError } = await this.supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            user_role: userRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('❌ Erreur création profil:', profileError)
          // Essayer de supprimer le compte d'authentification en cas d'échec
          await this.supabase.auth.admin.deleteUser(data.user.id).catch(console.error)
          throw profileError
        }

        console.log('✅ Profil utilisateur créé avec le rôle:', userRole)
      }

      console.log('✅ Inscription réussie')
      return { user: data.user, session: data.session }
      
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error)
      
      // Gestion spécifique des erreurs Supabase
      if (error?.message?.includes('For security purposes')) {
        throw new Error('Trop de tentatives d\'inscription. Veuillez attendre quelques secondes avant de réessayer.')
      } else if (error?.message?.includes('User already registered')) {
        throw new Error('Cette adresse email est déjà utilisée. Essayez de vous connecter à la place.')
      } else if (error?.message?.includes('Invalid email')) {
        throw new Error('Adresse email invalide.')
      } else if (error?.message?.includes('Password should be at least')) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.')
      }
      
      throw error
    }
  }

  /**
   * Connexion utilisateur
   */
  async signIn(email: string, password: string) {
    try {
      console.log('🔑 Connexion utilisateur:', email)
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Erreur connexion:', error)
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect')
        }
        throw new Error('Erreur de connexion. Veuillez réessayer.')
      }

      console.log('✅ Connexion réussie')
      return { user: data.user, session: data.session }
      
    } catch (error) {
      console.error('❌ Erreur connexion:', error)
      throw error
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async signOut() {
    try {
      console.log('🚪 Déconnexion utilisateur')
      
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error

      this.currentUser = null
      console.log('✅ Déconnexion réussie')
      
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error)
      throw error
    }
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * Obtenir la session actuelle
   */
  async getCurrentSession() {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session
  }

  /**
   * Obtenir les informations complètes de l'utilisateur depuis la table users
   */
  async getUserProfile(userId: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
      
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error)
      return null
    }
  }

  /**
   * Uploader un fichier audio vers Supabase Storage
   */
  async uploadAudioFile(
    fileUri: string, 
    fileName: string, 
    mimeType: string = 'audio/m4a'
  ): Promise<AudioFile | null> {
    try {
      if (!this.currentUser) {
        throw new Error('Utilisateur non connecté')
      }

      console.log('📤 Upload fichier audio:', fileName)

      // Lire le fichier depuis l'URI locale
      const response = await fetch(fileUri)
      if (!response.ok) {
        throw new Error('Impossible de lire le fichier audio')
      }
      
      const blob = await response.blob()
      
      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const uniqueFileName = `${this.currentUser.id}/${timestamp}_${fileName}`

      console.log('📁 Nom de fichier unique:', uniqueFileName)

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('audio-recordings')
        .upload(uniqueFileName, blob, {
          contentType: mimeType,
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Erreur upload storage:', uploadError)
        throw uploadError
      }

      console.log('✅ Fichier uploadé vers storage:', uploadData)

      // Obtenir l'URL publique du fichier
      const { data: { publicUrl } } = this.supabase.storage
        .from('audio-recordings')
        .getPublicUrl(uniqueFileName)

      console.log('🔗 URL publique:', publicUrl)

      // Enregistrer les métadonnées dans la table audio_files
      const { data: fileRecord, error: dbError } = await this.supabase
        .from('audio_files')
        .insert({
          user_id: this.currentUser.id,
          file_name: fileName,
          file_path: publicUrl,
          file_size: blob.size,
          mime_type: mimeType,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) {
        console.error('❌ Erreur insertion base de données:', dbError)
        // Essayer de supprimer le fichier du storage en cas d'échec
        await this.supabase.storage
          .from('audio-recordings')
          .remove([uniqueFileName])
          .catch(console.error)
        throw dbError
      }

      console.log('✅ Fichier audio uploadé avec succès et enregistré en base:', fileRecord)
      return fileRecord
      
    } catch (error) {
      console.error('❌ Erreur upload fichier audio:', error)
      throw error
    }
  }

  /**
   * Récupérer tous les fichiers audio de l'utilisateur
   */
  async getUserAudioFiles(userId?: string): Promise<AudioFile[]> {
    try {
      const targetUserId = userId || this.currentUser?.id
      if (!targetUserId) {
        throw new Error('Aucun utilisateur spécifié')
      }

      const { data, error } = await this.supabase
        .from('audio_files')
        .select('*')
        .eq('user_id', targetUserId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      return data || []
      
    } catch (error) {
      console.error('❌ Erreur récupération fichiers audio:', error)
      return []
    }
  }

  /**
   * Supprimer un fichier audio
   */
  async deleteAudioFile(fileId: string): Promise<boolean> {
    try {
      if (!this.currentUser) {
        throw new Error('Utilisateur non connecté')
      }

      // Récupérer les infos du fichier
      const { data: fileData, error: fetchError } = await this.supabase
        .from('audio_files')
        .select('file_path, user_id')
        .eq('id', fileId)
        .single()

      if (fetchError) throw fetchError

      // Vérifier que l'utilisateur est propriétaire du fichier
      if (fileData.user_id !== this.currentUser.id) {
        throw new Error('Non autorisé à supprimer ce fichier')
      }

      // Extraire le chemin du fichier depuis l'URL
      const filePath = fileData.file_path.split('/').pop()
      
      // Supprimer du storage
      const { error: storageError } = await this.supabase.storage
        .from('audio-recordings')
        .remove([`${this.currentUser.id}/${filePath}`])

      if (storageError) throw storageError

      // Supprimer de la base de données
      const { error: dbError } = await this.supabase
        .from('audio_files')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      console.log('✅ Fichier audio supprimé avec succès')
      return true
      
    } catch (error) {
      console.error('❌ Erreur suppression fichier audio:', error)
      return false
    }
  }

  /**
   * Vérifier la connexion à Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1)

      return !error
    } catch (error) {
      console.error('❌ Erreur test connexion Supabase:', error)
      return false
    }
  }

  /**
   * Vérifier et corriger le type d'utilisateur
   */
  async checkAndFixUserRole(userId: string, expectedRole: 'entendant' | 'sourd'): Promise<boolean> {
    try {
      if (!this.currentUser) {
        throw new Error('Utilisateur non connecté')
      }

      // Récupérer le profil utilisateur actuel
      const { data: currentProfile, error: fetchError } = await this.supabase
        .from('users')
        .select('user_role')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('❌ Erreur récupération profil:', fetchError)
        return false
      }

      // Si le rôle ne correspond pas, le corriger
      if (currentProfile.user_role !== expectedRole) {
        console.log(`🔄 Correction du rôle utilisateur: ${currentProfile.user_role} → ${expectedRole}`)
        
        const { error: updateError } = await this.supabase
          .from('users')
          .update({ 
            user_role: expectedRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) {
          console.error('❌ Erreur mise à jour rôle:', updateError)
          return false
        }

        console.log('✅ Rôle utilisateur corrigé avec succès')
        return true
      }

      return true
    } catch (error) {
      console.error('❌ Erreur vérification rôle:', error)
      return false
    }
  }
}

export default SupabaseService
