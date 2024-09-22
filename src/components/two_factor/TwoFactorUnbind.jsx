import { useState } from 'react';
import { Input, Button, Space, Typography, Checkbox } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * 
 * @param {onUnbind} 回调逻辑，用于输入验证码并确认后的逻辑
 * @param {onCancel} 取消按钮的回调逻辑
 * @returns 
 */
const TwoFactorUnBind = ({ onUnbind, onCancel }) => {
  const [code, setCode] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value);
    setError('');
  };

  const handleConfirmChange = (e) => {
    setConfirmed(e.target.checked);
  };

  const handleUnbind = () => {
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    if (!confirmed) {
      setError('Please confirm that you want to disable two-factor authentication.');
      return;
    }

    onUnbind(code);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={4}>Disable Two-Factor Authentication</Title>
      
      <Text type="warning">
        <ExclamationCircleOutlined /> Warning: Disabling two-factor authentication will make your account less secure.
      </Text>
      
      <Space direction="vertical">
        <Text>Enter your 6-digit verification code:</Text>
        <Input
          value={code}
          onChange={handleCodeChange}
          maxLength={6}
          style={{ width: '200px' }}
          placeholder="000000"
        />
      </Space>
      
      {error && <Text type="danger">{error}</Text>}
      
      <Checkbox checked={confirmed} onChange={handleConfirmChange}>
        I understand that disabling two-factor authentication reduces the security of my account.
      </Checkbox>
      
      <Space>
        <Button type="primary" danger onClick={handleUnbind} disabled={!code || !confirmed}>
          Disable Two-Factor Authentication
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </Space>
  );
};

export default TwoFactorUnBind;