const Quote = require('../models/Quote');
const Project = require('../models/Project');
// @desc    Créer devis (prestataire → projet client)
// @route   POST /api/quotes
// @access  Privé - Provider
exports.createQuote = async (req, res) => {
    try {
        req.body.provider = req.user._id;
        const quote = await Quote.create(req.body);
        // Ajouter à la liste des devis du projet
        await Project.findByIdAndUpdate(req.body.project, {
            $push: { quotes: quote._id }
        });
        res.status(201).json({ success: true, quote });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Récupérer devis d'un projet (client)
// @route   GET /api/projects/:projectId/quotes
// @access  Privé
exports.getProjectQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find({
            project: req.params.projectId
        }).populate('provider', 'companyName rating city')
            .populate('project', 'title')
            .sort({ createdAt: -1 });

        res.json({ success: true, quotes });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mes devis envoyés (prestataire)
// @route   GET /api/quotes/my-quotes
// @access  Privé - Provider
exports.getMyQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find({
            provider: req.user._id
        }).populate('project', 'title client city status')
            .populate('provider', 'companyName')
            .sort({ createdAt: -1 });
        res.json({ success: true, quotes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// @desc    Accepter devis (client)
// @route   PUT /api/quotes/:id/accept
// @access  Privé
exports.acceptQuote = async (req, res) => {
    try {
        const quoteToUpdate = await Quote.findById(req.params.id).populate('project');

        if (!quoteToUpdate) {
            return res.status(404).json({ success: false, message: 'Devis introuvable' });
        }

        // Authorization check: only the project client can accept.
        if (quoteToUpdate.project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Action non autorisée.' });
        }

        const quote = await Quote.findByIdAndUpdate(req.params.id,
            { status: 'accepted' },
            { new: true }
        ).populate('provider project');

        // Mettre à jour status project
        await Project.findByIdAndUpdate(quote.project,
            {
                status: 'en_cours'
            }
        );
        res.json({ success: true, quote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Rejeter devis (client)
// @route   PUT /api/quotes/:id/reject
// @access  Privé
exports.rejectQuote = async (req, res) => {
    try {
        const quoteToUpdate = await Quote.findById(req.params.id).populate('project');

        if (!quoteToUpdate) {
            return res.status(404).json({ success: false, message: 'Devis introuvable' });
        }

        // Authorization check: only the project client can reject.
        if (quoteToUpdate.project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Action non autorisée.' });
        }

        const quote = await Quote.findByIdAndUpdate(req.params.id,
            {
                status: 'rejected'
            },
            {
                new: true
            }
        );
        res.json({ success: true, quote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};