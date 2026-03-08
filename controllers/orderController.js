const Order = require('../models/Order');

// @desc    Créer commande (produit ou service accepté)
// @route   POST /api/orders
// @access  Privé
exports.createOrder = async (req, res) => {
    try {
        req.body.user = req.user._id;
        const order = await Order.create(req.body);
        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Mes commandes
// @route   GET /api/orders/my-orders
// @access  Privé
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Commandes vendeur/prestataire
// @route   GET /api/orders/my-seller-orders
// @access  Privé - Vendor/Provider
exports.getSellerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 'orderItems.seller': req.user._id })
            .populate('orderItems.product')
            .populate('user', 'nom email')
            .sort({ createdAt: -1 });
        res.json({ suceess: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// @desc    Mettre à jour statut commande
// @route   PUT /api/orders/:id
// @access  Privé - Vendor/Provider
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};