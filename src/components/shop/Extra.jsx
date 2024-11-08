import { useState } from "react";
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
    Tag,
} from "antd";
import { CloudUploadOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";

const { Title, Text } = Typography;

// 样式定义
const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
        &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
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

// 模拟存储空间数据
const storageOptions = [
    {
        id: "storage_100",
        space: "100GB",
        price: 20,
        duration: "永久有效",
        originalPrice: 29,
        discount: "限时6.9折",
        features: [
            "一次性购买",
            "永久有效",
            "可叠加使用",
            "支持所有文件类型"
        ]
    },
    {
        id: "storage_500",
        space: "500GB",
        price: 88,
        duration: "永久有效",
        originalPrice: 129,
        discount: "特惠价",
        features: [
            "一次性购买",
            "永久有效",
            "可叠加使用",
            "支持所有文件类型",
            "优先技术支持"
        ]
    },
    {
        id: "storage_1000",
        space: "1TB",
        price: 166,
        duration: "永久有效",
        originalPrice: 259,
        discount: "新年特惠",
        features: [
            "一次性购买",
            "永久有效",
            "可叠加使用",
            "支持所有文件类型",
            "24/7专属技术支持",
            "数据迁移服务"
        ]
    }
];

export default function Extra() {
    const { styles } = useStyle();
    const [selectedStorage, setSelectedStorage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);

    const showModal = (storage) => {
        setSelectedStorage(storage);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedStorage(null);
        setPaymentMethod(null);
    };

    const handlePurchase = () => {
        message.success("购买成功！存储空间已添加到您的账户");
        handleCancel();
    };

    return (
        <ConfigProvider button={{ className: styles.linearGradientButton }}>
            <div style={{ padding: "24px" }}>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    {/* 顶部介绍 */}
                    <div style={{
                        textAlign: "center",
                        marginBottom: 48,
                        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
                        padding: "48px 24px",
                        borderRadius: "16px",
                    }}>
                        <Title level={2} style={{
                            background: "linear-gradient(135deg, #6253e1, #04befe)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: 24,
                        }}>
                            扩展您的存储空间
                        </Title>
                        <Text style={{ fontSize: 18, display: "block", marginBottom: 24, color: "#666" }}>
                            一次性购买，永久扩容，灵活满足您的存储需求
                        </Text>
                    </div>

                    {/* 存储空间选项列表 */}
                    <Row gutter={[24, 24]}>
                        {storageOptions.map((option) => (
                            <Col xs={24} md={8} key={option.id}>
                                <Card
                                    hoverable
                                    style={{
                                        height: "100%",
                                        position: "relative",
                                        background: "#f0f2f5",
                                    }}
                                    bodyStyle={{
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100%",
                                        padding: 24,
                                    }}
                                >
                                    {/* 折扣标签 */}
                                    {option.discount && (
                                        <Tag color="#f50" style={{
                                            position: "absolute",
                                            top: 16,
                                            right: 16,
                                        }}>
                                            {option.discount}
                                        </Tag>
                                    )}

                                    {/* 存储空间大小 */}
                                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                                        <CloudUploadOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                                        <Title level={2} style={{ marginTop: 16, marginBottom: 0 }}>
                                            {option.space}
                                        </Title>
                                        <Text type="secondary">{option.duration}</Text>
                                    </div>

                                    {/* 价格显示 */}
                                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                                        <Text style={{ fontSize: 32, fontWeight: "bold", color: "#1890ff" }}>
                                            ￥{option.price}
                                        </Text>
                                        {option.originalPrice && (
                                            <Text delete type="secondary" style={{ marginLeft: 8 }}>
                                                ￥{option.originalPrice}
                                            </Text>
                                        )}
                                    </div>

                                    {/* 功能列表 */}
                                    <ul style={{
                                        listStyle: "none",
                                        padding: 0,
                                        margin: "0 0 24px 0",
                                        flex: 1,
                                    }}>
                                        {option.features.map((feature, index) => (
                                            <li key={index} style={{
                                                marginBottom: 12,
                                                display: "flex",
                                                alignItems: "center"
                                            }}>
                                                <ThunderboltOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                                                <Text>{feature}</Text>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* 购买按钮 */}
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => showModal(option)}
                                        style={{ width: "100%" }}
                                    >
                                        立即购买
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Space>

                {/* 购买确认弹窗 */}
                <Modal
                    title="确认购买"
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    onOk={handlePurchase}
                >
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Text>您确定要购买以下存储空间吗？</Text>
                        <Card>
                            <Space direction="vertical">
                                <Text strong>存储空间：{selectedStorage?.space}</Text>
                                <Text strong>价格：￥{selectedStorage?.price}</Text>
                                <Text type="secondary">购买后立即生效，永久有效</Text>
                            </Space>
                        </Card>
                    </Space>
                </Modal>
            </div>
        </ConfigProvider>
    );
}
