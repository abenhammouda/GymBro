-- Script pour créer automatiquement des conversations pour toutes les relations CoachClient actives
-- Cela permettra aux coaches de voir leurs adhérents dans la messagerie

-- Créer des conversations pour toutes les relations CoachClient qui n'en ont pas encore
INSERT INTO Conversations (CoachClientId, CreatedAt, LastMessageAt)
SELECT 
    cc.CoachClientId,
    GETUTCDATE(),
    GETUTCDATE()
FROM CoachClients cc
LEFT JOIN Conversations conv ON cc.CoachClientId = conv.CoachClientId
WHERE conv.ConversationId IS NULL  -- Seulement pour ceux qui n'ont pas de conversation
  AND cc.Status = 0;  -- Seulement les relations actives

-- Vérifier les conversations créées
SELECT 
    conv.ConversationId,
    c.Name as CoachName,
    c.Email as CoachEmail,
    a.Name as AdherentName,
    a.Email as AdherentEmail,
    cc.Status,
    cc.GoalSummary,
    conv.CreatedAt
FROM Conversations conv
INNER JOIN CoachClients cc ON conv.CoachClientId = cc.CoachClientId
INNER JOIN Coaches c ON cc.CoachId = c.CoachId
INNER JOIN Adherents a ON cc.AdherentId = a.AdherentId
ORDER BY c.Name, a.Name;

PRINT '';
PRINT '✅ Conversations créées avec succès!';
PRINT '';
PRINT 'Nombre total de conversations:';
SELECT COUNT(*) as TotalConversations FROM Conversations;
