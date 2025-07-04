import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Styled Components
const RecommendationsContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Container = styled.div`
  max-width: ${props => props.theme.breakpoints.xl};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing['2xl']};
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes.h1};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PageSubtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto ${props => props.theme.spacing.lg};
`;

const RecommendationTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.primary.main};
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary.dark : props.theme.colors.primary.light};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const RecommendationSection = styled.section`
  margin-bottom: ${props => props.theme.spacing['3xl']};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    align-items: flex-start;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.h2};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SectionDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.md};
  max-width: 400px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.secondary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.secondary.dark};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const ProductCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.base};
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const RecommendationBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  z-index: 1;
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

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProductPrice = styled.div`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
`;

const ProductCategory = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.muted};
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const RecommendationScore = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.success.main};
  font-weight: ${props => props.theme.fontWeights.medium};
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EmptyTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.xl};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
`;

const EmptyDescription = styled.p`
  max-width: 400px;
  margin: 0 auto ${props => props.theme.spacing.lg};
  line-height: 1.6;
`;

const ExploreButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary.dark};
    transform: translateY(-2px);
  }
`;

const StatsSection = styled.div`
  background: ${props => props.theme.colors.background.paper};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.base};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const RECOMMENDATION_TYPES = {
  personalized: { label: '🎯 For You', description: 'Personalized recommendations based on your preferences and behavior' },
  collaborative: { label: '👥 Others Like You', description: 'Products liked by users with similar tastes' },
  content: { label: '🔍 Similar Items', description: 'Products similar to ones you\'ve viewed or liked' },
  trending: { label: '🔥 Trending', description: 'Popular products trending right now' },
  category: { label: '📂 By Category', description: 'Recommendations from your favorite categories' }
};

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('personalized');
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
    fetchStats();
  }, [activeTab]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      let endpoint = '/api/recommendations/personalized';
      const params = { limit: 12 };
      
      switch (activeTab) {
        case 'collaborative':
          endpoint = '/api/recommendations/personalized';
          params.type = 'collaborative';
          break;
        case 'content':
          endpoint = '/api/recommendations/personalized';
          params.type = 'content';
          break;
        case 'trending':
          endpoint = '/api/recommendations/trending';
          break;
        case 'category':
          endpoint = '/api/recommendations/category';
          break;
        default:
          params.type = 'hybrid';
      }
      
      const response = await axios.get(endpoint, { params });
      setRecommendations(response.data.data.recommendations || []);
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      showError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/recommendations/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
    showSuccess('Recommendations refreshed!');
  };

  const handleAddToCart = async (product) => {
    const success = addItem(product);
    if (success) {
      showSuccess(`${product.product_name} added to cart!`);
      
      // Record interaction
      try {
        await axios.post('/api/users/interaction', {
          productId: product.product_id,
          type: 'cart_add'
        });
      } catch (error) {
        console.error('Error recording interaction:', error);
      }
    } else {
      showError('Failed to add item to cart');
    }
  };

  const handleFeedback = async (productId, feedback) => {
    try {
      await axios.post('/api/recommendations/feedback', {
        productId,
        feedback,
        recommendationType: activeTab
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
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

  const getRecommendationBadge = (type) => {
    const badges = {
      personalized: '🎯',
      collaborative: '👥',
      content: '🔍',
      trending: '🔥',
      category: '📂'
    };
    return badges[type] || '✨';
  };

  return (
    <RecommendationsContainer>
      <Container>
        <PageHeader>
          <PageTitle>AI-Powered Recommendations</PageTitle>
          <PageSubtitle>
            Discover products tailored just for you using our advanced machine learning algorithms
          </PageSubtitle>
          
          <RecommendationTabs>
            {Object.entries(RECOMMENDATION_TYPES).map(([key, config]) => (
              <TabButton
                key={key}
                active={activeTab === key}
                onClick={() => setActiveTab(key)}
                disabled={loading}
              >
                {config.label}
              </TabButton>
            ))}
          </RecommendationTabs>
        </PageHeader>

        {/* Stats Section */}
        {stats && (
          <StatsSection>
            <SectionTitle style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              📊 Your Recommendation Profile
            </SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatValue>{stats.totalRecommendations || 0}</StatValue>
                <StatLabel>Total Recommendations</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.accuracyRate || 0}%</StatValue>
                <StatLabel>Accuracy Rate</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.categoriesExplored || 0}</StatValue>
                <StatLabel>Categories Explored</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.similarUsers || 0}</StatValue>
                <StatLabel>Similar Users</StatLabel>
              </StatCard>
            </StatsGrid>
          </StatsSection>
        )}

        {/* Recommendations Section */}
        <RecommendationSection>
          <SectionHeader>
            <div>
              <SectionTitle>
                {RECOMMENDATION_TYPES[activeTab].label}
              </SectionTitle>
              <SectionDescription>
                {RECOMMENDATION_TYPES[activeTab].description}
              </SectionDescription>
            </div>
            <RefreshButton 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </RefreshButton>
          </SectionHeader>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <LoadingSpinner text="Loading recommendations..." />
            </div>
          ) : recommendations.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🤖</EmptyIcon>
              <EmptyTitle>No Recommendations Yet</EmptyTitle>
              <EmptyDescription>
                We're still learning about your preferences. Browse some products to help us 
                create better recommendations for you!
              </EmptyDescription>
              <ExploreButton onClick={() => navigate('/products')}>
                🛍️ Explore Products
              </ExploreButton>
            </EmptyState>
          ) : (
            <ProductsGrid>
              {recommendations.map((item) => {
                const product = item.product || item;
                return (
                  <ProductCard 
                    key={product.product_id}
                    onClick={() => {
                      navigate(`/products/${product.product_id}`);
                      handleFeedback(product.product_id, 'clicked');
                    }}
                  >
                    <RecommendationBadge>
                      {getRecommendationBadge(activeTab)}
                    </RecommendationBadge>
                    
                    <ProductImage 
                      src={product.image_url} 
                      alt={product.product_name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/280x200?text=No+Image';
                      }}
                    />
                    
                    <ProductContent>
                      <ProductTitle>{product.product_name}</ProductTitle>
                      
                      <ProductMeta>
                        <ProductPrice>${product.price}</ProductPrice>
                        <ProductCategory>{product.category}</ProductCategory>
                      </ProductMeta>
                      
                      <ProductRating>
                        {renderStars(product.rating)} ({product.rating})
                      </ProductRating>
                      
                      {item.score && (
                        <RecommendationScore>
                          ✨ {Math.round(item.score * 100)}% match
                        </RecommendationScore>
                      )}
                      
                      <AddToCartButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                          handleFeedback(product.product_id, 'added_to_cart');
                        }}
                      >
                        Add to Cart
                      </AddToCartButton>
                    </ProductContent>
                  </ProductCard>
                );
              })}
            </ProductsGrid>
          )}
        </RecommendationSection>
      </Container>
    </RecommendationsContainer>
  );
};

export default Recommendations;