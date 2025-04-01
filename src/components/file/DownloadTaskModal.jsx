import { useState, useEffect } from "react";
import { Modal, List, Tag, Progress, Space, Tabs, Typography, Button, message, Tooltip, Popconfirm } from "antd";
import {
    CloudDownloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    ReloadOutlined,
    PauseCircleOutlined,
    HourglassOutlined,
    FileOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import { getDownloadTasks, clearDownloadTasks } from "@/api";

const { Text } = Typography;

const DownloadTaskModal = ({ visible, onCancel }) => {
    const [downloads, setDownloads] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [activeTab, setActiveTab] = useState("1");

    // 获取下载任务数据
    const fetchDownloadTasks = async () => {
        setRefreshing(true);
        try {
            const response = await getDownloadTasks();
            if (response.code === 200) {
                setDownloads(response.data);
                return true;
            } else {
                message.error(response.message || '获取下载任务失败');
                return false;
            }
        } catch (error) {
            console.error('获取下载任务失败:', error);
            message.error('获取下载任务失败: ' + (error.message || '未知错误'));
            return false;
        } finally {
            setRefreshing(false);
        }
    };

    // 处理刷新操作
    const handleRefresh = async () => {
        const success = await fetchDownloadTasks();
        if (success) {
            message.success('刷新成功');
        }
    };

    // 处理清空操作
    const handleClear = async () => {
        setClearing(true);
        try {
            const response = await clearDownloadTasks();
            if (response.code === 200) {
                message.success('清空下载记录成功');
                // 重新获取下载任务列表
                await fetchDownloadTasks();
            } else {
                message.error(response.message || '清空下载记录失败');
            }
        } catch (error) {
            console.error('清空下载记录失败:', error);
            message.error('清空下载记录失败: ' + (error.message || '未知错误'));
        } finally {
            setClearing(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchDownloadTasks();
        }
    }, [visible]);

    // 处理文件名显示
    const formatFileName = (fileName, status) => {
        if (!fileName) {
            // 根据状态返回不同的默认名称
            if (status === 'pending') return '等待中的任务';
            if (status === 'downloading') return '下载中的文件';
            return '未命名文件';
        }
        
        // 检查是否为base64编码（简单检查是否含有特殊字符）
        if (fileName.length > 20 && /[+/=]/.test(fileName)) {
            return '未命名文件（编码名称）';
        }
        
        // 如果文件名超过25个字符，进行截断
        if (fileName.length > 25) {
            const ext = fileName.lastIndexOf('.') > 0 ? fileName.slice(fileName.lastIndexOf('.')) : '';
            const name = fileName.slice(0, fileName.lastIndexOf('.') > 0 ? fileName.lastIndexOf('.') : fileName.length);
            return name.slice(0, 20) + '...' + ext;
        }
        
        return fileName;
    };

    // 获取状态标签
    const getStatusTag = (status) => {
        switch (status) {
            case "downloading":
                return (
                    <Tag icon={<LoadingOutlined />} color="processing">
                        下载中
                    </Tag>
                );
            case "pending":
                return (
                    <Tag icon={<HourglassOutlined />} color="default">
                        等待中
                    </Tag>
                );
            case "completed":
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        完成
                    </Tag>
                );
            case "failed":
                return (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                        失败
                    </Tag>
                );
            case "paused":
                return (
                    <Tag icon={<PauseCircleOutlined />} color="warning">
                        已暂停
                    </Tag>
                );
            default:
                return (
                    <Tag color="default">
                        未知状态
                    </Tag>
                );
        }
    };

    // 过滤出活跃下载（进行中和等待中）
    const activeDownloads = downloads.filter(
        item => item.status === 'downloading' || item.status === 'pending' || item.status === 'paused'
    );
    
    // 过滤出历史记录（已完成和失败）
    const completedDownloads = downloads.filter(
        item => item.status === 'completed' || item.status === 'failed'
    );

    const renderListItem = (item) => (
        <List.Item>
            <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                    <FileOutlined />
                    <Tooltip title={item.fileName || '未命名文件'}>
                        <Text ellipsis style={{ maxWidth: '300px' }}>
                            {formatFileName(item.fileName, item.status)}
                        </Text>
                    </Tooltip>
                    {getStatusTag(item.status)}
                </Space>
                {(item.status !== "completed" && item.status !== "failed") && (
                    <Progress 
                        percent={item.progress} 
                        size="small"
                        status={
                            item.status === "failed" ? "exception" : 
                            item.status === "paused" ? "normal" : 
                            "active"
                        }
                    />
                )}
            </Space>
        </List.Item>
    );

    const items = [
        {
            key: "1",
            label: `正在下载 (${activeDownloads.length})`,
            children: (
                <List
                    dataSource={activeDownloads}
                    renderItem={renderListItem}
                    locale={{ emptyText: '没有正在进行的下载任务' }}
                />
            ),
        },
        {
            key: "2",
            label: `历史记录 (${completedDownloads.length})`,
            children: (
                <List
                    dataSource={completedDownloads}
                    renderItem={renderListItem}
                    locale={{ emptyText: '没有历史下载记录' }}
                />
            ),
        },
    ];

    // 定义Tab栏右侧的额外内容
    const tabBarExtraContent = {
        right: (
            <Space>
                <Button
                    type="text"
                    icon={<ReloadOutlined spin={refreshing} />}
                    size="small"
                    onClick={handleRefresh}
                />
                <Popconfirm
                    title="清空下载记录"
                    description="确定要清空所有完成和失败的下载记录吗？"
                    onConfirm={handleClear}
                    okText="确定"
                    cancelText="取消"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined spin={clearing} />}
                        size="small"
                        style={{ marginRight: '8px' }}
                    />
                </Popconfirm>
            </Space>
        ),
    };

    return (
        <Modal
            title="下载任务"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Tabs 
                defaultActiveKey="1" 
                items={items} 
                onChange={setActiveTab}
                tabBarExtraContent={tabBarExtraContent}
            />
            {activeTab === "2" && completedDownloads.length > 0 && 
                <Text type="secondary">仅显示最近的下载记录</Text>
            }
        </Modal>
    );
};

export default DownloadTaskModal;
