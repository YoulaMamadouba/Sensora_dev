# Script PowerShell pour nettoyer l'historique Git des clés API

Write-Host "🔍 Nettoyage de l'historique Git des clés API sensibles..." -ForegroundColor Cyan

# Vérifier qu'on est sur la branche main
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Write-Host "❌ Erreur: Vous devez être sur la branche 'main'" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Branche actuelle: $currentBranch" -ForegroundColor Green

# Utiliser git filter-branch pour supprimer les fichiers problématiques de l'historique
Write-Host "`n🧹 Suppression des fichiers contenant des clés de l'historique..." -ForegroundColor Yellow

# Supprimer CONFIGURER_VARIABLES_EAS.md de l'historique
git filter-branch --force --index-filter `
    "git rm --cached --ignore-unmatch CONFIGURER_VARIABLES_EAS.md GUIDE_VARIABLES_ENV.md CONFIGURATION_EAS.md SETUP_EAS_VARIABLES.md 2>$null || true" `
    --prune-empty --tag-name-filter cat -- --all

# Nettoyer les références
Write-Host "`n🧹 Nettoyage des références..." -ForegroundColor Yellow
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "`n✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT: Vous devrez faire un force push: git push --force-with-lease" -ForegroundColor Yellow

