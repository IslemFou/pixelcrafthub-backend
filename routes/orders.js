const express = require('express');
const {
    createOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

//Créer une commande (client)
router.post('/', protect, createOrder);

//Mes commandes (client)
router.get('/my-orders', protect, getMyOrders);

//Commandes pour vendeur / prestataires
router.get(
    '/my-seller-orders',
    protect,
    authorize('vendor', 'provider'),
    getSellerOrders
);

//Mettre à jour status commande (vendor/provider)
router.put(
    '/:id',
    protect,
    authorize('vendor', 'provider', 'admin'),
    updateOrderStatus
);

module.exports = router;