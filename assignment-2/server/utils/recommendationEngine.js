const Product = require('../models/Product');
const User = require('../models/User');
const { Matrix } = require('ml-matrix');
const natural = require('natural');
const _ = require('lodash');

class RecommendationEngine {
  constructor() {
    this.tfidf = new natural.TfIdf();
  }

  /**
   * Hybrid recommendation system combining collaborative and content-based filtering
   */
  async getHybridRecommendations(userId, limit = 20) {
    try {
      // Get recommendations from both algorithms
      const collaborativeRecs = await this.getCollaborativeRecommendations(userId, Math.ceil(limit * 0.6));
      const contentRecs = await this.getContentBasedRecommendations(userId, Math.ceil(limit * 0.6));
      
      // Combine and weight the recommendations
      const combinedRecs = new Map();
      
      // Add collaborative filtering results with higher weight
      collaborativeRecs.forEach(rec => {
        combinedRecs.set(rec.product_id, {
          ...rec,
          hybridScore: rec.score * 0.6,
          sources: ['collaborative']
        });
      });
      
      // Add content-based results
      contentRecs.forEach(rec => {
        if (combinedRecs.has(rec.product_id)) {
          const existing = combinedRecs.get(rec.product_id);
          existing.hybridScore += rec.score * 0.4;
          existing.sources.push('content');
        } else {
          combinedRecs.set(rec.product_id, {
            ...rec,
            hybridScore: rec.score * 0.4,
            sources: ['content']
          });
        }
      });
      
      // Sort by hybrid score and return top results
      return Array.from(combinedRecs.values())
        .sort((a, b) => b.hybridScore - a.hybridScore)
        .slice(0, limit)
        .map(rec => ({
          ...rec,
          score: rec.hybridScore,
          recommendationType: 'hybrid'
        }));
        
    } catch (error) {
      console.error('Hybrid recommendations error:', error);
      // Fallback to content-based if collaborative fails
      return this.getContentBasedRecommendations(userId, limit);
    }
  }

  /**
   * Collaborative filtering based on user-item interactions
   */
  async getCollaborativeRecommendations(userId, limit = 20) {
    try {
      const user = await User.findById(userId);
      if (!user || user.interactions.length === 0) {
        return this.getPopularityBasedRecommendations(limit);
      }

      // Get user's interaction history
      const userInteractions = user.interactions.filter(i => 
        ['like', 'purchase', 'view'].includes(i.type)
      );
      
      if (userInteractions.length === 0) {
        return this.getPopularityBasedRecommendations(limit);
      }

      // Find similar users based on interaction patterns
      const similarUsers = await this.findSimilarUsers(userId, userInteractions);
      
      if (similarUsers.length === 0) {
        return this.getContentBasedRecommendations(userId, limit);
      }

      // Get recommendations from similar users
      const recommendations = await this.getRecommendationsFromSimilarUsers(
        userId, 
        similarUsers, 
        limit
      );

      return recommendations.map(rec => ({
        ...rec,
        recommendationType: 'collaborative'
      }));

    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return this.getPopularityBasedRecommendations(limit);
    }
  }

  /**
   * Content-based filtering using product features and user preferences
   */
  async getContentBasedRecommendations(userId, limit = 20) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return this.getPopularityBasedRecommendations(limit);
      }

      // Build user profile from interactions and preferences
      const userProfile = await this.buildUserProfile(user);
      
      // Get all available products (excluding already interacted ones)
      const interactedProductIds = user.interactions.map(i => i.productId);
      const availableProducts = await Product.find({
        product_id: { $nin: interactedProductIds },
        quantity_in_stock: { $gt: 0 }
      });

      // Calculate content similarity scores
      const scoredProducts = await Promise.all(
        availableProducts.map(async product => {
          const score = await this.calculateContentSimilarity(userProfile, product);
          return {
            ...product.toObject(),
            score,
            recommendationType: 'content'
          };
        })
      );

      // Sort by score and return top results
      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Content-based filtering error:', error);
      return this.getPopularityBasedRecommendations(limit);
    }
  }

  /**
   * Find users with similar interaction patterns
   */
  async findSimilarUsers(userId, userInteractions, limit = 10) {
    try {
      // Get users who have interacted with similar products
      const userProductIds = userInteractions.map(i => i.productId);
      
      const similarUsers = await User.aggregate([
        {
          $match: {
            _id: { $ne: userId },
            'interactions.productId': { $in: userProductIds }
          }
        },
        {
          $addFields: {
            commonProducts: {
              $size: {
                $setIntersection: [
                  '$interactions.productId',
                  userProductIds
                ]
              }
            },
            totalInteractions: { $size: '$interactions' }
          }
        },
        {
          $match: {
            commonProducts: { $gte: 2 }, // At least 2 common products
            totalInteractions: { $gte: 5 } // At least 5 total interactions
          }
        },
        {
          $addFields: {
            similarity: {
              $divide: [
                '$commonProducts',
                { $add: [userProductIds.length, '$totalInteractions'] }
              ]
            }
          }
        },
        { $sort: { similarity: -1 } },
        { $limit: limit }
      ]);

      return similarUsers;
    } catch (error) {
      console.error('Find similar users error:', error);
      return [];
    }
  }

  /**
   * Get recommendations from similar users' interactions
   */
  async getRecommendationsFromSimilarUsers(userId, similarUsers, limit) {
    try {
      const user = await User.findById(userId);
      const userProductIds = user.interactions.map(i => i.productId);
      
      // Collect product recommendations from similar users
      const productScores = new Map();
      
      for (const similarUser of similarUsers) {
        const weight = similarUser.similarity;
        
        // Get highly rated interactions from similar user
        const positiveInteractions = similarUser.interactions.filter(i => 
          ['like', 'purchase'].includes(i.type) && 
          !userProductIds.includes(i.productId)
        );
        
        positiveInteractions.forEach(interaction => {
          const productId = interaction.productId;
          const interactionWeight = interaction.type === 'purchase' ? 2 : 1;
          const score = weight * interactionWeight;
          
          if (productScores.has(productId)) {
            productScores.set(productId, productScores.get(productId) + score);
          } else {
            productScores.set(productId, score);
          }
        });
      }
      
      // Get product details and sort by score
      const productIds = Array.from(productScores.keys()).slice(0, limit * 2);
      const products = await Product.find({
        product_id: { $in: productIds },
        quantity_in_stock: { $gt: 0 }
      });
      
      return products
        .map(product => ({
          ...product.toObject(),
          score: productScores.get(product.product_id) || 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Get recommendations from similar users error:', error);
      return [];
    }
  }

  /**
   * Build user profile from interactions and preferences
   */
  async buildUserProfile(user) {
    const profile = {
      categories: new Map(),
      subcategories: new Map(),
      manufacturers: new Map(),
      priceRange: { min: Infinity, max: 0 },
      avgRating: 0,
      keywords: new Map()
    };

    // Analyze user interactions
    const productIds = user.interactions
      .filter(i => ['like', 'purchase', 'view'].includes(i.type))
      .map(i => i.productId);
    
    if (productIds.length === 0) {
      return profile;
    }

    const interactedProducts = await Product.find({
      product_id: { $in: productIds }
    });

    let totalRating = 0;
    let ratingCount = 0;

    interactedProducts.forEach(product => {
      // Count categories
      const categoryCount = profile.categories.get(product.category) || 0;
      profile.categories.set(product.category, categoryCount + 1);
      
      // Count subcategories
      const subcategoryCount = profile.subcategories.get(product.subcategory) || 0;
      profile.subcategories.set(product.subcategory, subcategoryCount + 1);
      
      // Count manufacturers
      const manufacturerCount = profile.manufacturers.get(product.manufacturer) || 0;
      profile.manufacturers.set(product.manufacturer, manufacturerCount + 1);
      
      // Update price range
      profile.priceRange.min = Math.min(profile.priceRange.min, product.price);
      profile.priceRange.max = Math.max(profile.priceRange.max, product.price);
      
      // Accumulate ratings
      totalRating += product.rating;
      ratingCount++;
      
      // Extract keywords from product names and descriptions
      const text = `${product.product_name} ${product.description}`.toLowerCase();
      const words = text.split(/\W+/).filter(word => word.length > 3);
      words.forEach(word => {
        const count = profile.keywords.get(word) || 0;
        profile.keywords.set(word, count + 1);
      });
    });

    profile.avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    
    // Include explicit preferences
    if (user.preferences) {
      user.preferences.categories?.forEach(category => {
        const count = profile.categories.get(category) || 0;
        profile.categories.set(category, count + 2); // Higher weight for explicit preferences
      });
    }

    return profile;
  }

  /**
   * Calculate content similarity between user profile and product
   */
  async calculateContentSimilarity(userProfile, product) {
    let score = 0;
    
    // Category similarity (30% weight)
    const categoryScore = (userProfile.categories.get(product.category) || 0) / 
      Math.max(1, Math.max(...userProfile.categories.values()));
    score += categoryScore * 0.3;
    
    // Subcategory similarity (20% weight)
    const subcategoryScore = (userProfile.subcategories.get(product.subcategory) || 0) / 
      Math.max(1, Math.max(...userProfile.subcategories.values()));
    score += subcategoryScore * 0.2;
    
    // Manufacturer similarity (15% weight)
    const manufacturerScore = (userProfile.manufacturers.get(product.manufacturer) || 0) / 
      Math.max(1, Math.max(...userProfile.manufacturers.values()));
    score += manufacturerScore * 0.15;
    
    // Price similarity (15% weight)
    if (userProfile.priceRange.min !== Infinity) {
      const priceRange = userProfile.priceRange.max - userProfile.priceRange.min;
      const priceDiff = Math.abs(product.price - (userProfile.priceRange.min + userProfile.priceRange.max) / 2);
      const priceScore = Math.max(0, 1 - (priceDiff / Math.max(priceRange, product.price)));
      score += priceScore * 0.15;
    }
    
    // Rating similarity (10% weight)
    if (userProfile.avgRating > 0) {
      const ratingDiff = Math.abs(product.rating - userProfile.avgRating);
      const ratingScore = Math.max(0, 1 - (ratingDiff / 5));
      score += ratingScore * 0.1;
    }
    
    // Text similarity (10% weight)
    const textScore = this.calculateTextSimilarity(userProfile.keywords, product);
    score += textScore * 0.1;
    
    // Boost for high-rated products
    score *= (1 + (product.rating / 10));
    
    // Boost for popular products
    score *= (1 + (product.analytics.views / 10000));
    
    return score;
  }

  /**
   * Calculate text similarity using keyword matching
   */
  calculateTextSimilarity(userKeywords, product) {
    const productText = `${product.product_name} ${product.description}`.toLowerCase();
    const productWords = productText.split(/\W+/).filter(word => word.length > 3);
    
    let matchScore = 0;
    let totalUserKeywords = 0;
    
    userKeywords.forEach((count, keyword) => {
      totalUserKeywords += count;
      if (productWords.includes(keyword)) {
        matchScore += count;
      }
    });
    
    return totalUserKeywords > 0 ? matchScore / totalUserKeywords : 0;
  }

  /**
   * Get similar products based on pre-computed similarity scores
   */
  async getSimilarProducts(productId, limit = 10) {
    try {
      const product = await Product.findOne({ product_id: productId });
      if (!product || !product.similarity_scores) {
        return [];
      }

      // Get similar product IDs and scores
      const similarProductIds = Array.from(product.similarity_scores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id, score]) => ({ id: parseInt(id), score }));

      // Fetch product details
      const products = await Product.find({
        product_id: { $in: similarProductIds.map(p => p.id) },
        quantity_in_stock: { $gt: 0 }
      });

      // Add similarity scores
      return products.map(product => {
        const similarityData = similarProductIds.find(p => p.id === product.product_id);
        return {
          ...product.toObject(),
          score: similarityData?.score || 0,
          recommendationType: 'similar'
        };
      }).sort((a, b) => b.score - a.score);

    } catch (error) {
      console.error('Get similar products error:', error);
      return [];
    }
  }

  /**
   * Get trending recommendations based on recent activity
   */
  async getTrendingRecommendations(limit = 20, timeframe = '7d') {
    try {
      const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const trendingProducts = await Product.aggregate([
        {
          $match: {
            quantity_in_stock: { $gt: 0 },
            updatedAt: { $gte: cutoffDate }
          }
        },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: ['$analytics.views', 0.3] },
                { $multiply: ['$analytics.likes', 0.4] },
                { $multiply: ['$analytics.purchases', 0.3] },
                { $multiply: ['$rating', 10] }
              ]
            }
          }
        },
        { $sort: { trendingScore: -1 } },
        { $limit: limit }
      ]);

      return trendingProducts.map(product => ({
        ...product,
        score: product.trendingScore,
        recommendationType: 'trending'
      }));

    } catch (error) {
      console.error('Get trending recommendations error:', error);
      return [];
    }
  }

  /**
   * Get category-based recommendations
   */
  async getCategoryRecommendations(category, subcategory = null, limit = 20) {
    try {
      const query = {
        category,
        quantity_in_stock: { $gt: 0 }
      };
      
      if (subcategory) {
        query.subcategory = subcategory;
      }

      const products = await Product.find(query)
        .sort({ 
          rating: -1, 
          'analytics.views': -1,
          'analytics.purchases': -1
        })
        .limit(limit);

      return products.map(product => ({
        ...product.toObject(),
        score: product.rating + (product.analytics.views / 1000),
        recommendationType: 'category'
      }));

    } catch (error) {
      console.error('Get category recommendations error:', error);
      return [];
    }
  }

  /**
   * Fallback to popularity-based recommendations
   */
  async getPopularityBasedRecommendations(limit = 20) {
    try {
      const products = await Product.find({
        quantity_in_stock: { $gt: 0 }
      })
      .sort({ 
        rating: -1,
        'analytics.views': -1,
        'analytics.purchases': -1
      })
      .limit(limit);

      return products.map(product => ({
        ...product.toObject(),
        score: product.rating + (product.analytics.views / 1000),
        recommendationType: 'popular'
      }));

    } catch (error) {
      console.error('Get popularity-based recommendations error:', error);
      return [];
    }
  }

  /**
   * Process user feedback to improve recommendations
   */
  async processFeedback(userId, productId, feedback, recommendationType) {
    try {
      // This could be used to train ML models or adjust recommendation weights
      // For now, we'll just log the feedback
      console.log(`Feedback received: User ${userId}, Product ${productId}, Feedback: ${feedback}, Type: ${recommendationType}`);
      
      // In a production system, you might:
      // 1. Store feedback in a separate collection
      // 2. Use it to retrain recommendation models
      // 3. Adjust similarity scores based on feedback patterns
      
    } catch (error) {
      console.error('Process feedback error:', error);
    }
  }

  /**
   * Get recommendation system statistics
   */
  async getRecommendationStats() {
    try {
      const totalProducts = await Product.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalInteractions = await User.aggregate([
        { $unwind: '$interactions' },
        { $count: 'total' }
      ]);

      const topCategories = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            totalViews: { $sum: '$analytics.views' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        totalProducts,
        totalUsers,
        totalInteractions: totalInteractions[0]?.total || 0,
        topCategories,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Get recommendation stats error:', error);
      return null;
    }
  }

  /**
   * Get user's recommendation profile
   */
  async getUserRecommendationProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const profile = await this.buildUserProfile(user);
      
      return {
        topCategories: Array.from(profile.categories.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([category, count]) => ({ category, count })),
        topManufacturers: Array.from(profile.manufacturers.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([manufacturer, count]) => ({ manufacturer, count })),
        priceRange: profile.priceRange,
        avgRating: profile.avgRating,
        interactionCount: user.interactions.length,
        lastActivity: user.interactions.length > 0 ? 
          Math.max(...user.interactions.map(i => new Date(i.timestamp).getTime())) : null
      };

    } catch (error) {
      console.error('Get user recommendation profile error:', error);
      return null;
    }
  }
}

module.exports = RecommendationEngine;