import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, NativeEventEmitter } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export default function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const { colors } = useTheme();
  const inputs = useRef<TextInput[]>([]);
  const otpArray = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (text: string, index: number) => {
    const newOtpArray = [...otpArray];
    newOtpArray[index] = text.slice(-1);
    const newValue = newOtpArray.join('');
    onChange(newValue);

    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array(length).fill(0).map((_, i) => (
        <View 
          key={i} 
          style={[
            styles.inputBox, 
            { 
              backgroundColor: colors.card,
              borderColor: value.length === i ? colors.primary : colors.border,
              borderWidth: value.length === i ? 2 : 1,
            }
          ]}
        >
          <TextInput
            ref={(ref) => (inputs.current[i] = ref as TextInput)}
            style={[styles.input, { color: colors.text }]}
            value={otpArray[i]}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
  },
  inputBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  input: {
    fontSize: 24,
    fontWeight: '700',
    width: '100%',
    height: '100%',
  },
});
