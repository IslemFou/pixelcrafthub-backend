const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prix: { type: Number, required: true },
    categorie: {
        type: String,
        enum: ['canape', 'table', 'chaise'],
        required: true
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    stock: { type: Number, default: 0 },
    eco: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    new: { type: Boolean, default: false }
}, {
    timestamps: true
});

//  retourne le modèle SANS jamais recompiler
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
