const express = require('express');
const {
    createUser,
    getUsers,
    updateUser,
    verifyUser,
    deleteUser,
    getUserById,
    createGuestUser
} = require('../controllers/userController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

// ===== Route publique : création d'utilisateur invité / test =====
router.post('/guest', createGuestUser);


// ===== Routes Admin protégées =====
router.use(protect);
router.use(authorize('admin'));

router.post('/user', createUser);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/verify', verifyUser);
router.delete('/:id', deleteUser);

module.exports = router;