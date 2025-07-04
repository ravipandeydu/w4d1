import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  SET_LOADING: 'SET_LOADING'
};

// Initial State
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false
};

// Helper function to calculate totals
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product_id === product.product_id
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem = {
          product_id: product.product_id,
          product_name: product.product_name,
          price: product.price,
          image_url: product.image_url,
          category: product.category,
          manufacturer: product.manufacturer,
          quantity,
          addedAt: new Date().toISOString()
        };
        newItems = [...state.items, newItem];
      }
      
      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case CART_ACTIONS.REMOVE_ITEM: {
      const productId = action.payload;
      const newItems = state.items.filter(item => item.product_id !== productId);
      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const newItems = state.items.filter(item => item.product_id !== productId);
        const totals = calculateTotals(newItems);
        return {
          ...state,
          items: newItems,
          ...totals
        };
      }
      
      const newItems = state.items.map(item => 
        item.product_id === productId 
          ? { ...item, quantity }
          : item
      );
      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    
    case CART_ACTIONS.LOAD_CART: {
      const items = action.payload || [];
      const totals = calculateTotals(items);
      return {
        ...state,
        items,
        ...totals
      };
    }
    
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated]);

  // Add item to cart
  const addItem = (product, quantity = 1) => {
    if (!product || !product.product_id) {
      console.error('Invalid product data');
      return false;
    }

    if (quantity <= 0) {
      console.error('Quantity must be greater than 0');
      return false;
    }

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity }
    });
    
    return true;
  };

  // Remove item from cart
  const removeItem = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: productId
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  };

  // Increment item quantity
  const incrementQuantity = (productId) => {
    const item = state.items.find(item => item.product_id === productId);
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  // Decrement item quantity
  const decrementQuantity = (productId) => {
    const item = state.items.find(item => item.product_id === productId);
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      removeItem(productId);
    }
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product_id === productId);
  };

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  // Get cart item by product ID
  const getCartItem = (productId) => {
    return state.items.find(item => item.product_id === productId);
  };

  // Get cart summary
  const getCartSummary = () => {
    return {
      itemCount: state.totalItems,
      totalPrice: state.totalPrice,
      isEmpty: state.items.length === 0,
      items: state.items
    };
  };

  // Calculate shipping (mock implementation)
  const calculateShipping = () => {
    if (state.totalPrice >= 100) {
      return 0; // Free shipping over $100
    }
    return 10; // $10 shipping fee
  };

  // Calculate tax (mock implementation)
  const calculateTax = (taxRate = 0.08) => {
    return state.totalPrice * taxRate;
  };

  // Get order total including shipping and tax
  const getOrderTotal = (taxRate = 0.08) => {
    const shipping = calculateShipping();
    const tax = calculateTax(taxRate);
    return state.totalPrice + shipping + tax;
  };

  // Validate cart items (check stock, prices, etc.)
  const validateCart = async () => {
    // This would typically make API calls to validate each item
    // For now, we'll just return a simple validation
    const invalidItems = [];
    
    state.items.forEach(item => {
      if (item.quantity <= 0) {
        invalidItems.push({
          productId: item.product_id,
          reason: 'Invalid quantity'
        });
      }
    });
    
    return {
      isValid: invalidItems.length === 0,
      invalidItems
    };
  };

  // Get cart statistics
  const getCartStats = () => {
    const categories = {};
    const manufacturers = {};
    
    state.items.forEach(item => {
      // Count by category
      categories[item.category] = (categories[item.category] || 0) + item.quantity;
      
      // Count by manufacturer
      manufacturers[item.manufacturer] = (manufacturers[item.manufacturer] || 0) + item.quantity;
    });
    
    return {
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
      uniqueItems: state.items.length,
      categories,
      manufacturers,
      averageItemPrice: state.items.length > 0 ? state.totalPrice / state.totalItems : 0
    };
  };

  // Context value
  const value = {
    // State
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    loading: state.loading,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    
    // Utilities
    isInCart,
    getItemQuantity,
    getCartItem,
    getCartSummary,
    calculateShipping,
    calculateTax,
    getOrderTotal,
    validateCart,
    getCartStats
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// HOC for components that need cart functionality
export const withCart = (Component) => {
  return function CartComponent(props) {
    const cart = useCart();
    return <Component {...props} cart={cart} />;
  };
};

export default CartContext;