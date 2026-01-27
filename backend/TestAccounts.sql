-- Script pour créer des comptes de test
-- Mot de passe pour tous les comptes : Test123!
-- Hash BCrypt pour "Test123!" : $2a$11$xQJZvKz5Z5Z5Z5Z5Z5Z5ZeO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z

-- Supprimer les comptes de test existants (si présents)
DELETE FROM CoachClients WHERE CoachId IN (SELECT CoachId FROM Coaches WHERE Email LIKE '%@test.com');
DELETE FROM CoachClients WHERE AdherentId IN (SELECT AdherentId FROM Adherents WHERE Email LIKE '%@test.com');
DELETE FROM Coaches WHERE Email LIKE '%@test.com';
DELETE FROM Adherents WHERE Email LIKE '%@test.com';

-- Insérer des coaches de test
INSERT INTO Coaches (Name, Email, PhoneNumber, PasswordHash, Bio, Specialization, IsEmailVerified, IsActive, CreatedAt)
VALUES 
    ('Coach Test 1', 'coach1@test.com', '+33612345671', '$2a$11$xQJZvKz5Z5Z5Z5Z5Z5Z5ZeO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Coach spécialisé en musculation et nutrition', 'Musculation', 1, 1, GETUTCDATE()),
    ('Coach Test 2', 'coach2@test.com', '+33612345672', '$2a$11$xQJZvKz5Z5Z5Z5Z5Z5Z5ZeO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Coach spécialisé en cardio et perte de poids', 'Cardio', 1, 1, GETUTCDATE()),
    ('Marie Dupont', 'marie.coach@test.com', '+33612345673', '$2a$11$xQJZvKz5Z5Z5Z5Z5Z5Z5ZeO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Coach certifiée en fitness et bien-être', 'Fitness', 1, 1, GETUTCDATE());

-- Insérer des adhérents de test
INSERT INTO Adherents (Name, Email, PhoneNumber, PasswordHash, DateOfBirth, Gender, Height, IsEmailVerified, IsActive, CreatedAt)
VALUES 
    ('Adherent Test 1', 'adherent1@test.com', '+33612345681', '$2a$11$xQJZvKz5Z5Z5Z5Z5Z5Z5ZeO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', '1990-01-15', 'M', 175.0, 1, 1, GETUTCDATE()),
    ('Adherent Test 2', 'adherent2@test.com', '+33612345682', '$2a$11$xQJZvKz5Z5Z5Z5Z5Z5Z5ZeO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', '1995-05-20', 'F', 165.0, 1, 1, GETUTCDATE()),
    ('Jean Martin', 'jean.adherent@test.com', '+33612345683', '$2a$11$xQJZvKz5Z5Z5Z5Z5Z5Z5ZeO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', '1988-03-10', 'M', 180.0, 1, 1, GETUTCDATE()),
    ('Sophie Bernard', 'sophie.adherent@test.com', '+33612345684', '$2a$11$xQJZvKz5Z5Z5Z5Z5Z5Z5ZeO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', '1992-07-25', 'F', 168.0, 1, 1, GETUTCDATE());

-- Afficher les comptes créés
SELECT 'COACHES' as Type, CoachId as Id, Name, Email FROM Coaches WHERE Email LIKE '%@test.com'
UNION ALL
SELECT 'ADHERENTS' as Type, AdherentId as Id, Name, Email FROM Adherents WHERE Email LIKE '%@test.com';
