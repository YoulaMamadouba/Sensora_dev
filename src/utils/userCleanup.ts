/**
 * Utilitaires pour nettoyer et corriger les problèmes d'utilisateurs
 */

import SupabaseService from '../services/SupabaseService'
import { ENV_CONFIG } from '../config/envConfig'

export interface CleanupResult {
  success: boolean
  cleanedUsers: number
  fixedRoles: number
  errors: string[]
  details: {
    duplicateUsers: string[]
    invalidRoles: string[]
    fixedRoles: string[]
  }
}

/**
 * Nettoyer les utilisateurs en double et corriger les rôles
 */
export const cleanupUsers = async (supabaseService: SupabaseService): Promise<CleanupResult> => {
  const result: CleanupResult = {
    success: false,
    cleanedUsers: 0,
    fixedRoles: 0,
    errors: [],
    details: {
      duplicateUsers: [],
      invalidRoles: [],
      fixedRoles: []
    }
  }

  try {
    console.log('🧹 Début du nettoyage des utilisateurs...')

    // 1. Récupérer tous les utilisateurs
    const { data: users, error: fetchError } = await supabaseService.client
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      result.errors.push(`Erreur récupération utilisateurs: ${fetchError.message}`)
      return result
    }

    if (!users || users.length === 0) {
      console.log('ℹ️ Aucun utilisateur trouvé')
      result.success = true
      return result
    }

    console.log(`📊 ${users.length} utilisateurs trouvés`)

    // 2. Identifier les doublons par email
    const emailGroups = new Map<string, any[]>()
    users.forEach(user => {
      if (!emailGroups.has(user.email)) {
        emailGroups.set(user.email, [])
      }
      emailGroups.get(user.email)!.push(user)
    })

    // 3. Traiter les doublons
    for (const [email, duplicateUsers] of emailGroups) {
      if (duplicateUsers.length > 1) {
        console.log(`🔄 Traitement des doublons pour ${email}: ${duplicateUsers.length} utilisateurs`)
        
        // Garder le plus ancien, supprimer les autres
        const sortedUsers = duplicateUsers.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        
        const keepUser = sortedUsers[0]
        const deleteUsers = sortedUsers.slice(1)
        
        console.log(`✅ Conservation de l'utilisateur: ${keepUser.id} (créé le ${keepUser.created_at})`)
        
        for (const userToDelete of deleteUsers) {
          try {
            // Supprimer de la table users
            const { error: deleteError } = await supabaseService.client
              .from('users')
              .delete()
              .eq('id', userToDelete.id)

            if (deleteError) {
              result.errors.push(`Erreur suppression utilisateur ${userToDelete.id}: ${deleteError.message}`)
            } else {
              console.log(`🗑️ Utilisateur supprimé: ${userToDelete.id}`)
              result.cleanedUsers++
              result.details.duplicateUsers.push(userToDelete.id)
            }
          } catch (error) {
            result.errors.push(`Erreur suppression utilisateur ${userToDelete.id}: ${error}`)
          }
        }
      }
    }

    // 4. Corriger les rôles invalides
    const { data: remainingUsers, error: remainingError } = await supabaseService.client
      .from('users')
      .select('*')

    if (remainingError) {
      result.errors.push(`Erreur récupération utilisateurs restants: ${remainingError.message}`)
      return result
    }

    for (const user of remainingUsers || []) {
      // Vérifier si le rôle est valide
      if (!user.user_role || (user.user_role !== 'entendant' && user.user_role !== 'sourd')) {
        console.log(`⚠️ Rôle invalide détecté pour ${user.email}: ${user.user_role}`)
        result.details.invalidRoles.push(user.id)

        // Essayer de déterminer le rôle correct depuis les métadonnées auth
        try {
          const { data: authUser } = await supabaseService.client.auth.admin.getUserById(user.id)
          let correctRole = 'entendant' // Valeur par défaut

          if (authUser?.user?.user_metadata?.user_role) {
            const metadataRole = authUser.user.user_metadata.user_role
            if (metadataRole === 'entendant' || metadataRole === 'sourd') {
              correctRole = metadataRole
            }
          }

          // Corriger le rôle
          const { error: updateError } = await supabaseService.client
            .from('users')
            .update({ 
              user_role: correctRole,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

          if (updateError) {
            result.errors.push(`Erreur correction rôle pour ${user.email}: ${updateError.message}`)
          } else {
            console.log(`✅ Rôle corrigé pour ${user.email}: ${user.user_role} → ${correctRole}`)
            result.fixedRoles++
            result.details.fixedRoles.push(user.id)
          }
        } catch (error) {
          result.errors.push(`Erreur correction rôle pour ${user.email}: ${error}`)
        }
      }
    }

    result.success = result.errors.length === 0
    console.log(`✅ Nettoyage terminé: ${result.cleanedUsers} utilisateurs nettoyés, ${result.fixedRoles} rôles corrigés`)

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
    result.errors.push(`Erreur générale: ${error}`)
  }

  return result
}

/**
 * Vérifier l'intégrité de la base de données
 */
export const checkDatabaseIntegrity = async (supabaseService: SupabaseService): Promise<{
  success: boolean
  issues: string[]
  stats: {
    totalUsers: number
    validRoles: number
    invalidRoles: number
    duplicateEmails: number
  }
}> => {
  const result = {
    success: false,
    issues: [] as string[],
    stats: {
      totalUsers: 0,
      validRoles: 0,
      invalidRoles: 0,
      duplicateEmails: 0
    }
  }

  try {
    console.log('🔍 Vérification de l\'intégrité de la base de données...')

    // Récupérer tous les utilisateurs
    const { data: users, error: fetchError } = await supabaseService.client
      .from('users')
      .select('*')

    if (fetchError) {
      result.issues.push(`Erreur récupération utilisateurs: ${fetchError.message}`)
      return result
    }

    if (!users) {
      result.issues.push('Aucun utilisateur trouvé')
      return result
    }

    result.stats.totalUsers = users.length

    // Vérifier les rôles
    for (const user of users) {
      if (user.user_role === 'entendant' || user.user_role === 'sourd') {
        result.stats.validRoles++
      } else {
        result.stats.invalidRoles++
        result.issues.push(`Rôle invalide pour ${user.email}: ${user.user_role}`)
      }
    }

    // Vérifier les doublons d'email
    const emailCounts = new Map<string, number>()
    users.forEach(user => {
      emailCounts.set(user.email, (emailCounts.get(user.email) || 0) + 1)
    })

    for (const [email, count] of emailCounts) {
      if (count > 1) {
        result.stats.duplicateEmails += count - 1
        result.issues.push(`Email dupliqué: ${email} (${count} occurrences)`)
      }
    }

    result.success = result.issues.length === 0
    console.log('✅ Vérification terminée:', result.stats)

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
    result.issues.push(`Erreur générale: ${error}`)
  }

  return result
}

/**
 * Fonction de maintenance complète
 */
export const performMaintenance = async (supabaseService: SupabaseService): Promise<{
  success: boolean
  integrityCheck: any
  cleanup: CleanupResult
  summary: string
}> => {
  console.log('🔧 Début de la maintenance complète...')

  // 1. Vérification de l'intégrité
  const integrityCheck = await checkDatabaseIntegrity(supabaseService)
  console.log('📊 Résultats de la vérification d\'intégrité:', integrityCheck)

  // 2. Nettoyage si nécessaire
  let cleanup: CleanupResult = {
    success: true,
    cleanedUsers: 0,
    fixedRoles: 0,
    errors: [],
    details: { duplicateUsers: [], invalidRoles: [], fixedRoles: [] }
  }

  if (!integrityCheck.success) {
    console.log('🧹 Nettoyage nécessaire, début du nettoyage...')
    cleanup = await cleanupUsers(supabaseService)
  }

  // 3. Résumé
  const summary = `
Maintenance terminée:
- Utilisateurs vérifiés: ${integrityCheck.stats.totalUsers}
- Rôles valides: ${integrityCheck.stats.validRoles}
- Rôles invalides: ${integrityCheck.stats.invalidRoles}
- Emails dupliqués: ${integrityCheck.stats.duplicateEmails}
- Utilisateurs nettoyés: ${cleanup.cleanedUsers}
- Rôles corrigés: ${cleanup.fixedRoles}
- Erreurs: ${integrityCheck.issues.length + cleanup.errors.length}
  `.trim()

  console.log('📋 Résumé de la maintenance:', summary)

  return {
    success: integrityCheck.success && cleanup.success,
    integrityCheck,
    cleanup,
    summary
  }
}

export default {
  cleanupUsers,
  checkDatabaseIntegrity,
  performMaintenance
}

