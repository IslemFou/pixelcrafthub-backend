const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate a JWT token containing the user's ID and uses a secret key from environnment variables process.env.JWT_SECRET for security. This token expires in 7 days.
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// @desc    User registration
// @route   POST /api/auth/register
// @access  Public
/*
Route Handler:
Purpose: Lets new users sign up.
Extracts user details from the request body (e.g., email, password).
Checks if a user with that email already exists.
Creates a new user in the database (password gets hashed automatically by the User model).
Generates a JWT token and sends it back with user info.
If something fails (e.g., database error), returns an error message.
*/
exports.register = async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            phone,
            role,
            companyName,
            siret,
            address,
            city,
            postalCode,
            lang,
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create the user
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            roles: role ? [role] : ['client'], // client by default
            companyName,
            siret,
            address,
            city,
            postalCode,
            lang
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
                verified: user.verified,
                companyName: user.companyName
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    User login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                roles: user.roles,
                verified: user.verified,
                companyName: user.companyName,
                city: user.city
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('shops', 'name logo rating')
            .select('-password');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const updates = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            lang: req.body.lang
        };

        // Pro fields (vendor/provider)
        if (req.body.companyName) updates.companyName = req.body.companyName;
        if (req.body.siret) updates.siret = req.body.siret;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// protect middleware verifies JWT and attaches user to req
exports.protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token missing'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token invalid'
        });
    }
};

// authorize middleware restricts access based on roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const hasRole = roles.some(role => req.user.roles.includes(role));
        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: 'User role not authorized'
            });
        }
        next();
    };
};

// @desc    Request pro verification
// @route   POST /api/auth/verify-request
// @access  Private (vendor/provider only)
exports.requestVerification = async (req, res) => {
    try {
        // Check if pro
        if (!req.user.roles.includes('vendor') && !req.user.roles.includes('provider')) {
            return res.status(403).json({
                success: false,
                message: 'Only sellers/providers can request verification'
            });
        }

        // Check if already verified
        if (req.user.verified) {
            return res.status(400).json({
                success: false,
                message: 'Already verified'
            });
        }

        // TODO: Send admin email + attachments
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { verificationRequested: true },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Verification request sent'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    };
}