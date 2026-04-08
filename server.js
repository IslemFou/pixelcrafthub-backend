//Dependencies and variables declaration  
const express = require('express');
// express framework web Node.js (créer des APIs, routes, serveur HTTP, etc.)
const cors = require('cors');
// permet de partager des ressources entre plusieurs origines différentes, Autorise React (port 3000) et API Node.js (port 5000) à communiquer entre eux 
const mongoose = require('mongoose');
console.log("Version de Mongoose :", mongoose.version);
// Librairie de gestion de base de données NoSQL pour Node.js
const dotenv = require('dotenv');
// permet de charger des variables d'environnement depuis un fichier .env


//configuration dotenv variables d'environnement
dotenv.config(); // 

const app = express(); //création du server express 


// middleware
app.use(cors()); // Autorise React (port 3000) et API Node.js (port 5000) à communiquer entre eux
app.use(cors({
    origin: 'http://localhost:5173', // L'URL précise de ton Front Vite
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json()); // Transforme JSON des requêtes POST en objet JS 

//-------- Routes 
const authRoutes = require('./routes/auth.js');
const dashboardRoutes = require('./routes/dashboard.js');
const orderRoutes = require('./routes/orders.js');
const quoteRoutes = require('./routes/quotes.js');
const userRoutes = require('./routes/users.js');

const serviceRoutes = require('./routes/services');
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/users', userRoutes);

//Mongo DB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pixelch')
    .then(() => console.log('✅ MongoDB pixelch connecté'))
    .catch(err => {
        console.log('❌ MongoDB', err);
        console.log('⚠️ Assurez-vous que MongoDB tourne sur 127.0.0.1:27017 ou définissez MONGO_URI dans .env');
    });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend: http://127.0.0.1:${PORT}`));