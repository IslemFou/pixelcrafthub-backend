const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: {
        min: Number,
        max: Number
    },
    skills: [String],
    deadline: Date,
    location: String,
    client: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    prestataire: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    proposals: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        price: Number,
        duration: String,
        message: String
    }],
    status: {
        type: String,
        enum: ['open', 'in_progress', 'completed', 'cancelled'],
        default: 'open'
    },
    paymentIntent: String,
    clientReview: {
        rating: Number,
        comment: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Mission', missionSchema);