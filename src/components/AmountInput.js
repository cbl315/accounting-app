import React from 'react';
import { TextInput } from 'react-native-paper';

const AmountInput = ({ value, onChangeText }) => {
  const handleChange = (text) => {
    // 验证金额格式（最多两位小数）
    if (/^\d*\.?\d{0,2}$/.test(text) || text === '') {
      onChangeText(text);
    }
  };

  return (
    <TextInput
      label="金额"
      value={value}
      onChangeText={handleChange}
      keyboardType="numeric"
      mode="outlined"
      left={<TextInput.Affix text="¥" />}
      style={{ marginBottom: 16 }}
    />
  );
};

export default AmountInput;
