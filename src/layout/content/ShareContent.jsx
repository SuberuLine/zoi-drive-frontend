import { useState, useEffect } from "react";
import { 
    Layout, 
    Table, 
    Space, 
    Button, 
    Input, 
    Card, 
    Typography, 
    message, 
    Tabs, 
    Tooltip, 
    Modal, 
    Tag, 
    Popconfirm 
} from "antd";
import {
    ShareAltOutlined,
    LinkOutlined,
    EyeOutlined,
    DownloadOutlined,
    ClockCircleOutlined,
    LockOutlined,
    UnlockOutlined,
    DeleteOutlined,
    CopyOutlined,
    FileOutlined,
    FolderOutlined
} from "@ant-design/icons";
import { formatDate } from "@/utils/formatter";
import { getUserShares, getUserSavedShares, cancelShare, extendShareExpiration, createShare } from "@/api";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const ShareContent = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [activeTab, setActiveTab] = useState("1");
    const [myShares, setMyShares] = useState([]);
    const [savedShares, setSavedShares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [createShareModalVisible, setCreateShareModalVisible] = useState(false);
    const [shareFiles, setShareFiles] = useState([]);
    const [shareFolders, setShareFolders] = useState([]);
    const [shareTitle, setShareTitle] = useState("");
    const [shareDescription, setShareDescription] = useState("");
    const [sharePassword, setSharePassword] = useState("");
    const [expireDays, setExpireDays] = useState(7);
    const [extendModalVisible, setExtendModalVisible] = useState(false);
    const [currentShareId, setCurrentShareId] = useState(null);
    const [extendDays, setExtendDays] = useState(7);

    // 获取分享列表
    const fetchShareList = async (page = 1, tab = activeTab) => {
        setLoading(true);
        try {
            let response;
            if (tab === "1") {
                response = await getUserShares(page, pagination.pageSize);
            } else {
                response = await getUserSavedShares(page, pagination.pageSize);
            }
            
            if (response.code === 200) {
                const { records, total, current, size } = response.data;
                if (tab === "1") {
                    setMyShares(records);
                } else {
                    setSavedShares(records);
                }
                setPagination({
                    current,
                    pageSize: size,
                    total
                });
            } else {
                messageApi.error(response.message || "获取分享列表失败");
            }
        } catch (error) {
            console.error("获取分享列表失败:", error);
            messageApi.error("获取分享列表失败: " + (error.message || "未知错误"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShareList();
    }, [activeTab]);

    // 处理标签页切换
    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination({ ...pagination, current: 1 });
    };

    // 处理分页变化
    const handleTableChange = (pagination) => {
        fetchShareList(pagination.current);
    };

    // 拷贝分享链接
    const copyShareLink = (shareCode) => {
        const shareUrl = `${window.location.origin}/s/${shareCode}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                messageApi.success("分享链接已复制到剪贴板");
            })
            .catch(() => {
                messageApi.error("复制失败，请手动复制");
            });
    };

    // 取消分享
    const handleCancelShare = async (shareId) => {
        try {
            const response = await cancelShare(shareId);
            if (response.code === 200 && response.data) {
                messageApi.success("取消分享成功");
                fetchShareList();
            } else {
                messageApi.error(response.message || "取消分享失败");
            }
        } catch (error) {
            console.error("取消分享失败:", error);
            messageApi.error("取消分享失败: " + (error.message || "未知错误"));
        }
    };

    // 显示延长有效期对话框
    const showExtendModal = (shareId) => {
        setCurrentShareId(shareId);
        setExtendModalVisible(true);
    };

    // 延长分享有效期
    const handleExtendExpiration = async () => {
        if (!currentShareId || extendDays <= 0) {
            messageApi.warning("请选择有效的延长天数");
            return;
        }

        try {
            const response = await extendShareExpiration(currentShareId, extendDays);
            if (response.code === 200 && response.data) {
                messageApi.success("延长有效期成功");
                setExtendModalVisible(false);
                fetchShareList();
            } else {
                messageApi.error(response.message || "延长有效期失败");
            }
        } catch (error) {
            console.error("延长有效期失败:", error);
            messageApi.error("延长有效期失败: " + (error.message || "未知错误"));
        }
    };

    // 创建新分享
    const handleCreateShare = async () => {
        if ((!shareFiles.length && !shareFolders.length) || !shareTitle) {
            messageApi.warning("请选择要分享的文件并填写分享标题");
            return;
        }

        const shareRequest = {
            fileIds: shareFiles.map(file => file.id),
            folderIds: shareFolders.map(folder => folder.id),
            title: shareTitle,
            description: shareDescription,
            password: sharePassword || undefined,
            expireTime: expireDays > 0 ? new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000) : undefined
        };

        try {
            const response = await createShare(shareRequest);
            if (response.code === 200) {
                const shareCode = response.data;
                copyShareLink(shareCode);
                messageApi.success("创建分享成功，链接已复制到剪贴板");
                resetShareForm();
                setCreateShareModalVisible(false);
                fetchShareList();
            } else {
                messageApi.error(response.message || "创建分享失败");
            }
        } catch (error) {
            console.error("创建分享失败:", error);
            messageApi.error("创建分享失败: " + (error.message || "未知错误"));
        }
    };

    // 重置分享表单
    const resetShareForm = () => {
        setShareFiles([]);
        setShareFolders([]);
        setShareTitle("");
        setShareDescription("");
        setSharePassword("");
        setExpireDays(7);
    };

    // 我的分享列表列定义
    const mySharesColumns = [
        {
            title: "分享名称",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <Space>
                    <ShareAltOutlined />
                    <Text strong>{text}</Text>
                    {record.needPassword && <LockOutlined style={{ color: "#faad14" }} />}
                </Space>
            ),
        },
        {
            title: "浏览/下载/保存",
            key: "stats",
            render: (_, record) => (
                <Space>
                    <Tag icon={<EyeOutlined />} color="default">
                        {record.viewCount || 0}
                    </Tag>
                    <Tag icon={<DownloadOutlined />} color="default">
                        {record.downloadCount || 0}
                    </Tag>
                    <Tag icon={<CopyOutlined />} color="default">
                        {record.saveCount || 0}
                    </Tag>
                </Space>
            ),
        },
        {
            title: "创建时间",
            dataIndex: "createTime",
            key: "createTime",
            render: (text) => (
                <Space>
                    <ClockCircleOutlined />
                    {formatDate(text)}
                </Space>
            ),
        },
        {
            title: "到期时间",
            dataIndex: "expireTime",
            key: "expireTime",
            render: (text) => (
                text ? (
                    <Space>
                        <ClockCircleOutlined />
                        {formatDate(text)}
                    </Space>
                ) : (
                    <Tag color="green">永不过期</Tag>
                )
            ),
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === 0 ? "green" : "red"}>
                    {status === 0 ? "正常" : "已关闭"}
                </Tag>
            ),
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="复制链接">
                        <Button 
                            type="text" 
                            icon={<LinkOutlined />} 
                            onClick={() => copyShareLink(record.shareCode)}
                        />
                    </Tooltip>
                    <Tooltip title="延长有效期">
                        <Button 
                            type="text" 
                            icon={<ClockCircleOutlined />} 
                            onClick={() => showExtendModal(record.id)}
                            disabled={record.status !== 0}
                        />
                    </Tooltip>
                    <Tooltip title="取消分享">
                        <Popconfirm
                            title="确定要取消此分享吗？"
                            description="取消后分享链接将无法访问"
                            onConfirm={() => handleCancelShare(record.id)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                disabled={record.status !== 0}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // 我保存的分享列表列定义
    const savedSharesColumns = [
        {
            title: "分享名称",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <Space>
                    <ShareAltOutlined />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: "分享者",
            dataIndex: "username",
            key: "username",
            render: (text, record) => (
                <Space>
                    <img 
                        src={record.avatar || "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"} 
                        alt="avatar" 
                        style={{ width: 24, height: 24, borderRadius: '50%' }} 
                    />
                    <Text>{text}</Text>
                </Space>
            ),
        },
        {
            title: "保存时间",
            dataIndex: "createTime",
            key: "createTime",
            render: (text) => formatDate(text),
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="查看分享">
                        <Button 
                            type="text" 
                            icon={<EyeOutlined />} 
                            onClick={() => window.open(`/s/${record.shareCode}`, '_blank')}
                        />
                    </Tooltip>
                    <Tooltip title="复制链接">
                        <Button 
                            type="text" 
                            icon={<LinkOutlined />} 
                            onClick={() => copyShareLink(record.shareCode)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Content style={{ padding: "0 24px", minHeight: 280 }}>
            {contextHolder}
            <Card>
                <Tabs 
                    activeKey={activeTab} 
                    onChange={handleTabChange}
                    tabBarExtraContent={
                        activeTab === "1" ? (
                            <Button 
                                type="primary" 
                                icon={<ShareAltOutlined />}
                                onClick={() => setCreateShareModalVisible(true)}
                            >
                                创建分享
                            </Button>
                        ) : null
                    }
                >
                    <TabPane tab="我的分享" key="1">
                        <Table 
                            columns={mySharesColumns}
                            dataSource={myShares}
                            rowKey="id"
                            pagination={pagination}
                            loading={loading}
                            onChange={handleTableChange}
                        />
                    </TabPane>
                    <TabPane tab="我保存的分享" key="2">
                        <Table 
                            columns={savedSharesColumns}
                            dataSource={savedShares}
                            rowKey="id"
                            pagination={pagination}
                            loading={loading}
                            onChange={handleTableChange}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* 创建分享对话框 */}
            <Modal
                title="创建文件分享"
                open={createShareModalVisible}
                onOk={handleCreateShare}
                onCancel={() => setCreateShareModalVisible(false)}
                okText="创建分享"
                cancelText="取消"
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input 
                        placeholder="分享标题" 
                        value={shareTitle}
                        onChange={(e) => setShareTitle(e.target.value)}
                        prefix={<ShareAltOutlined />}
                        required
                    />
                    <Input.TextArea 
                        placeholder="分享描述(可选)" 
                        value={shareDescription}
                        onChange={(e) => setShareDescription(e.target.value)}
                        rows={3}
                    />
                    <Input 
                        placeholder="访问密码(可选)" 
                        value={sharePassword}
                        onChange={(e) => setSharePassword(e.target.value)}
                        prefix={<LockOutlined />}
                    />
                    <Space>
                        <Text>有效期：</Text>
                        <Input 
                            type="number" 
                            style={{ width: 120 }} 
                            value={expireDays}
                            onChange={(e) => setExpireDays(parseInt(e.target.value) || 0)}
                            suffix="天"
                            min={0}
                        />
                        <Text type="secondary">0表示永不过期</Text>
                    </Space>
                    
                    <div style={{ marginTop: 16 }}>
                        <Text strong>待分享文件：</Text>
                        {shareFiles.length > 0 || shareFolders.length > 0 ? (
                            <div style={{ marginTop: 8 }}>
                                {shareFiles.map(file => (
                                    <Tag key={file.id} closable onClose={() => setShareFiles(prev => prev.filter(f => f.id !== file.id))}>
                                        <FileOutlined /> {file.name}
                                    </Tag>
                                ))}
                                {shareFolders.map(folder => (
                                    <Tag key={folder.id} closable onClose={() => setShareFolders(prev => prev.filter(f => f.id !== folder.id))}>
                                        <FolderOutlined /> {folder.name}
                                    </Tag>
                                ))}
                            </div>
                        ) : (
                            <Text type="secondary">请先在文件管理中选择要分享的文件</Text>
                        )}
                    </div>
                </Space>
            </Modal>

            {/* 延长有效期对话框 */}
            <Modal
                title="延长分享有效期"
                open={extendModalVisible}
                onOk={handleExtendExpiration}
                onCancel={() => setExtendModalVisible(false)}
                okText="确定"
                cancelText="取消"
            >
                <Space>
                    <Text>延长天数：</Text>
                    <Input 
                        type="number" 
                        style={{ width: 120 }} 
                        value={extendDays}
                        onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                        suffix="天"
                        min={1}
                    />
                </Space>
            </Modal>
        </Content>
    );
};

export default ShareContent;
