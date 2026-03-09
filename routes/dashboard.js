const express = require('express');
const {
    dashboardClient,
    dashboardVendor,
    dashboardProvider,
    dashboardAdmin
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

//Client
router.get('/client', protect, authorize('client'), dashboardClient);

//Vendor (vendeur meubles/déco)
router.get('/vendor', protect, authorize('vendor'), dashboardVendor);

//Providor (prestataire traveaux)
router.get('/provider', protect, authorize('provider'), dashboardProvider);

//Admin global
router.get('/admin', protect, authorize('admin'), dashboardAdmin);

module.exports = router;