const fs = require('fs').promises;
const path = require('path');
const Product = require('../models/Product');

const loadProductData = async () => {
  try {
    // Check if products already exist in database
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`📦 Products already loaded: ${existingCount} products in database`);
      return;
    }

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../products.json');
    const rawData = await fs.readFile(jsonPath, 'utf8');
    const products = JSON.parse(rawData);

    console.log(`📦 Loading ${products.length} products into database...`);

    // Process and enhance product data
    const enhancedProducts = products.map(product => {
      // Generate search keywords from product name and description
      const keywords = [
        ...product.product_name.toLowerCase().split(' '),
        ...product.description.toLowerCase().split(' '),
        product.category.toLowerCase(),
        product.subcategory.toLowerCase(),
        product.manufacturer.toLowerCase()
      ].filter(word => word.length > 2); // Filter out short words

      // Generate tags based on product attributes
      const tags = [];
      if (product.is_featured) tags.push('featured');
      if (product.is_on_sale) tags.push('sale');
      if (product.rating >= 4.5) tags.push('top-rated');
      if (product.rating <= 2.0) tags.push('low-rated');
      if (product.quantity_in_stock < 50) tags.push('limited-stock');
      if (product.price < 100) tags.push('budget-friendly');
      if (product.price > 800) tags.push('premium');

      return {
        ...product,
        search_keywords: [...new Set(keywords)], // Remove duplicates
        tags,
        analytics: {
          views: Math.floor(Math.random() * 1000), // Simulate some initial data
          likes: Math.floor(Math.random() * 100),
          purchases: Math.floor(Math.random() * 50),
          cart_adds: Math.floor(Math.random() * 150),
          average_view_duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
          conversion_rate: 0
        }
      };
    });

    // Calculate conversion rates
    enhancedProducts.forEach(product => {
      if (product.analytics.views > 0) {
        product.analytics.conversion_rate = 
          (product.analytics.purchases / product.analytics.views) * 100;
      }
    });

    // Insert products in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < enhancedProducts.length; i += batchSize) {
      const batch = enhancedProducts.slice(i, i + batchSize);
      await Product.insertMany(batch, { ordered: false });
      insertedCount += batch.length;
      console.log(`📦 Inserted ${insertedCount}/${enhancedProducts.length} products`);
    }

    console.log(`✅ Successfully loaded ${insertedCount} products into database`);
    
    // Generate similarity scores (basic implementation)
    await generateSimilarityScores();
    
  } catch (error) {
    console.error('❌ Error loading product data:', error);
    throw error;
  }
};

const generateSimilarityScores = async () => {
  try {
    console.log('🔄 Generating product similarity scores...');
    
    const products = await Product.find({}).select('product_id category subcategory manufacturer price rating');
    const similarityMap = new Map();

    // Simple similarity calculation based on category, price range, and rating
    for (let i = 0; i < products.length; i++) {
      const product1 = products[i];
      const similarities = new Map();

      for (let j = 0; j < products.length; j++) {
        if (i === j) continue;
        
        const product2 = products[j];
        let similarity = 0;

        // Category similarity (40% weight)
        if (product1.category === product2.category) {
          similarity += 0.4;
          if (product1.subcategory === product2.subcategory) {
            similarity += 0.2;
          }
        }

        // Manufacturer similarity (20% weight)
        if (product1.manufacturer === product2.manufacturer) {
          similarity += 0.2;
        }

        // Price similarity (20% weight)
        const priceDiff = Math.abs(product1.price - product2.price);
        const maxPrice = Math.max(product1.price, product2.price);
        const priceSimiliarity = 1 - (priceDiff / maxPrice);
        similarity += priceSimiliarity * 0.2;

        // Rating similarity (20% weight)
        const ratingDiff = Math.abs(product1.rating - product2.rating);
        const ratingSimiliarity = 1 - (ratingDiff / 5);
        similarity += ratingSimiliarity * 0.2;

        if (similarity > 0.3) { // Only store meaningful similarities
          similarities.set(product2.product_id.toString(), similarity);
        }
      }

      // Keep only top 20 similar products
      const sortedSimilarities = Array.from(similarities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

      similarityMap.set(product1.product_id, new Map(sortedSimilarities));
    }

    // Update products with similarity scores
    const updatePromises = Array.from(similarityMap.entries()).map(([productId, similarities]) => {
      return Product.updateOne(
        { product_id: productId },
        { similarity_scores: similarities }
      );
    });

    await Promise.all(updatePromises);
    console.log('✅ Similarity scores generated successfully');
    
  } catch (error) {
    console.error('❌ Error generating similarity scores:', error);
  }
};

const getProductStats = async () => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating' },
          featuredCount: { $sum: { $cond: ['$is_featured', 1, 0] } },
          onSaleCount: { $sum: { $cond: ['$is_on_sale', 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      general: stats[0] || {},
      categories: categoryStats
    };
  } catch (error) {
    console.error('Error getting product stats:', error);
    return null;
  }
};

module.exports = {
  loadProductData,
  generateSimilarityScores,
  getProductStats
};