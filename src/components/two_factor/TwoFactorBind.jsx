import { useState } from "react";
import { Card, Steps, Button, Input, message, Typography, Space } from "antd";
import {
    QrcodeOutlined,
    KeyOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";

const { Step } = Steps;
const { Title, Paragraph } = Typography;

export default function TwoFactorBind({ onSuccess=null }) {
    const [current, setCurrent] = useState(0);
    const [qrCode, setQrCode] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const generateQRCode = () => {
        // 模拟生成QR码的过程
        setTimeout(() => {
            setQrCode(
                "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
            );
            setCurrent(1);
        }, 1000);
    };

    const verifyCode = () => {
        setIsVerifying(true);
        // 模拟验证过程
        setTimeout(() => {
            if (verificationCode === "123456") {
                // 假设 '123456' 是正确的验证码
                message.success(
                    "Two-factor authentication has been successfully set up!"
                );
                setCurrent(2);
                // 成功时回调
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error("Invalid verification code. Please try again.");
            }
            setIsVerifying(false);
        }, 1500);
    };

    const steps = [
        {
            title: "Generate QR Code",
            content: (
                <Space
                    direction="vertical"
                    align="center"
                    style={{ width: "100%" }}
                >
                    <Paragraph>
                        Click the button below to generate a QR code for your
                        two-factor authentication setup.
                    </Paragraph>
                    <Button
                        type="primary"
                        onClick={generateQRCode}
                        icon={<QrcodeOutlined />}
                    >
                        Generate QR Code
                    </Button>
                </Space>
            ),
        },
        {
            title: "Scan & Verify",
            content: (
                <Space
                    direction="vertical"
                    align="center"
                    style={{ width: "100%" }}
                >
                    <img
                        src={qrCode}
                        alt="QR Code"
                        style={{ marginBottom: 16 }}
                    />
                    <Paragraph>
                        Scan this QR code with your authenticator app, then
                        enter the verification code below.
                    </Paragraph>
                    <Input
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        style={{ width: 200, marginBottom: 16 }}
                    />
                    <Button
                        type="primary"
                        onClick={verifyCode}
                        disabled={!verificationCode}
                        loading={isVerifying}
                        icon={<KeyOutlined />}
                    >
                        Verify Code
                    </Button>
                </Space>
            ),
        },
        {
            title: "Completed",
            content: (
                <Space
                    direction="vertical"
                    align="center"
                    style={{ width: "100%" }}
                >
                    <CheckCircleOutlined
                        style={{ fontSize: 48, color: "#52c41a" }}
                    />
                    <Title level={4}>Two-Factor Authentication Enabled</Title>
                    <Paragraph>
                        You have successfully set up two-factor authentication
                        for your account.
                    </Paragraph>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Set Up Two-Factor Authentication"
            style={{ width: 500, margin: "auto" }}
        >
            <Steps current={current}>
                {steps.map((item) => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <div style={{ marginTop: 24, minHeight: 200 }}>
                {steps[current].content}
            </div>
        </Card>
    );
}
