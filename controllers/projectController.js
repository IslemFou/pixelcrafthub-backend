const Project = require('../models/Project');
const Quote = require('../models/Quote');

// @desc    Create project (client requests works)
// @route   POST /api/projects
exports.createProject = async (req, res) => {
    try {
        req.body.client = req.user._id;
        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get projects (Filtered by user role)
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
    try {
        let filter = {};

        // SECURITY FIX: Apply the filter based on roles
        if (req.user.roles.includes('client')) {
            filter.client = req.user._id;
        } else if (req.user.roles.includes('provider')) {
            filter = {
                $or: [
                    { developer: req.user._id },
                    { status: 'planning' } // Providers can see available projects
                ]
            };
        }

        const projects = await Project.find(filter) // Use the filter here!
            .populate('client', 'firstName lastName')
            .populate('developer', 'firstName lastName companyName')
            .populate({
                path: 'quotes',
                populate: { path: 'provider', select: 'companyName rating' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// getProject // Details
// un utilisateur ne peut voir les détails d'un projet que s'il est le Client, le Developer, ou un Admin.
// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private (Involved parties only)
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client', 'firstName lastName email')
            .populate('developer', 'firstName lastName companyName email')
            .populate('service', 'title category')
            .populate('order', 'totalPrice paymentStatus')
            .populate('quotes');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // --- SECURITY CHECK ---
        const isAdmin = req.user.roles.includes('admin');
        const isClient = project.client._id.toString() === req.user._id.toString();
        const isDev = project.developer && project.developer._id.toString() === req.user._id.toString();

        if (!isAdmin && !isClient && !isDev) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this project'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update project status or progress
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
    try {
        const { status, progress, repositoryUrl, stagingUrl } = req.body;
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        // Authorization check
        const isClient = project.client.toString() === req.user._id.toString();
        const isDev = project.developer && project.developer.toString() === req.user._id.toString();

        if (!isClient && !isDev) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Prepare update object
        const updateData = {};
        if (status) updateData.status = status;
        if (progress !== undefined) updateData.progress = progress;
        if (repositoryUrl) updateData.repositoryUrl = repositoryUrl;
        if (stagingUrl) updateData.stagingUrl = stagingUrl;

        project = await Project.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin or Owner)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Security check: Only an Admin or the Client who created it can delete
        const isAdmin = req.user.roles.includes('admin');
        const isOwner = project.client.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this project'
            });
        }

        // Logic: If the project is already "in_progress", maybe prevent deletion?
        if (project.status === 'development' && !isAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a project already in development. Please cancel it instead.'
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Project removed from PixelcraftHub'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};