import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframes for animations
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

// Styled Components
const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
`;

const SpinnerWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

// Default Spinner (Rotating Circle)
const DefaultSpinner = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  border: ${props => {
    switch (props.size) {
      case 'small': return '2px';
      case 'large': return '4px';
      default: return '3px';
    }
  }} solid ${props => props.theme.colors.border.light};
  border-top: ${props => {
    switch (props.size) {
      case 'small': return '2px';
      case 'large': return '4px';
      default: return '3px';
    }
  }} solid ${props => props.color || props.theme.colors.primary.main};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Dots Spinner
const DotsSpinner = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const Dot = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'small': return '8px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '8px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
  background: ${props => props.color || props.theme.colors.primary.main};
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${props => props.delay || '0s'};
`;

// Pulse Spinner
const PulseSpinner = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  background: ${props => props.color || props.theme.colors.primary.main};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// Bars Spinner
const BarsSpinner = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Bar = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'small': return '3px';
      case 'large': return '6px';
      default: return '4px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '20px';
      case 'large': return '40px';
      default: return '30px';
    }
  }};
  background: ${props => props.color || props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.sm};
  animation: ${pulse} 1.2s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

// Loading Text
const LoadingText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return props.theme.fontSizes.sm;
      case 'large': return props.theme.fontSizes.lg;
      default: return props.theme.fontSizes.base;
    }
  }};
  font-weight: ${props => props.theme.fontWeights.medium};
  margin: 0;
  text-align: center;
`;

// Overlay for full-screen loading
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
`;

const LoadingSpinner = ({
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'default', // 'default', 'dots', 'pulse', 'bars'
  color,
  text,
  overlay = false,
  className,
  ...props
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <DotsSpinner>
            <Dot size={size} color={color} delay="0s" />
            <Dot size={size} color={color} delay="0.16s" />
            <Dot size={size} color={color} delay="0.32s" />
          </DotsSpinner>
        );
      
      case 'pulse':
        return <PulseSpinner size={size} color={color} />;
      
      case 'bars':
        return (
          <BarsSpinner>
            <Bar size={size} color={color} delay="0s" />
            <Bar size={size} color={color} delay="0.1s" />
            <Bar size={size} color={color} delay="0.2s" />
            <Bar size={size} color={color} delay="0.3s" />
            <Bar size={size} color={color} delay="0.4s" />
          </BarsSpinner>
        );
      
      default:
        return <DefaultSpinner size={size} color={color} />;
    }
  };

  const content = (
    <SpinnerContainer className={className} {...props}>
      <SpinnerWrapper>
        {renderSpinner()}
      </SpinnerWrapper>
      {text && (
        <LoadingText size={size}>
          {text}
        </LoadingText>
      )}
    </SpinnerContainer>
  );

  if (overlay) {
    return (
      <Overlay>
        {content}
      </Overlay>
    );
  }

  return content;
};

// Preset components for common use cases
export const SmallSpinner = (props) => (
  <LoadingSpinner size="small" variant="default" {...props} />
);

export const DotsLoader = (props) => (
  <LoadingSpinner variant="dots" {...props} />
);

export const PulseLoader = (props) => (
  <LoadingSpinner variant="pulse" {...props} />
);

export const BarsLoader = (props) => (
  <LoadingSpinner variant="bars" {...props} />
);

export const FullScreenLoader = (props) => (
  <LoadingSpinner 
    size="large" 
    overlay 
    text="Loading..." 
    {...props} 
  />
);

// Inline spinner for buttons
export const ButtonSpinner = styled(LoadingSpinner).attrs({
  size: 'small',
  variant: 'default'
})`
  padding: 0;
  
  ${SpinnerContainer} {
    padding: 0;
    gap: 0;
  }
`;

// Higher-order component for adding loading state to any component
export const withLoading = (Component) => {
  return function LoadingComponent({ loading, loadingProps, ...props }) {
    if (loading) {
      return <LoadingSpinner {...loadingProps} />;
    }
    return <Component {...props} />;
  };
};

// Hook for managing loading states
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  
  const startLoading = React.useCallback(() => setLoading(true), []);
  const stopLoading = React.useCallback(() => setLoading(false), []);
  const toggleLoading = React.useCallback(() => setLoading(prev => !prev), []);
  
  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading
  };
};

export default LoadingSpinner;