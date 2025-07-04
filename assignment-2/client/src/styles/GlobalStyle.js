import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.fonts.primary};
    font-size: ${props => props.theme.fontSizes.base};
    line-height: 1.6;
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .App {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.fonts.heading};
    font-weight: ${props => props.theme.fontWeights.bold};
    line-height: 1.2;
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text.primary};
  }

  h1 {
    font-size: ${props => props.theme.fontSizes.h1};
  }

  h2 {
    font-size: ${props => props.theme.fontSizes.h2};
  }

  h3 {
    font-size: ${props => props.theme.fontSizes.h3};
  }

  h4 {
    font-size: ${props => props.theme.fontSizes.h4};
  }

  h5 {
    font-size: ${props => props.theme.fontSizes.h5};
  }

  h6 {
    font-size: ${props => props.theme.fontSizes.h6};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text.secondary};
  }

  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${props => props.theme.colors.primary.dark};
      text-decoration: underline;
    }
  }

  /* Form Elements */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.light};
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover {
      background: ${props => props.theme.colors.border.main};
    }
  }

  /* Selection */
  ::selection {
    background: ${props => props.theme.colors.primary.light};
    color: white;
  }

  ::-moz-selection {
    background: ${props => props.theme.colors.primary.light};
    color: white;
  }

  /* Focus Styles */
  *:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  /* Utility Classes */
  .container {
    max-width: ${props => props.theme.breakpoints.xl};
    margin: 0 auto;
    padding: 0 ${props => props.theme.spacing.md};

    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      padding: 0 ${props => props.theme.spacing.sm};
    }
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .mb-0 { margin-bottom: 0; }
  .mb-1 { margin-bottom: ${props => props.theme.spacing.xs}; }
  .mb-2 { margin-bottom: ${props => props.theme.spacing.sm}; }
  .mb-3 { margin-bottom: ${props => props.theme.spacing.md}; }
  .mb-4 { margin-bottom: ${props => props.theme.spacing.lg}; }
  .mb-5 { margin-bottom: ${props => props.theme.spacing.xl}; }

  .mt-0 { margin-top: 0; }
  .mt-1 { margin-top: ${props => props.theme.spacing.xs}; }
  .mt-2 { margin-top: ${props => props.theme.spacing.sm}; }
  .mt-3 { margin-top: ${props => props.theme.spacing.md}; }
  .mt-4 { margin-top: ${props => props.theme.spacing.lg}; }
  .mt-5 { margin-top: ${props => props.theme.spacing.xl}; }

  .d-flex {
    display: flex;
  }

  .flex-column {
    flex-direction: column;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .align-center {
    align-items: center;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .gap-1 { gap: ${props => props.theme.spacing.xs}; }
  .gap-2 { gap: ${props => props.theme.spacing.sm}; }
  .gap-3 { gap: ${props => props.theme.spacing.md}; }
  .gap-4 { gap: ${props => props.theme.spacing.lg}; }

  /* Responsive Utilities */
  .hide-mobile {
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      display: none;
    }
  }

  .hide-desktop {
    @media (min-width: ${props => props.theme.breakpoints.md}) {
      display: none;
    }
  }

  /* Animation Classes */
  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  .slide-up {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Loading Animation */
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  /* Card Hover Effects */
  .card-hover {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${props => props.theme.shadows.lg};
    }
  }

  /* Image Styles */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  .img-cover {
    object-fit: cover;
  }

  .img-contain {
    object-fit: contain;
  }

  /* Error and Success States */
  .error-text {
    color: ${props => props.theme.colors.error.main};
    font-size: ${props => props.theme.fontSizes.sm};
  }

  .success-text {
    color: ${props => props.theme.colors.success.main};
    font-size: ${props => props.theme.fontSizes.sm};
  }

  .warning-text {
    color: ${props => props.theme.colors.warning.main};
    font-size: ${props => props.theme.fontSizes.sm};
  }

  /* Print Styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    a, a:visited {
      text-decoration: underline;
    }

    a[href]:after {
      content: " (" attr(href) ")";
    }

    abbr[title]:after {
      content: " (" attr(title) ")";
    }

    .no-print {
      display: none !important;
    }
  }
`;

export default GlobalStyle;