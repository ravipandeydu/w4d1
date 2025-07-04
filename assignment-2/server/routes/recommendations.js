const express = require('express');
const { query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const RecommendationEngine = require('../utils/recommendationEngine');

const router = express.Router();

// @route   GET /api/recommendations/personalized
// @desc    Get personalized recommendations for authenticated user
// @access  Private
router.get('/personalized', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('algorithm').optional().isIn(['collaborative', 'content', 'hybrid']).withMessage('Invalid algorithm type')
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

    const { limit = 20, algorithm = 'hybrid' } = req.query;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let recommendations = [];
    const engine = new RecommendationEngine();

    switch (algorithm) {
      case 'collaborative':
        recommendations = await engine.getCollaborativeRecommendations(userId, parseInt(limit));
        break;
      case 'content':
        recommendations = await engine.getContentBasedRecommendations(userId, parseInt(limit));
        break;
      case 'hybrid':
      default:
        recommendations = await engine.getHybridRecommendations(userId, parseInt(limit));
        break;
    }

    res.json({
      success: true,
      data: {
        recommendations,
        algorithm,
        userId,
        totalRecommendations: recommendations.length
      }
    });

  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating recommendations'
    });
  }
});

// @route   GET /api/recommendations/similar/:productId
// @desc    Get products similar to a specific product
// @access  Public
router.get('/similar/:productId', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productId = parseInt(req.params.productId);
    const { limit = 10 } = req.query;

    const product = await Product.findOne({ product_id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const engine = new RecommendationEngine();
    const similarProducts = await engine.getSimilarProducts(productId, parseInt(limit));

    res.json({
      success: true,
      data: {
        baseProduct: {
          id: product.product_id,
          name: product.product_name,
          category: product.category
        },
        similarProducts,
        totalSimilar: similarProducts.length
      }
    });

  } catch (error) {
    console.error('Similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while finding similar products'
    });
  }
});

// @route   GET /api/recommendations/trending
// @desc    Get trending recommendations based on recent user activity
// @access  Public
router.get('/trending', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('timeframe').optional().isIn(['1d', '7d', '30d']).withMessage('Invalid timeframe')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { limit = 20, timeframe = '7d' } = req.query;
    const engine = new RecommendationEngine();
    
    const trendingProducts = await engine.getTrendingRecommendations(parseInt(limit), timeframe);

    res.json({
      success: true,
      data: {
        trendingProducts,
        timeframe,
        totalTrending: trendingProducts.length
      }
    });

  } catch (error) {
    console.error('Trending recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending recommendations'
    });
  }
});

// @route   GET /api/recommendations/category/:category
// @desc    Get recommendations within a specific category
// @access  Public
router.get('/category/:category', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('subcategory').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { category } = req.params;
    const { limit = 20, subcategory } = req.query;
    
    const engine = new RecommendationEngine();
    const categoryRecommendations = await engine.getCategoryRecommendations(
      category, 
      subcategory, 
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        category,
        subcategory,
        recommendations: categoryRecommendations,
        totalRecommendations: categoryRecommendations.length
      }
    });

  } catch (error) {
    console.error('Category recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category recommendations'
    });
  }
});

// @route   POST /api/recommendations/feedback
// @desc    Provide feedback on recommendations to improve future suggestions
// @access  Private
router.post('/feedback', auth, async (req, res) => {
  try {
    const { productId, feedback, recommendationType } = req.body;

    if (!productId || !feedback || !['positive', 'negative', 'neutral'].includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback data'
      });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Store feedback as interaction
    await user.addInteraction(parseInt(productId), 'feedback', {
      feedback,
      recommendationType,
      timestamp: new Date()
    });

    // Update recommendation engine with feedback (could be used for ML model training)
    const engine = new RecommendationEngine();
    await engine.processFeedback(userId, parseInt(productId), feedback, recommendationType);

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    console.error('Recommendation feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing feedback'
    });
  }
});

// @route   GET /api/recommendations/stats
// @desc    Get recommendation system statistics
// @access  Private (Admin only - simplified for demo)
router.get('/stats', auth, async (req, res) => {
  try {
    const engine = new RecommendationEngine();
    const stats = await engine.getRecommendationStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Recommendation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendation stats'
    });
  }
});

// @route   GET /api/recommendations/user-profile
// @desc    Get user's recommendation profile and preferences
// @access  Private
router.get('/user-profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const engine = new RecommendationEngine();
    const userProfile = await engine.getUserRecommendationProfile(userId);

    res.json({
      success: true,
      data: {
        userId,
        profile: userProfile,
        preferences: user.preferences,
        interactionCount: user.interactions.length,
        likedProductsCount: user.likedProducts.length,
        purchasedProductsCount: user.purchasedProducts.length
      }
    });

  } catch (error) {
    console.error('User recommendation profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user recommendation profile'
    });
  }
});

module.exports = router;