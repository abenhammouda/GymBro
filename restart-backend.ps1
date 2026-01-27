# Script pour redémarrer le backend
Write-Host "=== Redémarrage du backend CoachingApp ===" -ForegroundColor Cyan

# Arrêter le processus backend actuel
Write-Host "`nRecherche du processus CoachingApp.API..." -ForegroundColor Yellow
$process = Get-Process -Name "CoachingApp.API" -ErrorAction SilentlyContinue

if ($process) {
    Write-Host "Processus trouvé (PID: $($process.Id)). Arrêt en cours..." -ForegroundColor Yellow
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Processus arrêté." -ForegroundColor Green
} else {
    Write-Host "Aucun processus CoachingApp.API en cours d'exécution." -ForegroundColor Gray
}

# Redémarrer le backend
Write-Host "`nDémarrage du backend..." -ForegroundColor Yellow
Set-Location -Path "backend\src\CoachingApp.API"

Write-Host "Exécution de 'dotnet run'..." -ForegroundColor Cyan
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur.`n" -ForegroundColor Gray

dotnet run
