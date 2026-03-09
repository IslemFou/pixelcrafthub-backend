const Product = require('../models/product');
const User = require('../models/User');
//GET tous les produits par paramètres

// @desc    Récupérer tous les produits
// @route   GET /api/products
// @access  Public
// GET All products
const getProducts = async (req, res) => {
    try {
        const { categorie, prix_max, vendor, city, limit = 12, page = 1 } = req.query; // Obtenir les paramètres de la requête 
        let query = {}; // Créer un objet de requête vide
        if (categorie) query.categorie = categorie; // Ajouter la categorie au query
        if (vendor) query.vendor = vendor;
        if (city) query.city = city;
        if (prix_max) query.prix = { $lte: prix_max };

        const products = await Product.find(query).populate('vendor').limit(limit).skip((page - 1) * limit).sort({ createdAt: -1 });
        res.json({
            success: true,
            count,
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// @desc    Récupérer produit par ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor', 'companyName city rating');
        if (!product) {
            return res.status(404).json({ success: false, error: "Produit introuvable" });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Créer produit (SEULS LES VENDORS)
// @route   POST /api/products
// @access  Privé - Vendor uniquement
const createProduct = async (req, res) => {
    try {
        // ✅ 1. VÉRIFIER que c'est un VENDOR
        if (!req.user.roles.includes('vendor')) {
            return res.status(403).json({
                success: false,
                message: 'Seuls les vendeurs peuvent créer des produits'
            });
        }

        // ✅ 2. AUTO-ASSIGNER le vendor connecté
        req.body.vendor = req.user._id;

        // ✅ 3. Créer le produit
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// PUT modifier un produit
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ success: false, error: "Produit introuvable" });
        }
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// DELETE supprimer un produit
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, error: 'Produit introuvable' });
        }
        res.json({ success: true, message: 'Produit supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}
