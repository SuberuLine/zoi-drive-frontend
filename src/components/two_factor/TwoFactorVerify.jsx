import { useState, useRef, useEffect } from "react";
import { Input, Button, Space, Typography } from "antd";

const { Text } = Typography;

const TwoFactorInput = ({ onVerify }) => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus on the first input when the component mounts
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError("");

        // Move to the next input if the current one is filled
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to the previous input on backspace if the current input is empty
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = () => {
        const verificationCode = code.join("");
        if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
            onVerify(verificationCode);
        } else {
            setError("Please enter a valid 6-digit code.");
        }
    };

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Text>Enter the 6-digit verification code:</Text>
            <Space size="small">
                {code.map((digit, index) => (
                    <Input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        maxLength={1}
                        style={{
                            width: "40px",
                            height: "40px",
                            textAlign: "center",
                            fontSize: "18px",
                        }}
                    />
                ))}
            </Space>
            {error && <Text type="danger">{error}</Text>}
            <Button type="primary" onClick={handleVerify} block>
                Verify
            </Button>
        </Space>
    );
};

export default TwoFactorInput;
