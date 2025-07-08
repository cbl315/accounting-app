import React from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DatePicker = ({ date, onChange }) => {
  const [visible, setVisible] = React.useState(false);

  const onConfirm = ({ date }) => {
    onChange(date);
    setVisible(false);
  };

  return (
    <>
      <Button 
        mode="outlined" 
        onPress={() => setVisible(true)}
        icon="calendar"
        style={{ marginBottom: 16 }}
      >
        {date.toLocaleDateString('zh-CN')}
      </Button>
      
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <DatePickerModal
            locale="zh"
            mode="single"
            visible={visible}
            onConfirm={onConfirm}
            onDismiss={() => setVisible(false)}
            date={date}
          />
        </Dialog>
      </Portal>
    </>
  );
};

export default DatePicker;
