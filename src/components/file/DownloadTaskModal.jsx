import { useState, useEffect } from "react";
import { Modal, List, Tag, Progress, Space, Tabs, Typography } from "antd";
import {
    CloudDownloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const DownloadTaskModal = ({ visible, onCancel }) => {
    const [activeDownloads, setActiveDownloads] = useState([]);
    const [completedDownloads, setCompletedDownloads] = useState([]);

    // 模拟获取下载任务数据
    useEffect(() => {
        // 这里应该是从API获取实际数据
        setActiveDownloads([
            { id: 1, name: "文件1.zip", status: "downloading", progress: 45 },
            { id: 2, name: "文件2.pdf", status: "waiting", progress: 0 },
        ]);
        setCompletedDownloads([
            { id: 3, name: "文件3.jpg", status: "completed", progress: 100 },
            { id: 4, name: "文件4.doc", status: "failed", progress: 30 },
        ]);
    }, []);

    const getStatusTag = (status) => {
        switch (status) {
            case "downloading":
                return (
                    <Tag icon={<LoadingOutlined />} color="processing">
                        下载中
                    </Tag>
                );
            case "waiting":
                return (
                    <Tag icon={<CloudDownloadOutlined />} color="default">
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
            default:
                return null;
        }
    };

    const renderListItem = (item) => (
        <List.Item>
            <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                    {item.name}
                    {getStatusTag(item.status)}
                </Space>
                {item.status !== "completed" && (
                    <Progress percent={item.progress} size="small" />
                )}
            </Space>
        </List.Item>
    );

    const items = [
        {
            key: "1",
            label: "正在下载",
            children: (
                <List
                    dataSource={activeDownloads}
                    renderItem={renderListItem}
                />
            ),
        },
        {
            key: "2",
            label: "历史记录",
            children: (
                <List
                    dataSource={completedDownloads}
                    renderItem={renderListItem}
                />
            ),
        },
    ];

    return (
        <Modal
            title="下载任务"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Tabs defaultActiveKey="1" items={items} />
            {items.key === "2" ? <Text type="secondary">历史记录只展示最近5条</Text> : null}
        </Modal>
    );
};

export default DownloadTaskModal;
