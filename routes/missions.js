const express = require('express');
const {
    createMission,
    getMissions,
    getMission,
    createProposal,
    acceptProposal,
    completeMission
} = require('../controllers/missionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getMission)
    .post(createProposal) // Répondre
    .put(acceptProposal) // Accepter
    .patch(completeMission); //Cloturer

module.exports = router;
