const User = require('../models/User');
const Project = require('../models/Projects');
const Service = require('../models/Service');
const Quote = require('../models/Quote');

// @desc    Dashboard client
// @route   GET /api/dashboard/client
exports.dashboardClient = async (req, res) => {
    try {
        const stats = await Promise.all([
            Project.countDocuments({ client: req.user._id }),
            Quote.countDocuments({ 'project.client': req.user._id }),
            Quote.countDocuments({ 'project.client': req.user._id, status: 'accepted' })
        ]);

        res.json({
            success: true,
            data: {
                projectsCount: stats[0],
                totalQuotesSent: stats[1],
                acceptedQuotes: stats[2]
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Dashboard provider
// @route   GET /api/dashboard/provider
exports.dashboardProvider = async (req, res) => {
    try {
        const stats = await Promise.all([
            Service.countDocuments({ provider: req.user._id }),
            Quote.countDocuments({ provider: req.user._id, status: 'accepted' }),
            Project.countDocuments({ developer: req.user._id, status: 'development' })
        ]);

        res.json({
            success: true,
            data: {
                myServicesCount: stats[0],
                confirmedContracts: stats[1],
                activeDevelopments: stats[2] //C'est l'info la plus importante pour lui : combien de projets web sont en cours de codage actuellement
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Dashboard admin global
// @route   GET /api/dashboard/admin
exports.dashboardAdmin = async (req, res) => {
    try {
        const stats = await Promise.all([
            User.countDocuments(),
            Service.countDocuments(),
            Project.countDocuments({ status: 'planning' }),
            Project.countDocuments({ status: 'completed' })
        ]);

        res.json({
            success: true,
            data: {
                totalUsers: stats[0],
                totalServices: stats[1],
                pendingProjects: stats[2],
                completedProjects: stats[3]
            } // l'utilisation de data{ ...} on renvoies un objet propre pour ton Front-end (React/Vue), ce qui facilite le mapping des composants de ton interface.

            //Santé de la plateforme : Pour l'Admin, on suit maintenant le ratio entre projets en attente (planning) et projets terminés (completed). C'est ton KPI (indicateur de performance) principal.
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};