import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Styled Components
const CartContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.secondary};
`;

const CartContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const CartHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const CartTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes.h1};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CartSubtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.md};
`;

const CartItems = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 80px 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

const ItemImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background.secondary};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    height: 80px;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ItemName = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSizes.md};
  }
`;

const ItemCategory = styled.p`
  color: ${props => props.theme.colors.text.muted};
  font-size: ${props => props.theme.fontSizes.sm};
  margin: 0;
`;

const ItemPrice = styled.div`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  align-items: flex-end;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xs};
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.fontWeights.bold};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary.light};
    color: ${props => props.theme.colors.primary.main};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.error.main};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;
  font-size: ${props => props.theme.fontSizes.sm};
  
  &:hover {
    background: ${props => props.theme.colors.error.light};
    color: ${props => props.theme.colors.error.dark};
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const EmptyCartIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EmptyCartTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.h2};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EmptyCartText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary.dark};
    transform: translateY(-2px);
  }
`;

const CartSummary = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.xl};
  height: fit-content;
  position: sticky;
  top: ${props => props.theme.spacing.xl};
`;

const SummaryTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.h3};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: ${props => props.isTotal ? `2px solid ${props.theme.colors.border.main}` : `1px solid ${props.theme.colors.border.light}`};
  
  &:last-child {
    border-bottom: none;
    margin-top: ${props => props.theme.spacing.md};
  }
`;

const SummaryLabel = styled.span`
  color: ${props => props.isTotal ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
  font-weight: ${props => props.isTotal ? props.theme.fontWeights.bold : props.theme.fontWeights.medium};
  font-size: ${props => props.isTotal ? props.theme.fontSizes.lg : props.theme.fontSizes.md};
`;

const SummaryValue = styled.span`
  color: ${props => props.isTotal ? props.theme.colors.primary.main : props.theme.colors.text.primary};
  font-weight: ${props => props.isTotal ? props.theme.fontWeights.bold : props.theme.fontWeights.semibold};
  font-size: ${props => props.isTotal ? props.theme.fontSizes.lg : props.theme.fontSizes.md};
`;

const PromoSection = styled.div`
  margin: ${props => props.theme.spacing.lg} 0;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const PromoInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const PromoButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.secondary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.secondary.dark};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary.dark};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContinueShoppingButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.primary.main};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &:hover {
    text-decoration: underline;
  }
`;

const Cart = () => {
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartCount,
    calculateShipping,
    calculateTax
  } = useCart();
  const { showSuccess, showError, showWarning } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const subtotal = getCartTotal();
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  const discount = (subtotal * promoDiscount) / 100;
  const total = subtotal + shipping + tax - discount;

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    try {
      await updateQuantity(productId, newQuantity);
      showSuccess('Cart updated successfully');
    } catch (error) {
      showError('Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      showSuccess('Item removed from cart');
    } catch (error) {
      showError('Failed to remove item');
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      showWarning('Please enter a promo code');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate promo code validation
      const validPromoCodes = {
        'SAVE10': 10,
        'WELCOME15': 15,
        'STUDENT20': 20,
        'FIRST25': 25
      };
      
      const discount = validPromoCodes[promoCode.toUpperCase()];
      
      if (discount) {
        setPromoDiscount(discount);
        showSuccess(`Promo code applied! ${discount}% discount`);
      } else {
        showError('Invalid promo code');
      }
    } catch (error) {
      showError('Failed to apply promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      showWarning('Your cart is empty');
      return;
    }
    
    setCheckoutLoading(true);
    
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Record purchases for each item
      for (const item of items) {
        // This would typically be handled by the backend
        console.log(`Recording purchase for product ${item.id}`);
      }
      
      await clearCart();
      showSuccess('Order placed successfully! Thank you for your purchase.');
      navigate('/orders', { replace: true });
    } catch (error) {
      showError('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < Math.floor(rating) ? '#ffd700' : '#ddd' }}>
        ★
      </span>
    ));
  };

  if (items.length === 0) {
    return (
      <CartContainer>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <CartHeader>
            <CartTitle>🛒 Your Shopping Cart</CartTitle>
            <CartSubtitle>Review and manage your selected items</CartSubtitle>
          </CartHeader>
          
          <EmptyCart>
            <EmptyCartIcon>🛒</EmptyCartIcon>
            <EmptyCartTitle>Your cart is empty</EmptyCartTitle>
            <EmptyCartText>
              Looks like you haven't added any items to your cart yet.
              Start shopping to find amazing products!
            </EmptyCartText>
            <ShopButton to="/products">
              🛍️ Start Shopping
            </ShopButton>
          </EmptyCart>
        </div>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <CartHeader>
        <CartTitle>🛒 Your Shopping Cart</CartTitle>
        <CartSubtitle>
          {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
        </CartSubtitle>
      </CartHeader>
      
      <ContinueShoppingButton to="/products">
        ← Continue Shopping
      </ContinueShoppingButton>
      
      <CartContent>
        <CartItems>
          {items.map((item) => (
            <CartItem key={item.id}>
              <ItemImage 
                src={item.image || '/api/placeholder/120/120'} 
                alt={item.name}
                onError={(e) => {
                  e.target.src = '/api/placeholder/120/120';
                }}
              />
              
              <ItemDetails>
                <ItemName>{item.name}</ItemName>
                <ItemCategory>{item.category}</ItemCategory>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderStars(item.rating || 0)}
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    ({item.rating?.toFixed(1) || 'N/A'})
                  </span>
                </div>
                <ItemPrice>${item.price?.toFixed(2) || '0.00'}</ItemPrice>
              </ItemDetails>
              
              <ItemActions>
                <QuantityControls>
                  <QuantityButton
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </QuantityButton>
                  <QuantityDisplay>{item.quantity}</QuantityDisplay>
                  <QuantityButton
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </QuantityButton>
                </QuantityControls>
                
                <RemoveButton onClick={() => handleRemoveItem(item.id)}>
                  🗑️ Remove
                </RemoveButton>
              </ItemActions>
            </CartItem>
          ))}
        </CartItems>
        
        <CartSummary>
          <SummaryTitle>📋 Order Summary</SummaryTitle>
          
          <SummaryRow>
            <SummaryLabel>Subtotal ({getCartCount()} items)</SummaryLabel>
            <SummaryValue>${subtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Shipping</SummaryLabel>
            <SummaryValue>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Tax</SummaryLabel>
            <SummaryValue>${tax.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          {promoDiscount > 0 && (
            <SummaryRow>
              <SummaryLabel>Discount ({promoDiscount}%)</SummaryLabel>
              <SummaryValue style={{ color: '#10b981' }}>-${discount.toFixed(2)}</SummaryValue>
            </SummaryRow>
          )}
          
          <SummaryRow isTotal>
            <SummaryLabel isTotal>Total</SummaryLabel>
            <SummaryValue isTotal>${total.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <PromoSection>
            <PromoInput
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
            />
            <PromoButton onClick={handleApplyPromo} disabled={loading}>
              {loading ? 'Applying...' : 'Apply Code'}
            </PromoButton>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Try: SAVE10, WELCOME15, STUDENT20, FIRST25
            </div>
          </PromoSection>
          
          <CheckoutButton onClick={handleCheckout} disabled={checkoutLoading}>
            {checkoutLoading ? (
              <>
                <LoadingSpinner size="small" color="white" />
                Processing...
              </>
            ) : (
              '🚀 Proceed to Checkout'
            )}
          </CheckoutButton>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            textAlign: 'center', 
            marginTop: '16px' 
          }}>
            🔒 Secure checkout with SSL encryption
          </div>
        </CartSummary>
      </CartContent>
    </CartContainer>
  );
};

export default Cart;