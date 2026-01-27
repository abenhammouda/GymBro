-- Script pour créer des données de test complètes avec conversations

-- D'abord, vérifier les IDs existants
SELECT 'Coaches' as TableName, CoachId as Id, Name, Email FROM Coaches WHERE Email LIKE '%@test.com';
SELECT 'Adherents' as TableName, AdherentId as Id, Name, Email FROM Adherents WHERE Email LIKE '%@test.com';

-- Créer une relation CoachClient si elle n'existe pas
-- Supposons que coach1@test.com a CoachId = 1007 et adherent1@test.com a AdherentId = 1006
-- (Ajustez ces IDs selon vos données réelles)

-- Vérifier si une relation existe déjà
SELECT * FROM CoachClients WHERE CoachId = 1007 AND AdherentId = 1006;

-- Si aucune relation n'existe, en créer une
IF NOT EXISTS (SELECT 1 FROM CoachClients WHERE CoachId = 1007 AND AdherentId = 1006)
BEGIN
    INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, Notes, CreatedAt)
    VALUES (1007, 1006, 0, GETUTCDATE(), 'Perte de poids et gain musculaire', 'Client motivé', GETUTCDATE());
    
    PRINT 'CoachClient créé';
END

-- Récupérer l'ID du CoachClient
DECLARE @CoachClientId INT;
SELECT @CoachClientId = CoachClientId FROM CoachClients WHERE CoachId = 1007 AND AdherentId = 1006;

PRINT 'CoachClientId: ' + CAST(@CoachClientId AS VARCHAR);

-- Créer une conversation si elle n'existe pas
IF NOT EXISTS (SELECT 1 FROM Conversations WHERE CoachClientId = @CoachClientId)
BEGIN
    INSERT INTO Conversations (CoachClientId, CreatedAt)
    VALUES (@CoachClientId, GETUTCDATE());
    
    PRINT 'Conversation créée';
END

-- Récupérer l'ID de la conversation
DECLARE @ConversationId INT;
SELECT @ConversationId = ConversationId FROM Conversations WHERE CoachClientId = @CoachClientId;

PRINT 'ConversationId: ' + CAST(@ConversationId AS VARCHAR);

-- Créer quelques messages de test
IF NOT EXISTS (SELECT 1 FROM Messages WHERE ConversationId = @ConversationId)
BEGIN
    INSERT INTO Messages (ConversationId, SenderId, SenderType, MessageText, IsRead, SentAt)
    VALUES 
        (@ConversationId, 1007, 0, 'Bonjour! Comment puis-je vous aider aujourd''hui?', 1, DATEADD(HOUR, -2, GETUTCDATE())),
        (@ConversationId, 1006, 1, 'Salut! J''aimerais avoir un programme de musculation.', 1, DATEADD(HOUR, -1, GETUTCDATE())),
        (@ConversationId, 1007, 0, 'Parfait! Je vais créer un programme adapté à vos objectifs.', 0, GETUTCDATE());
    
    PRINT 'Messages créés';
END

-- Mettre à jour LastMessageAt
UPDATE Conversations 
SET LastMessageAt = (SELECT MAX(SentAt) FROM Messages WHERE ConversationId = @ConversationId)
WHERE ConversationId = @ConversationId;

-- Afficher le résultat final
SELECT 
    c.ConversationId,
    c.CoachClientId,
    c.LastMessageAt,
    cc.CoachId,
    cc.AdherentId,
    coach.Name as CoachName,
    adherent.Name as AdherentName,
    (SELECT COUNT(*) FROM Messages WHERE ConversationId = c.ConversationId) as MessageCount
FROM Conversations c
INNER JOIN CoachClients cc ON c.CoachClientId = cc.CoachClientId
INNER JOIN Coaches coach ON cc.CoachId = coach.CoachId
INNER JOIN Adherents adherent ON cc.AdherentId = adherent.AdherentId
WHERE c.ConversationId = @ConversationId;
