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
    Collapse,
} from "antd";
import { CheckOutlined, AntDesignOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";

const { Title, Text } = Typography;

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
        &.${prefixCls}-btn-primary:not([disabled]):not(
                .${prefixCls}-btn-dangerous
            ) {
            border-width: 0;

            > span {
                position: relative;
            }

            &::before {
                content: "";
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
        originalPrice: 39,
        discount: "限时7.7折",
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
    },
];

const paymentMethods = [
    { id: "alipay", name: "支付宝" },
    { id: "wechat", name: "微信支付" },
    { id: "card", name: "信用卡" },
];

// 添加常见问题数据
const faqs = [
    {
        question: "如何选择适合我的方案？",
        answer: "您可以根据存储空间需求和下载需求来选择。如果您只是偶尔使用，免费方案就足够了；如果您需要更大空间和更快的下载速度，可以考虑入门或专业方案。",
    },
    {
        question: "我可以随时更换方案吗？",
        answer: "是的，您可以随时升级或降级您的方案。升级会立即生效，降级将在当前计费周期结束后生效。",
    },
    {
        question: "付款方式安全吗？",
        answer: "我们使用业内领先的支付安全技术，支持支付宝、微信支付等多种安全支付方式，确保您的支付安全。",
    },
    {
        question: "如果不满意可以退款吗？",
        answer: "我们提供7天无理由退款保证。如果您对服务不满意，可以联系客服申请退款。",
    },
];

const PriceDisplay = ({ price, originalPrice, discount }) => (
    <div
        style={{
            marginBottom: 24,
            minHeight: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}
    >
        <div
            style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 8,
            }}
        >
            <Text
                strong
                style={{ fontSize: "2.5rem", color: "#1890ff", lineHeight: 1 }}
            >
                ￥{price}
            </Text>
            <Text type="secondary">/月</Text>
        </div>

        {discount && (
            <div style={{ marginTop: 8 }}>
                <Text
                    delete
                    type="secondary"
                    style={{ fontSize: "1rem", marginRight: 8 }}
                >
                    ￥{originalPrice}
                </Text>
                <Text
                    style={{
                        backgroundColor: "#ff4d4f",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                    }}
                >
                    {discount}
                </Text>
            </div>
        )}
    </div>
);

const DiscountBadge = ({ discount }) =>
    discount ? (
        <div
            style={{
                position: "absolute",
                top: -2,
                right: -2,
                background: "linear-gradient(45deg, #ff4d4f, #ff7875)",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "0 4px 0 12px",
                fontSize: "12px",
                fontWeight: "bold",
                boxShadow: "0 2px 6px rgba(255, 77, 79, 0.4)",
                zIndex: 1,
            }}
        >
            {discount}
        </div>
    ) : null;

const MembershipPlan = () => {
    const { styles } = useStyle();
    const [currentPlan, setCurrentPlan] = useState("free");
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentStep, setPaymentStep] = useState(1);

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
                            style={{
                                width: 200,
                                height: 200,
                                margin: "20px 0",
                            }}
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

    // 定义卡片的固定高度和内部间距
    const cardStyle = {
        height: "100%",
        transition: "all 0.3s",
        backgroundColor: "#f0f2f5",
    };

    const cardBodyStyle = {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "24px",
    };

    return (
        <ConfigProvider
            button={{
                className: styles.linearGradientButton,
            }}
        >
            <div style={{ padding: "24px" }}>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    {/* 优化后的顶部介绍部分 */}
                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: 48,
                            background:
                                "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
                            padding: "48px 24px",
                            borderRadius: "16px",
                        }}
                    >
                        <Title
                            level={2}
                            style={{
                                background:
                                    "linear-gradient(135deg, #6253e1, #04befe)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: 24,
                            }}
                        >
                            ZoiDrive 会员套餐
                        </Title>
                        <Text
                            style={{
                                fontSize: 18,
                                display: "block",
                                marginBottom: 36,
                                color: "#666",
                            }}
                        >
                            简单、透明的定价，满足您的业务需求
                        </Text>

                        <Row justify="center" gutter={[48, 24]}>
                            <Col>
                                <Card
                                    hoverable
                                    style={{
                                        width: 240,
                                        height: 120,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(255, 255, 255, 0.8)",
                                    }}
                                >
                                    <Space direction="vertical" align="center">
                                        <CheckOutlined
                                            style={{
                                                fontSize: 24,
                                                color: "#52c41a",
                                                backgroundColor: "#f6ffed",
                                                padding: 12,
                                                borderRadius: "50%",
                                            }}
                                        />
                                        <Text strong>无需年付，按月计费</Text>
                                        <Text type="secondary">
                                            灵活的付费方式
                                        </Text>
                                    </Space>
                                </Card>
                            </Col>
                            <Col>
                                <Card
                                    hoverable
                                    style={{
                                        width: 240,
                                        height: 120,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(255, 255, 255, 0.8)",
                                    }}
                                >
                                    <Space direction="vertical" align="center">
                                        <CheckOutlined
                                            style={{
                                                fontSize: 24,
                                                color: "#1890ff",
                                                backgroundColor: "#e6f7ff",
                                                padding: 12,
                                                borderRadius: "50%",
                                            }}
                                        />
                                        <Text strong>7天无理由退款</Text>
                                        <Text type="secondary">无风险体验</Text>
                                    </Space>
                                </Card>
                            </Col>
                            <Col>
                                <Card
                                    hoverable
                                    style={{
                                        width: 240,
                                        height: 120,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(255, 255, 255, 0.8)",
                                    }}
                                >
                                    <Space direction="vertical" align="center">
                                        <CheckOutlined
                                            style={{
                                                fontSize: 24,
                                                color: "#722ed1",
                                                backgroundColor: "#f9f0ff",
                                                padding: 12,
                                                borderRadius: "50%",
                                            }}
                                        />
                                        <Text strong>24/7 技术支持</Text>
                                        <Text type="secondary">
                                            专业团队服务
                                        </Text>
                                    </Space>
                                </Card>
                            </Col>
                            <Col>
                                <Card
                                    hoverable
                                    style={{
                                        width: 240,
                                        height: 120,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(255, 255, 255, 0.8)",
                                    }}
                                >
                                    <Space direction="vertical" align="center">
                                        <CheckOutlined
                                            style={{
                                                fontSize: 24,
                                                color: "#ff7a45",
                                                backgroundColor: "#f9f0ff",
                                                padding: 12,
                                                borderRadius: "50%",
                                            }}
                                        />
                                        <Text strong>
                                            以及更多的私人定制需求
                                        </Text>
                                        <Text type="secondary">
                                            更多的团队方案
                                        </Text>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    <Row gutter={[16, 16]}>
                        {plans.map((plan) => (
                            <Col xs={24} sm={12} md={6} key={plan.id}>
                                <Card
                                    hoverable
                                    style={{
                                        ...cardStyle,
                                        position: "relative",
                                    }}
                                    bodyStyle={cardBodyStyle}
                                >
                                    <DiscountBadge discount={plan.discount} />

                                    {/* 标题和描述部分 */}
                                    <div
                                        style={{
                                            marginBottom: 24,
                                            minHeight: 80,
                                        }}
                                    >
                                        <Title
                                            level={3}
                                            style={{
                                                marginBottom: 8,
                                                fontSize: "1.5rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            {plan.name}
                                        </Title>
                                        <Text
                                            type="secondary"
                                            style={{
                                                display: "block",
                                                textAlign: "center",
                                                minHeight: "3em",
                                            }}
                                        >
                                            {plan.description}
                                        </Text>
                                    </div>

                                    {/* 价格显示部分 */}
                                    <PriceDisplay
                                        price={plan.price}
                                        originalPrice={plan.originalPrice}
                                        discount={plan.discount}
                                    />

                                    {/* 功能列表部分 */}
                                    <ul
                                        style={{
                                            listStyleType: "none",
                                            padding: 0,
                                            margin: "0 0 24px 0",
                                            flex: 1,
                                            minHeight: "200px",
                                        }}
                                    >
                                        {plan.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    marginBottom: "16px",
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <CheckOutlined
                                                    style={{
                                                        color: "#52c41a",
                                                        marginRight: "8px",
                                                        marginTop: "4px",
                                                    }}
                                                />
                                                <Text>{feature}</Text>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* 按钮部分 */}
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<AntDesignOutlined />}
                                        onClick={() => showModal(plan)}
                                        disabled={plan.id === currentPlan}
                                        style={{
                                            width: "100%",
                                            height: "40px",
                                        }}
                                    >
                                        {plan.id === currentPlan
                                            ? "当前方案"
                                            : "选择方案"}
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* FAQ 部分 */}
                    <div
                        style={{
                            marginTop: 64,
                            background: "#fff",
                            borderRadius: "16px",
                            padding: "32px",
                        }}
                    >
                        <Title
                            level={2}
                            style={{
                                marginBottom: 48,
                                fontSize: "2rem",
                                fontWeight: "bold",
                            }}
                        >
                            让我们为你答疑解惑
                        </Title>

                        <Collapse
                            bordered={false}
                            expandIconPosition="end"
                            style={{
                                background: "#fff",
                            }}
                            items={faqs.map((faq, index) => ({
                                key: index,
                                label: faq.question,
                                children: <Text>{faq.answer}</Text>,
                                style: {
                                    marginBottom: 16,
                                    padding: "8px 0",
                                    borderBottom: "1px solid #f0f0f0",
                                },
                            }))}
                        />
                    </div>

                    {/* 添加底部联系方式 */}
                    <div style={{ textAlign: "center", marginTop: 48 }}>
                        <Title level={4}>还有其他问题？</Title>
                        <Text>
                            请联系我们的客服团队{" "}
                            <a href="mailto:support@zoidrive.com">
                                support@zoidrive.com
                            </a>
                        </Text>
                    </div>
                </Space>

                {/* 现有的 Modal 部分保持不变 */}
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
