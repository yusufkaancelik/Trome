// src/components/Input.js
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  label,
  error,
  style,
  inputStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          inputStyle
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.disabled}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%'
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8
  },
  input: {
    backgroundColor: colors.background.light,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.background.light
  },
  inputError: {
    borderColor: colors.error
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4
  }
});