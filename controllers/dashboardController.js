const User = require('../models/User');
const Product = require('../models/Product');
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
            projectsCount: stats[0],
            activeQuotes: stats[1]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Dashboard vendor
// @route   GET /api/dashboard/vendor
exports.dashboardVendor = async (req, res) => {
    try {
        const stats = await Promise.all([
            Product.countDocuments({ vendor: req.user._id }),
            //Order.countDocuments('orderItems.seller': req.user._id, status: 'delivered'})
        ]);

        res.json({
            success: true,
            productsCount: stats[0],
            //revenue: stats[1]
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
            Quote.countDocuments({ provider: req.user._id, status: 'accepted' })
        ]);

        res.json({
            success: true,
            servicesCount: stats[0],
            acceptedQuotes: stats[1]
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
            Product.countDocuments(),
            Service.countDocuments(),
            Project.countDocuments({ status: 'ouvert' })
        ]);

        res.json({
            success: true,
            usersCount: stats[0],
            productsCount: stats[1],
            servicesCount: stats[2],
            openProjects: stats[3]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};