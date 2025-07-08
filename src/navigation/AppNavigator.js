import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Add') {
              iconName = 'plus-circle';
            } else if (route.name === 'Stats') {
              iconName = 'chart-bar';
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={TransactionList} 
          options={{ title: '交易记录' }}
        />
        <Tab.Screen
          name="Add"
          component={TransactionForm}
          options={{ title: '记账' }}
        />
        <Tab.Screen
          name="Stats"
          component={() => <Text>统计页面</Text>}
          options={{ title: '统计' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
