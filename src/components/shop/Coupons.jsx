import { useState } from "react";
import {
    Card,
    Tabs,
    Typography,
    Space,
    Button,
    message,
    Tag,
    Empty,
    Row,
    Col,
    Pagination,
    Spin,
} from "antd";
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    CopyOutlined,
    GiftOutlined,
    RedEnvelopeOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// 修改优惠券数据结构
const mockCoupons = [
    {
        id: 1,
        type: "discount",
        name: "新人专享8折券",
        discount: "8折",
        startDate: "2024-03-01",
        endDate: "2024-04-01",
        status: "unused",
        minAmount: 100,
        description: "仅限会员套餐使用",
        applicableTo: {
            type: "membership", // membership: 会员套餐, storage: 存储空间
            plans: ["basic"], // 适用的具体方案
            planNames: ["入门方案"] // 方案名称（用于显示）
        }
    },
    {
        id: 2,
        type: "code",
        name: "存储空间兑换码",
        code: "STORE100GB2024",
        startDate: "2024-03-01",
        endDate: "2024-12-31",
        status: "unused",
        description: "可兑换100GB永久存储空间",
        applicableTo: {
            type: "storage",
            plans: ["storage_100"],
            planNames: ["100GB存储包"]
        }
    },
    {
        id: 3,
        type: "discount",
        name: "周年庆优惠券",
        discount: "立减50元",
        startDate: "2024-02-01",
        endDate: "2024-02-29",
        status: "expired",
        minAmount: 200,
        description: "适用于专业版会员",
        applicableTo: {
            type: "membership",
            plans: ["pro"],
            planNames: ["专业方案"]
        }
    },
];

// 修改优惠券卡片组件
const CouponCard = ({ coupon }) => {
    const [showCode, setShowCode] = useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success("已复制到剪贴板");
        });
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            unused: { color: "success", text: "未使用" },
            used: { color: "default", text: "已使用" },
            expired: { color: "error", text: "已过期" },
        };
        const config = statusConfig[status];
        return <Tag color={config.color} className="ml-4">{config.text}</Tag>;
    };

    return (
        <Card
            hoverable
            style={{
                background: coupon.status === "expired" ? "#f5f5f5" : "#fff",
                position: "relative",
                overflow: "hidden",
                borderRadius: "8px",
                border: "1px solid #e8e8e8",
            }}
            bodyStyle={{ padding: "24px" }}
        >
            <Row gutter={24}>
                {/* 左侧类型标识 */}
                <Col span={6} style={{ 
                    borderRight: "1px dashed #e8e8e8",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {coupon.type === "discount" ? 
                    <GiftOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }}  /> : 
                    <RedEnvelopeOutlined style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }} />}
                    <Text strong style={{ fontSize: 20, color: "#1890ff" }}>
                        {coupon.type === "discount" ? "优惠券" : "兑换码"}
                    </Text>
                </Col>

                {/* 中间详细信息 */}
                <Col span={12}>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {coupon.name}
                            {getStatusTag(coupon.status)}
                        </Title>
                        
                        <Text type="secondary">{coupon.description}</Text>
                        
                        {/* 仅优惠券显示适用范围 */}
                        {coupon.type === "discount" && (
                            <Space size="middle">
                                <Tag color="blue">
                                    {coupon.applicableTo.type === "membership" ? "会员专享" : "存储专享"}
                                </Tag>
                                <Text type="secondary">
                                    适用于：{coupon.applicableTo.planNames.join("、")}
                                </Text>
                            </Space>
                        )}

                        {/* 修改兑换码显示区域 */}
                        {coupon.type === "code" && (
                            <Space size="middle" style={{ marginTop: 8 }}>
                                <Text style={{ 
                                    fontFamily: 'monospace',
                                    fontSize: 16,
                                    letterSpacing: 1
                                }}>
                                    {showCode ? coupon.code : "••••••••••••••"}
                                </Text>
                                <Space size="small">
                                    <Button
                                        type="text"
                                        icon={showCode ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                        onClick={() => setShowCode(!showCode)}
                                        style={{ padding: '4px 8px' }}
                                    />
                                    <Button
                                        type="text"
                                        icon={<CopyOutlined />}
                                        onClick={() => copyToClipboard(coupon.code)}
                                        style={{ padding: '4px 8px' }}
                                    />
                                </Space>
                            </Space>
                        )}
                    </Space>
                </Col>

                {/* 右侧有效期和操作 */}
                <Col span={6} style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-end"
                }}>
                    <Text type="secondary">
                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                        有效期至：{coupon.endDate}
                    </Text>

                    {/* 仅优惠券显示使用按钮 */}
                    {coupon.type === "discount" && coupon.status === "unused" && (
                        <Button type="primary">
                            立即使用
                        </Button>
                    )}
                </Col>
            </Row>
        </Card>
    );
};

// 修改主组件布局
const Coupons = () => {
    const [activeTab, setActiveTab] = useState("unused");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    const filterCoupons = (status) => {
        return mockCoupons.filter((coupon) => coupon.status === status);
    };

    // 获取当前页的优惠券
    const getCurrentPageCoupons = (coupons) => {
        const startIndex = (currentPage - 1) * pageSize;
        return coupons.slice(startIndex, startIndex + pageSize);
    };

    // 处理页码变化
    const handlePageChange = (page) => {
        setLoading(true);
        setCurrentPage(page);
        // 模拟加载效果
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    // Tab切换时重置页码
    const handleTabChange = (key) => {
        setActiveTab(key);
        setCurrentPage(1);
    };

    return (
        <div style={{ 
            minHeight: "100vh",
            background: "#f0f2f5",
            padding: "24px"
        }}>
            <Card bordered={false} style={{ height: "100%" }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={[
                        {
                            key: "unused",
                            label: "未使用",
                            children: (
                                <Spin spinning={loading}>
                                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                        {getCurrentPageCoupons(filterCoupons("unused")).map((coupon) => (
                                            <CouponCard key={coupon.id} coupon={coupon} />
                                        ))}
                                        {filterCoupons("unused").length === 0 ? (
                                            <Empty description="暂无未使用的优惠券" />
                                        ) : (
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'flex-end',
                                                marginTop: 16 
                                            }}>
                                                <Pagination
                                                    current={currentPage}
                                                    total={filterCoupons("unused").length}
                                                    pageSize={pageSize}
                                                    onChange={handlePageChange}
                                                    showTotal={(total) => `共 ${total} 项`}
                                                />
                                            </div>
                                        )}
                                    </Space>
                                </Spin>
                            ),
                        },
                        {
                            key: "used",
                            label: "已使用",
                            children: (
                                <Spin spinning={loading}>
                                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                        {getCurrentPageCoupons(filterCoupons("used")).map((coupon) => (
                                            <CouponCard key={coupon.id} coupon={coupon} />
                                        ))}
                                        {filterCoupons("used").length === 0 ? (
                                            <Empty description="暂无已使用的优惠券" />
                                        ) : (
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'flex-end',
                                                marginTop: 16 
                                            }}>
                                                <Pagination
                                                    current={currentPage}
                                                    total={filterCoupons("used").length}
                                                    pageSize={pageSize}
                                                    onChange={handlePageChange}
                                                    showTotal={(total) => `共 ${total} 项`}
                                                />
                                            </div>
                                        )}
                                    </Space>
                                </Spin>
                            ),
                        },
                        {
                            key: "expired",
                            label: "已过期",
                            children: (
                                <Spin spinning={loading}>
                                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                        {getCurrentPageCoupons(filterCoupons("expired")).map((coupon) => (
                                            <CouponCard key={coupon.id} coupon={coupon} />
                                        ))}
                                        {filterCoupons("expired").length === 0 ? (
                                            <Empty description="暂无已过期的优惠券" />
                                        ) : (
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'flex-end',
                                                marginTop: 16 
                                            }}>
                                                <Pagination
                                                    current={currentPage}
                                                    total={filterCoupons("expired").length}
                                                    pageSize={pageSize}
                                                    onChange={handlePageChange}
                                                    showTotal={(total) => `共 ${total} 项`}
                                                />
                                            </div>
                                        )}
                                    </Space>
                                </Spin>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default Coupons;