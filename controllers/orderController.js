const Order = require('../models/Order');
const Project = require('../models/Project'); // Import indispensable pour la suite
const Quote = require('../models/Quote');


// @desc    Create order from an accepted Quote
// @route   POST /api/orders
// @access  Private (Client)
exports.createOrder = async (req, res) => {
    try {
        const {
            quoteId,
            paymentMethod
        } = req.body;


        // 1. Récupérer les devis pour avoir les détails prix, prestataires, service
        const quote = await Quote.findById(quoteId)
            .populate('service');

        if (!quote) {
            return res.status(404).json({
                success: false, message: 'Quote Not Found'
            });
        }
        // 2. Créer la commande basée sur le devis
        const order = await Order.create({
            client: req.user._id,
            provider: quote.provider,
            quote: quote._id,
            totalPrice: quote.price,
            paymentMethod,
            status: 'pending'
        });

        res.status(201).json({ success: true, order });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get my orders (As a client)
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            client: req.user._id
        }).populate('service', 'title category')
            .populate('provide', 'firstName lastName companyName')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders received (As a developer/provider)
// @route   GET /api/orders/my-provider-orders
exports.getProviderOrders = async (req, res) => {
    try {
        const orders = await Order.find({ provider: req.user._id }).populate('service', 'title')
            .populate('client', 'firstName', 'lastName', 'email')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Payment status & Trigger Project Creation
// @route   PUT /api/orders/:id/pay
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('service');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        //simulation de paiement validé
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'completed';

        const updateOrder = await order.save();

        // On craie le projet automatiquement ici!
        await Project.create({
            title: order.service.title,
            description: "Project started after payment confirmation",
            client: order.client,
            developer: order.provider,
            order: order._id,
            service: order.service._id,
            status: 'planning'
        });
        res.json({ success: true, order: updatedOrder, message: "Payment confirmed & Project created" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}