const express = require('express');
const { query, param, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get products with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().trim(),
  query('subcategory').optional().isString().trim(),
  query('manufacturer').optional().isString().trim(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be non-negative'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('onSale').optional().isBoolean().withMessage('onSale must be a boolean'),
  query('featured').optional().isBoolean().withMessage('featured must be a boolean'),
  query('sortBy').optional().isIn(['price', 'rating', 'name', 'date', 'popularity']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('search').optional().isString().trim()
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      manufacturer,
      minPrice,
      maxPrice,
      minRating,
      onSale,
      featured,
      sortBy = 'rating',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build query
    const query = { quantity_in_stock: { $gt: 0 } };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (manufacturer) query.manufacturer = manufacturer;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (onSale === 'true') query.is_on_sale = true;
    if (featured === 'true') query.is_featured = true;

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    switch (sortBy) {
      case 'price':
        sortObj.price = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
        sortObj.rating = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortObj.product_name = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'date':
        sortObj.release_date = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        sortObj['analytics.views'] = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sortObj.rating = -1;
    }

    // Add text score for search results
    let selectFields = {};
    if (search) {
      selectFields.score = { $meta: 'textScore' };
      sortObj.score = { $meta: 'textScore' };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .select(selectFields)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Track search if user is authenticated
    if (req.user && search) {
      const user = await User.findById(req.user.userId);
      if (user) {
        await user.addSearchHistory(search, products.length);
      }
    }

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        filters: {
          category,
          subcategory,
          manufacturer,
          minPrice,
          maxPrice,
          minRating,
          onSale,
          featured,
          search
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all categories and subcategories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          subcategories: { $addToSet: '$subcategory' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const manufacturers = await Product.aggregate([
      {
        $group: {
          _id: '$manufacturer',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => ({
          name: cat._id,
          subcategories: cat.subcategories.sort(),
          productCount: cat.count,
          avgPrice: Math.round(cat.avgPrice * 100) / 100,
          avgRating: Math.round(cat.avgRating * 10) / 10
        })),
        manufacturers: manufacturers.map(mfg => ({
          name: mfg._id,
          productCount: mfg.count,
          categories: mfg.categories
        }))
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.getFeatured(limit);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products'
    });
  }
});

// @route   GET /api/products/trending
// @desc    Get trending products
// @access  Public
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.getTrending(limit);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending products'
    });
  }
});

// @route   GET /api/products/sale
// @desc    Get products on sale
// @access  Public
router.get('/sale', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.getOnSale(limit);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get sale products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sale products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        errors: errors.array()
      });
    }

    const productId = parseInt(req.params.id);
    const product = await Product.findOne({ product_id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementAnalytics('views');

    // Track user interaction if authenticated
    if (req.user) {
      const user = await User.findById(req.user.userId);
      if (user) {
        await user.addInteraction(productId, 'view', {
          timestamp: new Date()
        });
      }
    }

    // Get similar products
    const similarProductIds = Array.from(product.similarity_scores.keys()).slice(0, 6);
    const similarProducts = await Product.find({
      product_id: { $in: similarProductIds.map(id => parseInt(id)) },
      quantity_in_stock: { $gt: 0 }
    }).limit(6);

    res.json({
      success: true,
      data: {
        product,
        similarProducts
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
});

// @route   POST /api/products/:id/like
// @desc    Like/unlike a product
// @access  Private
router.post('/:id/like', [
  param('id').isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        errors: errors.array()
      });
    }

    const productId = parseInt(req.params.id);
    const product = await Product.findOne({ product_id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user.userId);
    const isLiked = user.likedProducts.includes(productId);

    if (isLiked) {
      // Unlike
      user.likedProducts = user.likedProducts.filter(id => id !== productId);
      await product.incrementAnalytics('likes', -1);
    } else {
      // Like
      user.likedProducts.push(productId);
      await product.incrementAnalytics('likes', 1);
      await user.addInteraction(productId, 'like');
    }

    await user.save();

    res.json({
      success: true,
      message: isLiked ? 'Product unliked' : 'Product liked',
      data: {
        isLiked: !isLiked,
        totalLikes: product.analytics.likes + (isLiked ? -1 : 1)
      }
    });

  } catch (error) {
    console.error('Like product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking product'
    });
  }
});

// @route   POST /api/products/:id/purchase
// @desc    Record a product purchase
// @access  Private
router.post('/:id/purchase', [
  param('id').isInt({ min: 1 }).withMessage('Product ID must be a positive integer')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        errors: errors.array()
      });
    }

    const productId = parseInt(req.params.id);
    const { rating } = req.body;

    const product = await Product.findOne({ product_id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user.userId);
    
    // Add to purchased products
    user.purchasedProducts.push({
      productId,
      purchaseDate: new Date(),
      rating: rating || null
    });

    // Add interaction
    await user.addInteraction(productId, 'purchase', { rating });
    
    // Update product analytics
    await product.incrementAnalytics('purchases');
    await product.updateConversionRate();

    await user.save();

    res.json({
      success: true,
      message: 'Purchase recorded successfully'
    });

  } catch (error) {
    console.error('Record purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording purchase'
    });
  }
});

module.exports = router;