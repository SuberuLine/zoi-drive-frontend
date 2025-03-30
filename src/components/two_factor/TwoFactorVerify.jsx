import { useState } from "react";
import { Card, Input, Button, message, Typography, Space } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import { twoFactorValidate } from "@/api";

const { Title, Paragraph } = Typography;

export default function TwoFactorVerify({ onSuccess }) {
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        if (!verificationCode) {
            message.warning('请输入验证码');
            return;
        }

        setIsVerifying(true);
        try {
            const res = await twoFactorValidate(verificationCode);
            if (res.data.code === 200) {
                if (res.data.data) {
                    const tokenData = {
                        token: res.data.data,
                        timestamp: Date.now()
                    };
                    localStorage.setItem('2fa_temp_token', JSON.stringify(tokenData));
                }
                
                message.success('验证成功');
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error('验证失败: ' + res.data.message);
            }
        } catch (error) {
            console.error('验证失败:', error);
            message.error('验证失败');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Card
            title="两步验证"
            style={{ width: 500, margin: "auto" }}
        >
            <Space
                direction="vertical"
                align="center"
                style={{ width: "100%" }}
            >
                <Title level={4}>请输入验证码</Title>
                <Paragraph>
                    请打开您的身份验证器应用程序，输入显示的验证码。
                </Paragraph>
                <Input
                    placeholder="输入验证码"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    style={{ width: 200, marginBottom: 16 }}
                    onPressEnter={handleVerify}
                />
                <Button
                    type="primary"
                    onClick={handleVerify}
                    loading={isVerifying}
                    icon={<KeyOutlined />}
                    disabled={!verificationCode}
                >
                    验证
                </Button>
            </Space>
        </Card>
    );
}
