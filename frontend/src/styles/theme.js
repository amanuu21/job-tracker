export const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#667eea',
    primaryDark: '#5a67d8',
    primaryLight: '#ebf4ff',
    secondary: '#764ba2',
    accent: '#f093fb',
    success: '#48bb78',
    warning: '#ed8936',
    error: '#fc8181',
    info: '#63b3ed',

    bg: '#f7f8fc',
    bgCard: '#ffffff',
    bgSidebar: '#1a1d2e',
    bgSidebarHover: 'rgba(102,126,234,0.15)',

    text: '#1a202c',
    textSecondary: '#718096',
    textMuted: '#a0aec0',
    textInverse: '#ffffff',

    border: '#e2e8f0',
    borderLight: '#f0f4f8',
    shadow: 'rgba(0,0,0,0.08)',
    shadowMd: 'rgba(0,0,0,0.12)',

    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientAccent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    gradientSuccess: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    gradientWarm: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
  borderRadius: {
    sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
    lg: '0 8px 30px rgba(0,0,0,0.12)',
    xl: '0 20px 60px rgba(0,0,0,0.15)',
    glow: '0 0 20px rgba(102,126,234,0.3)',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.4s ease',
  },
};

export const darkTheme = {
  ...lightTheme,
  mode: 'dark',
  colors: {
    ...lightTheme.colors,
    bg: '#0f1117',
    bgCard: '#1a1d2e',
    bgSidebar: '#0d0f1a',
    bgSidebarHover: 'rgba(102,126,234,0.2)',

    text: '#f7fafc',
    textSecondary: '#a0aec0',
    textMuted: '#718096',

    border: '#2d3748',
    borderLight: '#1a202c',
    shadow: 'rgba(0,0,0,0.3)',
    shadowMd: 'rgba(0,0,0,0.4)',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
    lg: '0 8px 30px rgba(0,0,0,0.5)',
    xl: '0 20px 60px rgba(0,0,0,0.6)',
    glow: '0 0 20px rgba(102,126,234,0.4)',
  },
};
