# Coaching App

Application complète de coaching avec backend .NET et frontends web/mobile React.

## 🏗️ Architecture

```
Coachin/
├── backend/           # ASP.NET Core 8 + SQL Server
├── frontend-web/      # React + Vite + TypeScript
├── frontend-mobile/   # React Native + Expo
└── shared/            # Code partagé (types, services, hooks)
```

## 🚀 Technologies

### Backend
- **ASP.NET Core 8** - Web API
- **Entity Framework Core** - ORM
- **SQL Server** - Base de données
- **SignalR** - Messagerie temps réel
- **JWT** - Authentification
- **Swagger** - Documentation API

### Frontend Web
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** + **Shadcn/ui** - Styling
- **React Router** - Navigation
- **TanStack Query** - Gestion API
- **Zustand** - State management
- **@microsoft/signalr** - Messagerie temps réel

### Frontend Mobile
- **React Native** + **Expo**
- **TypeScript**
- **NativeWind** - Styling
- **React Navigation** - Navigation
- **TanStack Query** - Gestion API
- **Zustand** - State management
- **@microsoft/signalr** - Messagerie temps réel

## 📋 Fonctionnalités

- ✅ Gestion des coachs et adhérents
- ✅ Programmes d'entraînement personnalisés
- ✅ Plans de repas
- ✅ Messagerie temps réel (bulles de messages)
- ✅ Système de paiement pour les coachs (3 niveaux)
- ✅ Suivi de progression avec photos et poids
- ✅ Calendrier et rappels

## 🛠️ Installation

### Prérequis
- .NET 8 SDK
- Node.js 18+
- SQL Server
- Expo CLI (pour mobile)

### Backend
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run --project src/CoachingApp.API
```

### Frontend Web
```bash
cd frontend-web
npm install
npm run dev
```

### Frontend Mobile
```bash
cd frontend-mobile
npm install
npx expo start
```

## 📚 Documentation

- [Schéma de Base de Données](docs/database_schema.md)
- [API Documentation](http://localhost:5000/swagger) (après démarrage du backend)

## 🤝 Contribution

Ce projet suit l'architecture Clean Architecture pour le backend et une structure modulaire pour les frontends.

## 📄 License

MIT
