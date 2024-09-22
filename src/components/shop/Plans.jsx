import { useState, useEffect } from "react";
import {
    Card,
    Button,
    Row,
    Col,
    Typography,
    Space,
    Modal,
    Radio,
    message,
    ConfigProvider,
} from "antd";
import { CheckOutlined, AntDesignOutlined } from "@ant-design/icons";
import { createStyles } from 'antd-style';

const { Title, Text } = Typography;

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
        &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
            border-width: 0;

            > span {
                position: relative;
            }

            &::before {
                content: '';
                background: linear-gradient(135deg, #6253e1, #04befe);
                position: absolute;
                inset: 0;
                opacity: 1;
                transition: all 0.3s;
                border-radius: inherit;
            }

            &:hover::before {
                opacity: 0;
            }
        }
    `,
}));

const plans = [
    {
        id: "free",
        name: "免费方案",
        price: 0,
        description: "开始使用我们的基本功能。",
        features: [
            "免费使用",
            "100 GB 存储空间",
            "在线图片查看",
            "每月 10 次磁力下载配额",
        ],
    },
    {
        id: "basic",
        name: "入门方案",
        price: 30,
        description: "适合个人日常存储使用",
        features: [
            "超高速下载",
            "1000 GB 存储空间",
            "在线图片、视频查看",
            "每月 100 次磁力下载配额",
        ],
    },
    {
        id: "pro",
        name: "专业计划",
        price: 88,
        description: "为高需求人群定制",
        features: [
            "无限制下载速度",
            "2 TB 存储空间",
            "在线图片、视频查看与文档编辑",
            "无限次下载配额",
        ],
    },
    {
        id: "enterprise",
        name: "企业级计划",
        price: 4999,
        description: "最优质的服务",
        features: [
            "专属存储服务器，专线接入",
            "12 TB 独立存储空间",
            "可自定义服务",
            "专人对接",
        ],
    }
];

const paymentMethods = [
    { id: "alipay", name: "支付宝" },
    { id: "wechat", name: "微信支付" },
    { id: "card", name: "信用卡" },
];

const MembershipPlan = () => {
    const { styles } = useStyle();
    const [currentPlan, setCurrentPlan] = useState("free");
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentStep, setPaymentStep] = useState(1);

    useEffect(() => {
        setTimeout(() => {
            setCurrentPlan("basic");
        }, 1000);
    }, []);

    const showModal = (plan) => {
        setSelectedPlan(plan);
        setIsModalVisible(true);
        setPaymentStep(1);
        setPaymentMethod(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedPlan(null);
        setPaymentStep(1);
        setPaymentMethod(null);
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleNextStep = () => {
        if (paymentStep === 1 && paymentMethod) {
            setPaymentStep(2);
        } else if (paymentStep === 1) {
            message.error("请选择支付方式");
        }
    };

    const handlePaymentComplete = () => {
        // 模拟支付验证
        message.loading("正在验证支付状态...", 2).then(() => {
            message.success("支付成功！", 2);
            setPaymentStep(3);
        });
    };

    const renderModalContent = () => {
        switch (paymentStep) {
            case 1:
                return (
                    <div>
                        <Title level={4}>选择支付方式</Title>
                        <Radio.Group
                            onChange={handlePaymentMethodChange}
                            value={paymentMethod}
                        >
                            <Space direction="vertical">
                                {paymentMethods.map((method) => (
                                    <Radio key={method.id} value={method.id}>
                                        {method.name}
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>
                    </div>
                );
            case 2:
                return (
                    <div
                        style={{
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Title level={4}>扫码支付</Title>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentMethod}-${selectedPlan.id}`}
                            alt="支付二维码"
                            style={{ width: 200, height: 200, margin: "20px 0" }}
                        />
                        <br />
                        <Button onClick={handlePaymentComplete}>
                            已完成支付
                        </Button>
                    </div>
                );
            case 3:
                return (
                    <div style={{ textAlign: "center" }}>
                        <Title level={4}>支付成功</Title>
                        <Text>恭喜您成功订阅 {selectedPlan.name}！</Text>
                    </div>
                );
            default:
                return null;
        }
    };

    const cardStyle = {
        height: "100%",
        transition: "all 0.3s",
        backgroundColor: "#f0f2f5",
    };

    return (
        <ConfigProvider
            button={{
                className: styles.linearGradientButton,
            }}
        >
            <div style={{ padding: "24px" }}>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div style={{ textAlign: "center" }}>
                        <Title level={2}>ZoiDrive 定价计划</Title>
                        <Text>简单、透明的定价，满足您的业务需求。</Text>
                    </div>
                    <Row gutter={[16, 16]}>
                        {plans.map((plan) => (
                            <Col xs={24} sm={12} md={6} key={plan.id}>
                                <Card
                                    hoverable
                                    style={cardStyle}
                                    bodyStyle={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Space
                                        direction="vertical"
                                        size="middle"
                                        style={{ width: "100%", flex: 1 }}
                                    >
                                        <div>
                                            <Title level={3}>{plan.name}</Title>
                                            <Text type="secondary">
                                                {plan.description}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text
                                                strong
                                                style={{ fontSize: "2rem" }}
                                            >
                                                ￥{plan.price}
                                            </Text>
                                            <Text type="secondary">/月</Text>
                                        </div>
                                        <ul
                                            style={{
                                                listStyleType: "none",
                                                padding: 0,
                                                margin: 0,
                                                flex: 1,
                                            }}
                                        >
                                            {plan.features.map((feature, index) => (
                                                <li
                                                    key={index}
                                                    style={{
                                                        marginBottom: "8px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <CheckOutlined
                                                        style={{
                                                            color: "#52c41a",
                                                            marginRight: "8px",
                                                        }}
                                                    />
                                                    <Text>{feature}</Text>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<AntDesignOutlined />}
                                            onClick={() => showModal(plan)}
                                            disabled={plan.id === currentPlan}
                                            style={{ width: "100%" }}
                                        >
                                            {plan.id === currentPlan
                                                ? "当前方案"
                                                : "选择方案"}
                                        </Button>
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Space>

                <Modal
                    title={`订阅 ${selectedPlan?.name}`}
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={
                        paymentStep === 1
                            ? [
                                  <Button key="back" onClick={handleCancel}>
                                      取消
                                  </Button>,
                                  <Button
                                      key="next"
                                      type="primary"
                                      onClick={handleNextStep}
                                  >
                                      下一步
                                  </Button>,
                              ]
                            : null
                    }
                >
                    {renderModalContent()}
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default MembershipPlan;
