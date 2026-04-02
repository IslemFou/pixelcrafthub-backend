**PixelCraftHub Backend**

Backend API pour PixelCraftHub, marketplace freelance pour services Design/UI/UX et Web Development.
Construit avec MERN stack (MongoDB, Express, React, Node.js). Gère authentification, profils, missions, messagerie temps réel et paiements.

🚀 Fonctionnalités
Authentification : JWT, OAuth (Google), rôles (client/prestataire/admin).

Profils prestataires : Portfolio, compétences (Figma, React, Bootstrap), tarifs.

Missions : Publication, recherche/filtres, devis.

Messagerie : Chat temps réel (Socket.io).

Paiements : Stripe (acompte + solde).

Admin : Modération, dashboards stats.

API : RESTful + WebSockets, documentation Swagger/Postman.

🛠️ Technologies
Catégorie	Outils
Framework	Express.js, Node.js
DB	MongoDB (Mongoose ODM)
Auth	JWT, bcrypt
Temps réel	Socket.io
Paiements	Stripe
Uploads	Multer, Cloudinary
Tests	Jest, Supertest
Docs	Swagger UI
📦 Prérequis
Node.js ≥ 20.x

MongoDB ≥ 7.0 (local ou Atlas)

npm/yarn

Clés API : Stripe, Cloudinary, JWT secret

🚀 Installation rapide
bash
# Clone le repo
git clone https://github.com/ton-username/pixelcrafthub-backend.git
cd pixelcrafthub-backend

# Install deps
npm install

# Copie env
cp .env.example .env
# Édite .env avec tes clés (DB_URI, JWT_SECRET, STRIPE_KEY...)

# Lance MongoDB (ou connection Atlas)

# Dev mode
npm run dev

# Build prod
npm run build
npm start
🔧 Scripts npm
bash
npm run dev      # Nodemon + hot reload
npm run start    # Production
npm run test     # Tests unitaires
npm run docs     # Swagger docs (http://localhost:5000/api-docs)
npm run db:seed  # Seed DB test data
📁 Structure dossiers
text
src/
├── config/      # DB, env, Stripe
├── controllers/ # User, Mission, Chat...
├── middleware/  # Auth, validation
├── models/      # Mongoose schemas
├── routes/      # API endpoints
├── sockets/     # Socket.io chat
├── utils/       # Helpers
└── app.js       # Entry point
🌐 Endpoints API (Swagger)
Serveur : http://localhost:5000/api/v1

Endpoint	Méthode	Description	Auth
/auth/register	POST	Inscription	No
/users/profile	GET/PUT	Profil user	Yes
/missions	GET/POST	Liste/créer mission	Yes
/chat/:roomId	WS	Messagerie temps réel	Yes
/payments/create	POST	Créer payment intent	Yes
Swagger : /api-docs une fois lancé.

.env exemple
text
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pixelcrafthub
JWT_SECRET=tonsupersecretclé
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_URL=cloudinary://...
🧪 Tests
bash
npm test
# ou
npm run test:watch
Coverage > 80% visé (Jest).

🚀 Déploiement
Heroku : git push heroku main

Render/Vercel : Vars env + Mongo Atlas

Docker : Dockerfile inclus

text
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=prod
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
🤝 Contributing
Fork → Clone → Branch feature/xxx

npm install

Code + tests

PR vers develop

📄 Licence
MIT - Voir LICENSE.

👥 Contact
Islema Fourati - Web Dev/Designer - Égly, FR
LinkedIn | Portfolio

⭐ Star si utile !

Version 1.0.0 - MVP PixelCraftHub (Mars 2026).
