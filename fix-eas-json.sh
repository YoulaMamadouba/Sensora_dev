#!/bin/bash
export FILTER_BRANCH_SQUELCH_WARNING=1

echo "🔍 Nettoyage de l'historique Git..."

# Fonction pour nettoyer eas.json
clean_eas_json() {
    if [ -f eas.json ]; then
        # Remplacer les clés par des chaînes vides
        sed -i 's/"EXPO_PUBLIC_SUPABASE_URL": "[^"]*"/"EXPO_PUBLIC_SUPABASE_URL": ""/g' eas.json
        sed -i 's/"EXPO_PUBLIC_SUPABASE_ANON_KEY": "[^"]*"/"EXPO_PUBLIC_SUPABASE_ANON_KEY": ""/g' eas.json
        sed -i 's/"EXPO_PUBLIC_OPENAI_API_KEY": "[^"]*"/"EXPO_PUBLIC_OPENAI_API_KEY": ""/g' eas.json
        git add eas.json
    fi
}

# Modifier eas.json dans tous les commits
git filter-branch --force --tree-filter '
    # Nettoyer eas.json si il existe
    if [ -f eas.json ]; then
        sed -i "s/\"EXPO_PUBLIC_SUPABASE_URL\": \"[^\"]*\"/\"EXPO_PUBLIC_SUPABASE_URL\": \"\"/g" eas.json
        sed -i "s/\"EXPO_PUBLIC_SUPABASE_ANON_KEY\": \"[^\"]*\"/\"EXPO_PUBLIC_SUPABASE_ANON_KEY\": \"\"/g" eas.json
        sed -i "s/\"EXPO_PUBLIC_OPENAI_API_KEY\": \"[^\"]*\"/\"EXPO_PUBLIC_OPENAI_API_KEY\": \"\"/g" eas.json
    fi
    # Supprimer les fichiers de documentation problématiques
    rm -f CONFIGURER_VARIABLES_EAS.md GUIDE_VARIABLES_ENV.md CONFIGURATION_EAS.md SETUP_EAS_VARIABLES.md 2>/dev/null || true
' --prune-empty --tag-name-filter cat -- --all

echo "🧹 Nettoyage des références..."
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Nettoyage terminé!"
echo "⚠️  IMPORTANT: Faites un force push: git push --force-with-lease"

