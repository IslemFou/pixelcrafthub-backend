const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    password: {
        type: String,
        required: [true, 'Password required'],
        // On garde minlength pour la forme, mais la regex est plus forte
        validate: {
            validator: function (v) {
                // On utilise la même Regex qu'en Front
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
            },
            message: "Password is too weak! Needs 8 chars, 1 uppercase, 1 lowercase and 1 number."
        }
    },
    firstName: {
        type: String,
        required: function () {
            // CORRECTION : On utilise "roles" (au pluriel) pour correspondre au champ plus bas
            return this.roles && !this.roles.includes('guest');
        }
    },
    lastName: {
        type: String,
        required: function () {
            return this.roles && !this.roles.includes('guest');
        }
    },
    phone: {
        type: String,
        required: function () {
            return this.roles && !this.roles.includes('guest');
        }
    },

    // CORRECTION : Harmonisation sur "roles"
    roles: {
        type: [String],
        enum: ['freelancer', 'company', 'admin', 'guest'],
        default: ['guest']
    },

    // Pro info
    companyName: { type: String },
    siret: {
        type: String,
        match: [/^[0-9]{14}$/, 'Invalid SIRET'],
        unique: true,
        sparse: true,
        required: false
    },
    address: String,
    city: String,
    postalCode: String,
    lang: {
        type: String,
        enum: ['en', 'fr', 'ar', 'other'],
        default: 'en'
    },
    verified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Hash password before saving (Ajout de next pour plus de sécurité)
userSchema.pre('save', async function () {
    // Si le mot de passe n'est pas modifié, on sort de la fonction
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        // Pas besoin d'appeler next(), la fin de la fonction async suffit
    } catch (error) {
        // On throw l'erreur pour que Mongoose l'attrape
        throw error;
    }
});

module.exports = mongoose.model('User', userSchema);