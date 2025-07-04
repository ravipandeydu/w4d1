import React from 'react';
import styled from 'styled-components';

// Styled Components
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin: ${props => props.theme.spacing.md};
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.error.main};
`;

const ErrorTitle = styled.h2`
  color: ${props => props.theme.colors.error.main};
  font-size: ${props => props.theme.fontSizes.h3};
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  max-width: 600px;
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  max-width: 100%;
  width: 600px;
  
  summary {
    cursor: pointer;
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
    
    &:hover {
      color: ${props => props.theme.colors.primary.main};
    }
  }
`;

const ErrorStack = styled.pre`
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: ${props => props.theme.colors.primary.main};
    color: white;
    
    &:hover {
      background: ${props => props.theme.colors.primary.dark};
    }
  }
  
  &.secondary {
    background: ${props => props.theme.colors.background.primary};
    color: ${props => props.theme.colors.text.primary};
    border: 1px solid ${props => props.theme.colors.border.main};
    
    &:hover {
      background: ${props => props.theme.colors.background.secondary};
    }
  }
`;

const FallbackContainer = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.error.main}10;
  border: 1px solid ${props => props.theme.colors.error.main}30;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.error.main};
  text-align: center;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Report error to monitoring service (e.g., Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You could also send error to analytics or logging service here
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Mock error logging - replace with actual service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In a real app, you'd send this to your error tracking service
    console.log('Error logged:', errorData);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Simple fallback for minimal errors
      if (this.props.minimal) {
        return (
          <FallbackContainer>
            <p>Something went wrong. Please try refreshing the page.</p>
            <ActionButton className="primary" onClick={this.handleRetry}>
              Try Again
            </ActionButton>
          </FallbackContainer>
        );
      }

      // Full error UI
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>
            {this.props.title || 'Oops! Something went wrong'}
          </ErrorTitle>
          <ErrorMessage>
            {this.props.message || 
             'We\'re sorry, but something unexpected happened. Our team has been notified and is working to fix the issue.'}
          </ErrorMessage>
          
          <ActionButtons>
            <ActionButton className="primary" onClick={this.handleRetry}>
              Try Again
            </ActionButton>
            <ActionButton className="secondary" onClick={this.handleReload}>
              Reload Page
            </ActionButton>
            <ActionButton className="secondary" onClick={this.handleGoHome}>
              Go Home
            </ActionButton>
          </ActionButtons>

          {(this.state.error || this.state.errorInfo) && (
            <ErrorDetails>
              <summary>Technical Details</summary>
              {this.state.error && (
                <div>
                  <h4>Error:</h4>
                  <ErrorStack>{this.state.error.toString()}</ErrorStack>
                </div>
              )}
              {this.state.errorInfo && (
                <div>
                  <h4>Component Stack:</h4>
                  <ErrorStack>{this.state.errorInfo.componentStack}</ErrorStack>
                </div>
              )}
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const handleError = React.useCallback((error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);
  
  // Throw error to be caught by ErrorBoundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return { handleError, resetError };
};

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AsyncErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidMount() {
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    this.setState({ hasError: true });
    if (this.props.onError) {
      this.props.onError(event.reason, { type: 'unhandledrejection' });
    }
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>An unexpected error occurred. Please try again.</ErrorMessage>
          <ActionButton 
            className="primary" 
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </ActionButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;