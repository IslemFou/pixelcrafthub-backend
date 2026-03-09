const express = require('express');
const {
    getUsers,
    updateUser,
    verifyUser,
    deleteUser,
    getUserById
} = require('../controllers/userConroller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

//Toutes les routes Admin
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/verify', verifyUser);
router.delete('/:id', deleteUser);

module.exports = router;