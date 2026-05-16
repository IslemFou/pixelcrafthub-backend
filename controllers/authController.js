const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Génère un JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// @desc    Inscription utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    console.log("1. Requête reçue avec le body:", req.body);
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            phone,
            role,   // On récupère "role" du front
            siret,
            companyName // N'oublie pas de le récupérer aussi !
        } = req.body;

        // 1. Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        console.log("2. Utilisateur existe déjà ?", !!existingUser);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // 2. PRÉPARATION DE L'OBJET (Le secret est ici)
        const userData = {
            email,
            password,
            firstName,
            lastName,
            phone,
            roles: [role],
            companyName
        };

        // On ajoute le SIRET SEULEMENT s'il n'est pas vide
        if (siret && siret.trim() !== "") {
            userData.siret = siret.trim();
        }

        // 3. Créer l'utilisateur avec l'objet propre
        console.log("3. Tentative de User.create avec :", userData);
        const user = await User.create(userData);

        console.log("4. Utilisateur créé ID:", user._id);

        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                roles: user.roles
            }
        });


    } catch (error) {
        console.error("❌ ERREUR CATCHÉE :", error.message);
        console.error("❌ STACKTRACE :", error.stack);
        console.error("DETAILED REGISTER ERROR:", error); // Ajoute ce log pour voir l'erreur exacte dans ta console terminal
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
/* is an asynchronous Express.js route handler that authenticates a user based on their email and password. It follows a standard authentication flow for a web API.
*/
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Générer token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                roles: user.roles,
                verified: user.verified,
                companyName: user.companyName,
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Récupérer profil utilisateur
// @route   GET /api/auth/profile
// @access  Privé
exports.profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('shops', 'name logo rating')
            .select('-password');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Modifier profil
// @route   PUT /api/auth/profile
// @access  Privé
exports.updateProfile = async (req, res) => {
    try {
        const updates = {
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            zoneIntervention: req.body.zoneIntervention
        };

        // Champs pros (vendor/provider)
        if (req.body.companyName) updates.companyName = req.body.companyName;
        if (req.body.siret) updates.siret = req.body.siret;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Demander vérification pro
// @route   POST /api/auth/verify-request
// @access  Privé (vendor/provider uniquement)
exports.requestVerification = async (req, res) => {
    try {
        // Vérifier si c'est un pro
        if (!req.user.roles.includes('vendor') && !req.user.roles.includes('provider')) {
            return res.status(403).json({
                success: false,
                message: 'Seuls les vendeurs/prestataires peuvent demander une vérification'
            });
        }

        // Vérifier si déjà vérifié
        if (req.user.verified) {
            return res.status(400).json({
                success: false,
                message: 'Déjà vérifié'
            });
        }

        // TODO: Envoyer email admin + pièces jointes
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { verificationRequested: true },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Demande de vérification envoyée'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
