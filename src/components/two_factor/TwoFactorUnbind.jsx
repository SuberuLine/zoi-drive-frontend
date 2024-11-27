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
      setError('请输入正确的六位验证码！');
      return;
    }

    if (!confirmed) {
      setError('请先确认您已了解关闭两步验证的风险');
      return;
    }

    onUnbind(code);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={4}>正在进行两步验证关闭操作</Title>
      
      <Text type="warning">
        <ExclamationCircleOutlined /> 警告：关闭两步验证会导致您的账户安全性降低
      </Text>
      
      <Space direction="vertical">
        <Text>输入您验证器中的六位数验证码：</Text>
        <Input
          value={code}
          onChange={handleCodeChange}
          maxLength={6}
          style={{ width: '200px' }}
          placeholder="输入六位数的验证码"
        />
      </Space>
      
      {error && <Text type="danger">{error}</Text>}
      
      <Checkbox checked={confirmed} onChange={handleConfirmChange}>
        我了解关闭两步认证会给我的账户带来的风险
      </Checkbox>
      
      <Space>
        <Button type="primary" danger onClick={handleUnbind} disabled={!code || !confirmed}>
          关闭两步验证
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </Space>
    </Space>
  );
};

export default TwoFactorUnBind;