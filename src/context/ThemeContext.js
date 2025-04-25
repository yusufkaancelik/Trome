// src/context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, themeColors } from '../theme/colors';

// Create the context with a default value
export const ThemeContext = createContext({
  theme: colors,
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Varsayılan olarak açık tema

  // Geçerli temayı belirle
  const theme = isDarkMode ? themeColors.dark : themeColors.light;

  useEffect(() => {
    // Kaydedilmiş tema tercihini yükle
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.log('Tema yüklenirken hata oluştu', error);
      }
    };
    
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Tema tercihini kaydet
    try {
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.log('Tema kaydedilirken hata oluştu', error);
    }
  };

  const setTheme = async (isDark) => {
    setIsDarkMode(isDark);
    
    // Tema tercihini kaydet
    try {
      await AsyncStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Tema kaydedilirken hata oluştu', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};