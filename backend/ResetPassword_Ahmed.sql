-- Script pour réinitialiser le mot de passe du coach Ahmed Ben Ali
-- Nouveau mot de passe : Test123!

-- Hash BCrypt pour "Test123!" (vous devrez le générer avec BCrypt)
-- Pour l'instant, utilisons un hash temporaire

-- IMPORTANT: Vous devez d'abord générer le hash BCrypt pour "Test123!"
-- Utilisez ce code C# pour générer le hash:
-- string hash = BCrypt.Net.BCrypt.HashPassword("Test123!");

-- Exemple de mise à jour (remplacez le hash par le vrai hash généré)
UPDATE Coaches 
SET PasswordHash = '$2a$11$NOUVEAU_HASH_ICI'
WHERE CoachId = 1006 AND Email = 'ahmed.benali@coach.test';

-- Vérification
SELECT CoachId, Name, Email, IsEmailVerified, IsActive 
FROM Coaches 
WHERE CoachId = 1006;
