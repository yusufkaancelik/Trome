// src/components/Typography.js
  import React from 'react';
  import { Text, StyleSheet } from 'react-native';
  import { colors } from '../theme/colors';
  
  export const Typography = {
    H1: ({ children, style, ...props }) => (
      <Text style={[styles.h1, style]} {...props}>{children}</Text>
    ),
    H2: ({ children, style, ...props }) => (
      <Text style={[styles.h2, style]} {...props}>{children}</Text>
    ),
    H3: ({ children, style, ...props }) => (
      <Text style={[styles.h3, style]} {...props}>{children}</Text>
    ),
    Body: ({ children, style, ...props }) => (
      <Text style={[styles.body, style]} {...props}>{children}</Text>
    ),
    Caption: ({ children, style, ...props }) => (
      <Text style={[styles.caption, style]} {...props}>{children}</Text>
    )
  };
  
  const styles = StyleSheet.create({
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 8
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 6
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4
    },
    body: {
      fontSize: 16,
      color: colors.text.primary
    },
    caption: {
      fontSize: 14,
      color: colors.text.secondary
    }
  });