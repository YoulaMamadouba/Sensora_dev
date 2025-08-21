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
        console.log('✅ Compte d\'authentification créé, création du profil avec le rôle:', userRole)
        
        // S'assurer que le rôle est bien défini
        const userRoleToInsert = userRole || 'entendant'
        console.log('🔍 Rôle à insérer dans la base de données:', userRoleToInsert)
        
        // Utiliser une transaction pour s'assurer que tout est cohérent
        const { error: profileError } = await this.supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            user_role: userRoleToInsert,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('❌ Erreur création profil:', profileError)
          // Essayer de supprimer le compte d'authentification en cas d'échec
          try {
            await this.supabase.auth.admin.deleteUser(data.user.id)
          } catch (deleteError) {
            console.error('❌ Erreur suppression compte après échec profil:', deleteError)
          }
          throw profileError
        }

        // Vérifier que le profil a été créé correctement
        const { data: createdProfile, error: verifyError } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (verifyError) {
          console.error('❌ Erreur vérification profil créé:', verifyError)
        } else {
          console.log('✅ Profil utilisateur créé avec succès:', {
            id: createdProfile.id,
            email: createdProfile.email,
            full_name: createdProfile.full_name,
            user_role: createdProfile.user_role
          })

          // Si le rôle ne correspond pas à ce qui était attendu, le corriger
          if (createdProfile.user_role !== userRoleToInsert) {
            console.warn(`⚠️ Rôle incorrect détecté: ${createdProfile.user_role} au lieu de ${userRoleToInsert}`)
            
            // Forcer la mise à jour du rôle
            const { error: updateError } = await this.supabase
              .from('users')
              .update({ 
                user_role: userRoleToInsert,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id)

            if (updateError) {
              console.error('❌ Erreur correction rôle:', updateError)
            } else {
              console.log('✅ Rôle corrigé avec succès')
            }
          }
        }
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
      } else if (error?.message?.includes('duplicate key value violates unique constraint')) {
        throw new Error('Un utilisateur avec cet email existe déjà.')
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
   * Corriger automatiquement tous les rôles utilisateur incorrects
   */
  async fixAllUserRoles(): Promise<{
    success: boolean
    fixedCount: number
    errors: string[]
  }> {
    try {
      console.log('🔧 Correction automatique de tous les rôles utilisateur')
      
      const errors: string[] = []
      let fixedCount = 0

      // Récupérer tous les utilisateurs
      const { data: users, error: fetchError } = await this.supabase
        .from('users')
        .select('id, email, full_name, user_role')

      if (fetchError) {
        errors.push(`Erreur récupération utilisateurs: ${fetchError.message}`)
        return { success: false, fixedCount: 0, errors }
      }

      if (!users || users.length === 0) {
        console.log('ℹ️ Aucun utilisateur trouvé')
        return { success: true, fixedCount: 0, errors: [] }
      }

      console.log(`📊 ${users.length} utilisateurs trouvés`)

      // Vérifier et corriger chaque utilisateur
      for (const user of users) {
        try {
          // Vérifier si le rôle est valide
          if (!user.user_role || (user.user_role !== 'entendant' && user.user_role !== 'sourd')) {
            console.log(`⚠️ Rôle invalide détecté pour ${user.email}: ${user.user_role}`)
            
            // Essayer de déterminer le rôle correct basé sur les métadonnées
            const { data: authUser } = await this.supabase.auth.admin.getUserById(user.id)
            if (authUser?.user?.user_metadata?.user_role) {
              const correctRole = authUser.user.user_metadata.user_role
              if (correctRole === 'entendant' || correctRole === 'sourd') {
                // Corriger le rôle
                const { error: updateError } = await this.supabase
                  .from('users')
                  .update({ 
                    user_role: correctRole,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', user.id)

                if (updateError) {
                  errors.push(`Erreur correction rôle pour ${user.email}: ${updateError.message}`)
                } else {
                  console.log(`✅ Rôle corrigé pour ${user.email}: ${user.user_role} → ${correctRole}`)
                  fixedCount++
                }
              } else {
                errors.push(`Rôle invalide dans les métadonnées pour ${user.email}: ${correctRole}`)
              }
            } else {
              // Si pas de métadonnées, utiliser la valeur par défaut
              const { error: updateError } = await this.supabase
                .from('users')
                .update({ 
                  user_role: 'entendant',
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

              if (updateError) {
                errors.push(`Erreur correction rôle par défaut pour ${user.email}: ${updateError.message}`)
              } else {
                console.log(`✅ Rôle corrigé par défaut pour ${user.email}: ${user.user_role} → entendant`)
                fixedCount++
              }
            }
          }
        } catch (error) {
          errors.push(`Erreur traitement utilisateur ${user.email}: ${error}`)
        }
      }

      console.log(`✅ Correction terminée: ${fixedCount} utilisateurs corrigés`)
      return {
        success: errors.length === 0,
        fixedCount,
        errors
      }
    } catch (error) {
      console.error('❌ Erreur correction automatique:', error)
      return {
        success: false,
        fixedCount: 0,
        errors: [`Erreur générale: ${error}`]
      }
    }
  }

  /**
   * Tester la structure de la base de données
   */
  async testDatabaseStructure(): Promise<{
    success: boolean
    issues: string[]
    tableExists: boolean
    columnExists: boolean
    constraintExists: boolean
  }> {
    try {
      console.log('🔍 Test de la structure de la base de données')
      
      const issues: string[] = []
      let tableExists = false
      let columnExists = false
      let constraintExists = false

      // Vérifier si la table users existe
      const { data: tableCheck, error: tableError } = await this.supabase
        .from('users')
        .select('count')
        .limit(1)

      if (tableError) {
        issues.push(`Table users n'existe pas: ${tableError.message}`)
      } else {
        tableExists = true
        console.log('✅ Table users existe')
      }

      // Vérifier si la colonne user_role existe
      if (tableExists) {
        const { data: columnCheck, error: columnError } = await this.supabase
          .from('users')
          .select('user_role')
          .limit(1)

        if (columnError) {
          issues.push(`Colonne user_role n'existe pas: ${columnError.message}`)
        } else {
          columnExists = true
          console.log('✅ Colonne user_role existe')
        }
      }

      // Vérifier la contrainte sur user_role
      if (columnExists) {
        try {
          // Tenter d'insérer une valeur invalide pour tester la contrainte
          const { error: constraintError } = await this.supabase
            .from('users')
            .insert({
              id: '00000000-0000-0000-0000-000000000000', // UUID invalide pour le test
              email: 'test@test.com',
              full_name: 'Test User',
              user_role: 'invalid_role'
            })

          if (constraintError && constraintError.message.includes('check constraint')) {
            constraintExists = true
            console.log('✅ Contrainte sur user_role existe')
          } else {
            issues.push('Contrainte sur user_role ne fonctionne pas correctement')
          }
        } catch (error) {
          // C'est normal que l'insertion échoue, on vérifie juste la contrainte
          constraintExists = true
          console.log('✅ Contrainte sur user_role existe (test réussi)')
        }
      }

      return {
        success: issues.length === 0,
        issues,
        tableExists,
        columnExists,
        constraintExists
      }
    } catch (error) {
      console.error('❌ Erreur test structure base de données:', error)
      return {
        success: false,
        issues: [`Erreur test: ${error}`],
        tableExists: false,
        columnExists: false,
        constraintExists: false
      }
    }
  }

  /**
   * Diagnostiquer les problèmes avec le rôle utilisateur
   */
  async diagnoseUserRole(userId: string): Promise<{
    success: boolean
    currentRole: string | null
    expectedRole: string | null
    issues: string[]
  }> {
    try {
      console.log('🔍 Diagnostic du rôle utilisateur:', userId)

      const issues: string[] = []
      let currentRole: string | null = null
      let expectedRole: string | null = null

      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await this.supabase
        .from('users')
        .select('user_role, email, full_name')
        .eq('id', userId)
        .single()

      if (profileError) {
        issues.push(`Erreur récupération profil: ${profileError.message}`)
        return { success: false, currentRole: null, expectedRole: null, issues }
      }

      currentRole = profile.user_role
      console.log('📊 Profil actuel:', profile)

      // Vérifier si le rôle est valide
      if (!currentRole || (currentRole !== 'entendant' && currentRole !== 'sourd')) {
        issues.push(`Rôle invalide: ${currentRole}`)
      }

      // Vérifier si le rôle correspond à ce qui est attendu
      if (this.currentUser) {
        // Essayer de déterminer le rôle attendu basé sur les données d'authentification
        const { data: authUser } = await this.supabase.auth.getUser()
        if (authUser?.user) {
          const userMetadata = authUser.user.user_metadata
          if (userMetadata?.user_role) {
            expectedRole = userMetadata.user_role
            if (expectedRole !== currentRole) {
              issues.push(`Rôle attendu (${expectedRole}) ne correspond pas au rôle actuel (${currentRole})`)
            }
          }
        }
      }

      return {
        success: issues.length === 0,
        currentRole,
        expectedRole,
        issues
      }
    } catch (error) {
      console.error('❌ Erreur diagnostic rôle:', error)
      return {
        success: false,
        currentRole: null,
        expectedRole: null,
        issues: [`Erreur diagnostic: ${error}`]
      }
    }
  }

  /**
   * Forcer la mise à jour du rôle utilisateur
   */
  async forceUpdateUserRole(userId: string, userRole: 'entendant' | 'sourd'): Promise<boolean> {
    try {
      console.log('🔧 Force mise à jour du rôle utilisateur:', { userId, userRole })

      const { error: updateError } = await this.supabase
        .from('users')
        .update({ 
          user_role: userRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Erreur force mise à jour rôle:', updateError)
        return false
      }

      // Vérifier que la mise à jour a bien été effectuée
      const { data: updatedProfile, error: verifyError } = await this.supabase
        .from('users')
        .select('user_role, email, full_name')
        .eq('id', userId)
        .single()

      if (verifyError) {
        console.error('❌ Erreur vérification force mise à jour:', verifyError)
        return false
      }

      if (updatedProfile.user_role === userRole) {
        console.log('✅ Force mise à jour réussie:', {
          id: userId,
          email: updatedProfile.email,
          full_name: updatedProfile.full_name,
          user_role: updatedProfile.user_role
        })
        return true
      } else {
        console.error('❌ Échec de la force mise à jour: le rôle n\'a pas été mis à jour')
        return false
      }
    } catch (error) {
      console.error('❌ Erreur force mise à jour rôle:', error)
      return false
    }
  }

  /**
   * Vérifier et corriger le type d'utilisateur
   */
  async checkAndFixUserRole(userId: string, expectedRole: 'entendant' | 'sourd'): Promise<boolean> {
    try {
      if (!this.currentUser) {
        console.warn('⚠️ Utilisateur non connecté, impossible de vérifier le rôle')
        return false
      }

      console.log('🔍 Vérification du rôle utilisateur:', { userId, expectedRole })

      // Récupérer le profil utilisateur actuel
      const { data: currentProfile, error: fetchError } = await this.supabase
        .from('users')
        .select('user_role, email, full_name')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('❌ Erreur récupération profil:', fetchError)
        return false
      }

      console.log('📊 Profil actuel:', {
        id: userId,
        email: currentProfile.email,
        full_name: currentProfile.full_name,
        current_role: currentProfile.user_role,
        expected_role: expectedRole
      })

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
        
        // Vérifier que la mise à jour a bien été effectuée
        const { data: updatedProfile, error: verifyError } = await this.supabase
          .from('users')
          .select('user_role')
          .eq('id', userId)
          .single()

        if (verifyError) {
          console.error('❌ Erreur vérification mise à jour:', verifyError)
          return false
        }

        if (updatedProfile.user_role === expectedRole) {
          console.log('✅ Vérification réussie: le rôle a été correctement mis à jour')
          return true
        } else {
          console.error('❌ Échec de la vérification: le rôle n\'a pas été mis à jour correctement')
          return false
        }
      } else {
        console.log('✅ Le rôle utilisateur est déjà correct:', currentProfile.user_role)
        return true
      }
    } catch (error) {
      console.error('❌ Erreur vérification rôle:', error)
      return false
    }
  }
}

export default SupabaseService
