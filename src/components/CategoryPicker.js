import React from 'react';
import { Menu, Divider } from 'react-native-paper';

const PRESET_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: 'food' },
  { id: 'transport', name: '交通', icon: 'bus' },
  { id: 'shopping', name: '购物', icon: 'shopping' },
  { id: 'entertainment', name: '娱乐', icon: 'movie' },
  { id: 'housing', name: '住房', icon: 'home' },
];

const CategoryPicker = ({ selected, onSelect }) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <Button 
          mode="outlined" 
          onPress={openMenu}
          icon={selected ? 'check' : 'plus'}
          style={{ marginBottom: 16 }}
        >
          {selected || '选择分类'}
        </Button>
      }
    >
      {PRESET_CATEGORIES.map(category => (
        <Menu.Item
          key={category.id}
          title={category.name}
          leadingIcon={category.icon}
          onPress={() => {
            onSelect(category.name);
            closeMenu();
          }}
        />
      ))}
      <Divider />
      <Menu.Item
        title="自定义分类"
        leadingIcon="plus"
        onPress={() => {
          // TODO: 实现自定义分类逻辑
          closeMenu();
        }}
      />
    </Menu>
  );
};

export default CategoryPicker;
