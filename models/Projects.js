const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    // Links to the business side
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    developer: { // Renamed 'provider' to 'developer' for Web context
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        maxlength: 200
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        maxlength: 2000
    },

    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },

    // Web-specific fields
    repositoryUrl: String, // Link to GitHub/GitLab
    stagingUrl: String,    // Preview link for the client


    images: [String], // URLs Cloudinary

    // Milestones (Phases du projet)
    milestones: [{
        name: String,
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed'],
            default: 'pending'
        },
        dueDate: Date
    }],

    // Current State
    status: {
        type: String,
        enum: ['planning', 'development', 'review', 'completed', 'on_hold'],
        default: 'planning'
    },

    // Files & Deliverables
    assets: [{
        name: String,
        url: String, // Cloudinary or S3 link
        uploadedAt: { type: Date, default: Date.now }
    }],

    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    quotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
