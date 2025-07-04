const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  preferences: {
    categories: [{
      type: String,
      trim: true
    }],
    priceRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 10000
      }
    },
    brands: [{
      type: String,
      trim: true
    }]
  },
  interactions: [{
    productId: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['view', 'like', 'purchase', 'cart_add', 'search'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      searchQuery: String,
      duration: Number, // for view interactions
      rating: Number // for purchase interactions
    }
  }],
  searchHistory: [{
    query: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    resultsCount: Number
  }],
  likedProducts: [{
    type: Number
  }],
  purchasedProducts: [{
    productId: {
      type: Number,
      required: true
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'interactions.productId': 1 });
userSchema.index({ 'interactions.type': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add interaction method
userSchema.methods.addInteraction = function(productId, type, metadata = {}) {
  this.interactions.push({
    productId,
    type,
    metadata,
    timestamp: new Date()
  });
  
  // Keep only last 1000 interactions
  if (this.interactions.length > 1000) {
    this.interactions = this.interactions.slice(-1000);
  }
  
  return this.save();
};

// Add search to history
userSchema.methods.addSearchHistory = function(query, resultsCount) {
  this.searchHistory.push({
    query,
    resultsCount,
    timestamp: new Date()
  });
  
  // Keep only last 100 searches
  if (this.searchHistory.length > 100) {
    this.searchHistory = this.searchHistory.slice(-100);
  }
  
  return this.save();
};

// Get user preferences based on interactions
userSchema.methods.getImplicitPreferences = function() {
  const categoryCount = {};
  const brandCount = {};
  
  this.interactions.forEach(interaction => {
    // This would need product data to extract category/brand
    // Implementation would require joining with product data
  });
  
  return {
    topCategories: Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a]).slice(0, 5),
    topBrands: Object.keys(brandCount).sort((a, b) => brandCount[b] - brandCount[a]).slice(0, 5)
  };
};

module.exports = mongoose.model('User', userSchema);