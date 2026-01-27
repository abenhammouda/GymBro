# Script PowerShell pour créer des comptes de test
# Assurez-vous que le backend est lancé sur http://localhost:5085

$baseUrl = "http://localhost:5085/api/auth"

Write-Host "=== Création des comptes de test ===" -ForegroundColor Cyan
Write-Host ""

# Fonction pour créer un coach
function Create-Coach {
    param($name, $email, $phone, $bio, $specialization)
    
    $body = @{
        name = $name
        email = $email
        phoneNumber = $phone
        password = "Test123!"
        bio = $bio
        specialization = $specialization
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/register/coach" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ Coach créé: $email" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Erreur pour $email : $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Détails: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        return $false
    }
}

# Fonction pour créer un adhérent
function Create-Adherent {
    param($name, $email, $gender, $height)
    
    $body = @{
        name = $name
        email = $email
        password = "Test123!"
        gender = $gender
        height = $height
        dateOfBirth = "1990-01-01"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/register/adherent" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ Adhérent créé: $email" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Erreur pour $email : $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Détails: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        return $false
    }
}

# Créer les coaches
Write-Host "--- Création des Coaches ---" -ForegroundColor Yellow
Create-Coach -name "Coach Test 1" -email "coach1@test.com" -phone "+33612345671" -bio "Coach spécialisé en musculation" -specialization "Musculation"
Create-Coach -name "Coach Test 2" -email "coach2@test.com" -phone "+33612345672" -bio "Coach spécialisé en cardio" -specialization "Cardio"
Create-Coach -name "Marie Dupont" -email "marie.coach@test.com" -phone "+33612345673" -bio "Coach certifiée en fitness" -specialization "Fitness"

Write-Host ""

# Créer les adhérents
Write-Host "--- Création des Adhérents ---" -ForegroundColor Yellow
Create-Adherent -name "Adherent Test 1" -email "adherent1@test.com" -gender "M" -height 175
Create-Adherent -name "Adherent Test 2" -email "adherent2@test.com" -gender "F" -height 165
Create-Adherent -name "Jean Martin" -email "jean.adherent@test.com" -gender "M" -height 180
Create-Adherent -name "Sophie Bernard" -email "sophie.adherent@test.com" -gender "F" -height 168

Write-Host ""
Write-Host "=== Terminé! ===" -ForegroundColor Cyan
Write-Host "Mot de passe pour tous les comptes: Test123!" -ForegroundColor Green
