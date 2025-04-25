// src/theme/colors.js
const darkTheme = {
  primary: '#6C63FF',
  secondary: '#FF6584',
  accent: '#63FFDA',
  background: {
    dark: '#121212',
    medium: '#1E1E1E',
    light: '#2D2D2D'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6B6B6B'
  },
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFEB3B',
  danger: '#F44336'  // ProfileScreen'deki danger kullanımı için eklendi
};

const lightTheme = {
  primary: '#6C63FF',
  secondary: '#FF6584',
  accent: '#63FFDA',
  background: {
    dark: '#121212',
    medium: '#1E1E1E',
    light: '#2D2D2D'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6B6B6B'
  },
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFEB3B',
  danger: '#F44336'  // ProfileScreen'deki danger kullanımı için eklendi
};

// Tema nesnelerini export et
export const themeColors = {
  dark: darkTheme,
  light: darkTheme
};

// Varsayılan olarak açık tema değerlerini içeren colors nesnesi
export const colors = {
  ...darkTheme,
  dark: darkTheme,
  light: darkTheme
};