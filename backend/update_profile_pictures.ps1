# Script PowerShell pour mettre à jour les photos de profil des adhérents

$serverName = "laptop-gm66i350"
$databaseName = "CoachingAppDb"

# Connexion à la base de données
$connectionString = "Server=$serverName;Database=$databaseName;Trusted_Connection=True;TrustServerCertificate=True;"

Write-Host "Connexion à la base de données..." -ForegroundColor Cyan

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    Write-Host "Connecté avec succès!" -ForegroundColor Green
    
    # Récupérer les adhérents existants
    Write-Host "`nRécupération des adhérents..." -ForegroundColor Cyan
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT AdherentId, Name, Email, ProfilePicture FROM Adherents ORDER BY AdherentId"
    $reader = $command.ExecuteReader()
    
    $adherents = @()
    while ($reader.Read()) {
        $adherents += [PSCustomObject]@{
            Id = $reader["AdherentId"]
            Name = $reader["Name"]
            Email = $reader["Email"]
            CurrentPicture = $reader["ProfilePicture"]
        }
    }
    $reader.Close()
    
    Write-Host "Trouvé $($adherents.Count) adhérent(s)" -ForegroundColor Yellow
    $adherents | Format-Table -AutoSize
    
    # URLs de photos de célébrités/personnes aléatoires
    $photoUrls = @(
        "https://randomuser.me/api/portraits/men/32.jpg",
        "https://randomuser.me/api/portraits/women/44.jpg",
        "https://randomuser.me/api/portraits/men/45.jpg",
        "https://randomuser.me/api/portraits/women/68.jpg",
        "https://randomuser.me/api/portraits/men/52.jpg",
        "https://randomuser.me/api/portraits/women/65.jpg",
        "https://randomuser.me/api/portraits/men/71.jpg",
        "https://randomuser.me/api/portraits/women/89.jpg",
        "https://randomuser.me/api/portraits/men/83.jpg",
        "https://randomuser.me/api/portraits/women/90.jpg",
        "https://randomuser.me/api/portraits/men/91.jpg",
        "https://randomuser.me/api/portraits/women/92.jpg",
        "https://randomuser.me/api/portraits/men/93.jpg",
        "https://randomuser.me/api/portraits/women/94.jpg",
        "https://randomuser.me/api/portraits/men/95.jpg"
    )
    
    # Mettre à jour chaque adhérent
    Write-Host "`nMise à jour des photos de profil..." -ForegroundColor Cyan
    $index = 0
    foreach ($adherent in $adherents) {
        $photoUrl = $photoUrls[$index % $photoUrls.Count]
        
        $updateCommand = $connection.CreateCommand()
        $updateCommand.CommandText = "UPDATE Adherents SET ProfilePicture = @ProfilePicture WHERE AdherentId = @AdherentId"
        $updateCommand.Parameters.AddWithValue("@ProfilePicture", $photoUrl) | Out-Null
        $updateCommand.Parameters.AddWithValue("@AdherentId", $adherent.Id) | Out-Null
        
        $rowsAffected = $updateCommand.ExecuteNonQuery()
        
        if ($rowsAffected -gt 0) {
            Write-Host "✓ Mis à jour: $($adherent.Name) -> $photoUrl" -ForegroundColor Green
        }
        
        $index++
    }
    
    Write-Host "`nMise à jour terminée avec succès!" -ForegroundColor Green
    
    # Vérifier les résultats
    Write-Host "`nVérification des mises à jour..." -ForegroundColor Cyan
    $verifyCommand = $connection.CreateCommand()
    $verifyCommand.CommandText = "SELECT AdherentId, Name, ProfilePicture FROM Adherents ORDER BY AdherentId"
    $verifyReader = $verifyCommand.ExecuteReader()
    
    $results = @()
    while ($verifyReader.Read()) {
        $results += [PSCustomObject]@{
            Id = $verifyReader["AdherentId"]
            Name = $verifyReader["Name"]
            Photo = $verifyReader["ProfilePicture"]
        }
    }
    $verifyReader.Close()
    
    $results | Format-Table -AutoSize
    
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
        Write-Host "`nConnexion fermée." -ForegroundColor Cyan
    }
}
