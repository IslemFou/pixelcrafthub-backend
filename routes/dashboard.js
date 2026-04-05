const express = require('express');
const {
    dashboardClient,
    dashboardProvider,
    dashboardAdmin
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

//Client
router.get('/client', protect, authorize('client'), dashboardClient);


//Providor (prestataire )
router.get('/provider', protect, authorize('provider'), dashboardProvider);

//Admin global
router.get('/admin', protect, authorize('admin'), dashboardAdmin);

module.exports = router;