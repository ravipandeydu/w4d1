const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile with interaction history
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get interaction statistics
    const interactionStats = {
      totalInteractions: user.interactions.length,
      views: user.interactions.filter(i => i.type === 'view').length,
      likes: user.interactions.filter(i => i.type === 'like').length,
      purchases: user.interactions.filter(i => i.type === 'purchase').length,
      searches: user.interactions.filter(i => i.type === 'search').length
    };

    // Get recent interactions with product details
    const recentInteractionIds = user.interactions
      .slice(-10)
      .map(i => i.productId);
    
    const recentProducts = await Product.find({
      product_id: { $in: recentInteractionIds }
    }).select('product_id product_name category price image_url rating');

    const recentInteractions = user.interactions
      .slice(-10)
      .map(interaction => {
        const product = recentProducts.find(p => p.product_id === interaction.productId);
        return {
          ...interaction.toObject(),
          product
        };
      })
      .reverse();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        stats: interactionStats,
        recentInteractions,
        likedProductsCount: user.likedProducts.length,
        purchasedProductsCount: user.purchasedProducts.length,
        searchHistoryCount: user.searchHistory.length
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  body('categories').optional().isArray().withMessage('Categories must be an array'),
  body('categories.*').optional().isString().trim().withMessage('Each category must be a string'),
  body('priceRange.min').optional().isNumeric().withMessage('Minimum price must be a number'),
  body('priceRange.max').optional().isNumeric().withMessage('Maximum price must be a number'),
  body('brands').optional().isArray().withMessage('Brands must be an array'),
  body('brands.*').optional().isString().trim().withMessage('Each brand must be a string')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { categories, priceRange, brands } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (categories !== undefined) {
      user.preferences.categories = categories;
    }
    if (priceRange !== undefined) {
      user.preferences.priceRange = {
        min: priceRange.min || 0,
        max: priceRange.max || 10000
      };
    }
    if (brands !== undefined) {
      user.preferences.brands = brands;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences'
    });
  }
});

// @route   GET /api/users/liked-products
// @desc    Get user's liked products
// @access  Private
router.get('/liked-products', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const likedProductIds = user.likedProducts.slice(skip, skip + parseInt(limit));
    
    const likedProducts = await Product.find({
      product_id: { $in: likedProductIds }
    });

    // Maintain the order of liked products
    const orderedProducts = likedProductIds.map(id => 
      likedProducts.find(product => product.product_id === id)
    ).filter(Boolean);

    const totalLiked = user.likedProducts.length;
    const totalPages = Math.ceil(totalLiked / parseInt(limit));

    res.json({
      success: true,
      data: {
        products: orderedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: totalLiked,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get liked products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching liked products'
    });
  }
});

// @route   GET /api/users/purchase-history
// @desc    Get user's purchase history
// @access  Private
router.get('/purchase-history', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const purchaseHistory = user.purchasedProducts
      .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
      .slice(skip, skip + parseInt(limit));
    
    const productIds = purchaseHistory.map(p => p.productId);
    const products = await Product.find({
      product_id: { $in: productIds }
    });

    const purchaseHistoryWithProducts = purchaseHistory.map(purchase => {
      const product = products.find(p => p.product_id === purchase.productId);
      return {
        ...purchase.toObject(),
        product
      };
    });

    const totalPurchases = user.purchasedProducts.length;
    const totalPages = Math.ceil(totalPurchases / parseInt(limit));

    res.json({
      success: true,
      data: {
        purchases: purchaseHistoryWithProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPurchases,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get purchase history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching purchase history'
    });
  }
});

// @route   GET /api/users/search-history
// @desc    Get user's search history
// @access  Private
router.get('/search-history', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { limit = 50 } = req.query;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const searchHistory = user.searchHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    // Get popular search terms
    const searchTerms = user.searchHistory.map(s => s.query);
    const termFrequency = {};
    searchTerms.forEach(term => {
      termFrequency[term] = (termFrequency[term] || 0) + 1;
    });

    const popularTerms = Object.entries(termFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));

    res.json({
      success: true,
      data: {
        searchHistory,
        popularTerms,
        totalSearches: user.searchHistory.length
      }
    });

  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching search history'
    });
  }
});

// @route   DELETE /api/users/search-history
// @desc    Clear user's search history
// @access  Private
router.delete('/search-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.searchHistory = [];
    await user.save();

    res.json({
      success: true,
      message: 'Search history cleared successfully'
    });

  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing search history'
    });
  }
});

// @route   GET /api/users/interaction-stats
// @desc    Get detailed user interaction statistics
// @access  Private
router.get('/interaction-stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate interaction statistics
    const stats = {
      totalInteractions: user.interactions.length,
      byType: {},
      byCategory: {},
      byMonth: {},
      recentActivity: []
    };

    // Group by interaction type
    user.interactions.forEach(interaction => {
      stats.byType[interaction.type] = (stats.byType[interaction.type] || 0) + 1;
      
      // Group by month
      const month = new Date(interaction.timestamp).toISOString().substring(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    // Get product categories for interactions
    const productIds = user.interactions.map(i => i.productId);
    const products = await Product.find({
      product_id: { $in: productIds }
    }).select('product_id category');

    const productCategoryMap = {};
    products.forEach(product => {
      productCategoryMap[product.product_id] = product.category;
    });

    // Group by category
    user.interactions.forEach(interaction => {
      const category = productCategoryMap[interaction.productId];
      if (category) {
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      }
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    stats.recentActivity = user.interactions
      .filter(i => new Date(i.timestamp) >= thirtyDaysAgo)
      .length;

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get interaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interaction statistics'
    });
  }
});

// @route   POST /api/users/interaction
// @desc    Record a user interaction
// @access  Private
router.post('/interaction', [
  body('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('type').isIn(['view', 'like', 'purchase', 'cart_add', 'search']).withMessage('Invalid interaction type'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, type, metadata = {} } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify product exists
    const product = await Product.findOne({ product_id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add interaction
    await user.addInteraction(productId, type, metadata);

    res.json({
      success: true,
      message: 'Interaction recorded successfully'
    });

  } catch (error) {
    console.error('Record interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording interaction'
    });
  }
});

module.exports = router;