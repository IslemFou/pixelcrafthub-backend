const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
    //Produit OU Service
    itemType: {
        type: String,
        enum: ['product', 'service'],
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service',
        required: true
    },

    //Vendeur / prestataire (celui qui encaisse)
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: { type: String, required: true }, //nom du produit/Service au moment de la commande
    price: { type: Number, required: true }, //prix unitaire TTC
    quantity: { type: Number, default: 1 }, // pour produits
    // Pour les services on peux laisser quantity = 1
}, { _id: false });


const orderSchema = new mongoose.Schema({
    //client qui passe la commande
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    //Liste des lignes de commande (produits + services)
    orderItems: {
        type: [orderItemSchema],
        validate: [arr => arr.length > 0, 'Au moins un article requis']
    },

    //Adresse de livraison / Chantier
    shippingAdress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'France' }
    },
    //Prix
    itemsPrice: { type: Number, required: true, min: 0 }, //total HT items
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    //Paiement
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'stripe', 'cash'],
        default: 'card'
    },
    paymentResult: {
        id: String, // id paiement (Stripe/ PayPal)
        status: String,
        update_time: String,
        email_address: String
    },
    //Status commande
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipping', 'completed', 'cancelled'],
        default: 'pending'
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,

    //Suivi
    notes: { String }

});

//Index pour requêtes fréquentes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'orderItems.seller': 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
