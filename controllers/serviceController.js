const Service = require('../models/Service.js');
// User model is not used in this controller (was causing module resolution errors),
// so the import has been removed. Add it back only if needed in the future.

// @desc    Get all services (search providers)
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
    try {
        const {
            category,
            city,
            roomType,
            minPrice,
            maxPrice,
            minRating = 0,
            limit = 12,
            page = 1
        } = req.query; // Get query parameters
        let query = { isActive: true }; // Create an empty query object
        // Filters by work category
        if (category) query.category = category;
        // Filters by room / housing type
        if (roomType) query.roomType = roomType;
        // Geo filters
        if (city) query.city = { $regex: city, $options: 'i' };

        // Budget and rating filters
        if (maxPrice) query.priceForm = { $lte: parseInt(maxPrice) };
        if (minPrice) query.priceForm = {
            ...query.priceForm,
            $gte: parseInt(minPrice)
        };

        // Rating filters
        if (minRating > 0) query.rating = { $gte: parseFloat(minRating) };

        const services = await Service.find(query).populate('provider', 'companyName city rating').limit(limit).skip((page - 1) * limit).sort({ createdAt: -1 });

        const count = await Service.countDocuments(query);

        res.json({
            success: true,
            count,
            services,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('provider', 'companyName city rating');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        res.json({
            success: true,
            service
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
// @desc    Create service (PROVIDERS ONLY)
// @route   POST /api/services
// @access  Private - Provider only
exports.createService = async (req, res) => {
    try {
        // Check provider role
        if (!req.user.roles.includes('provider')) {
            return res.status(403).json({
                success: false,
                message: 'Only providers can create services'
            });
        }

        // Auto-assign the logged-in provider
        req.body.provider = req.user._id;

        const service = await Service.create(req.body);

        res.status(201).json({ success: true, service });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update service (OWNER ONLY)
// @route   PUT /api/services/:id
// @access  Private - Provider only
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        // verify
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        // Check provider role
        if (service.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this service'
            });
        }

        // Update the service
        const updatedService = await Service.findByIdAndUpdate(req.params.id,
            req.body,
            { new: true, runValidators: true })
            .populate('provider', 'companyName city rating');

        res.json({
            success: true,
            message: 'Service updated',
            updatedService
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete service (OWNER ONLY)
// @route   DELETE /api/services/:id
// @access  Private - Provider only

exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        if (service.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this service'
            });
        }

        await Service.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Service deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    My services (provider dashboard)
// @route   GET /api/services/my-services
// @access  Private - Provider only

exports.getMyServices = async (req, res) => {
    try {
        const services = await Service.find({
            provider: req.user._id
        }).populate('provider', 'companyName city rating')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            services
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
