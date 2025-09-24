#!/usr/bin/env node

/**
 * Script pour corriger les problèmes d'utilisateurs dans Supabase
 * Usage: node scripts/fix-user-issues.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('Assurez-vous que EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY sont définies')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

/**
 * Nettoyer les utilisateurs en double
 */
async function cleanupDuplicateUsers() {
  console.log(`${colors.cyan}🧹 Nettoyage des utilisateurs en double...${colors.reset}`)
  
  try {
    // Récupérer tous les utilisateurs
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error(`${colors.red}❌ Erreur récupération utilisateurs:${colors.reset}`, fetchError.message)
      return false
    }

    if (!users || users.length === 0) {
      console.log(`${colors.yellow}ℹ️ Aucun utilisateur trouvé${colors.reset}`)
      return true
    }

    console.log(`${colors.blue}📊 ${users.length} utilisateurs trouvés${colors.reset}`)

    // Identifier les doublons par email
    const emailGroups = new Map()
    users.forEach(user => {
      if (!emailGroups.has(user.email)) {
        emailGroups.set(user.email, [])
      }
      emailGroups.get(user.email).push(user)
    })

    let cleanedCount = 0

    // Traiter les doublons
    for (const [email, duplicateUsers] of emailGroups) {
      if (duplicateUsers.length > 1) {
        console.log(`${colors.yellow}🔄 Traitement des doublons pour ${email}: ${duplicateUsers.length} utilisateurs${colors.reset}`)
        
        // Garder le plus ancien, supprimer les autres
        const sortedUsers = duplicateUsers.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        
        const keepUser = sortedUsers[0]
        const deleteUsers = sortedUsers.slice(1)
        
        console.log(`${colors.green}✅ Conservation de l'utilisateur: ${keepUser.id} (créé le ${keepUser.created_at})${colors.reset}`)
        
        for (const userToDelete of deleteUsers) {
          try {
            const { error: deleteError } = await supabase
              .from('users')
              .delete()
              .eq('id', userToDelete.id)

            if (deleteError) {
              console.error(`${colors.red}❌ Erreur suppression utilisateur ${userToDelete.id}:${colors.reset}`, deleteError.message)
            } else {
              console.log(`${colors.green}🗑️ Utilisateur supprimé: ${userToDelete.id}${colors.reset}`)
              cleanedCount++
            }
          } catch (error) {
            console.error(`${colors.red}❌ Erreur suppression utilisateur ${userToDelete.id}:${colors.reset}`, error)
          }
        }
      }
    }

    console.log(`${colors.green}✅ Nettoyage terminé: ${cleanedCount} utilisateurs supprimés${colors.reset}`)
    return true

  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors du nettoyage:${colors.reset}`, error)
    return false
  }
}

/**
 * Corriger les rôles invalides
 */
async function fixInvalidRoles() {
  console.log(`${colors.cyan}🔧 Correction des rôles invalides...${colors.reset}`)
  
  try {
    // Récupérer tous les utilisateurs
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')

    if (fetchError) {
      console.error(`${colors.red}❌ Erreur récupération utilisateurs:${colors.reset}`, fetchError.message)
      return false
    }

    if (!users) {
      console.log(`${colors.yellow}ℹ️ Aucun utilisateur trouvé${colors.reset}`)
      return true
    }

    let fixedCount = 0

    for (const user of users) {
      // Vérifier si le rôle est valide
      if (!user.user_role || (user.user_role !== 'entendant' && user.user_role !== 'sourd')) {
        console.log(`${colors.yellow}⚠️ Rôle invalide détecté pour ${user.email}: ${user.user_role}${colors.reset}`)

        // Essayer de déterminer le rôle correct depuis les métadonnées auth
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(user.id)
          let correctRole = 'entendant' // Valeur par défaut

          if (authUser?.user?.user_metadata?.user_role) {
            const metadataRole = authUser.user.user_metadata.user_role
            if (metadataRole === 'entendant' || metadataRole === 'sourd') {
              correctRole = metadataRole
            }
          }

          // Corriger le rôle
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              user_role: correctRole,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

          if (updateError) {
            console.error(`${colors.red}❌ Erreur correction rôle pour ${user.email}:${colors.reset}`, updateError.message)
          } else {
            console.log(`${colors.green}✅ Rôle corrigé pour ${user.email}: ${user.user_role} → ${correctRole}${colors.reset}`)
            fixedCount++
          }
        } catch (error) {
          console.error(`${colors.red}❌ Erreur correction rôle pour ${user.email}:${colors.reset}`, error)
        }
      }
    }

    console.log(`${colors.green}✅ Correction terminée: ${fixedCount} rôles corrigés${colors.reset}`)
    return true

  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors de la correction:${colors.reset}`, error)
    return false
  }
}

/**
 * Vérifier l'intégrité de la base de données
 */
async function checkDatabaseIntegrity() {
  console.log(`${colors.cyan}🔍 Vérification de l'intégrité de la base de données...${colors.reset}`)
  
  try {
    // Récupérer tous les utilisateurs
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')

    if (fetchError) {
      console.error(`${colors.red}❌ Erreur récupération utilisateurs:${colors.reset}`, fetchError.message)
      return false
    }

    if (!users) {
      console.log(`${colors.yellow}ℹ️ Aucun utilisateur trouvé${colors.reset}`)
      return true
    }

    const stats = {
      totalUsers: users.length,
      validRoles: 0,
      invalidRoles: 0,
      duplicateEmails: 0
    }

    // Vérifier les rôles
    for (const user of users) {
      if (user.user_role === 'entendant' || user.user_role === 'sourd') {
        stats.validRoles++
      } else {
        stats.invalidRoles++
        console.log(`${colors.red}❌ Rôle invalide pour ${user.email}: ${user.user_role}${colors.reset}`)
      }
    }

    // Vérifier les doublons d'email
    const emailCounts = new Map()
    users.forEach(user => {
      emailCounts.set(user.email, (emailCounts.get(user.email) || 0) + 1)
    })

    for (const [email, count] of emailCounts) {
      if (count > 1) {
        stats.duplicateEmails += count - 1
        console.log(`${colors.red}❌ Email dupliqué: ${email} (${count} occurrences)${colors.reset}`)
      }
    }

    console.log(`${colors.blue}📊 Statistiques:${colors.reset}`)
    console.log(`  - Total utilisateurs: ${stats.totalUsers}`)
    console.log(`  - Rôles valides: ${stats.validRoles}`)
    console.log(`  - Rôles invalides: ${stats.invalidRoles}`)
    console.log(`  - Emails dupliqués: ${stats.duplicateEmails}`)

    const hasIssues = stats.invalidRoles > 0 || stats.duplicateEmails > 0
    if (hasIssues) {
      console.log(`${colors.yellow}⚠️ Problèmes détectés dans la base de données${colors.reset}`)
      return false
    } else {
      console.log(`${colors.green}✅ Base de données en bon état${colors.reset}`)
      return true
    }

  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors de la vérification:${colors.reset}`, error)
    return false
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log(`${colors.bright}${colors.blue}🔧 Script de correction des problèmes d'utilisateurs${colors.reset}\n`)
  
  try {
    // 1. Vérification de l'intégrité
    const integrityOk = await checkDatabaseIntegrity()
    
    if (!integrityOk) {
      console.log(`\n${colors.yellow}🧹 Problèmes détectés, début du nettoyage...${colors.reset}`)
      
      // 2. Nettoyage des doublons
      const cleanupOk = await cleanupDuplicateUsers()
      
      // 3. Correction des rôles
      const fixRolesOk = await fixInvalidRoles()
      
      if (cleanupOk && fixRolesOk) {
        console.log(`\n${colors.green}✅ Nettoyage terminé, nouvelle vérification...${colors.reset}`)
        await checkDatabaseIntegrity()
      }
    } else {
      console.log(`\n${colors.green}✅ Aucun problème détecté${colors.reset}`)
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Erreur générale:${colors.reset}`, error)
    process.exit(1)
  }
}

// Exécuter le script
if (require.main === module) {
  main()
}

module.exports = { cleanupDuplicateUsers, fixInvalidRoles, checkDatabaseIntegrity }

