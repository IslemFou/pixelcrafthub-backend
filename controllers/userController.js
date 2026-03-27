const User = require('../models/User.js');
const crypto = require('crypto');
/**
 * Create a new user
 * @param {Object} req.body - The user data to create the new user
 * @returns {Object} - The newly created user
 */
exports.createUser = async (req, res) => {
    try {
        // Create a new user
        const newUser = new User(req.body);
        const { email } = newUser;

        // Check if the user already exists
        const userExist = await User.findOne({ email })

        if (userExist) {
            // If the user already exists, return a bad request response
            return res.status(400).json({ message: "User already exists." })
        }

        // Save the new user to the database
        const saveData = await newUser.save();
        // Return the newly created user
        res.status(200).json(saveData);
    } catch (error) {
        // If an error occurs, return an internal server error response
        res.status(500).json({ message: error.message });
    }
}

// create GuestUser
exports.createGuestUser = async (req, res) => {
    console.log('createGuestUser called');
    try {
        const randomSuffix = crypto.randomBytes(4).toString('hex');
        const guest = await User.create({
            // name: `Guest-${randomSuffix}`,
            // email: `guest_${randomSuffix}@test.com`,
            // password: 'guestpassword123',
            // role: 'guest',
            nom: 'Guest',
            prenom: 'Test',
            telephone: '0000000000',
            name: 'Guest Test', // si tu as aussi ce champ
            email: `guest_${Date.now()}@example.com`,
            password: 'test1234',
            role: 'guest',
            isVerified: false
        });
        // pour ne pas renvoyer le password
        guest.password = undefined;
        //
        res.status(201).json({
            success: true,
            data: guest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur création utilisateur invité',
            error: error.message
        });
    }
}

// @desc    Récupérer tous les utilisateurs (admin uniquement)
// @route   GET /api/users
// @access  Privé - Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('shops')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer utilisateur par ID
// @route   GET /api/users/:id
// @access  Privé - Admin
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Modifier utilisateur (admin)
// @route   PUT /api/users/:id
// @access  Privé - Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, runValidators: true
            }).select('-password');
        res.json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Vérifier prestataire/vendeur (admin)
// @route   PUT /api/users/:id/verify
// @access  Privé - Admin
exports.verifyUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { verified: true },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: `${user.companyName} vérifié`,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Supprimer utilisateur (admin)
// @route   DELETE /api/users/:id
// @access  Privé - Admin
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}