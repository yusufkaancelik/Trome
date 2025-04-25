// src/components/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props 
}) => {
  const buttonStyle = [
    styles.button,
    styles[type],
    disabled && styles.disabled,
    style
  ];
  
  const textStyleArray = [
    styles.text,
    styles[`${type}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={type === 'outline' ? colors.primary : colors.text.primary} 
          size="small" 
        />
      ) : (
        <Text style={textStyleArray}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8
  },
  text: {
    fontSize: 16,
    fontWeight: '600'
  },
  // Tip varyasyonları
  primary: {
    backgroundColor: colors.primary
  },
  primaryText: {
    color: colors.text.primary
  },
  secondary: {
    backgroundColor: colors.secondary
  },
  secondaryText: {
    color: colors.text.primary
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary
  },
  outlineText: {
    color: colors.primary
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  ghostText: {
    color: colors.primary
  },
  disabled: {
    backgroundColor: colors.background.light,
    borderColor: colors.background.light
  },
  disabledText: {
    color: colors.text.disabled
  }
});