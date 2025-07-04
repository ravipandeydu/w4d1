import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Create Notification Context
const NotificationContext = createContext();

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Notification Actions
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL'
};

// Initial State
const initialState = {
  notifications: []
};

// Generate unique ID for notifications
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Notification Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    
    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: []
      };
    
    default:
      return state;
  }
};

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = generateId();
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      title: '',
      message: '',
      duration: 5000, // 5 seconds default
      persistent: false,
      actions: [],
      ...notification,
      timestamp: new Date().toISOString()
    };

    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: newNotification
    });

    // Auto-remove notification after duration (if not persistent)
    if (!newNotification.persistent && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ALL });
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      title: options.title || 'Success',
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      title: options.title || 'Error',
      duration: options.duration || 8000, // Longer duration for errors
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      title: options.title || 'Warning',
      duration: options.duration || 6000,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      title: options.title || 'Info',
      ...options
    });
  }, [addNotification]);

  // Show loading notification
  const showLoading = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      title: options.title || 'Loading...',
      persistent: true,
      showSpinner: true,
      ...options
    });
  }, [addNotification]);

  // Update existing notification
  const updateNotification = useCallback((id, updates) => {
    // Remove old notification and add updated one
    removeNotification(id);
    return addNotification({ ...updates, id });
  }, [addNotification, removeNotification]);

  // Show confirmation dialog
  const showConfirmation = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      const id = addNotification({
        type: NOTIFICATION_TYPES.WARNING,
        message,
        title: options.title || 'Confirm Action',
        persistent: true,
        actions: [
          {
            label: options.cancelLabel || 'Cancel',
            variant: 'secondary',
            onClick: () => {
              removeNotification(id);
              resolve(false);
            }
          },
          {
            label: options.confirmLabel || 'Confirm',
            variant: 'primary',
            onClick: () => {
              removeNotification(id);
              resolve(true);
            }
          }
        ],
        ...options
      });
    });
  }, [addNotification, removeNotification]);

  // Handle API errors
  const handleApiError = useCallback((error, customMessage) => {
    let message = customMessage || 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;
      
      if (data?.message) {
        message = data.message;
      } else if (data?.error) {
        message = data.error;
      } else {
        switch (status) {
          case 400:
            message = 'Bad request. Please check your input.';
            break;
          case 401:
            message = 'Authentication required. Please log in.';
            break;
          case 403:
            message = 'Access denied. You don\'t have permission.';
            break;
          case 404:
            message = 'Resource not found.';
            break;
          case 500:
            message = 'Server error. Please try again later.';
            break;
          default:
            message = `Request failed with status ${status}`;
        }
      }
    } else if (error.request) {
      // Network error
      message = 'Network error. Please check your connection.';
    } else if (error.message) {
      message = error.message;
    }
    
    return showError(message);
  }, [showError]);

  // Batch operations
  const showMultiple = useCallback((notifications) => {
    const ids = [];
    notifications.forEach(notification => {
      const id = addNotification(notification);
      ids.push(id);
    });
    return ids;
  }, [addNotification]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return state.notifications.filter(notification => notification.type === type);
  }, [state.notifications]);

  // Check if there are any notifications of a specific type
  const hasNotificationsOfType = useCallback((type) => {
    return state.notifications.some(notification => notification.type === type);
  }, [state.notifications]);

  // Get notification count
  const getNotificationCount = useCallback(() => {
    return state.notifications.length;
  }, [state.notifications]);

  // Context value
  const value = {
    // State
    notifications: state.notifications,
    
    // Basic operations
    addNotification,
    removeNotification,
    clearAll,
    updateNotification,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showConfirmation,
    
    // Utility methods
    handleApiError,
    showMultiple,
    getNotificationsByType,
    hasNotificationsOfType,
    getNotificationCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// HOC for components that need notification functionality
export const withNotification = (Component) => {
  return function NotificationComponent(props) {
    const notification = useNotification();
    return <Component {...props} notification={notification} />;
  };
};

// Hook for handling async operations with notifications
export const useAsyncOperation = () => {
  const { showLoading, showSuccess, showError, removeNotification } = useNotification();
  
  const executeAsync = useCallback(async (operation, options = {}) => {
    const {
      loadingMessage = 'Processing...',
      successMessage = 'Operation completed successfully',
      errorMessage,
      showSuccessNotification = true,
      showErrorNotification = true
    } = options;
    
    const loadingId = showLoading(loadingMessage);
    
    try {
      const result = await operation();
      removeNotification(loadingId);
      
      if (showSuccessNotification) {
        showSuccess(successMessage);
      }
      
      return { success: true, data: result };
    } catch (error) {
      removeNotification(loadingId);
      
      if (showErrorNotification) {
        const message = errorMessage || error.message || 'Operation failed';
        showError(message);
      }
      
      return { success: false, error };
    }
  }, [showLoading, showSuccess, showError, removeNotification]);
  
  return { executeAsync };
};

export default NotificationContext;