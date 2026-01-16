# Backend .NET

## Configuration de la Base de Données

1. **Mettre à jour la chaîne de connexion** dans `appsettings.json` :
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=CoachingAppDb;Trusted_Connection=True;TrustServerCertificate=True"
   }
   ```

2. **Créer la base de données** :
   ```bash
   cd backend
   dotnet ef migrations add InitialCreate --project src/CoachingApp.Infrastructure --startup-project src/CoachingApp.API
   dotnet ef database update --project src/CoachingApp.Infrastructure --startup-project src/CoachingApp.API
   ```

3. **Lancer l'API** :
   ```bash
   dotnet run --project src/CoachingApp.API
   ```

4. **Accéder à Swagger** :
   - URL : https://localhost:5001/swagger

## Structure

- **CoachingApp.API** : Controllers, SignalR Hubs, Configuration
- **CoachingApp.Core** : Entités, Interfaces, Enums
- **CoachingApp.Infrastructure** : DbContext, Repositories, Services

## Prochaines Étapes

- [ ] Créer les controllers (AuthController, ProgramController, MessageController, etc.)
- [ ] Implémenter SignalR Hub pour la messagerie
- [ ] Ajouter l'authentification JWT
- [ ] Créer les repositories et services
