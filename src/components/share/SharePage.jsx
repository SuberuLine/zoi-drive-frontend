import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Layout,
    Card,
    List,
    Typography,
    Button,
    Space,
    Table,
    Tag,
    Modal,
    Input,
    Breadcrumb,
    message,
    Spin,
    Result,
    Tooltip,
    Empty
} from "antd";
import {
    ShareAltOutlined,
    DownloadOutlined,
    LockOutlined,
    EyeOutlined,
    CloudDownloadOutlined,
    FileOutlined,
    FolderOutlined,
    SaveOutlined,
    LinkOutlined,
    LoginOutlined,
    FileImageOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FileTextOutlined,
    VideoCameraOutlined,
    SoundOutlined,
    FileZipOutlined,
    FileUnknownOutlined
} from "@ant-design/icons";
import { checkLogin, getShareInfo, getShareContent, verifySharePassword, saveShareFiles, downloadShareFile } from "@/api";
import useUserStore from "@/store/UserStore";
import { formatDate, formatFileSize } from "@/utils/formatter";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const SharePage = () => {
    const { shareCode } = useParams();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const { userInfo } = useUserStore();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [shareInfo, setShareInfo] = useState(null);
    const [shareContent, setShareContent] = useState(null);
    const [needPassword, setNeedPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFolders, setSelectedFolders] = useState([]);
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [targetFolderId, setTargetFolderId] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // 检查登录状态
        const checkLoginStatus = async () => {
            try {
                const loggedIn = await checkLogin();
                setIsLoggedIn(loggedIn);
            } catch (error) {
                console.error("检查登录状态失败:", error);
                setIsLoggedIn(false);
            }
        };
        
        checkLoginStatus();
        fetchShareInfo();
    }, [shareCode]);

    // 获取分享信息
    const fetchShareInfo = async () => {
        setLoading(true);
        try {
            const response = await getShareInfo(shareCode);
            if (response.code === 200) {
                setShareInfo(response.data);
                setNeedPassword(response.data.needPassword);
                
                // 如果不需要密码，直接获取分享内容
                if (!response.data.needPassword) {
                    fetchShareContent();
                } else {
                    setLoading(false);
                }
            } else {
                messageApi.error(response.message || "获取分享信息失败");
                setLoading(false);
            }
        } catch (error) {
            console.error("获取分享信息失败:", error);
            messageApi.error("获取分享信息失败: " + (error.message || "未知错误"));
            setLoading(false);
        }
    };

    // 获取分享内容
    const fetchShareContent = async (pwd = "") => {
        setLoading(true);
        try {
            const response = await getShareContent(shareCode, pwd);
            if (response.code === 200) {
                setShareContent(response.data);
                setNeedPassword(false);
            } else {
                messageApi.error(response.message || "获取分享内容失败");
            }
        } catch (error) {
            console.error("获取分享内容失败:", error);
            messageApi.error("获取分享内容失败: " + (error.message || "未知错误"));
        } finally {
            setLoading(false);
        }
    };

    // 验证分享密码
    const verifyPassword = async () => {
        if (!password) {
            messageApi.warning("请输入分享密码");
            return;
        }

        setVerifying(true);
        try {
            const response = await verifySharePassword({ shareCode, password });
            if (response.code === 200 && response.data) {
                fetchShareContent(password);
            } else {
                messageApi.error("密码错误，请重新输入");
            }
        } catch (error) {
            console.error("验证密码失败:", error);
            messageApi.error("验证密码失败: " + (error.message || "未知错误"));
        } finally {
            setVerifying(false);
        }
    };

    // 下载单个文件
    const handleDownloadFile = (fileId) => {
        try {
            // 生成下载URL
            const url = downloadShareFile(shareCode, fileId, password);
            
            // 使用a标签模拟下载，这样会在当前页面内触发下载而不是打开新标签
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("下载文件失败:", error);
            messageApi.error("下载文件失败: " + (error.message || "未知错误"));
        }
    };

    // 批量下载
    const handleBatchDownload = () => {
        if (selectedFiles.length === 0) {
            messageApi.warning("请先选择要下载的文件");
            return;
        }

        for (const file of selectedFiles) {
            handleDownloadFile(file.id);
        }
    };

    // 保存到我的网盘
    const handleSaveToMyDrive = () => {
        if (!isLoggedIn) {
            messageApi.warning("请先登录");
            navigate('/login', { state: { returnUrl: `/s/${shareCode}` } });
            return;
        }

        if (selectedFiles.length === 0 && selectedFolders.length === 0) {
            messageApi.warning("请先选择要保存的文件或文件夹");
            return;
        }

        setSaveModalVisible(true);
    };

    // 执行保存操作
    const handleSave = async () => {
        setSaving(true);
        try {
            const saveRequest = {
                shareCode,
                password: password || undefined,
                fileIds: selectedFiles.map(file => file.id),
                folderIds: selectedFolders.map(folder => folder.id),
                targetFolderId
            };

            const response = await saveShareFiles(saveRequest);
            if (response.code === 200 && response.data) {
                messageApi.success("保存成功");
                setSaveModalVisible(false);
                setSelectedRowKeys([]);
                setSelectedFiles([]);
                setSelectedFolders([]);
            } else {
                messageApi.error(response.message || "保存失败");
            }
        } catch (error) {
            console.error("保存文件失败:", error);
            messageApi.error("保存文件失败: " + (error.message || "未知错误"));
        } finally {
            setSaving(false);
        }
    };

    // 文件图标映射
    const getFileIcon = (type) => {
        const iconMap = {
            image: <FileImageOutlined />,
            word: <FileWordOutlined />,
            excel: <FileExcelOutlined />,
            pdf: <FilePdfOutlined />,
            text: <FileTextOutlined />,
            video: <VideoCameraOutlined />,
            audio: <SoundOutlined />,
            zip: <FileZipOutlined />,
        };
        
        return iconMap[type] || <FileUnknownOutlined />;
    };

    // 文件表格列定义
    const fileColumns = [
        {
            title: "文件名",
            dataIndex: "filename",
            key: "filename",
            render: (text, record) => (
                <Space>
                    {record.isFolder ? 
                        <FolderOutlined style={{ color: '#f5b72d' }} /> : 
                        getFileIcon(record.type)}
                    <Text>{text}</Text>
                </Space>
            ),
        },
        {
            title: "大小",
            dataIndex: "size",
            key: "size",
            render: (size, record) => record.isFolder ? "-" : formatFileSize(size),
        },
        {
            title: "上传时间",
            dataIndex: "uploadAt",
            key: "uploadAt",
            render: (text) => formatDate(text),
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                !record.isFolder ? (
                    <Space size="small">
                        <Tooltip title="下载">
                            <Button 
                                type="text" 
                                icon={<DownloadOutlined />} 
                                onClick={() => handleDownloadFile(record.id)}
                            />
                        </Tooltip>
                    </Space>
                ) : null
            ),
        },
    ];

    // 处理表格选择
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys, selectedRows) => {
            setSelectedRowKeys(selectedKeys);
            setSelectedFiles(selectedRows.filter(row => !row.isFolder));
            setSelectedFolders(selectedRows.filter(row => row.isFolder));
        },
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!shareInfo) {
        return (
            <Result
                status="404"
                title={<span style={{ color: "#fff" }}>分享不存在或已失效</span>}
                subTitle={<span style={{ color: "#fff" }}>请检查分享链接是否正确或联系分享者</span>}
                style={{ background: "#000", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}
            />
        );
    }

    if (needPassword) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
                {contextHolder}
                <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <ShareAltOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                        <Title level={3} style={{ marginTop: 16 }}>
                            {shareInfo.title}
                        </Title>
                        <Text type="secondary">
                            由 {shareInfo.username} 分享
                        </Text>
                    </div>
                    
                    <Input.Password
                        placeholder="请输入分享密码"
                        prefix={<LockOutlined />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onPressEnter={verifyPassword}
                    />
                    
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <Button 
                            type="primary" 
                            loading={verifying}
                            onClick={verifyPassword}
                            block
                        >
                            {verifying ? "验证中..." : "验证密码"}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const allFiles = [
        ...(shareContent?.folderList || []).map(folder => ({ ...folder, isFolder: true, key: `folder-${folder.id}` })),
        ...(shareContent?.fileList || []).map(file => ({ ...file, isFolder: false, key: `file-${file.id}` }))
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {contextHolder}
            <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
                <Card style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space direction="vertical" size={8}>
                            <Space>
                                <ShareAltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    {shareInfo.title}
                                </Title>
                            </Space>
                            {shareInfo.description && (
                                <Paragraph type="secondary">{shareInfo.description}</Paragraph>
                            )}
                            <Space split={<Text type="secondary"> | </Text>}>
                                <Space>
                                    <img 
                                        src={
                                            shareInfo.avatar 
                                                ? (shareInfo.avatar.startsWith('http') 
                                                    ? shareInfo.avatar 
                                                    : shareInfo.avatar) // 使用相对路径，会被代理转发
                                                : "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                                        } 
                                        alt="avatar" 
                                        style={{ width: 24, height: 24, borderRadius: '50%' }} 
                                    />
                                    <Text>{shareInfo.username}</Text>
                                </Space>
                                <Text type="secondary">
                                    {shareInfo.expireTime ? `有效期至：${formatDate(shareInfo.expireTime)}` : '永不过期'}
                                </Text>
                                <Text type="secondary">
                                    浏览次数：{shareInfo.viewCount || 0}
                                </Text>
                                <Text type="secondary">
                                    下载次数：{shareInfo.downloadCount || 0}
                                </Text>
                                <Text type="secondary">
                                    保存次数：{shareInfo.saveCount || 0}
                                </Text>
                            </Space>
                        </Space>
                        
                        <Space>
                            {!isLoggedIn && (
                                <Button 
                                    icon={<LoginOutlined />} 
                                    onClick={() => navigate('/login', { state: { returnUrl: `/s/${shareCode}` } })}
                                >
                                    登录
                                </Button>
                            )}
                            <Button 
                                icon={<LinkOutlined />} 
                                onClick={() => {
                                    const shareUrl = `${window.location.origin}/s/${shareCode}`;
                                    navigator.clipboard.writeText(shareUrl)
                                        .then(() => messageApi.success("分享链接已复制到剪贴板"))
                                        .catch(() => messageApi.error("复制失败，请手动复制"));
                                }}
                            >
                                复制链接
                            </Button>
                        </Space>
                    </div>
                </Card>

                <Card 
                    title={
                        <Space>
                            <Text strong>分享内容</Text>
                            <Tag>{allFiles.length} 个项目</Tag>
                        </Space>
                    }
                    extra={
                        <Space>
                            <Button 
                                icon={<DownloadOutlined />} 
                                onClick={handleBatchDownload}
                                disabled={selectedFiles.length === 0}
                            >
                                下载选中文件
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<SaveOutlined />} 
                                onClick={handleSaveToMyDrive}
                                disabled={selectedFiles.length === 0 && selectedFolders.length === 0}
                            >
                                保存到我的网盘
                            </Button>
                        </Space>
                    }
                >
                    {allFiles.length > 0 ? (
                        <Table 
                            columns={fileColumns}
                            dataSource={allFiles}
                            rowKey="key"
                            rowSelection={rowSelection}
                            pagination={false}
                        />
                    ) : (
                        <Empty description="没有可显示的文件" />
                    )}
                </Card>
            </Content>

            {/* 保存到网盘对话框 */}
            <Modal
                title="保存到我的网盘"
                open={saveModalVisible}
                onOk={handleSave}
                onCancel={() => setSaveModalVisible(false)}
                okText="保存"
                cancelText="取消"
                confirmLoading={saving}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>将保存以下内容到我的网盘：</Text>
                    <div>
                        {selectedFiles.length > 0 && (
                            <Text>文件：{selectedFiles.length}个</Text>
                        )}
                        {selectedFolders.length > 0 && (
                            <Text>文件夹：{selectedFolders.length}个</Text>
                        )}
                    </div>
                    <Space style={{ marginTop: 16 }}>
                        <Text>保存位置：</Text>
                        <Button onClick={() => setTargetFolderId(0)} type={targetFolderId === 0 ? "primary" : "default"}>
                            根目录
                        </Button>
                        {/* 可以添加文件夹选择器 */}
                    </Space>
                </Space>
            </Modal>
        </Layout>
    );
};

export default SharePage; 