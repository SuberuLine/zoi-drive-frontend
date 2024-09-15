import {
    Layout,
    Card,
    List,
    Avatar,
    Button,
    Row,
    Col,
    Typography,
    Statistic,
    message
} from "antd";
import { useEffect } from "react";
import {
    FolderOutlined,
    FileOutlined,
    CheckCircleOutlined,
    PictureOutlined,
    VideoCameraOutlined,
    SoundOutlined,
    FileZipOutlined,
} from "@ant-design/icons";
import useUserStore from "@/store/UserStore";
import { checkIn } from "@/api";

const { Content } = Layout;
const { Title } = Typography;

export default function HomeContent() {
    const [messageApi, contextHolder] = message.useMessage();

    const { isChecked, setCheckinToday, setTodaysReward, todaysReward } = useUserStore(
        (state) => ({
            isChecked: state.isChecked,
            setCheckinToday: state.setCheckinToday,
            setTodaysReward: state.setTodaysReward,
            todaysReward: state.todaysReward,
        })
    );

    useEffect(() => {
        // 从持久化存储中读取数据
        const storedState = JSON.parse(localStorage.getItem('user-storage'));
        if (storedState && storedState.state) {
            setTodaysReward(storedState.state.todaysReward);
            setCheckinToday(storedState.state.checkinToday);
        }
    }, [setTodaysReward, setCheckinToday]);

    useEffect(() => {
        console.log("todaysReward 更新:", todaysReward);
    }, [todaysReward]);

    const fileCategories = [
        { icon: <FolderOutlined />, title: "All Files", count: 120 },
        { icon: <PictureOutlined />, title: "Images", count: 45 },
        { icon: <VideoCameraOutlined />, title: "Videos", count: 20 },
        { icon: <SoundOutlined />, title: "Audio", count: 15 },
        { icon: <FileZipOutlined />, title: "Archives", count: 10 },
    ];

    const recentFiles = [
        {
            title: "Project Proposal.docx",
            icon: <FileOutlined />,
            time: "2 hours ago",
        },
        {
            title: "Budget 2023.xlsx",
            icon: <FileOutlined />,
            time: "5 hours ago",
        },
        {
            title: "Team Photo.jpg",
            icon: <PictureOutlined />,
            time: "Yesterday",
        },
        {
            title: "Client Meeting.mp4",
            icon: <VideoCameraOutlined />,
            time: "2 days ago",
        },
    ];

    const recentlySaved = [
        {
            title: "Marketing Plan.pptx",
            icon: <FileOutlined />,
            time: "1 hour ago",
        },
        { title: "Q2 Report.pdf", icon: <FileOutlined />, time: "3 hours ago" },
        {
            title: "Product Demo.mp4",
            icon: <VideoCameraOutlined />,
            time: "Yesterday",
        },
        {
            title: "Design Assets.zip",
            icon: <FileZipOutlined />,
            time: "2 days ago",
        },
    ];

    const handleCheckIn = async () => {
        await checkIn().then((res) => {
            console.log(res.data)
            if (res.data.code === 200) {
                setCheckinToday(true);
                const reward = Number(res.data.data.split('M')[0]);
                setTodaysReward(reward);
                messageApi.success(res.data.message);
            } else {
                messageApi.error(res.data.message);
            }
        });
    };

    return (
        <>
            {contextHolder}
            <Layout style={{ padding: "24px" }}>
            <Content>
                <Title level={2}>Welcome to Your Cloud Drive</Title>
                <Row gutter={[16, 16]}>
                    <Col span={16}>
                        <Card title="File Categories">
                            <List
                                grid={{ gutter: 16, column: 4 }}
                                dataSource={fileCategories}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Card hoverable>
                                            <Statistic
                                                title={item.title}
                                                value={item.count}
                                                prefix={item.icon}
                                            />
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            title="Daily Check-in"
                            extra={
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={handleCheckIn}
                                    disabled={isChecked()}
                                >
                                    Check In
                                </Button>
                            }
                        >
                            {isChecked() ? (
                                <p>今天已签到！已获得{todaysReward}M</p>
                            ) : (
                                <p>
                                    今天尚未签到，点击签到获取空间
                                </p>
                            )}
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                    <Col span={12}>
                        <Card
                            title="Recently Viewed"
                            extra={<a href="#">View All</a>}
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={recentFiles}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar icon={item.icon} />
                                            }
                                            title={
                                                <a href="#">{item.title}</a>
                                            }
                                            description={item.time}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            title="Recently Saved"
                            extra={<a href="#">View All</a>}
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={recentlySaved}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar icon={item.icon} />
                                            }
                                            title={
                                                <a href="#">{item.title}</a>
                                            }
                                            description={item.time}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
        </>
    );
}
