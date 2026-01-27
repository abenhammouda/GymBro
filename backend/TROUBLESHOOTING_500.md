# Guide de résolution de l'erreur 500 - Messages

## Problème
Erreur 500 lors de l'appel à `/api/messages/conversation/12`

## Diagnostic

### Étape 1: Vérifier la base de données
Exécutez le script `QuickFix.sql` dans votre base de données SQL Server pour vérifier:
1. Si la conversation 12 existe
2. Si elle a un CoachClient valide associé

```sql
-- Ouvrez SQL Server Management Studio ou Azure Data Studio
-- Connectez-vous à votre base de données
-- Exécutez: backend/QuickFix.sql
```

### Étape 2: Interpréter les résultats

#### Cas A: La conversation n'existe pas
Si le script ne retourne aucune ligne, la conversation 12 n'existe pas.

**Solution**: Utilisez l'endpoint `/api/messages/conversation` (POST) pour créer une nouvelle conversation entre le coach et l'adhérent.

#### Cas B: CoachClientStatus = "MISSING!"
La conversation existe mais le CoachClient associé n'existe pas dans la base de données.

**Solution**: 
1. Regardez les CoachClients disponibles dans le deuxième résultat du script
2. Choisissez le bon CoachClientId (celui qui correspond au coach 1007)
3. Exécutez:
```sql
UPDATE Conversations 
SET CoachClientId = <ID_DU_COACHCLIENT> 
WHERE ConversationId = 12;
```

#### Cas C: CoachClientStatus = "OK"
Le problème est ailleurs (probablement Entity Framework ne charge pas les relations).

**Solution**: Redémarrez le backend pour appliquer les corrections de code.

### Étape 3: Redémarrer le backend
Après avoir corrigé la base de données:
1. Arrêtez le backend (Ctrl+C)
2. Relancez avec `dotnet run` depuis `backend/src/CoachingApp.API`
3. Les nouveaux logs vous donneront des informations détaillées

### Étape 4: Vérifier les logs
Après le redémarrage, essayez à nouveau de charger la conversation.
Les logs vous diront exactement:
- Si la conversation existe
- Si le CoachClient est chargé
- Quel est le CoachClientId
- Si l'utilisateur a accès

## Scripts SQL disponibles

1. **QuickFix.sql** - Diagnostic rapide et correction
2. **CheckConversation.sql** - Vérification détaillée
3. **CreateTestConversation.sql** - Création de données de test complètes

## Modifications de code effectuées

1. ✅ **MessageRepository.cs** - Ajout des includes pour CoachClient dans GetMessageByIdAsync
2. ✅ **MessageService.cs** - Ajout de logs détaillés et messages d'erreur explicites
3. ✅ **DebugController.cs** - Endpoint de debug (nécessite redémarrage)

## Prochaines étapes

1. Exécutez `QuickFix.sql`
2. Corrigez la base de données si nécessaire
3. Redémarrez le backend
4. Testez à nouveau
5. Consultez les logs pour plus de détails

## Contact
Si le problème persiste après ces étapes, partagez:
- Les résultats du script QuickFix.sql
- Les logs du backend (console où dotnet run s'exécute)
- Le message d'erreur exact retourné par l'API
