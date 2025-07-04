import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components
const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.text.primary};
  color: ${props => props.theme.colors.background.primary};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: ${props => props.theme.breakpoints.xl};
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.sm};
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const FooterSection = styled.div`
  h3 {
    color: ${props => props.theme.colors.background.primary};
    font-size: ${props => props.theme.fontSizes.lg};
    font-weight: ${props => props.theme.fontWeights.semibold};
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  p {
    color: ${props => props.theme.colors.text.disabled};
    line-height: 1.6;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    margin-bottom: ${props => props.theme.spacing.sm};
  }
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.text.disabled};
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary.light};
    text-decoration: none;
  }
`;

const ExternalLink = styled.a`
  color: ${props => props.theme.colors.text.disabled};
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary.light};
    text-decoration: none;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.text.disabled}20;
  color: ${props => props.theme.colors.text.disabled};
  border-radius: ${props => props.theme.borderRadius.md};
  text-decoration: none;
  font-size: ${props => props.theme.fontSizes.lg};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary.main};
    color: white;
    transform: translateY(-2px);
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.text.disabled}40;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.primary}10;
  color: ${props => props.theme.colors.background.primary};
  font-size: ${props => props.theme.fontSizes.base};
  
  &::placeholder {
    color: ${props => props.theme.colors.text.disabled};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.background.primary}20;
  }
`;

const NewsletterButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${props => props.theme.colors.text.disabled}30;
  padding-top: ${props => props.theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: ${props => props.theme.colors.text.disabled};
  font-size: ${props => props.theme.fontSizes.sm};
  margin: 0;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const LegalLink = styled(Link)`
  color: ${props => props.theme.colors.text.disabled};
  text-decoration: none;
  font-size: ${props => props.theme.fontSizes.sm};
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary.light};
    text-decoration: none;
  }
`;

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      // Handle newsletter subscription
      console.log('Newsletter subscription:', email);
      e.target.reset();
      // You could show a success notification here
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>🛍️ RecommendShop</h3>
            <p>
              Your intelligent shopping companion. Discover products tailored to your preferences 
              with our AI-powered recommendation system.
            </p>
            <SocialLinks>
              <SocialLink href="#" aria-label="Facebook">
                📘
              </SocialLink>
              <SocialLink href="#" aria-label="Twitter">
                🐦
              </SocialLink>
              <SocialLink href="#" aria-label="Instagram">
                📷
              </SocialLink>
              <SocialLink href="#" aria-label="LinkedIn">
                💼
              </SocialLink>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <h3>Quick Links</h3>
            <FooterLinks>
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/products">Products</FooterLink></li>
              <li><FooterLink to="/recommendations">Recommendations</FooterLink></li>
              <li><FooterLink to="/cart">Shopping Cart</FooterLink></li>
              <li><FooterLink to="/profile">My Account</FooterLink></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>Categories</h3>
            <FooterLinks>
              <li><FooterLink to="/products?category=Electronics">Electronics</FooterLink></li>
              <li><FooterLink to="/products?category=Clothing">Clothing</FooterLink></li>
              <li><FooterLink to="/products?category=Home">Home & Garden</FooterLink></li>
              <li><FooterLink to="/products?category=Sports">Sports</FooterLink></li>
              <li><FooterLink to="/products?category=Books">Books</FooterLink></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>Customer Service</h3>
            <FooterLinks>
              <li><ExternalLink href="#">Contact Us</ExternalLink></li>
              <li><ExternalLink href="#">FAQ</ExternalLink></li>
              <li><ExternalLink href="#">Shipping Info</ExternalLink></li>
              <li><ExternalLink href="#">Returns</ExternalLink></li>
              <li><ExternalLink href="#">Size Guide</ExternalLink></li>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>Newsletter</h3>
            <p>
              Subscribe to get updates on new products and personalized recommendations.
            </p>
            <NewsletterForm onSubmit={handleNewsletterSubmit}>
              <NewsletterInput
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
              <NewsletterButton type="submit">
                Subscribe
              </NewsletterButton>
            </NewsletterForm>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <Copyright>
            © {currentYear} RecommendShop. All rights reserved.
          </Copyright>
          <LegalLinks>
            <LegalLink to="/privacy">Privacy Policy</LegalLink>
            <LegalLink to="/terms">Terms of Service</LegalLink>
            <LegalLink to="/cookies">Cookie Policy</LegalLink>
          </LegalLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;