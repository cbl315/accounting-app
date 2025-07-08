import React from 'react';
import { ScrollView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import AmountInput from './AmountInput';
import CategoryPicker from './CategoryPicker';
import DatePicker from './DatePicker';
import ReceiptUpload from './ReceiptUpload';
import TypeSelector from './TypeSelector';
import useTransactionStore from '../stores/useTransactionStore';

const TransactionForm = () => {
  const [type, setType] = React.useState('expense');
  const [date, setDate] = React.useState(new Date());
  const [memo, setMemo] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [imageUri, setImageUri] = React.useState(null);
  const addTransaction = useTransactionStore(state => state.addTransaction);

  const handleSubmit = () => {
    if (!amount || !category) {
      alert('请填写金额和分类');
      return;
    }

    const transactionData = {
      amount: parseFloat(amount),
      type,
      category,
      date: date.toISOString(),
      memo
    };
    
    if (imageUri) {
      // 如果是base64数据，只存储数据部分
      transactionData.imageUri = imageUri.startsWith('data:') 
        ? imageUri.split(',')[1]
        : imageUri;
    }
    
    addTransaction(transactionData);
    // Reset form
    setAmount('');
    setCategory('');
    setMemo('');
    setImageUri(null);
  };

  return (
    <ScrollView style={{padding: 16}}>
      <AmountInput value={amount} onChangeText={setAmount} />
      
      <TypeSelector value={type} onChange={setType} />
      
      <DatePicker date={date} onChange={setDate} />
      
      <CategoryPicker 
        selected={category}
        onSelect={setCategory}
      />
      
      <TextInput
        label="备注"
        value={memo}
        onChangeText={setMemo}
        mode="outlined"
        style={{marginBottom: 16}}
      />
      
      <ReceiptUpload 
        imageUri={imageUri}
        onChange={setImageUri}
      />
      
      <Button 
        mode="contained" 
        onPress={handleSubmit}
        style={{marginTop: 16}}
        disabled={!amount || !category}
      >
        保存
      </Button>
    </ScrollView>
  );
};

export default TransactionForm;
