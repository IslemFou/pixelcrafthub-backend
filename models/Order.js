const mongoose = require('mongoose');

// 1. DÉFINITION DU SOUS-SCHÉMA (Les items de la commande)
const orderItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'service', required: true },
    quote: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true },
    client: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'bank_transfer'],
        default: 'stripe'
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    location: String,
    notes: String
}, { timestamps: true });

// 2. DÉFINITION DU SCHÉMA PRINCIPAL
const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: {
        type: [orderItemSchema],
        validate: [arr => arr.length > 0, 'At least one item required']
    },
    itemsPrice: { type: Number, required: true, min: 0 },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'stripe', 'cash'],
        default: 'card'
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipping', 'completed', 'cancelled'],
        default: 'pending'
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    notes: String // Corrigé ici : String au lieu de { String }
}, { timestamps: true }); // Ajout des timestamps ici aussi pour le tri

// 3. ENFIN, LES INDEX (Une fois que orderSchema existe !)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
// Attention : 'orderItems.seller' n'existe pas dans ton schéma, 
// j'ai mis 'provider' à la place si c'est ce que tu voulais indexer
orderSchema.index({ 'orderItems.provider': 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);