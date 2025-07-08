import React from 'react';
import { SegmentedButtons } from 'react-native-paper';

const TypeSelector = ({ value, onChange }) => {
  return (
    <SegmentedButtons
      value={value}
      onValueChange={onChange}
      buttons={[
        {
          value: 'expense',
          icon: 'arrow-down',
          label: '支出',
          style: { marginBottom: 16 }
        },
        {
          value: 'income', 
          icon: 'arrow-up',
          label: '收入',
          style: { marginBottom: 16 }
        },
      ]}
    />
  );
};

export default TypeSelector;
