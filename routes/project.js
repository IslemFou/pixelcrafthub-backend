const express = require('express');
const router = express.Router();
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');

// Import your future auth middlewares
// const { protect, authorize } = require('../middleware/auth');

// For now, routes are public for testing, but they should be protected soon

router
    .route('/')
    .get(getProjects) //Get all the projects (filtered by user in controller)
    .post(createProject); //// Triggered when an Order is paid

router
    .route('/:id')
    .get(getProject) // Get single project details
    .put(updateProject);  //Update URLs, description, or status

// Special route for developers to quickly update % progress
router.put('/:id/progress', updateProgress);

router.delete(protect, deleteProject);

module.exports = router;