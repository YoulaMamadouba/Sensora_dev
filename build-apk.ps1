# Script PowerShell pour générer l'APK Android avec EAS
Write-Host "🚀 Initialisation du projet EAS..." -ForegroundColor Cyan
$response = Read-Host "Voulez-vous créer un projet EAS pour @youla_mamadouba/sensora-app? (Y/n)"
if ($response -eq "Y" -or $response -eq "y" -or $response -eq "") {
    Write-Host "✅ Création du projet EAS..." -ForegroundColor Green
    npx eas-cli init --id
    Write-Host "📦 Lancement de la génération de l'APK..." -ForegroundColor Cyan
    npx eas-cli build --platform android --profile preview
} else {
    Write-Host "❌ Création du projet annulée" -ForegroundColor Red
}


