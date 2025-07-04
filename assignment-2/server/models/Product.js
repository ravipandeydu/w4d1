const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
    unique: true
  },
  product_name: {
    type: String,
    required: true,
    trim: true,
    index: 'text'
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity_in_stock: {
    type: Number,
    required: true,
    min: 0
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    index: 'text'
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    type: String,
    trim: true
  },
  release_date: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  is_featured: {
    type: Boolean,
    default: false,
    index: true
  },
  is_on_sale: {
    type: Boolean,
    default: false,
    index: true
  },
  sale_price: {
    type: Number,
    min: 0
  },
  image_url: {
    type: String,
    required: true
  },
  // Additional fields for recommendation system
  tags: [{
    type: String,
    trim: true
  }],
  features: [{
    name: String,
    value: String
  }],
  // Analytics data
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    cart_adds: {
      type: Number,
      default: 0
    },
    average_view_duration: {
      type: Number,
      default: 0
    },
    conversion_rate: {
      type: Number,
      default: 0
    }
  },
  // Recommendation scores (computed)
  similarity_scores: {
    type: Map,
    of: Number,
    default: new Map()
  },
  // Search optimization
  search_keywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Compound indexes for better query performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1, rating: -1 });
productSchema.index({ is_featured: 1, rating: -1 });
productSchema.index({ is_on_sale: 1, price: 1 });
productSchema.index({ manufacturer: 1, category: 1 });
productSchema.index({ 'analytics.views': -1 });
productSchema.index({ 'analytics.purchases': -1 });

// Text search index
productSchema.index({
  product_name: 'text',
  description: 'text',
  category: 'text',
  subcategory: 'text',
  manufacturer: 'text'
}, {
  weights: {
    product_name: 10,
    category: 5,
    subcategory: 3,
    manufacturer: 2,
    description: 1
  }
});

// Virtual for effective price (considering sale)
productSchema.virtual('effective_price').get(function() {
  return this.is_on_sale && this.sale_price < this.price ? this.sale_price : this.price;
});

// Virtual for discount percentage
productSchema.virtual('discount_percentage').get(function() {
  if (this.is_on_sale && this.sale_price < this.price) {
    return Math.round(((this.price - this.sale_price) / this.price) * 100);
  }
  return 0;
});

// Method to increment analytics
productSchema.methods.incrementAnalytics = function(type, value = 1) {
  if (this.analytics[type] !== undefined) {
    this.analytics[type] += value;
    return this.save();
  }
  throw new Error(`Invalid analytics type: ${type}`);
};

// Method to update conversion rate
productSchema.methods.updateConversionRate = function() {
  if (this.analytics.views > 0) {
    this.analytics.conversion_rate = (this.analytics.purchases / this.analytics.views) * 100;
  }
  return this.save();
};

// Static method to get trending products
productSchema.statics.getTrending = function(limit = 10) {
  return this.find({
    quantity_in_stock: { $gt: 0 }
  })
  .sort({ 
    'analytics.views': -1, 
    'analytics.purchases': -1,
    rating: -1 
  })
  .limit(limit);
};

// Static method to get featured products
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({
    is_featured: true,
    quantity_in_stock: { $gt: 0 }
  })
  .sort({ rating: -1, 'analytics.views': -1 })
  .limit(limit);
};

// Static method to get products on sale
productSchema.statics.getOnSale = function(limit = 10) {
  return this.find({
    is_on_sale: true,
    quantity_in_stock: { $gt: 0 }
  })
  .sort({ 
    discount_percentage: -1,
    rating: -1 
  })
  .limit(limit);
};

// Static method for advanced search
productSchema.statics.advancedSearch = function(query, filters = {}) {
  const searchQuery = { quantity_in_stock: { $gt: 0 } };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Category filter
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    searchQuery.price = {};
    if (filters.minPrice) searchQuery.price.$gte = filters.minPrice;
    if (filters.maxPrice) searchQuery.price.$lte = filters.maxPrice;
  }
  
  // Rating filter
  if (filters.minRating) {
    searchQuery.rating = { $gte: filters.minRating };
  }
  
  // Manufacturer filter
  if (filters.manufacturer) {
    searchQuery.manufacturer = filters.manufacturer;
  }
  
  // Sale filter
  if (filters.onSale) {
    searchQuery.is_on_sale = true;
  }
  
  let queryBuilder = this.find(searchQuery);
  
  // Add text score for sorting if text search is used
  if (query) {
    queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } });
  }
  
  return queryBuilder;
};

module.exports = mongoose.model('Product', productSchema);