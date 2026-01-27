-- Vérifier si des comptes de test existent déjà
SELECT 'COACHES' as Type, CoachId, Name, Email, PhoneNumber, IsEmailVerified, IsActive 
FROM Coaches 
WHERE Email IN ('coach1@test.com', 'coach2@test.com', 'marie.coach@test.com')
   OR PhoneNumber IN ('+33612345671', '+33612345672', '+33612345673');

SELECT 'ADHERENTS' as Type, AdherentId, Name, Email, IsEmailVerified, IsActive 
FROM Adherents 
WHERE Email IN ('adherent1@test.com', 'adherent2@test.com', 'jean.adherent@test.com', 'sophie.adherent@test.com');

-- Si les comptes existent mais ne sont pas vérifiés, les activer manuellement
UPDATE Coaches 
SET IsEmailVerified = 1, IsPhoneVerified = 1, VerificationCode = NULL, VerificationCodeExpiry = NULL
WHERE Email IN ('coach1@test.com', 'coach2@test.com', 'marie.coach@test.com');

UPDATE Adherents 
SET IsEmailVerified = 1, VerificationCode = NULL, VerificationCodeExpiry = NULL
WHERE Email IN ('adherent1@test.com', 'adherent2@test.com', 'jean.adherent@test.com', 'sophie.adherent@test.com');

-- Vérifier le résultat
SELECT 'COACHES VERIFIES' as Type, CoachId, Name, Email, IsEmailVerified 
FROM Coaches 
WHERE Email IN ('coach1@test.com', 'coach2@test.com', 'marie.coach@test.com');

SELECT 'ADHERENTS VERIFIES' as Type, AdherentId, Name, Email, IsEmailVerified 
FROM Adherents 
WHERE Email IN ('adherent1@test.com', 'adherent2@test.com', 'jean.adherent@test.com', 'sophie.adherent@test.com');
