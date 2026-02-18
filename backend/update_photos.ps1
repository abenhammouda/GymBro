# Script PowerShell pour mettre à jour les photos de profil des adherents

$serverName = "laptop-gm66i350"
$databaseName = "CoachingAppDb"
$connectionString = "Server=$serverName;Database=$databaseName;Trusted_Connection=True;TrustServerCertificate=True;"

Write-Host "Connexion a la base de donnees..." -ForegroundColor Cyan

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    Write-Host "Connecte avec succes!" -ForegroundColor Green
    
    # Recuperer les adherents existants
    Write-Host "Recuperation des adherents..." -ForegroundColor Cyan
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT AdherentId, Name, Email FROM Adherents ORDER BY AdherentId"
    $reader = $command.ExecuteReader()
    
    $adherents = @()
    while ($reader.Read()) {
        $adherents += [PSCustomObject]@{
            Id = $reader["AdherentId"]
            Name = $reader["Name"]
        }
    }
    $reader.Close()
    
    Write-Host "Trouve $($adherents.Count) adherent(s)" -ForegroundColor Yellow
    
    # URLs de photos
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
        "https://randomuser.me/api/portraits/women/90.jpg"
    )
    
    # Mettre a jour chaque adherent
    Write-Host "Mise a jour des photos de profil..." -ForegroundColor Cyan
    $index = 0
    foreach ($adherent in $adherents) {
        $photoUrl = $photoUrls[$index % $photoUrls.Count]
        
        $updateCommand = $connection.CreateCommand()
        $updateCommand.CommandText = "UPDATE Adherents SET ProfilePicture = @ProfilePicture WHERE AdherentId = @AdherentId"
        $updateCommand.Parameters.AddWithValue("@ProfilePicture", $photoUrl) | Out-Null
        $updateCommand.Parameters.AddWithValue("@AdherentId", $adherent.Id) | Out-Null
        
        $rowsAffected = $updateCommand.ExecuteNonQuery()
        
        if ($rowsAffected -gt 0) {
            Write-Host "Mis a jour: $($adherent.Name)" -ForegroundColor Green
        }
        
        $index++
    }
    
    Write-Host "Mise a jour terminee avec succes!" -ForegroundColor Green
    
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
} finally {
    if ($connection.State -eq 'Open') {
        $connection.Close()
        Write-Host "Connexion fermee." -ForegroundColor Cyan
    }
}
