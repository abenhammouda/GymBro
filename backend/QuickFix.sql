-- Vérification rapide de la conversation 12
SELECT 
    'Conversation Info' as Info,
    c.ConversationId,
    c.CoachClientId,
    CASE WHEN cc.CoachClientId IS NULL THEN 'MISSING!' ELSE 'OK' END as CoachClientStatus
FROM Conversations c
LEFT JOIN CoachClients cc ON c.CoachClientId = cc.CoachClientId
WHERE c.ConversationId = 12;

-- Si CoachClient est NULL, voici le problème!
-- Vérifier quel CoachClientId devrait être utilisé
SELECT 
    'Available CoachClients' as Info,
    cc.CoachClientId,
    cc.CoachId,
    cc.AdherentId,
    coach.Name as CoachName,
    adherent.Name as AdherentName
FROM CoachClients cc
INNER JOIN Coaches coach ON cc.CoachId = coach.CoachId
INNER JOIN Adherents adherent ON cc.AdherentId = adherent.AdherentId
WHERE cc.CoachId = 1007; -- L'ID du coach depuis votre token JWT

-- FIX RAPIDE: Si la conversation 12 existe mais n'a pas de CoachClient valide
-- Décommentez et exécutez cette ligne après avoir choisi le bon CoachClientId ci-dessus:
-- UPDATE Conversations SET CoachClientId = <ID_DU_COACHCLIENT> WHERE ConversationId = 12;
