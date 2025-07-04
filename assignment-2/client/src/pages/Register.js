import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Styled Components
const RegisterContainer = styled.div`
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.secondary};
`;

const RegisterCard = styled.div`
  background: ${props => props.theme.colors.background.paper};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  width: 100%;
  max-width: 500px;
  position: relative;
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const RegisterTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes.h2};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const RegisterSubtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.md};
`;

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
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
  
  .required {
    color: ${props => props.theme.colors.error.main};
  }
`;

const FormInput = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.hasError ? props.theme.colors.error.main : props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.background.paper};
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? props.theme.colors.error.main : props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.hasError ? props.theme.colors.error.light : props.theme.colors.primary.light};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.background.secondary};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const FormSelect = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.hasError ? props.theme.colors.error.main : props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.background.paper};
  cursor: pointer;
  
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

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error.main};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success.main};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.muted};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  
  &:hover {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const PasswordStrength = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
`;

const StrengthBar = styled.div`
  height: 4px;
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.sm};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StrengthFill = styled.div`
  height: 100%;
  width: ${props => props.strength}%;
  background: ${props => {
    if (props.strength < 30) return props.theme.colors.error.main;
    if (props.strength < 60) return props.theme.colors.warning.main;
    return props.theme.colors.success.main;
  }};
  transition: all 0.3s ease;
`;

const StrengthText = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => {
    if (props.strength < 30) return props.theme.colors.error.main;
    if (props.strength < 60) return props.theme.colors.warning.main;
    return props.theme.colors.success.main;
  }};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const PreferencesSection = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
`;

const PreferencesTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  
  input {
    accent-color: ${props => props.theme.colors.primary.main};
  }
  
  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const RegisterButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.lg} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.border.light};
  }
  
  span {
    color: ${props => props.theme.colors.text.muted};
    font-size: ${props => props.theme.fontSizes.sm};
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fontSizes.sm};
  
  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${props => props.theme.fontWeights.semibold};
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports',
  'Beauty', 'Toys', 'Automotive', 'Health', 'Food & Beverages'
];

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    preferences: {
      categories: [],
      priceRange: { min: '', max: '' }
    }
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (passwordStrength < 30) {
      newErrors.password = 'Password is too weak. Please choose a stronger password';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 13) {
      newErrors.age = 'You must be at least 13 years old';
    } else if (formData.age > 120) {
      newErrors.age = 'Please enter a valid age';
    }
    
    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender,
        preferences: {
          categories: formData.preferences.categories,
          priceRange: {
            min: formData.preferences.priceRange.min ? parseFloat(formData.preferences.priceRange.min) : 0,
            max: formData.preferences.priceRange.max ? parseFloat(formData.preferences.priceRange.max) : 10000
          }
        }
      };
      
      await register(registrationData);
      showSuccess('Account created successfully! Welcome to RecommendShop!');
      navigate('/', { replace: true });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      showError(errorMessage);
      
      // Set specific field errors if provided by the server
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <RegisterTitle>Create Your Account</RegisterTitle>
          <RegisterSubtitle>Join RecommendShop and discover products made for you</RegisterSubtitle>
        </RegisterHeader>
        
        <RegisterForm onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <FormLabel htmlFor="firstName">
                First Name <span className="required">*</span>
              </FormLabel>
              <FormInput
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                hasError={!!errors.firstName}
                disabled={loading}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <ErrorMessage>
                  ⚠️ {errors.firstName}
                </ErrorMessage>
              )}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="lastName">
                Last Name <span className="required">*</span>
              </FormLabel>
              <FormInput
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                hasError={!!errors.lastName}
                disabled={loading}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <ErrorMessage>
                  ⚠️ {errors.lastName}
                </ErrorMessage>
              )}
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <FormLabel htmlFor="email">
              Email Address <span className="required">*</span>
            </FormLabel>
            <FormInput
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              hasError={!!errors.email}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <ErrorMessage>
                ⚠️ {errors.email}
              </ErrorMessage>
            )}
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <FormLabel htmlFor="age">
                Age <span className="required">*</span>
              </FormLabel>
              <FormInput
                id="age"
                name="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleInputChange}
                hasError={!!errors.age}
                disabled={loading}
                min="13"
                max="120"
              />
              {errors.age && (
                <ErrorMessage>
                  ⚠️ {errors.age}
                </ErrorMessage>
              )}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="gender">
                Gender <span className="required">*</span>
              </FormLabel>
              <FormSelect
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                hasError={!!errors.gender}
                disabled={loading}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </FormSelect>
              {errors.gender && (
                <ErrorMessage>
                  ⚠️ {errors.gender}
                </ErrorMessage>
              )}
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <FormLabel htmlFor="password">
              Password <span className="required">*</span>
            </FormLabel>
            <PasswordInputWrapper>
              <FormInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                hasError={!!errors.password}
                disabled={loading}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </PasswordToggle>
            </PasswordInputWrapper>
            {formData.password && (
              <PasswordStrength>
                <StrengthBar>
                  <StrengthFill strength={passwordStrength} />
                </StrengthBar>
                <StrengthText strength={passwordStrength}>
                  Password strength: {getPasswordStrengthText()}
                </StrengthText>
              </PasswordStrength>
            )}
            {errors.password && (
              <ErrorMessage>
                ⚠️ {errors.password}
              </ErrorMessage>
            )}
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </FormLabel>
            <PasswordInputWrapper>
              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                hasError={!!errors.confirmPassword}
                disabled={loading}
                autoComplete="new-password"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </PasswordToggle>
            </PasswordInputWrapper>
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <SuccessMessage>
                ✅ Passwords match
              </SuccessMessage>
            )}
            {errors.confirmPassword && (
              <ErrorMessage>
                ⚠️ {errors.confirmPassword}
              </ErrorMessage>
            )}
          </FormGroup>
          
          {/* Preferences Section */}
          <PreferencesSection>
            <PreferencesTitle>🎯 Personalization Preferences (Optional)</PreferencesTitle>
            
            <FormGroup>
              <FormLabel>Favorite Categories</FormLabel>
              <CheckboxGroup>
                {CATEGORIES.map(category => (
                  <CheckboxItem key={category}>
                    <input
                      type="checkbox"
                      name="categories"
                      value={category}
                      checked={formData.preferences.categories.includes(category)}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {category}
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="priceMin">Min Price Range ($)</FormLabel>
                <FormInput
                  id="priceMin"
                  name="preferences.priceRange.min"
                  type="number"
                  placeholder="0"
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
                  placeholder="1000"
                  value={formData.preferences.priceRange.max}
                  onChange={handleInputChange}
                  disabled={loading}
                  min="0"
                />
              </FormGroup>
            </FormRow>
          </PreferencesSection>
          
          <RegisterButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner size="small" color="white" />
                Creating Account...
              </>
            ) : (
              '🚀 Create Account'
            )}
          </RegisterButton>
        </RegisterForm>
        
        <Divider>
          <span>or</span>
        </Divider>
        
        <LoginPrompt>
          Already have an account? <Link to="/login">Sign in here</Link>
        </LoginPrompt>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;