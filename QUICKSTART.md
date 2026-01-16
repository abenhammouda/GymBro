# Guide de Démarrage Rapide - Coaching App

## 🚀 Démarrage Rapide (5 minutes)

### 1. Configuration de la Base de Données

```bash
# Ouvrir SQL Server Management Studio (SSMS)
# Créer une nouvelle base de données ou utiliser une existante

# Mettre à jour la chaîne de connexion
# Fichier: backend/src/CoachingApp.API/appsettings.json
# Modifier "Server=localhost" avec votre serveur SQL Server
```

### 2. Créer la Base de Données

```bash
cd backend
dotnet ef migrations add InitialCreate --project src/CoachingApp.Infrastructure --startup-project src/CoachingApp.API
dotnet ef database update --project src/CoachingApp.Infrastructure --startup-project src/CoachingApp.API
```

### 3. Lancer les Applications

**Terminal 1 - Backend API**
```bash
cd backend
dotnet run --project src/CoachingApp.API
```
✅ API disponible sur https://localhost:5001  
✅ Swagger sur https://localhost:5001/swagger

**Terminal 2 - Frontend Web**
```bash
cd frontend-web
npm run dev
```
✅ App web sur http://localhost:5173

**Terminal 3 - Frontend Mobile**
```bash
cd frontend-mobile
npx expo start
```
✅ Scanner le QR code avec Expo Go

---

## 📚 Documentation Complète

- [README Principal](file:///c:/Projects/Personal/Coachin/README.md)
- [Schéma de Base de Données](file:///C:/Users/abenhammouda/.gemini/antigravity/brain/bf8bae4b-9135-42a3-ac02-4f6308e0358b/database_schema.md)
- [Walkthrough Complet](file:///C:/Users/abenhammouda/.gemini/antigravity/brain/bf8bae4b-9135-42a3-ac02-4f6308e0358b/walkthrough.md)

---

## 🛠️ Technologies Utilisées

### Backend
- ASP.NET Core 8
- Entity Framework Core 9.0
- SQL Server
- SignalR
- JWT Authentication

### Frontend Web
- React 18
- TypeScript
- Vite
- (À installer: Tailwind CSS, React Router, TanStack Query, Zustand)

### Frontend Mobile
- React Native
- Expo
- TypeScript
- (À installer: NativeWind, React Navigation, TanStack Query, Zustand)

---

## 🎯 Prochaines Étapes Recommandées

1. **Tester le backend** : Vérifier que l'API démarre et que Swagger fonctionne
2. **Créer un controller de test** : AuthController pour la connexion
3. **Configurer Tailwind CSS** sur le frontend web
4. **Créer la première page** : Page de connexion
5. **Implémenter SignalR Hub** pour la messagerie

---

## 💡 Conseils

- Utilisez SSMS pour visualiser votre base de données
- Swagger est votre meilleur ami pour tester l'API
- Le code partagé dans `/shared` peut être utilisé par web ET mobile
- Consultez le walkthrough pour plus de détails sur la structure

Bon développement ! 🚀
