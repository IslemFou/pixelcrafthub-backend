const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
    // name of product/Service at time of order
    title: {
        type: String,
        required: true
    },
    //Link to the Service Model
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service',
        required: true
    },

    //Quote
    quote: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote',
        required: true
    },

    // The Two parties
    client: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    //The provider who will perform the work
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Financials (Fixed from the Quote)
    totalPrice: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'EUR'
    },
    // Payment details
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'bank_transfer'],
        default: 'stripe'
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,

    // Mission Status
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    // If the service is physical (ex: furniture delivery or on-site work), 
    // we use a simple location string instead of a full address object
    location: String,

    notes: String
}, { timestamps: true });
orderSchema.index({ client: 1, status: 1 });
orderSchema.index({ provider: 1, status: 1 });

const orderSchema = new mongoose.Schema({
    // customer placing the order
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // List of order lines (products + services)
    orderItems: {
        type: [orderItemSchema],
        validate: [arr => arr.length > 0, 'At least one item required']
    },

    // Price
    itemsPrice: { type: Number, required: true, min: 0 }, // total pre-tax items
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    // Payment
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'stripe', 'cash'],
        default: 'card'
    },
    paymentResult: {
        id: String, // payment id (Stripe/ PayPal)
        status: String,
        update_time: String,
        email_address: String
    },
    // Order status
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipping', 'completed', 'cancelled'],
        default: 'pending'
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,

    // Tracking
    notes: { String }

});

// Indexes for frequent queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'orderItems.seller': 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
