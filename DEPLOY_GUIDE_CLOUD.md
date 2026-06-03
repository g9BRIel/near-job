# 🚀 Plan de Déploiement Cloud (Gratuit)

Pour mettre **NearJob** en ligne sans frais, nous allons utiliser trois services leaders. J'ai déjà préparé tout le code pour que ce soit compatible.

## Étape 1 : Créer le dépôt GitHub (30 secondes)
1. Cliquez ici : [github.com/new](https://github.com/new)
2. Nommez le dépôt : `nearjowb`
3. Cliquez sur **"Create repository"**.
4. Copiez les commandes sous **"push an existing repository from the command line"** et collez-les dans votre terminal ici.

## Étape 2 : Déployer le Backend (Serveur) sur Render
1. Allez sur [Render.com](https://dashboard.render.com/) et connectez-vous avec GitHub.
2. Cliquez sur **"New +"** > **"Web Service"**.
3. Choisissez votre dépôt `nearjowb`.
4. Dans les réglages :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
5. Ajoutez les variables d'environnement (Environment Variables) :
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD` (votre base de données MySQL).
   - `ALLOWED_ORIGINS` : L'URL que vous donnera Vercel à l'étape 3.

## Étape 3 : Déployer le Frontend (Site) sur Vercel
1. Allez sur [Vercel.com](https://vercel.com/new) et importez votre dépôt GitHub.
2. Choisissez le dossier Framework : **Create React App** (il le détectera).
3. **Root Directory** : `nearjob`
4. Ajoutez la variable d'environnement :
   - `REACT_APP_API_URL` : L'URL que vous a donnée Render à l'étape 2.
5. Cliquez sur **Deploy**.

---

### 🛡️ Base de Données Gratuite
Si vous n'avez pas encore de base de données MySQL en ligne, je vous recommande :
- **Clever Cloud** : Offre une petite instance MySQL gratuite à vie.
- **Aiven.io** : Offre du MySQL gratuit.

> [!IMPORTANT]
> Je ne peux pas créer les comptes à votre place pour des raisons de sécurité, mais une fois ces étapes faites, votre application sera **accessible par tout le monde avec une URL .vercel.app** !
