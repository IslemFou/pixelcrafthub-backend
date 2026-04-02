const Mission = require('../models/Mission');
const User = require('../models/Mission');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//@desc Créer une mission client
const createMission = async (req, res) => {
    try {
        const {
            title, description, budget, skills, deadline, location
        } = req.body;

        const clientId = req.user.id;

        const mission = await Mission.create({
            title,
            description,
            budget: {
                min: budget.min,
                max: budget.max
            },
            skills: skills || [],
            deadlines,
            location: location || 'Ile-de-France',
            client: clientId,
            status: 'open'
        });

        //Populate client Info
        await mission.populate('client', 'name email');

        res.status(201).json({
            success: true,
            data: mission
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error mission creation',
            error: error.message
        });
    }
};

//@desc Lists missions (open + my mission)
const getMissions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            skills,
            location,
            budgetmax,
            status = 'open',
            myMissions
        } = req.query;

        const query = { status: status };

        if (skills) query.skills = { $in: skills.split(',') };
        if (location) query.location = { $regex: location, $options: 'i' };
        if (budgetMax) query['budget.max'] = { $lte: budgetMax };
        if (myMissions) query.client = req.user.id;

        const missions = await Mission.find(query)
            .populate('client', 'name rating')
            .populate('proposals.user', 'name rating skills')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Mission.countDocuments(query);

        res.json({
            success: true,
            data: missions,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error Listing missions',
            error: error.message
        });
    }
};

//@desc Récupérer une mission
const getMission = async (req, res) => {
    try {
        const mission = await Mission.findById(req.params.id)
            .populate('client', 'name email rating')
            .populate('proposals.user', 'name skills rating portfolio')
            .populate('prestataire', 'name skills rating');

        if (!mission) {
            return res.status(404).json({
                success: false,
                message: 'Mission not found'
            });
        }

        res.json({
            success: true,
            data: mission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error mission',
            error: error.message
        });
    }
};

//@desc Répondre à une mission (prestataire)
const createProposal = async (req, res) => {
    try {
        const { price, duration, message } = req.body;
        const missionId = req.params.id;
        const prestataireId = req.user.id;

        //Vérif Mission open
        const mission = await Mission.findById(missionId);
        if (mission.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'Mission closed for propositions'
            });
        }

        const proposal = {
            user: prestataireId,
            price,
            duration,
            message
        };

        mission.proposals.push(proposal);
        await mission.save();

        await mission.populate('proposals.user', 'name skills rating');

        res.status(201).json({
            success: true,
            data: mission.proposals[mission.proposals.length - 1]
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error proposition',
            error: error.message
        });
    }
};

//@desc Accepter une proposition (client)
const acceptProposal = async (req, res) => {
    try {
        const { proposalIndex } = req.body;
        const prestataireId = req.user.id;

        const mission = await Mission.findOne({
            _id: req.params.id,
            client: prestataireId
        });

        if (!mission || mission.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'Mission non accessible'
            });
        }

        const proposal = mission.proposals[proposalIndex];
        if (!proposal) {
            return res.status(400).json({
                success: false,
                message: 'Proposition invalide'
            });
        }

        //Stripe payment intent (accompte 30%)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(proposal.price * 0.3 * 100),
            currency: 'eur',
            metadata: { missionId: mission._id.toString() }
        });

        mission.status = 'in_progress';
        mission.prestataire = proposal.user;
        mission.paymentIntent = paymentIntent.id;
        await mission.save();

        res.json({
            success: true,
            data: {
                mission,
                clientSecret: paymentIntent.client_secret
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur acceptation',
            error: error.message
        });
    }
};

//@desc Clôture mission (client)
const completeMission = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const clientId = req.user.id;

        const mission = await Mission.findOne({
            _id: req.params.id,
            client: clientId,
            status: 'in_progress'
        });

        if (!mission) {
            return res.status(400).json({
                success: false,
                message: 'Mission non accessible'
            });
        }

        //Libérer solde (70%) via Stripe
        await stripe.paymentIntents.create({
            amount: Math.round((mission.proposals[0].price * 0.7) * 100),
            currency: 'eur',
            metadata: { missionId: mission._id.toString() }
        });

        mission.status = 'completed';
        mission.clientReview = { rating, comment };
        await mission.save();

        res.json({
            success: true,
            data: mission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cloture',
            error: error.message
        });
    }
};

module.exports = {
    createMission,
    getMissions,
    getMission,
    createProposal,
    acceptProposal,
    completeMission
};
