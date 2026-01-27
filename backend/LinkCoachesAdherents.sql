-- Script pour créer des relations Coach-Adhérent
-- Cela permettra aux coaches de voir leurs adhérents dans la messagerie

-- D'abord, récupérer les IDs des coaches et adhérents de test
DECLARE @Coach1Id INT = (SELECT CoachId FROM Coaches WHERE Email = 'coach1@test.com');
DECLARE @Coach2Id INT = (SELECT CoachId FROM Coaches WHERE Email = 'coach2@test.com');
DECLARE @MarieCoachId INT = (SELECT CoachId FROM Coaches WHERE Email = 'marie.coach@test.com');

DECLARE @Adherent1Id INT = (SELECT AdherentId FROM Adherents WHERE Email = 'adherent1@test.com');
DECLARE @Adherent2Id INT = (SELECT AdherentId FROM Adherents WHERE Email = 'adherent2@test.com');
DECLARE @JeanId INT = (SELECT AdherentId FROM Adherents WHERE Email = 'jean.adherent@test.com');
DECLARE @SophieId INT = (SELECT AdherentId FROM Adherents WHERE Email = 'sophie.adherent@test.com');

-- Afficher les IDs trouvés pour vérification
SELECT 'Coach1' as Name, @Coach1Id as Id
UNION ALL SELECT 'Coach2', @Coach2Id
UNION ALL SELECT 'Marie', @MarieCoachId
UNION ALL SELECT 'Adherent1', @Adherent1Id
UNION ALL SELECT 'Adherent2', @Adherent2Id
UNION ALL SELECT 'Jean', @JeanId
UNION ALL SELECT 'Sophie', @SophieId;

-- Supprimer les relations existantes pour les comptes de test
DELETE FROM CoachClients 
WHERE CoachId IN (@Coach1Id, @Coach2Id, @MarieCoachId)
   OR AdherentId IN (@Adherent1Id, @Adherent2Id, @JeanId, @SophieId);

-- Créer les relations Coach-Adhérent
-- Coach 1 a 2 adhérents : Adherent1 et Jean
IF @Coach1Id IS NOT NULL AND @Adherent1Id IS NOT NULL
BEGIN
    INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, Notes, CreatedAt)
    VALUES (@Coach1Id, @Adherent1Id, 0, GETUTCDATE(), 'Prise de masse musculaire', 'Client motivé, bon suivi', GETUTCDATE());
END

IF @Coach1Id IS NOT NULL AND @JeanId IS NOT NULL
BEGIN
    INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, Notes, CreatedAt)
    VALUES (@Coach1Id, @JeanId, 0, GETUTCDATE(), 'Remise en forme générale', 'Débutant, besoin d''accompagnement', GETUTCDATE());
END

-- Coach 2 a 1 adhérent : Adherent2
IF @Coach2Id IS NOT NULL AND @Adherent2Id IS NOT NULL
BEGIN
    INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, Notes, CreatedAt)
    VALUES (@Coach2Id, @Adherent2Id, 0, GETUTCDATE(), 'Perte de poids et cardio', 'Objectif : -10kg en 3 mois', GETUTCDATE());
END

-- Marie a 2 adhérents : Sophie et Adherent2 (relation multiple possible)
IF @MarieCoachId IS NOT NULL AND @SophieId IS NOT NULL
BEGIN
    INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, Notes, CreatedAt)
    VALUES (@MarieCoachId, @SophieId, 0, GETUTCDATE(), 'Fitness et tonification', 'Programme fitness 3x/semaine', GETUTCDATE());
END

IF @MarieCoachId IS NOT NULL AND @Adherent2Id IS NOT NULL
BEGIN
    INSERT INTO CoachClients (CoachId, AdherentId, Status, StartDate, GoalSummary, Notes, CreatedAt)
    VALUES (@MarieCoachId, @Adherent2Id, 0, GETUTCDATE(), 'Bien-être et souplesse', 'Yoga et stretching', GETUTCDATE());
END

-- Vérifier les relations créées
SELECT 
    cc.CoachClientId,
    c.Name as CoachName,
    c.Email as CoachEmail,
    a.Name as AdherentName,
    a.Email as AdherentEmail,
    cc.Status,
    cc.GoalSummary,
    cc.StartDate
FROM CoachClients cc
INNER JOIN Coaches c ON cc.CoachId = c.CoachId
INNER JOIN Adherents a ON cc.AdherentId = a.AdherentId
WHERE c.Email LIKE '%@test.com'
ORDER BY c.Name, a.Name;

PRINT '';
PRINT '✅ Relations Coach-Adhérent créées avec succès!';
PRINT '';
PRINT 'Résumé:';
PRINT '- Coach Test 1 → Adherent Test 1, Jean Martin';
PRINT '- Coach Test 2 → Adherent Test 2';
PRINT '- Marie Dupont → Sophie Bernard, Adherent Test 2';
