-- Script de création de comptes de test pour l'application Coaching
-- Mot de passe pour tous les comptes: Test123!
-- Hash BCrypt: $2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe

-- Variables pour stocker les IDs
DECLARE @Coach1Id INT, @Coach2Id INT, @Coach3Id INT;
DECLARE @Adherent1Id INT, @Adherent2Id INT, @Adherent3Id INT, @Adherent4Id INT, @Adherent5Id INT;
DECLARE @CoachClient1Id INT, @CoachClient2Id INT, @CoachClient3Id INT, @CoachClient4Id INT, @CoachClient5Id INT, @CoachClient6Id INT;
DECLARE @Conversation1Id INT, @Conversation2Id INT, @Conversation3Id INT, @Conversation4Id INT, @Conversation5Id INT;

-- ============================================
-- COACHES DE TEST
-- ============================================

-- Coach 1: Jean Dupont (Spécialiste Musculation)
INSERT INTO Coaches (Name, Email, PhoneNumber, PasswordHash, Bio, Specialization, SubscriptionTierId, SubscriptionStartDate, SubscriptionEndDate, IsEmailVerified, IsPhoneVerified, CreatedAt, IsActive)
VALUES (
    'Jean Dupont',
    'jean.dupont@coach.test',
    '+33612345678',
    '$2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe',
    'Coach sportif spécialisé en musculation et prise de masse. 10 ans d''expérience.',
    'Musculation & Force',
    2, -- Pro Tier
    DATEADD(month, -2, GETUTCDATE()),
    DATEADD(month, 10, GETUTCDATE()),
    1,
    1,
    GETUTCDATE(),
    1
);
SET @Coach1Id = SCOPE_IDENTITY();

-- Coach 2: Marie Martin (Spécialiste Fitness)
INSERT INTO Coaches (Name, Email, PhoneNumber, PasswordHash, Bio, Specialization, SubscriptionTierId, SubscriptionStartDate, SubscriptionEndDate, IsEmailVerified, IsPhoneVerified, CreatedAt, IsActive)
VALUES (
    'Marie Martin',
    'marie.martin@coach.test',
    '+33623456789',
    '$2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe',
    'Experte en fitness et perte de poids. Certifiée nutrition sportive.',
    'Fitness & Perte de poids',
    3, -- Premium Tier
    DATEADD(month, -6, GETUTCDATE()),
    DATEADD(month, 6, GETUTCDATE()),
    1,
    1,
    GETUTCDATE(),
    1
);
SET @Coach2Id = SCOPE_IDENTITY();

-- Coach 3: Ahmed Ben Ali (Spécialiste CrossFit)
INSERT INTO Coaches (Name, Email, PhoneNumber, PasswordHash, Bio, Specialization, SubscriptionTierId, SubscriptionStartDate, SubscriptionEndDate, IsEmailVerified, IsPhoneVerified, CreatedAt, IsActive)
VALUES (
    'Ahmed Ben Ali',
    'ahmed.benali@coach.test',
    '+21698765432',
    '$2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe',
    'Coach CrossFit niveau 2. Spécialisé en préparation physique.',
    'CrossFit & Préparation physique',
    1, -- Starter Tier
    DATEADD(month, -1, GETUTCDATE()),
    DATEADD(month, 11, GETUTCDATE()),
    1,
    1,
    GETUTCDATE(),
    1
);
SET @Coach3Id = SCOPE_IDENTITY();

-- ============================================
-- ADHÉRENTS DE TEST
-- ============================================

-- Adhérent 1: Sophie Leclerc
INSERT INTO Adherents (Name, Email, PhoneNumber, PasswordHash, DateOfBirth, Gender, Height, IsEmailVerified, CreatedAt, IsActive)
VALUES (
    'Sophie Leclerc',
    'sophie.leclerc@test.com',
    '+33634567890',
    '$2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe',
    '1995-03-15',
    'F',
    165.0,
    1,
    GETUTCDATE(),
    1
);
SET @Adherent1Id = SCOPE_IDENTITY();

-- Adhérent 2: Thomas Bernard
INSERT INTO Adherents (Name, Email, PhoneNumber, PasswordHash, DateOfBirth, Gender, Height, IsEmailVerified, CreatedAt, IsActive)
VALUES (
    'Thomas Bernard',
    'thomas.bernard@test.com',
    '+33645678901',
    '$2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe',
    '1992-07-22',
    'M',
    178.0,
    1,
    GETUTCDATE(),
    1
);
SET @Adherent2Id = SCOPE_IDENTITY();

-- Adhérent 3: Fatima Zahra
INSERT INTO Adherents (Name, Email, PhoneNumber, PasswordHash, DateOfBirth, Gender, Height, IsEmailVerified, CreatedAt, IsActive)
VALUES (
    'Fatima Zahra',
    'fatima.zahra@test.com',
    '+21620123456',
    '$2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe',
    '1998-11-08',
    'F',
    160.0,
    1,
    GETUTCDATE(),
    1
);
SET @Adherent3Id = SCOPE_IDENTITY();

-- Adhérent 4: Lucas Petit
INSERT INTO Adherents (Name, Email, PhoneNumber, PasswordHash, DateOfBirth, Gender, Height, IsEmailVerified, CreatedAt, IsActive)
VALUES (
    'Lucas Petit',
    'lucas.petit@test.com',
    '+33656789012',
    '$2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe',
    '1990-05-30',
    'M',
    182.0,
    1,
    GETUTCDATE(),
    1
);
SET @Adherent4Id = SCOPE_IDENTITY();

-- Adhérent 5: Amina Trabelsi
INSERT INTO Adherents (Name, Email, PhoneNumber, PasswordHash, DateOfBirth, Gender, Height, IsEmailVerified, CreatedAt, IsActive)
VALUES (
    'Amina Trabelsi',
    'amina.trabelsi@test.com',
    '+21625987654',
    '$2a$11$WLluiBgincRHogMW83H6HuAvsqpYcPKDRyiPF6rbi8Hp7kjpsnBoe',
    '1996-09-12',
    'F',
    168.0,
    1,
    GETUTCDATE(),
    1
);
SET @Adherent5Id = SCOPE_IDENTITY();

-- ============================================
-- RELATIONS COACH-CLIENT
-- ============================================

-- Jean Dupont (Coach 1) a 3 clients
-- Status: 0 = Active, 1 = Inactive, 2 = Completed
INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, CreatedAt)
VALUES (@Coach1Id, @Adherent1Id, 0, DATEADD(month, -1, GETUTCDATE()), 'Prise de masse musculaire', GETUTCDATE());
SET @CoachClient1Id = SCOPE_IDENTITY();

INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, CreatedAt)
VALUES (@Coach1Id, @Adherent2Id, 0, DATEADD(month, -2, GETUTCDATE()), 'Renforcement musculaire', GETUTCDATE());
SET @CoachClient2Id = SCOPE_IDENTITY();

INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, CreatedAt)
VALUES (@Coach1Id, @Adherent4Id, 0, DATEADD(day, -15, GETUTCDATE()), 'Préparation physique générale', GETUTCDATE());
SET @CoachClient3Id = SCOPE_IDENTITY();

-- Marie Martin (Coach 2) a 2 clients
INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, CreatedAt)
VALUES (@Coach2Id, @Adherent1Id, 0, DATEADD(month, -3, GETUTCDATE()), 'Perte de poids et tonification', GETUTCDATE());
SET @CoachClient4Id = SCOPE_IDENTITY();

INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, CreatedAt)
VALUES (@Coach2Id, @Adherent3Id, 0, DATEADD(month, -1, GETUTCDATE()), 'Remise en forme', GETUTCDATE());
SET @CoachClient5Id = SCOPE_IDENTITY();

-- Ahmed Ben Ali (Coach 3) a 1 client
INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, CreatedAt)
VALUES (@Coach3Id, @Adherent5Id, 0, DATEADD(day, -7, GETUTCDATE()), 'Préparation CrossFit', GETUTCDATE());
SET @CoachClient6Id = SCOPE_IDENTITY();

-- ============================================
-- CONVERSATIONS POUR LE CHAT
-- ============================================

-- Conversation entre Jean Dupont et Sophie Leclerc
INSERT INTO Conversations (CoachClientId, LastMessageAt, CreatedAt)
VALUES (@CoachClient1Id, DATEADD(hour, -2, GETUTCDATE()), DATEADD(month, -1, GETUTCDATE()));
SET @Conversation1Id = SCOPE_IDENTITY();

-- Conversation entre Jean Dupont et Thomas Bernard
INSERT INTO Conversations (CoachClientId, LastMessageAt, CreatedAt)
VALUES (@CoachClient2Id, DATEADD(day, -1, GETUTCDATE()), DATEADD(month, -2, GETUTCDATE()));
SET @Conversation2Id = SCOPE_IDENTITY();

-- Conversation entre Marie Martin et Sophie Leclerc
INSERT INTO Conversations (CoachClientId, LastMessageAt, CreatedAt)
VALUES (@CoachClient4Id, DATEADD(hour, -5, GETUTCDATE()), DATEADD(month, -3, GETUTCDATE()));
SET @Conversation3Id = SCOPE_IDENTITY();

-- Conversation entre Marie Martin et Fatima Zahra
INSERT INTO Conversations (CoachClientId, LastMessageAt, CreatedAt)
VALUES (@CoachClient5Id, DATEADD(minute, -30, GETUTCDATE()), DATEADD(month, -1, GETUTCDATE()));
SET @Conversation4Id = SCOPE_IDENTITY();

-- Conversation entre Ahmed Ben Ali et Amina Trabelsi
INSERT INTO Conversations (CoachClientId, LastMessageAt, CreatedAt)
VALUES (@CoachClient6Id, DATEADD(hour, -1, GETUTCDATE()), DATEADD(day, -7, GETUTCDATE()));
SET @Conversation5Id = SCOPE_IDENTITY();

-- ============================================
-- MESSAGES DE TEST
-- ============================================

-- Messages entre Jean Dupont et Sophie Leclerc (Conversation 1)
-- SenderType: 0 = Coach, 1 = Adherent
INSERT INTO Messages (ConversationId, SenderId, SenderType, MessageText, SentAt, IsRead)
VALUES 
    (@Conversation1Id, @Coach1Id, 0, 'Bonjour Sophie ! Comment s''est passée ta séance d''hier ?', DATEADD(hour, -3, GETUTCDATE()), 1),
    (@Conversation1Id, @Adherent1Id, 1, 'Salut Jean ! C''était intense mais j''ai adoré 💪', DATEADD(hour, -2, GETUTCDATE()), 0);

-- Messages entre Jean Dupont et Thomas Bernard (Conversation 2)
INSERT INTO Messages (ConversationId, SenderId, SenderType, MessageText, SentAt, IsRead)
VALUES 
    (@Conversation2Id, @Adherent2Id, 1, 'Coach, j''ai une question sur mon programme', DATEADD(day, -1, GETUTCDATE()), 0),
    (@Conversation2Id, @Adherent2Id, 1, 'Est-ce que je peux augmenter les charges cette semaine ?', DATEADD(day, -1, GETUTCDATE()), 0);

-- Messages entre Marie Martin et Sophie Leclerc (Conversation 3)
INSERT INTO Messages (ConversationId, SenderId, SenderType, MessageText, SentAt, IsRead)
VALUES 
    (@Conversation3Id, @Adherent1Id, 1, 'Marie, merci pour le plan nutrition !', DATEADD(hour, -6, GETUTCDATE()), 1),
    (@Conversation3Id, @Coach2Id, 0, 'Avec plaisir Sophie ! N''hésite pas si tu as des questions 😊', DATEADD(hour, -5, GETUTCDATE()), 0);

-- Messages entre Marie Martin et Fatima Zahra (Conversation 4)
INSERT INTO Messages (ConversationId, SenderId, SenderType, MessageText, SentAt, IsRead)
VALUES 
    (@Conversation4Id, @Adherent3Id, 1, 'Bonjour Coach !', DATEADD(hour, -1, GETUTCDATE()), 1),
    (@Conversation4Id, @Coach2Id, 0, 'Bonjour Fatima ! Prête pour la séance de demain ?', DATEADD(minute, -30, GETUTCDATE()), 1);

-- Messages entre Ahmed Ben Ali et Amina Trabelsi (Conversation 5)
INSERT INTO Messages (ConversationId, SenderId, SenderType, MessageText, SentAt, IsRead)
VALUES 
    (@Conversation5Id, @Adherent5Id, 1, 'Coach Ahmed, j''ai terminé le WOD !', DATEADD(hour, -2, GETUTCDATE()), 1),
    (@Conversation5Id, @Coach3Id, 0, 'Excellent travail Amina ! Quel temps ?', DATEADD(hour, -1, GETUTCDATE()), 0),
    (@Conversation5Id, @Adherent5Id, 1, '15:32 ! Mon meilleur temps 🎉', DATEADD(hour, -1, GETUTCDATE()), 0);

PRINT 'Comptes de test créés avec succès !';
PRINT '';
PRINT '========================================';
PRINT 'COMPTES COACHES';
PRINT '========================================';
PRINT 'Email: jean.dupont@coach.test | Mot de passe: Test123!';
PRINT 'Email: marie.martin@coach.test | Mot de passe: Test123!';
PRINT 'Email: ahmed.benali@coach.test | Mot de passe: Test123!';
PRINT '';
PRINT '========================================';
PRINT 'COMPTES ADHÉRENTS';
PRINT '========================================';
PRINT 'Email: sophie.leclerc@test.com | Mot de passe: Test123!';
PRINT 'Email: thomas.bernard@test.com | Mot de passe: Test123!';
PRINT 'Email: fatima.zahra@test.com | Mot de passe: Test123!';
PRINT 'Email: lucas.petit@test.com | Mot de passe: Test123!';
PRINT 'Email: amina.trabelsi@test.com | Mot de passe: Test123!';
