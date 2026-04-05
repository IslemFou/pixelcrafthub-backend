const express = require('express');
const router = express.Router();
const {
    getProjects,
    getProject,
    updateProgress,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');

// Import auth middlewares
const { protect, authorize } = require('../middleware/auth');
// Application de protect à toutes les routes de ce fichier
router.use(protect);
//Au lieu d'écrire protect sur chaque ligne, le mettre en haut du fichier de routes (après les imports) protège toutes les routes qui suivent. C'est plus propre et tu n'oublieras jamais de sécuriser une nouvelle route.

router
    .route('/')
    .get(getProjects) //Get all the projects (filtered by user in controller)

router
    .route('/:id')
    .get(getProject) // Get single project details
    .put(updateProject) //Update URLs, description, or status
    .delete(deleteProject);

// Special route for developers to quickly update % progress
// On peut ajouter authorize('provider') ici pour plus de sécurité
router.put('/:id/progress', updateProgress);


module.exports = router;