-- Script pour vérifier la conversation ID 12
SELECT 
    c.ConversationId,
    c.CoachClientId,
    c.LastMessageAt,
    c.CreatedAt,
    cc.CoachClientId as CC_Id,
    cc.CoachId,
    cc.AdherentId,
    coach.Name as CoachName,
    coach.Email as CoachEmail,
    adherent.Name as AdherentName,
    adherent.Email as AdherentEmail
FROM Conversations c
LEFT JOIN CoachClients cc ON c.CoachClientId = cc.CoachClientId
LEFT JOIN Coaches coach ON cc.CoachId = coach.CoachId
LEFT JOIN Adherents adherent ON cc.AdherentId = adherent.AdherentId
WHERE c.ConversationId = 12;

-- Vérifier tous les CoachClients
SELECT * FROM CoachClients;

-- Vérifier toutes les conversations
SELECT * FROM Conversations;

-- Vérifier les messages de la conversation 12
SELECT * FROM Messages WHERE ConversationId = 12;
