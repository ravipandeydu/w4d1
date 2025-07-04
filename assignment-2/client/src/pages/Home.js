import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Styled Components
const HomeContainer = styled.div`
  min-height: calc(100vh - 140px);
`;

const HeroSection = styled.section`
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  padding: ${props => props.theme.spacing['4xl']} 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  max-width: ${props => props.theme.breakpoints.lg};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes['5xl']};
  font-weight: ${props => props.theme.fontWeights.extrabold};
  margin-bottom: ${props => props.theme.spacing.lg};
  line-height: 1.1;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes['3xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes.lg};
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const HeroButton = styled(Link)`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.semibold};
  font-size: ${props => props.theme.fontSizes.lg};
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &.primary {
    background: white;
    color: ${props => props.theme.colors.primary.main};
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props => props.theme.shadows.lg};
      text-decoration: none;
    }
  }
  
  &.secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
    
    &:hover {
      background: white;
      color: ${props => props.theme.colors.primary.main};
      text-decoration: none;
    }
  }
`;

const Section = styled.section`
  padding: ${props => props.theme.spacing['3xl']} 0;
  
  &.gray {
    background: ${props => props.theme.colors.background.secondary};
  }
`;

const Container = styled.div`
  max-width: ${props => props.theme.breakpoints.xl};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.h2};
  font-weight: ${props => props.theme.fontWeights.bold};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.primary};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  margin-top: ${props => props.theme.spacing.xl};
`;

const FeatureCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.base};
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FeatureTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.xl};
`;

const ProductCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.base};
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: ${props => props.theme.colors.background.secondary};
`;

const ProductContent = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

const ProductTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ViewAllButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin: ${props => props.theme.spacing.xl} auto 0;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary.dark};
    transform: translateY(-2px);
    text-decoration: none;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
`;

const StatNumber = styled.div`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured and trending products
      const [featuredRes, trendingRes] = await Promise.all([
        axios.get('/api/products/featured?limit=6'),
        axios.get('/api/products/trending?limit=6')
      ]);
      
      setFeaturedProducts(featuredRes.data.data.products || []);
      setTrendingProducts(trendingRes.data.data.products || []);
      
      // Mock stats - in a real app, you'd fetch these from an API
      setStats({
        totalProducts: 1000,
        happyCustomers: 5000,
        recommendations: 50000,
        categories: 25
      });
      
    } catch (error) {
      console.error('Error fetching home data:', error);
      showError('Failed to load homepage data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      showError('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    const success = addItem(product);
    if (success) {
      showSuccess(`${product.product_name} added to cart!`);
    } else {
      showError('Failed to add item to cart');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    
    return stars.join('');
  };

  const ProductSection = ({ title, products, viewAllLink }) => (
    <Section>
      <Container>
        <SectionTitle>{title}</SectionTitle>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner text="Loading products..." />
          </div>
        ) : (
          <>
            <ProductsGrid>
              {products.map((product) => (
                <ProductCard 
                  key={product.product_id}
                  onClick={() => navigate(`/products/${product.product_id}`)}
                >
                  <ProductImage 
                    src={product.image_url} 
                    alt={product.product_name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/280x200?text=No+Image';
                    }}
                  />
                  <ProductContent>
                    <ProductTitle>{product.product_name}</ProductTitle>
                    <ProductPrice>${product.price}</ProductPrice>
                    <ProductRating>
                      {renderStars(product.rating)} ({product.rating})
                    </ProductRating>
                    <AddToCartButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      Add to Cart
                    </AddToCartButton>
                  </ProductContent>
                </ProductCard>
              ))}
            </ProductsGrid>
            <div style={{ textAlign: 'center' }}>
              <ViewAllButton to={viewAllLink}>
                View All Products →
              </ViewAllButton>
            </div>
          </>
        )}
      </Container>
    </Section>
  );

  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>
            Discover Products Made Just for You
          </HeroTitle>
          <HeroSubtitle>
            Experience the power of AI-driven recommendations. Find products that match your style, 
            preferences, and needs with our intelligent shopping assistant.
          </HeroSubtitle>
          <HeroButtons>
            <HeroButton to="/products" className="primary">
              🛍️ Start Shopping
            </HeroButton>
            {isAuthenticated ? (
              <HeroButton to="/recommendations" className="secondary">
                ✨ My Recommendations
              </HeroButton>
            ) : (
              <HeroButton to="/register" className="secondary">
                📝 Sign Up Free
              </HeroButton>
            )}
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      {/* Features Section */}
      <Section>
        <Container>
          <SectionTitle>Why Choose RecommendShop?</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>🤖</FeatureIcon>
              <FeatureTitle>AI-Powered Recommendations</FeatureTitle>
              <FeatureDescription>
                Our advanced machine learning algorithms analyze your preferences and behavior 
                to suggest products you'll love.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>🎯</FeatureIcon>
              <FeatureTitle>Personalized Experience</FeatureTitle>
              <FeatureDescription>
                Every recommendation is tailored to your unique taste, shopping history, 
                and preferences for a truly personal experience.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>Smart Discovery</FeatureTitle>
              <FeatureDescription>
                Discover new products and brands you might have missed with our intelligent 
                discovery engine that learns from your interactions.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </Container>
      </Section>

      {/* Featured Products */}
      <ProductSection 
        title="Featured Products"
        products={featuredProducts}
        viewAllLink="/products?featured=true"
      />

      {/* Trending Products */}
      <Section className="gray">
        <ProductSection 
          title="Trending Now"
          products={trendingProducts}
          viewAllLink="/products?trending=true"
        />
      </Section>

      {/* Stats Section */}
      {stats && (
        <Section>
          <Container>
            <SectionTitle>Our Impact</SectionTitle>
            <StatsSection>
              <StatCard>
                <StatNumber>{stats.totalProducts.toLocaleString()}+</StatNumber>
                <StatLabel>Products Available</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.happyCustomers.toLocaleString()}+</StatNumber>
                <StatLabel>Happy Customers</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.recommendations.toLocaleString()}+</StatNumber>
                <StatLabel>Recommendations Made</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.categories}+</StatNumber>
                <StatLabel>Product Categories</StatLabel>
              </StatCard>
            </StatsSection>
          </Container>
        </Section>
      )}
    </HomeContainer>
  );
};

export default Home;