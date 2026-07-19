"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.createProductReview = exports.getProductById = exports.getProducts = exports.fallbackProducts = void 0;
const Product_js_1 = __importDefault(require("../models/Product.js"));
const Review_js_1 = __importDefault(require("../models/Review.js"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.fallbackProducts = [
    {
        _id: 'mock-product-1',
        name: 'Kanchipuram Pure Silk Bridal Saree',
        price: 12500,
        discount: 10,
        category: 'Bridal',
        images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Exquisite hand-woven pure Kanchipuram silk saree with rich zari border and traditional motifs. Ideal for grand weddings and brides seeking classic luxury.',
        fabric: 'Pure Mulberry Silk with Gold Zari',
        colors: ['Deep Maroon', 'Scarlet Red', 'Royal Gold'],
        stock: 8,
        ratings: 4.8,
        numReviews: 2,
        isActive: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    {
        _id: 'mock-product-2',
        name: 'Venkatagiri Fine Cotton Saree',
        price: 2499,
        discount: 5,
        category: 'Cotton',
        images: [
            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Lightweight and highly breathable Venkatagiri cotton saree with fine weave and gold border, ideal for hot summer events, corporate wear, and daily elegance.',
        fabric: 'Venkatagiri Pure Cotton',
        colors: ['Off-White', 'Mint Green', 'Citrus Yellow'],
        stock: 15,
        ratings: 4.5,
        numReviews: 1,
        isActive: true,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
    },
    {
        _id: 'mock-product-3',
        name: 'Dharmavaram Double-Shaded Silk Saree',
        price: 8999,
        discount: 15,
        category: 'Silk',
        images: [
            'https://images.unsplash.com/photo-1610030470298-40b355e71713?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Traditional Dharmavaram silk saree featuring double-shaded body weaving and a grand contrasting pallu decorated with detailed temple borders.',
        fabric: 'Dharmavaram Silk',
        colors: ['Peacock Blue', 'Royal Pink'],
        stock: 10,
        ratings: 4.7,
        numReviews: 0,
        isActive: true,
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
    },
    {
        _id: 'mock-product-4',
        name: 'Banarasi Soft Georgette Designer Saree',
        price: 6499,
        discount: 20,
        category: 'Designer',
        images: [
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Banarasi georgette saree featuring intricate zari jaal work, flowing drape, and a designer contemporary border setup.',
        fabric: 'Premium Banarasi Georgette',
        colors: ['Crimson Red', 'Mustard Yellow', 'Forest Green'],
        stock: 12,
        ratings: 4.6,
        numReviews: 0,
        isActive: true,
        createdAt: new Date('2026-01-04T00:00:00.000Z'),
    },
    {
        _id: 'mock-product-5',
        name: 'Gadwal Pure Handloom Saree',
        price: 5200,
        discount: 10,
        category: 'Handloom',
        images: [
            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Authentic Gadwal handloom saree with soft cotton body and pure silk border and pallu. Handcrafted by local weavers in Andhra Pradesh.',
        fabric: 'Gadwal Cotton-Silk Blend',
        colors: ['Emerald Green', 'Maroon Red'],
        stock: 3,
        ratings: 4.9,
        numReviews: 3,
        isActive: true,
        createdAt: new Date('2026-01-05T00:00:00.000Z'),
    },
    {
        _id: 'mock-product-6',
        name: 'Fancy Organza Party Wear Saree',
        price: 3500,
        discount: 8,
        category: 'Party Wear',
        images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
        ],
        description: 'Charming organza saree with beautiful floral embroidery work and delicate scallop borders. A modern designer style for evening parties.',
        fabric: 'Premium Organza',
        colors: ['Lavender Rose', 'Pastel Pink'],
        stock: 7,
        ratings: 4.4,
        numReviews: 1,
        isActive: true,
        createdAt: new Date('2026-01-06T00:00:00.000Z'),
    }
];
const useFallbackData = () => mongoose_1.default.connection.readyState !== 1;
const applyProductFilters = (items, query) => {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = query;
    let results = [...items].filter((item) => item.isActive !== false);
    if (search) {
        const searchValue = String(search).toLowerCase();
        results = results.filter((item) => [item.name, item.description, item.fabric]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(searchValue)));
    }
    if (category) {
        results = results.filter((item) => item.category === category);
    }
    if (minPrice || maxPrice) {
        const min = minPrice ? Number(minPrice) : Number.NEGATIVE_INFINITY;
        const max = maxPrice ? Number(maxPrice) : Number.POSITIVE_INFINITY;
        results = results.filter((item) => Number(item.price) >= min && Number(item.price) <= max);
    }
    if (sort === 'price_asc') {
        results.sort((a, b) => a.price - b.price);
    }
    else if (sort === 'price_desc') {
        results.sort((a, b) => b.price - a.price);
    }
    else if (sort === 'ratings') {
        results.sort((a, b) => b.ratings - a.ratings);
    }
    else {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const pagedResults = results.slice(skip, skip + limitNum);
    return {
        products: pagedResults,
        page: pageNum,
        pages: Math.ceil(results.length / limitNum),
        total: results.length,
    };
};
// @desc    Get all products with filters, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        if (useFallbackData()) {
            res.json(applyProductFilters(exports.fallbackProducts, req.query));
            return;
        }
        const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
        const query = { isActive: true };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { fabric: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            query.category = category;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = Number(minPrice);
            if (maxPrice)
                query.price.$lte = Number(maxPrice);
        }
        let sortOptions = { createdAt: -1 }; // default: latest
        if (sort === 'price_asc') {
            sortOptions = { price: 1 };
        }
        else if (sort === 'price_desc') {
            sortOptions = { price: -1 };
        }
        else if (sort === 'ratings') {
            sortOptions = { ratings: -1 };
        }
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;
        const products = await Product_js_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);
        const count = await Product_js_1.default.countDocuments(query);
        res.json({
            products,
            page: pageNum,
            pages: Math.ceil(count / limitNum),
            total: count,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProducts = getProducts;
// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        if (useFallbackData()) {
            const product = exports.fallbackProducts.find((item) => item._id === req.params.id);
            if (product) {
                const reviews = [];
                res.json({ product, reviews });
            }
            else {
                res.status(404).json({ message: 'Product not found' });
            }
            return;
        }
        const product = await Product_js_1.default.findById(req.params.id);
        if (product) {
            // Find reviews for this product
            const reviews = await Review_js_1.default.find({ productId: product._id }).sort({ createdAt: -1 });
            res.json({ product, reviews });
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductById = getProductById;
// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const product = await Product_js_1.default.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Check if user already reviewed
        const alreadyReviewed = await Review_js_1.default.findOne({
            productId: product._id,
            userId: req.user._id,
        });
        if (alreadyReviewed) {
            res.status(400).json({ message: 'Product already reviewed' });
            return;
        }
        const review = await Review_js_1.default.create({
            productId: product._id,
            userId: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        });
        // Update product ratings average and reviews count
        const productReviews = await Review_js_1.default.find({ productId: product._id });
        product.numReviews = productReviews.length;
        product.ratings =
            productReviews.reduce((acc, item) => item.rating + acc, 0) /
                productReviews.length;
        await product.save();
        res.status(201).json({ message: 'Review added successfully', review });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createProductReview = createProductReview;
// @desc    Get AI product recommendations
// @route   GET /api/products/:id/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
    try {
        if (useFallbackData()) {
            const product = exports.fallbackProducts.find((item) => item._id === req.params.id);
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
                return;
            }
            const recommendations = exports.fallbackProducts
                .filter((item) => item._id !== product._id && (item.category === product.category || item.fabric === product.fabric))
                .slice(0, 4);
            res.json(recommendations);
            return;
        }
        const product = await Product_js_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Smart rules-based AI Recommendations:
        // 1. Matches identical category (highest priority)
        // 2. Matches identical fabric
        // 3. Excludes current product
        // 4. Returns top 4 matching products
        const recommendations = await Product_js_1.default.find({
            _id: { $ne: product._id },
            isActive: true,
            $or: [
                { category: product.category },
                { fabric: product.fabric },
            ],
        }).limit(4);
        res.json(recommendations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRecommendations = getRecommendations;
