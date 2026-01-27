# Script pour forcer le redémarrage du backend
Write-Host "=== Redémarrage forcé du backend ===" -ForegroundColor Cyan

# Arrêter tous les processus CoachingApp.API
Write-Host "`nArrêt de tous les processus CoachingApp.API..." -ForegroundColor Yellow
Get-Process -Name "CoachingApp.API" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Arrêt du processus PID: $($_.Id)" -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 3

# Nettoyer les fichiers bin et obj
Write-Host "`nNettoyage des fichiers de build..." -ForegroundColor Yellow
Set-Location -Path "backend\src\CoachingApp.API"

if (Test-Path "bin") {
    Remove-Item -Path "bin" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Dossier bin supprimé" -ForegroundColor Gray
}

if (Test-Path "obj") {
    Remove-Item -Path "obj" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Dossier obj supprimé" -ForegroundColor Gray
}

# Nettoyer aussi CoachingApp.Infrastructure
Set-Location -Path "..\CoachingApp.Infrastructure"
if (Test-Path "bin") {
    Remove-Item -Path "bin" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "obj") {
    Remove-Item -Path "obj" -Recurse -Force -ErrorAction SilentlyContinue
}

# Retour au dossier API
Set-Location -Path "..\CoachingApp.API"

Write-Host "`nRecompilation et démarrage..." -ForegroundColor Yellow
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur.`n" -ForegroundColor Gray

dotnet run
