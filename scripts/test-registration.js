#!/usr/bin/env node

/**
 * Script de test pour vérifier l'inscription et la connexion
 * Usage: node scripts/test-registration.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
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
 * Tester l'inscription d'un utilisateur
 */
async function testUserRegistration() {
  console.log(`${colors.cyan}🧪 Test d'inscription d'utilisateur...${colors.reset}`)
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Test User'
  const testRole = 'entendant'

  try {
    // 1. Inscription
    console.log(`${colors.blue}📝 Tentative d'inscription...${colors.reset}`)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
          user_role: testRole
        }
      }
    })

    if (signUpError) {
      console.error(`${colors.red}❌ Erreur inscription:${colors.reset}`, signUpError.message)
      return false
    }

    if (!signUpData.user) {
      console.error(`${colors.red}❌ Aucun utilisateur créé${colors.reset}`)
      return false
    }

    console.log(`${colors.green}✅ Compte d'authentification créé: ${signUpData.user.id}${colors.reset}`)

    // 2. Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 3. Créer le profil dans la table users
    console.log(`${colors.blue}👤 Création du profil utilisateur...${colors.reset}`)
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        full_name: testName,
        user_role: testRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error(`${colors.red}❌ Erreur création profil:${colors.reset}`, profileError.message)
      return false
    }

    console.log(`${colors.green}✅ Profil utilisateur créé: ${profileData.id}${colors.reset}`)

    // 4. Vérifier la session
    console.log(`${colors.blue}🔐 Vérification de la session...${colors.reset}`)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error(`${colors.red}❌ Aucune session active${colors.reset}`)
      return false
    }

    console.log(`${colors.green}✅ Session active: ${session.user.email}${colors.reset}`)

    // 5. Vérifier le profil
    console.log(`${colors.blue}🔍 Vérification du profil...${colors.reset}`)
    const { data: userProfile, error: profileFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signUpData.user.id)
      .single()

    if (profileFetchError) {
      console.error(`${colors.red}❌ Erreur récupération profil:${colors.reset}`, profileFetchError.message)
      return false
    }

    console.log(`${colors.green}✅ Profil récupéré: ${userProfile.email} (${userProfile.user_role})${colors.reset}`)

    // 6. Test de connexion
    console.log(`${colors.blue}🔑 Test de déconnexion et reconnexion...${colors.reset}`)
    
    // Déconnexion
    await supabase.auth.signOut()
    console.log(`${colors.yellow}🚪 Déconnexion effectuée${colors.reset}`)

    // Reconnexion
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      console.error(`${colors.red}❌ Erreur reconnexion:${colors.reset}`, signInError.message)
      return false
    }

    console.log(`${colors.green}✅ Reconnexion réussie: ${signInData.user.email}${colors.reset}`)

    // 7. Nettoyage
    console.log(`${colors.blue}🧹 Nettoyage du test...${colors.reset}`)
    
    // Supprimer le profil
    await supabase
      .from('users')
      .delete()
      .eq('id', signUpData.user.id)

    // Supprimer le compte auth (nécessite des permissions admin)
    try {
      await supabase.auth.admin.deleteUser(signUpData.user.id)
      console.log(`${colors.green}✅ Utilisateur de test supprimé${colors.reset}`)
    } catch (deleteError) {
      console.warn(`${colors.yellow}⚠️ Impossible de supprimer le compte auth (permissions insuffisantes)${colors.reset}`)
    }

    return true

  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors du test:${colors.reset}`, error)
    return false
  }
}

/**
 * Vérifier l'état actuel de la base de données
 */
async function checkCurrentState() {
  console.log(`${colors.cyan}🔍 Vérification de l'état actuel...${colors.reset}`)
  
  try {
    // Vérifier les utilisateurs dans la table users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, user_role, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (usersError) {
      console.error(`${colors.red}❌ Erreur récupération utilisateurs:${colors.reset}`, usersError.message)
      return
    }

    console.log(`${colors.blue}📊 Utilisateurs dans la table users:${colors.reset}`)
    if (users && users.length > 0) {
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.user_role}) - ${user.created_at}`)
      })
    } else {
      console.log(`  ${colors.yellow}Aucun utilisateur trouvé${colors.reset}`)
    }

    // Vérifier la session actuelle
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      console.log(`${colors.green}✅ Session active: ${session.user.email}${colors.reset}`)
    } else {
      console.log(`${colors.yellow}ℹ️ Aucune session active${colors.reset}`)
    }

  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors de la vérification:${colors.reset}`, error)
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log(`${colors.bright}${colors.blue}🧪 Test d'inscription et de connexion${colors.reset}\n`)
  
  try {
    // 1. Vérifier l'état actuel
    await checkCurrentState()
    
    console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}`)
    
    // 2. Tester l'inscription
    const testResult = await testUserRegistration()
    
    console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}`)
    
    if (testResult) {
      console.log(`${colors.green}✅ Test d'inscription réussi !${colors.reset}`)
      console.log(`${colors.green}✅ L'inscription et la connexion fonctionnent correctement${colors.reset}`)
    } else {
      console.log(`${colors.red}❌ Test d'inscription échoué${colors.reset}`)
      console.log(`${colors.red}❌ Il y a des problèmes avec l'inscription ou la connexion${colors.reset}`)
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

module.exports = { testUserRegistration, checkCurrentState }
