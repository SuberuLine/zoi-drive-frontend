import { useState } from "react";
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
    const { userInfo } = useUserStore();

    const [user, setUser] = useState({
        username: userInfo.username,
        name: "user",
        email: userInfo.email,
        avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
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
                                <Avatar size={100} src={user.avatar} />
                                <Title level={2} style={{ marginTop: 16 }}>
                                    {user.name}
                                    <Tag color="gold" style={{ marginLeft: 8 }}>
                                        {user.memberLevel} Member
                                    </Tag>
                                </Title>
                                <Text type="secondary">@{user.username}</Text>
                                <Divider />
                                <p>
                                    <MailOutlined /> {user.email}
                                </p>
                                <Button
                                    type="primary"
                                    icon={<SettingOutlined />}
                                >
                                    Edit Profile
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
                                value={user.totalCheckinReward}
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
                        <Card title="Storage Usage">
                            <Row gutter={16}>
                                <Col span={18}>
                                    <SpaceProgress used={user.usedSpace} total={user.totalSpace} 
                                        type="base" size="large" />
                                </Col>
                                <Col span={6}>
                                    <Statistic
                                        title="Used Space"
                                        value={`${user.usedSpace}GB / ${user.totalSpace}GB`}
                                    />
                                </Col>
                            </Row>
                        </Card>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="Total Files"
                                        value={user.totalFiles}
                                        prefix={<FileOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card>
                                    <Statistic
                                        title="Member Since"
                                        value={userInfo.registerTime}
                                        prefix={<UserOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        <Card
                            title="Recent Activities"
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
                            title="Account Security"
                            extra={<a href="#">Manage</a>}
                        >
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="Password Strength"
                                        value="Strong"
                                        prefix={<LockOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Two-Factor Auth"
                                        value="Enabled"
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Last Login"
                                        value="2023-05-20 14:30"
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
