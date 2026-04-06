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
        minlength: 6
    },
    firstName: {
        type: String,
        required: function () {
            return !this.roles.includes('guest');
        }
    },
    lastName: {
        type: String, required: function () {
            return !this.roles.includes('guest');
        }
    },
    phone: {
        type: String, required: function () {
            return !this.roles.includes('guest');
        }
    },

    // roles
    roles: [{
        type: String,
        enum: ['client', 'provider', 'admin', 'guest'],
        default: ['guest']
    }],

    // Pro info (providers)
    companyName: { type: String },
    siret: {
        type: String,
        match: [/^[0-9]{14}$/, 'Invalid SIRET'],
        unique: true,
        sparse: true, //Allows multiple users without SIRET
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

    // Old fields (keep them)
    isAdmin: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        this.password = await bcrypt.hash(this.password, 12);

    } catch (error) {
        throw error;
    }
});

module.exports = mongoose.model('User', userSchema);
