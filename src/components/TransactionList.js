import React from 'react';
import { FlatList, View } from 'react-native';
import { List, Text } from 'react-native-paper';
import useTransactionStore from '../stores/useTransactionStore';

const TransactionList = () => {
  const transactions = useTransactionStore(state => state.transactions);

  const renderItem = ({ item }) => (
    <List.Item
      title={`${item.category} - ¥${item.amount}`}
      description={item.memo || '无备注'}
      left={props => (
        <List.Icon 
          {...props} 
          icon={item.type === 'income' ? 'arrow-up' : 'arrow-down'} 
          color={item.type === 'income' ? 'green' : 'red'}
        />
      )}
      right={props => (
        <Text>{new Date(item.date).toLocaleDateString()}</Text>
      )}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            暂无交易记录
          </Text>
        }
      />
    </View>
  );
};

export default TransactionList;
