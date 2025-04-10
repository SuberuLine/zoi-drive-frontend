import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Layout,
    Row,
    Col,
    Card,
    Avatar,
    Typography,
    Tag,
    Statistic,
    List,
    Button,
    Divider,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    CheckCircleOutlined,
    LockOutlined,
    SettingOutlined,
    DatabaseOutlined,
    FileOutlined,
    HourglassOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import SpaceProgress from "@/components/progress/SpaceProgress";
import useUserStore from '@/store/UserStore';
import { formatDate } from "@/utils/formatter";

const { Content } = Layout;
const { Title, Text } = Typography;

function PersonalPage() {
    const navigate = useNavigate();
    const { userInfo } = useUserStore();

    const [user, setUser] = useState({
        username: userInfo.username,
        email: userInfo.email,
        avatar: userInfo.avatar,
        memberLevel: "Gold",
        usedSpace: userInfo.userDetail.usedStorage,
        totalSpace: userInfo.userDetail.totalStorage,
        checkInDays: userInfo.userCheckin.checkinCount,
        consecutiveCheckinDays: userInfo.userCheckin.checkinConsecutive,
        totalCheckinReward: userInfo.userCheckin.checkinReward,
        lastCheckin: userInfo.userCheckin.lastCheckin,
        totalFiles: 114,
    });

    const recentActivities = [
        {
            action: "Uploaded",
            item: "Project Proposal.docx",
            time: "2 hours ago",
        },
        { action: "Shared", item: "Team Photo.jpg", time: "Yesterday" },
        { action: "Deleted", item: "Old Backup.zip", time: "3 days ago" },
        {
            action: "Renamed",
            item: "Client Presentation.pptx",
            time: "Last week",
        },
    ];

    return (
        <Layout style={{ padding: "24px" }}>
            <Content>
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Card>
                            <div style={{ textAlign: "center" }}>
                                {user.avatar ? <Avatar size={100} src={`${import.meta.env.VITE_API_URL}${user.avatar}`} /> : 
                                <Avatar size={100} icon={<UserOutlined />} />}
                                <Title level={2} style={{ marginTop: 16 }}>
                                    {user.username}
                                    <Tag color="gold" style={{ marginLeft: 8 }}>
                                        {user.memberLevel} Member
                                    </Tag>
                                </Title>
                                <Divider />
                                <p>
                                    <MailOutlined /> {user.email}
                                </p>
                                <Button
                                    type="primary"
                                    icon={<SettingOutlined />}
                                    onClick={() => navigate("/home/usersettings")}
                                >
                                    修改资料
                                </Button>
                            </div>
                        </Card>
                        <Card style={{ marginTop: 16 }}>
                            <Statistic
                                title="总计签到天数"
                                value={user.checkInDays}
                                prefix={<HourglassOutlined />}
                                suffix="天"
                            />
                            <Statistic
                                className="mt-6"
                                title="已连续签到天数"
                                value={user.consecutiveCheckinDays}
                                prefix={<CheckCircleOutlined />}
                                suffix="天"
                            />
                            <Statistic
                                className="mt-6"
                                title="总计获得空间"
                                value={user.totalCheckinReward / (1024 * 1024)}
                                prefix={<DatabaseOutlined />}
                                suffix="Mb"
                            />
                            <Statistic
                                className="mt-6"
                                title="最后签到日期"
                                value={formatDate(user.lastCheckin)}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={16}>
                        <Card title="存储使用情况">
                            <Row gutter={16}>
                                <Col span={18} className="mt-4">
                                    <SpaceProgress used={user.usedSpace} total={user.totalSpace} showInfo={false} />
                                </Col>
                                <Col span={6}>
                                    <Statistic
                                        title="已使用空间"
                                        value={`${(user.usedSpace / (1024 * 1024 * 1024)).toFixed(2)}GB / ${(user.totalSpace / (1024 * 1024 * 1024)).toFixed(2)}GB`}
                                    />
                                </Col>
                            </Row>
                        </Card>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="总文件数"
                                        value={user.totalFiles}
                                        prefix={<FileOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="注册时间"
                                        value={userInfo.registerTime}
                                        prefix={<UserOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        <Card
                            title="最近活动"
                            style={{ marginTop: 16 }}
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={recentActivities}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    icon={
                                                        <ClockCircleOutlined />
                                                    }
                                                />
                                            }
                                            title={`${item.action} ${item.item}`}
                                            description={item.time}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Card
                            title="账户安全"
                            extra={<a href="#">管理</a>}
                        >
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="密码强度"
                                        value="强"
                                        prefix={<LockOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="两步验证"
                                        value={userInfo.userSetting.twoFactorStatus}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="最近登录"
                                        value={userInfo.lastLogin}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}


export default PersonalPage;
