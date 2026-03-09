const express = require('express');
const {
    createQuote,
    getProjectQuotes,
    getMyQuotes,
    acceptQuote,
    rejectQuote
} = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

//Créer un devis (prestataire)
router.post(
    '/',
    protect,
    authorize('provider'),
    createQuote
);

//Devis d'un projet (client)
router.get(
    '/project/:projectId',
    protect,
    getProjectQuotes
);

//Mes devis envoyées (prestataires)
router.get(
    '/my-quotes',
    protect,
    authorize('provider'),
    getMyQuotes
);

//Accepter devis (client)
router.put(
    '/:id/accept',
    protect,
    authorize('client'),
    acceptQuote
);

//Rejeter Devis (client)
router.put(
    '/:id/reject',
    protect,
    authorize('client'),
    rejectQuote
);

module.exports = router;