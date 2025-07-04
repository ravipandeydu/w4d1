import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../services/api';

// Styled Components
const ProfileContainer = styled.div`
  min-height: calc(100vh - 140px);
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.secondary};
`;

const ProfileContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const ProfileSidebar = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.xl};
  height: fit-content;
  position: sticky;
  top: ${props => props.theme.spacing.xl};
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin: 0 auto ${props => props.theme.spacing.lg};
`;

const ProfileName = styled.h2`
  text-align: center;
  font-size: ${props => props.theme.fontSizes.h3};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProfileEmail = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary.main};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.muted};
  margin-top: ${props => props.theme.spacing.xs};
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const NavItem = styled.button`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.active ? props.theme.colors.primary.light : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.text.secondary};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: left;
  cursor: pointer;
  font-weight: ${props => props.active ? props.theme.fontWeights.semibold : props.theme.fontWeights.medium};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary.light};
    color: ${props => props.theme.colors.primary.main};
  }
`;

const ProfileMain = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const SectionTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes.h2};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const SectionSubtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.md};
`;

const SectionContent = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const FormLabel = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const FormInput = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.hasError ? props.theme.colors.error.main : props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? props.theme.colors.error.main : props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.hasError ? props.theme.colors.error.light : props.theme.colors.primary.light};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.background.secondary};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const FormSelect = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.light};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.background.secondary};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error.main};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const PreferenceItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
  }
  
  input {
    accent-color: ${props => props.theme.colors.primary.main};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const SaveButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
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

const CancelButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 2px solid ${props => props.theme.colors.border.main};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background.secondary};
    border-color: ${props => props.theme.colors.border.dark};
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
`;

const ActivityIcon = styled.div`
  font-size: 1.5rem;
`;

const ActivityDetails = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

const ActivityTime = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.muted};
`;

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports',
  'Beauty', 'Toys', 'Automotive', 'Health', 'Food & Beverages'
];

const Profile = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    gender: '',
    preferences: {
      categories: [],
      priceRange: { min: '', max: '' }
    }
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    favoriteProducts: 0,
    recentActivity: []
  });
  
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        age: user.age || '',
        gender: user.gender || '',
        preferences: {
          categories: user.preferences?.categories || [],
          priceRange: {
            min: user.preferences?.priceRange?.min || '',
            max: user.preferences?.priceRange?.max || ''
          }
        }
      };
      setFormData(userData);
      setOriginalData(userData);
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/users/interaction-stats');
      const stats = response.data;
      
      setUserStats({
        totalPurchases: stats.totalInteractions?.purchase || 0,
        totalSpent: stats.totalSpent || 0,
        favoriteProducts: stats.totalInteractions?.like || 0,
        recentActivity: stats.recentActivity || []
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox' && name === 'categories') {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          categories: checked 
            ? [...prev.preferences.categories, value]
            : prev.preferences.categories.filter(cat => cat !== value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.age && (formData.age < 13 || formData.age > 120)) {
      newErrors.age = 'Please enter a valid age';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        preferences: {
          categories: formData.preferences.categories,
          priceRange: {
            min: formData.preferences.priceRange.min ? parseFloat(formData.preferences.priceRange.min) : 0,
            max: formData.preferences.priceRange.max ? parseFloat(formData.preferences.priceRange.max) : 10000
          }
        }
      };
      
      await updateProfile(updateData);
      setOriginalData(formData);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const getInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'purchase': return '🛒';
      case 'like': return '❤️';
      case 'view': return '👁️';
      case 'search': return '🔍';
      default: return '📝';
    }
  };

  const renderProfileSection = () => (
    <>
      <SectionHeader>
        <SectionTitle>👤 Profile Information</SectionTitle>
        <SectionSubtitle>Manage your personal information and preferences</SectionSubtitle>
      </SectionHeader>
      
      <SectionContent>
        <FormGrid>
          <FormGroup>
            <FormLabel htmlFor="firstName">First Name</FormLabel>
            <FormInput
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              hasError={!!errors.firstName}
              disabled={loading}
            />
            {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="lastName">Last Name</FormLabel>
            <FormInput
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              hasError={!!errors.lastName}
              disabled={loading}
            />
            {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <FormInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              hasError={!!errors.email}
              disabled={loading}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="age">Age</FormLabel>
            <FormInput
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleInputChange}
              hasError={!!errors.age}
              disabled={loading}
              min="13"
              max="120"
            />
            {errors.age && <ErrorMessage>{errors.age}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="gender">Gender</FormLabel>
            <FormSelect
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </FormSelect>
          </FormGroup>
        </FormGrid>
        
        <div style={{ marginTop: '32px' }}>
          <FormLabel>Favorite Categories</FormLabel>
          <PreferencesGrid>
            {CATEGORIES.map(category => (
              <PreferenceItem key={category}>
                <input
                  type="checkbox"
                  name="categories"
                  value={category}
                  checked={formData.preferences.categories.includes(category)}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {category}
              </PreferenceItem>
            ))}
          </PreferencesGrid>
        </div>
        
        <FormGrid style={{ marginTop: '32px' }}>
          <FormGroup>
            <FormLabel htmlFor="priceMin">Min Price Range ($)</FormLabel>
            <FormInput
              id="priceMin"
              name="preferences.priceRange.min"
              type="number"
              value={formData.preferences.priceRange.min}
              onChange={handleInputChange}
              disabled={loading}
              min="0"
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="priceMax">Max Price Range ($)</FormLabel>
            <FormInput
              id="priceMax"
              name="preferences.priceRange.max"
              type="number"
              value={formData.preferences.priceRange.max}
              onChange={handleInputChange}
              disabled={loading}
              min="0"
            />
          </FormGroup>
        </FormGrid>
        
        {hasChanges && (
          <ActionButtons>
            <SaveButton onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  Saving...
                </>
              ) : (
                '💾 Save Changes'
              )}
            </SaveButton>
            <CancelButton onClick={handleCancel} disabled={loading}>
              Cancel
            </CancelButton>
          </ActionButtons>
        )}
      </SectionContent>
    </>
  );

  const renderActivitySection = () => (
    <>
      <SectionHeader>
        <SectionTitle>📊 Recent Activity</SectionTitle>
        <SectionSubtitle>Your recent interactions and shopping activity</SectionSubtitle>
      </SectionHeader>
      
      <SectionContent>
        {userStats.recentActivity.length > 0 ? (
          <ActivityList>
            {userStats.recentActivity.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityIcon>{getActivityIcon(activity.type)}</ActivityIcon>
                <ActivityDetails>
                  <ActivityTitle>
                    {activity.type === 'purchase' && `Purchased ${activity.productName}`}
                    {activity.type === 'like' && `Liked ${activity.productName}`}
                    {activity.type === 'view' && `Viewed ${activity.productName}`}
                    {activity.type === 'search' && `Searched for "${activity.query}"`}
                  </ActivityTitle>
                  <ActivityTime>{formatActivityTime(activity.timestamp)}</ActivityTime>
                </ActivityDetails>
              </ActivityItem>
            ))}
          </ActivityList>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
            <h3>No recent activity</h3>
            <p>Start shopping to see your activity here!</p>
            <Link to="/products" style={{ color: '#007bff', textDecoration: 'none' }}>
              Browse Products →
            </Link>
          </div>
        )}
      </SectionContent>
    </>
  );

  return (
    <ProfileContainer>
      <ProfileContent>
        <ProfileSidebar>
          <ProfileAvatar>{getInitials()}</ProfileAvatar>
          <ProfileName>{user?.firstName} {user?.lastName}</ProfileName>
          <ProfileEmail>{user?.email}</ProfileEmail>
          
          <ProfileStats>
            <StatItem>
              <StatValue>{userStats.totalPurchases}</StatValue>
              <StatLabel>Purchases</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>${userStats.totalSpent.toFixed(0)}</StatValue>
              <StatLabel>Total Spent</StatLabel>
            </StatItem>
          </ProfileStats>
          
          <NavMenu>
            <NavItem 
              active={activeSection === 'profile'}
              onClick={() => setActiveSection('profile')}
            >
              👤 Profile
            </NavItem>
            <NavItem 
              active={activeSection === 'activity'}
              onClick={() => setActiveSection('activity')}
            >
              📊 Activity
            </NavItem>
          </NavMenu>
        </ProfileSidebar>
        
        <ProfileMain>
          {activeSection === 'profile' && renderProfileSection()}
          {activeSection === 'activity' && renderActivitySection()}
        </ProfileMain>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default Profile;