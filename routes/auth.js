const express = require('express');
const {
    register,
    login,
    profile,
    updateProfile,
    requestVerification
} = require('../middleware/auth');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, profile);
router.put('/profile', protect, updateProfile);
router.post('/verify-request', protect, requestVerification);

module.exports = router;
