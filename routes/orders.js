const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getProviderOrders,
    updateOrderToPaid
} = require('../controllers/orderController');

//On importe le vigile
const { protect, authorize } = require('../middleware/auth');

//------------- Toutes les routes ci-dessous nécessitent d'être connecté
router.use(protect);

router.route('/')
    .post(authorize('client'), createOrder) //seul un client achète
    .get(getMyOrders);   // voir ses propres commandes

router.get('/provider', authorize('provider'), getProviderOrders); //// Voir ses ventes

router.put('/:id/pay', authorize('client'), updateOrderToPaid); // Simuler le paiement


module.exports = router;