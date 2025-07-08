import React from 'react';
import { Button, Avatar } from 'react-native-paper';

const ReceiptUpload = ({ imageUri, onChange }) => {
  const handleSelectImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // 验证图片大小
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }
      
      // 验证图片类型
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('仅支持JPEG/PNG格式');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target.result);
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  return (
    <>
      {imageUri ? (
        <Avatar.Image 
          size={120} 
          source={{ uri: imageUri }} 
          style={{ marginBottom: 16, alignSelf: 'center' }}
        />
      ) : null}
      <Button 
        mode="outlined" 
        onPress={handleSelectImage}
        icon="camera"
        style={{ marginBottom: 16 }}
      >
        {imageUri ? '更换图片' : '上传凭证'}
      </Button>
    </>
  );
};

export default ReceiptUpload;
