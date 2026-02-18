# Configuration de l'API Pexels

## Obtenir une clé API Pexels

1. **Créer un compte Pexels**
   - Allez sur https://www.pexels.com/
   - Cliquez sur "Join" pour créer un compte gratuit

2. **Accéder à l'API**
   - Une fois connecté, allez sur https://www.pexels.com/api/
   - Cliquez sur "Get Started" ou "Your API Key"

3. **Générer votre clé API**
   - Remplissez le formulaire avec :
     - Nom de votre application : "CoachingApp"
     - Description : "Fitness coaching application"
     - URL du site web : Votre URL ou "http://localhost:5085"
   - Acceptez les termes et conditions
   - Votre clé API sera générée instantanément

4. **Configurer la clé dans l'application**
   - Ouvrez `appsettings.json`
   - Remplacez `YOUR_PEXELS_API_KEY_HERE` par votre clé API
   
   ```json
   "ExternalApis": {
     "PexelsApiKey": "VOTRE_CLE_API_ICI"
   }
   ```

## Limites de l'API Gratuite

- **200 requêtes par heure**
- **20,000 requêtes par mois**
- Accès illimité aux photos et vidéos
- Pas besoin de carte de crédit

## Utilisation dans l'application

### Récupérer les images

```bash
POST /api/muscle-group-images/fetch
```

Cette commande va :
1. Télécharger 2-3 images pour chaque groupe musculaire
2. Les enregistrer dans `/uploads/muscle-group-images/`
3. Stocker les métadonnées dans la base de données

### Catégories d'images

L'application récupère des images pour :
- **UpperBody** - "upper body workout gym"
- **LowerBody** - "leg workout gym squat"
- **Chest** - "chest workout bench press"
- **Shoulders** - "shoulder workout gym"
- **Back** - "back workout gym"
- **Core** - "core workout abs"
- **Cardio** - "cardio workout running"
- **Flexibility** - "stretching flexibility yoga"

## Attribution

Pexels requiert une attribution pour les photos utilisées. L'application stocke automatiquement :
- Le nom du photographe
- L'URL source de la photo
- L'ID Pexels de la photo

Ces informations peuvent être affichées dans l'UI si nécessaire.

## Ressources

- Documentation API : https://www.pexels.com/api/documentation/
- Licence : https://www.pexels.com/license/
- Support : https://help.pexels.com/
