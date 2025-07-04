import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';

// Styled Components
const NavbarContainer = styled.nav`
  background: ${props => props.theme.colors.background.paper};
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.sticky};
  transition: all 0.3s ease;
`;

const NavbarContent = styled.div`
  max-width: ${props => props.theme.breakpoints.xl};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${props => props.theme.components.navbar.height};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 ${props => props.theme.spacing.sm};
  }
`;

const Logo = styled(Link)`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    color: ${props => props.theme.colors.primary.dark};
    text-decoration: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${props => props.theme.colors.background.paper};
    flex-direction: column;
    padding: ${props => props.theme.spacing.md};
    box-shadow: ${props => props.theme.shadows.md};
    gap: ${props => props.theme.spacing.md};
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.colors.text.primary};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.medium};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main}10;
    text-decoration: none;
  }
  
  &.active {
    color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main}15;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const CartButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.fontSizes.lg};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main}10;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: ${props => props.theme.colors.error.main};
  color: white;
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.bold};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.full};
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserDropdown = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.fontWeights.medium};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.main}10;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing.sm};
  min-width: 200px;
  z-index: ${props => props.theme.zIndex.dropdown};
  display: ${props => props.isOpen ? 'block' : 'none'};
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.fontSizes.lg};
  padding: ${props => props.theme.spacing.sm};
  cursor: pointer;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: block;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const AuthButton = styled(Link)`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: all 0.2s ease;
  
  &.login {
    color: ${props => props.theme.colors.primary.main};
    border: 1px solid ${props => props.theme.colors.primary.main};
    
    &:hover {
      background: ${props => props.theme.colors.primary.main};
      color: white;
      text-decoration: none;
    }
  }
  
  &.register {
    background: ${props => props.theme.colors.primary.main};
    color: white;
    
    &:hover {
      background: ${props => props.theme.colors.primary.dark};
      text-decoration: none;
    }
  }
`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout, getUserFullName } = useAuth();
  const { totalItems } = useCart();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setUserDropdownOpen(false);
      showSuccess('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo to="/">
          🛍️ RecommendShop
        </Logo>

        <NavLinks isOpen={isOpen}>
          <NavLink 
            to="/" 
            className={isActiveLink('/') ? 'active' : ''}
          >
            Home
          </NavLink>
          <NavLink 
            to="/products" 
            className={isActiveLink('/products') ? 'active' : ''}
          >
            Products
          </NavLink>
          {isAuthenticated && (
            <NavLink 
              to="/recommendations" 
              className={isActiveLink('/recommendations') ? 'active' : ''}
            >
              Recommendations
            </NavLink>
          )}
        </NavLinks>

        <UserSection>
          {isAuthenticated && (
            <CartButton onClick={() => navigate('/cart')}>
              🛒
              {totalItems > 0 && (
                <CartBadge>{totalItems}</CartBadge>
              )}
            </CartButton>
          )}

          {isAuthenticated ? (
            <UserDropdown ref={dropdownRef}>
              <UserButton onClick={toggleUserDropdown}>
                👤 {getUserFullName()}
                <span style={{ marginLeft: '4px' }}>▼</span>
              </UserButton>
              <DropdownMenu isOpen={userDropdownOpen}>
                <DropdownItem onClick={() => {
                  navigate('/profile');
                  setUserDropdownOpen(false);
                }}>
                  Profile
                </DropdownItem>
                <DropdownItem onClick={() => {
                  navigate('/cart');
                  setUserDropdownOpen(false);
                }}>
                  Cart ({totalItems})
                </DropdownItem>
                <DropdownItem onClick={handleLogout}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </UserDropdown>
          ) : (
            <AuthButtons>
              <AuthButton to="/login" className="login">
                Login
              </AuthButton>
              <AuthButton to="/register" className="register">
                Sign Up
              </AuthButton>
            </AuthButtons>
          )}

          <MobileMenuButton onClick={toggleMobileMenu}>
            {isOpen ? '✕' : '☰'}
          </MobileMenuButton>
        </UserSection>
      </NavbarContent>
    </NavbarContainer>
  );
};

export default Navbar;