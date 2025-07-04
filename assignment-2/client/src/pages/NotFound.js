import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 6rem;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  color: ${props => props.theme.colors.text};
  margin: 1rem 0;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.textLight};
  margin: 1rem 0 2rem;
  max-width: 500px;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.colors.primary};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.primary};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
  
  @media (max-width: 480px) {
    justify-content: center;
    width: 100%;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${props => props.theme.colors.textLight};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.border};
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const IllustrationContainer = styled.div`
  margin-bottom: 2rem;
  opacity: 0.8;
`;

const NotFound = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <NotFoundContainer>
      <IllustrationContainer>
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
          <circle cx="100" cy="75" r="60" fill="#e2e8f0" opacity="0.5" />
          <path 
            d="M70 60 Q100 40 130 60 Q130 90 100 100 Q70 90 70 60" 
            fill="#cbd5e0" 
          />
          <circle cx="85" cy="70" r="8" fill="#4a5568" />
          <circle cx="115" cy="70" r="8" fill="#4a5568" />
          <path 
            d="M85 85 Q100 95 115 85" 
            stroke="#4a5568" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
      </IllustrationContainer>
      
      <ErrorCode>404</ErrorCode>
      <ErrorTitle>Page Not Found</ErrorTitle>
      <ErrorMessage>
        Oops! The page you're looking for doesn't exist. It might have been moved, 
        deleted, or you entered the wrong URL.
      </ErrorMessage>
      
      <ActionButtons>
        <ActionButton to="/" primary>
          🏠 Go Home
        </ActionButton>
        <ActionButton to="/products">
          🛍️ Browse Products
        </ActionButton>
        <BackButton onClick={handleGoBack}>
          ← Go Back
        </BackButton>
      </ActionButtons>
    </NotFoundContainer>
  );
};

export default NotFound;