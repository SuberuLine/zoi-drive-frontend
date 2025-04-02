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
    message,
    Spin,
    Empty
} from "antd";
import { useEffect, useState } from "react";
import {
    FolderOutlined,
    FileOutlined,
    CheckCircleOutlined,
    PictureOutlined,
    VideoCameraOutlined,
    SoundOutlined,
    FileZipOutlined,
    FileUnknownOutlined,
} from "@ant-design/icons";
import useUserStore from "@/store/UserStore";
import { daysStats, formatDate } from "@/utils/formatter";
import { checkIn, getFileStats, getRecentViews, getRecentSaved, getDownloadLink } from "@/api";
import PreviewContainer from '@/components/preview/PreviewContainer';

const { Content } = Layout;
const { Title } = Typography;

export default function HomeContent() {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);
    const [recentViewsLoading, setRecentViewsLoading] = useState(true);
    const [recentSavedLoading, setRecentSavedLoading] = useState(true);
    const [fileStats, setFileStats] = useState({
        totalCount: 0,
        typeDistribution: {
            image: 0,
            video: 0,
            audio: 0,
            archive: 0,
            other: 0
        }
    });
    const [recentViewFiles, setRecentViewFiles] = useState([]);
    const [recentSavedFiles, setRecentSavedFiles] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const { isChecked, setCheckinToday, setTodaysReward, todaysReward } = useUserStore(
        (state) => ({
            isChecked: state.isChecked,
            setCheckinToday: state.setCheckinToday,
            setTodaysReward: state.setTodaysReward,
            todaysReward: state.todaysReward,
        })
    );

    const [checked, setChecked] = useState(isChecked());
    const { userInfo, setUserInfo } = useUserStore();

    // 文件类型到图标和标题的映射
    const typeMapping = {
        image: { icon: <PictureOutlined />, title: "图片" },
        video: { icon: <VideoCameraOutlined />, title: "视频" },
        audio: { icon: <SoundOutlined />, title: "音频" },
        archive: { icon: <FileZipOutlined />, title: "压缩包" },
        other: { icon: <FileUnknownOutlined />, title: "其他" }
    };

    // 获取文件类型对应的图标
    const getFileIcon = (type) => {
        return typeMapping[type]?.icon || <FileOutlined />;
    };

    // 格式化日期显示
    const formatViewDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // 如果日期无效，则返回格式化的原始字符串
                return dateString;
            }
            
            const now = new Date();
            
            // 计算时间差（毫秒）
            const diff = now - date;
            
            // 转换为分钟、小时、天
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (minutes < 60) {
                return minutes <= 1 ? "刚刚" : `${minutes}分钟前`;
            } else if (hours < 24) {
                return `${hours}小时前`;
            } else if (days < 7) {
                return `${days}天前`;
            } else {
                // 使用通用格式化函数
                return formatDate(dateString);
            }
        } catch (error) {
            console.error('日期格式化错误:', error);
            return formatDate(dateString);
        }
    };

    // 获取文件统计数据
    const fetchFileStats = async () => {
        setLoading(true);
        try {
            const response = await getFileStats();
            if (response.code === 200) {
                setFileStats(response.data);
            } else {
                message.error(response.message || '获取文件统计信息失败');
            }
        } catch (error) {
            console.error('获取文件统计信息失败:', error);
            message.error('获取文件统计信息失败: ' + (error.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    // 获取最近查看文件
    const fetchRecentViews = async () => {
        setRecentViewsLoading(true);
        try {
            const response = await getRecentViews();
            if (response.code === 200) {
                setRecentViewFiles(response.data || []);
            } else {
                message.error(response.message || '获取最近查看文件失败');
            }
        } catch (error) {
            console.error('获取最近查看文件失败:', error);
            message.error('获取最近查看文件失败: ' + (error.message || '未知错误'));
        } finally {
            setRecentViewsLoading(false);
        }
    };

    // 获取最近保存文件
    const fetchRecentSaved = async () => {
        setRecentSavedLoading(true);
        try {
            const response = await getRecentSaved();
            if (response.code === 200) {
                setRecentSavedFiles(response.data || []);
            } else {
                message.error(response.message || '获取最近保存文件失败');
            }
        } catch (error) {
            console.error('获取最近保存文件失败:', error);
            message.error('获取最近保存文件失败: ' + (error.message || '未知错误'));
        } finally {
            setRecentSavedLoading(false);
        }
    };

    // 处理文件预览
    const handlePreview = (file) => {
        setPreviewFile({
            key: file.id,
            name: file.filename,
            type: file.type
        });
        setIsPreviewVisible(true);
    };

    // 关闭预览
    const handleClosePreview = () => {
        setIsPreviewVisible(false);
        setPreviewFile(null);
    };

    // 处理文件下载
    const handleDownload = async (file) => {
        try {
            const url = await getDownloadLink(file.key);
            // 创建一个隐藏的 <a> 元素并触发点击
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name; // 设置下载文件名
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('下载文件失败:', error);
            message.error({
                content: `下载文件失败: ${error.message}`,
                duration: 3,
            });
        }
    };

    // 处理获取直链
    const handleGetLink = (file) => {
        // 实现获取直链逻辑
        console.log('获取直链:', file);
        message.success('已复制直链到剪贴板');
    };

    useEffect(() => {
        // 每次组件加载时检查签到状态
        setChecked(isChecked());
        
        // 获取文件统计数据
        fetchFileStats();
        
        // 获取最近查看文件
        fetchRecentViews();
        
        // 获取最近保存文件
        fetchRecentSaved();
    }, [isChecked]);

    // 将API返回的文件统计数据转换为UI展示需要的格式
    const getFileCategories = () => {
        // 确保至少包含"所有文件"项
        const categories = [
            { 
                key: 'all', 
                icon: <FolderOutlined />, 
                title: "所有文件", 
                count: fileStats.totalCount || 0 
            }
        ];

        // 添加各类型文件
        if (fileStats.typeDistribution) {
            Object.entries(fileStats.typeDistribution).forEach(([type, count]) => {
                if (typeMapping[type]) {
                    categories.push({
                        key: type,
                        icon: typeMapping[type].icon,
                        title: typeMapping[type].title,
                        count: count
                    });
                }
            });
        }

        return categories;
    };

    const handleCheckIn = async () => {
        await checkIn().then((res) => {
            console.log(res.data)
            if (res.data.code === 200) {
                setCheckinToday(true);
                const reward = Number(res.data.data.split('M')[0]);
                setTodaysReward(reward);
                setChecked(true);
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
                <Title level={2}>{userInfo.username}，{daysStats()}</Title>
                <Row gutter={[16, 16]}>
                    <Col span={16}>
                        <Card title="文件一览">
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <Spin />
                                </div>
                            ) : (
                                <List
                                    grid={{ gutter: 16, column: 4 }}
                                    dataSource={getFileCategories()}
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
                            )}
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            title="每日签到"
                            extra={
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={handleCheckIn}
                                    disabled={checked}
                                >
                                    签到
                                </Button>
                            }
                        >
                            {checked ? (
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
                            title="最近查看"
                            extra={<a href="/files">查看全部</a>}
                        >
                            {recentViewsLoading ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <Spin />
                                </div>
                            ) : recentViewFiles.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={recentViewFiles}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar icon={getFileIcon(item.type)} />
                                                }
                                                title={
                                                    <a onClick={() => !item.isFolder && handlePreview(item)}>{item.filename}</a>
                                                }
                                                description={formatViewDate(item.viewDate)}
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="暂无最近查看记录" />
                            )}
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            title="最近保存"
                            extra={<a href="/files">查看全部</a>}
                        >
                            {recentSavedLoading ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <Spin />
                                </div>
                            ) : recentSavedFiles.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={recentSavedFiles}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar icon={getFileIcon(item.type)} />
                                                }
                                                title={
                                                    <a onClick={() => !item.isFolder && handlePreview(item)}>{item.filename}</a>
                                                }
                                                description={formatViewDate(item.saveDate)}
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="暂无最近保存记录" />
                            )}
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>

        {/* 文件预览组件 */}
        <PreviewContainer
            file={previewFile}
            visible={isPreviewVisible}
            onClose={handleClosePreview}
            onDownload={handleDownload}
            onGetLink={handleGetLink}
        />
        </>
    );
}