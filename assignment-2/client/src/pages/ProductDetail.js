import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Styled Components
const ProductDetailContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Container = styled.div`
  max-width: ${props => props.theme.breakpoints.xl};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: transparent;
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  margin-bottom: ${props => props.theme.spacing.lg};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const ProductSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing['2xl']};
  margin-bottom: ${props => props.theme.spacing['3xl']};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.xl};
  }
`;

const ImageSection = styled.div`
  position: sticky;
  top: ${props => props.theme.spacing.xl};
  height: fit-content;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  background: ${props => props.theme.colors.background.secondary};
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ProductHeader = styled.div``;

const ProductTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes.h1};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.2;
`;

const ProductMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProductPrice = styled.div`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
`;

const ProductCategory = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  color: ${props => props.theme.colors.text.secondary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const ProductManufacturer = styled.div`
  background: ${props => props.theme.colors.primary.light};
  color: ${props => props.theme.colors.primary.dark};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const RatingStars = styled.div`
  color: ${props => props.theme.colors.warning.main};
`;

const RatingText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.md};
`;

const ProductDescription = styled.div`
  background: ${props => props.theme.colors.background.paper};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
`;

const DescriptionTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
`;

const DescriptionText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  font-size: ${props => props.theme.fontSizes.md};
`;

const ProductActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  flex: 1;
  min-width: 200px;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  
  &.primary {
    background: ${props => props.theme.colors.primary.main};
    color: white;
    
    &:hover {
      background: ${props => props.theme.colors.primary.dark};
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: transparent;
    color: ${props => props.theme.colors.primary.main};
    border: 2px solid ${props => props.theme.colors.primary.main};
    
    &:hover {
      background: ${props => props.theme.colors.primary.light};
    }
  }
  
  &.liked {
    background: ${props => props.theme.colors.error.light};
    color: ${props => props.theme.colors.error.main};
    border: 2px solid ${props => props.theme.colors.error.main};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProductStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const SimilarProductsSection = styled.section`
  margin-top: ${props => props.theme.spacing['3xl']};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.h2};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xl};
  text-align: center;
`;

const SimilarProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const SimilarProductCard = styled.div`
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

const SimilarProductImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  background: ${props => props.theme.colors.background.secondary};
`;

const SimilarProductContent = styled.div`
  padding: ${props => props.theme.spacing.md};
`;

const SimilarProductTitle = styled.h4`
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SimilarProductPrice = styled.div`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  color: ${props => props.theme.colors.error.main};
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ErrorTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.xl};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/products/${id}`);
      const data = response.data.data;
      
      setProduct(data.product);
      setSimilarProducts(data.similarProducts || []);
      setIsLiked(data.product.isLiked || false);
      
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showError('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    setActionLoading(true);
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
    
    setActionLoading(false);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      showError('Please log in to like products');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      
      const response = await axios.post(`/api/products/${id}/like`);
      const newLikedState = response.data.data.liked;
      
      setIsLiked(newLikedState);
      showSuccess(newLikedState ? 'Product liked!' : 'Product unliked!');
      
      // Update product analytics
      if (product) {
        setProduct(prev => ({
          ...prev,
          analytics: {
            ...prev.analytics,
            likes: newLikedState ? prev.analytics.likes + 1 : prev.analytics.likes - 1
          }
        }));
      }
      
    } catch (error) {
      console.error('Error liking product:', error);
      showError('Failed to update like status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      showError('Please log in to purchase products');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      
      await axios.post(`/api/products/${id}/purchase`, {
        quantity: 1,
        price: product.price
      });
      
      showSuccess('Purchase recorded successfully!');
      
      // Update product analytics
      setProduct(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          purchases: prev.analytics.purchases + 1
        }
      }));
      
    } catch (error) {
      console.error('Error recording purchase:', error);
      showError('Failed to record purchase');
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return (
      <ProductDetailContainer>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <LoadingSpinner text="Loading product details..." />
          </div>
        </Container>
      </ProductDetailContainer>
    );
  }

  if (error || !product) {
    return (
      <ProductDetailContainer>
        <Container>
          <BackButton onClick={() => navigate(-1)}>
            ← Back
          </BackButton>
          <ErrorMessage>
            <ErrorIcon>😞</ErrorIcon>
            <ErrorTitle>Product Not Found</ErrorTitle>
            <p>{error || 'The product you are looking for does not exist.'}</p>
          </ErrorMessage>
        </Container>
      </ProductDetailContainer>
    );
  }

  return (
    <ProductDetailContainer>
      <Container>
        <BackButton onClick={() => navigate(-1)}>
          ← Back to Products
        </BackButton>
        
        <ProductSection>
          <ImageSection>
            <ProductImage 
              src={product.image_url} 
              alt={product.product_name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
              }}
            />
          </ImageSection>
          
          <ProductInfo>
            <ProductHeader>
              <ProductTitle>{product.product_name}</ProductTitle>
              
              <ProductMeta>
                <ProductPrice>${product.price}</ProductPrice>
                <ProductCategory>{product.category}</ProductCategory>
                <ProductManufacturer>{product.manufacturer}</ProductManufacturer>
              </ProductMeta>
              
              <ProductRating>
                <RatingStars>{renderStars(product.rating)}</RatingStars>
                <RatingText>({product.rating}/5)</RatingText>
              </ProductRating>
            </ProductHeader>
            
            <ProductDescription>
              <DescriptionTitle>Product Description</DescriptionTitle>
              <DescriptionText>
                {product.description || 'No description available for this product.'}
              </DescriptionText>
            </ProductDescription>
            
            <ProductStats>
              <StatItem>
                <StatValue>{product.analytics?.views || 0}</StatValue>
                <StatLabel>Views</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{product.analytics?.likes || 0}</StatValue>
                <StatLabel>Likes</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{product.analytics?.purchases || 0}</StatValue>
                <StatLabel>Purchases</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{product.quantity || 0}</StatValue>
                <StatLabel>In Stock</StatLabel>
              </StatItem>
            </ProductStats>
            
            <ProductActions>
              <ActionButton 
                className="primary"
                onClick={handleAddToCart}
                disabled={actionLoading || product.quantity === 0}
              >
                {product.quantity === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
              </ActionButton>
              
              <ActionButton 
                className={isLiked ? 'liked' : 'secondary'}
                onClick={handleLike}
                disabled={actionLoading}
              >
                {isLiked ? '❤️ Liked' : '🤍 Like'}
              </ActionButton>
              
              <ActionButton 
                className="secondary"
                onClick={handlePurchase}
                disabled={actionLoading || product.quantity === 0}
              >
                💳 Buy Now
              </ActionButton>
            </ProductActions>
          </ProductInfo>
        </ProductSection>
        
        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <SimilarProductsSection>
            <SectionTitle>Similar Products You Might Like</SectionTitle>
            <SimilarProductsGrid>
              {similarProducts.map((similarProduct) => (
                <SimilarProductCard 
                  key={similarProduct.product_id}
                  onClick={() => navigate(`/products/${similarProduct.product_id}`)}
                >
                  <SimilarProductImage 
                    src={similarProduct.image_url} 
                    alt={similarProduct.product_name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/250x150?text=No+Image';
                    }}
                  />
                  <SimilarProductContent>
                    <SimilarProductTitle>{similarProduct.product_name}</SimilarProductTitle>
                    <SimilarProductPrice>${similarProduct.price}</SimilarProductPrice>
                  </SimilarProductContent>
                </SimilarProductCard>
              ))}
            </SimilarProductsGrid>
          </SimilarProductsSection>
        )}
      </Container>
    </ProductDetailContainer>
  );
};

export default ProductDetail;