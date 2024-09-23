import { useState } from "react";
import { Card, Steps, Button, Input, message, Typography, Space, QRCode } from "antd";
import {
    QrcodeOutlined,
    KeyOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";

const { Step } = Steps;
const { Title, Paragraph } = Typography;
import { twoFactorGenerate, confirmGenerate } from "@/api";

export default function TwoFactorBind({ onSuccess=null }) {
    const [current, setCurrent] = useState(0);
    const [qrCode, setQrCode] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateQRCode = async () => {
        setIsGenerating(true);
        await twoFactorGenerate().then((res) => {
            if (res.data.code == 200) {
                setQrCode(res.data.data);
                setIsGenerating(false);
                setCurrent(1);
            } else {
                setIsGenerating(false);
                message.error("Failed to generate QR code. Please try again.");
            }
        });
    };

    const verifyCode = async () => {
        setIsVerifying(true);
        await confirmGenerate(verificationCode).then((res) => {
            if (res.data.code == 200) {
                message.success(res.data.data);
                setCurrent(2);
                // 成功时回调
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error("验证失败: " + res.data.message);
            }
            setIsVerifying(false);
        });
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
                        loading={isGenerating}
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
                    <QRCode
                        value={qrCode}
                        size={200}
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
