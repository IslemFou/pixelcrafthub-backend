const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    // Provider offering the service
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Service name
    title: {
        type: String,
        required: [true, 'Service title is required'],
        maxlength: 200
    },

    // Detailed description
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 2000
    },

    // Service category
    category: {
        type: String,
        enum: ['Graphic Design',
            'UI/UX Design',
            'Web Development', 'Digital Marketing', 'Content Writing',
            'Handcraft',
            'Marketing',
            'Consulting',
            'Other'
        ],
        required: true
    },

    // Pricing
    pricingType: {
        type: String,
        enum: ['Fixed', 'Hourly', 'Quote'],
        default: 'Quote'
    },
    priceFrom: {
        type: Number,
        min: 0,
        default: 0
    },
    priceUnit: {
        type: String,
        enum: ['per_project', 'per_hour', 'per_day', 'per_item'],
        default: 'per_project'
    },

    // Durée indicative
    duration: String, // ex: "1 journée", "2-3 jours"

    // Média / portfolio
    images: [String], // URLs Cloudinary
    videoUrl: String,

    // Expérience & tags
    experienceYears: { type: Number, min: 0 },
    tags: {
        type: [String],
        lowercase: true
    },

    //  Availability
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

// Index utiles pour la recherche
serviceSchema.index({ category: 1 });
serviceSchema.index({ provider: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
