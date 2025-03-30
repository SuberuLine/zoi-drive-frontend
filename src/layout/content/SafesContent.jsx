import { useState, useEffect } from "react";
import { Table, Space, Button, Breadcrumb, message, Modal, Input } from "antd";
import {
    FileOutlined,
    FolderOutlined,
    EyeOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    ReloadOutlined,
    FolderAddOutlined,
    MoreOutlined,
    FileImageOutlined,
    FileTextOutlined,
    FileZipOutlined,
    VideoCameraOutlined,
    SoundOutlined,
    FileMarkdownOutlined,
    DownloadOutlined,
    UnlockOutlined,
} from "@ant-design/icons";
import { getSafesList, is2FATokenValid, moveFromSafe, getSafeDownloadLink } from "@/api";
import { formatDate } from "@/utils/formatter";
import styles from "@/styles/FileContent.module.css";
import PreviewContainer from '@/components/preview/PreviewContainer';
import useUserStore from '@/store/UserStore';
import TwoFactorBind from '@/components/two_factor/TwoFactorBind';
import TwoFactorVerify from '@/components/two_factor/TwoFactorVerify';

// 未开启两步验证的提示组件
const NotOpenTwoFactor = () => (
    <>
        <div className='flex justify-center items-center mt-10'>
            <span className='text-2xl font-bold'>请先开启两步验证后再使用保险箱功能</span>
        </div>
        <div className='flex justify-center items-center mt-10'>
            <TwoFactorBind />
        </div>
    </>
);

// 验证组件
const VerifyComponent = ({ onSuccess }) => (
    <div className='mt-10'>
        <TwoFactorVerify onSuccess={onSuccess} />
    </div>
);

// 主要内容组件
const SafesContent = () => {
    const [currentPath, setCurrentPath] = useState(["保险箱"]);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState(0);
    const { userInfo } = useUserStore();

    // 组件加载时检查令牌是否有效
    useEffect(() => {
        // 如果用户已开启两步验证，检查令牌是否在有效期内
        if (userInfo.userSetting?.twoFactorStatus) {
            if (is2FATokenValid()) {
                setIsVerified(true);
            } else {
                // 确保未验证时不处于加载状态
                setLoading(false);
            }
        }
    }, [userInfo.userSetting?.twoFactorStatus]);

    useEffect(() => {
        if (isVerified) {
            fetchSafesList();
        }
    }, [isVerified, currentFolderId]);

    // 获取保险箱文件列表
    const fetchSafesList = async () => {
        setLoading(true);
        try {
            const response = await getSafesList(currentFolderId);
            if (response.data.code === 200) {
                const files = response.data.data || [];
                const formattedFiles = files.map(file => ({
                    key: file.key,
                    name: file.name,
                    isFolder: file.type === 'folder',
                    type: file.type,
                    size: file.size,
                    uploadAt: file.createAt,
                }));
                setCurrentFiles(formattedFiles);
            } else {
                // 检查是否是因为令牌过期或无效
                if (response.data.code === 401 || 
                    response.data.code === 403 || 
                    response.data.message?.includes('令牌') || 
                    response.data.message?.includes('token')) {
                    // 将验证状态重置为未验证
                    setIsVerified(false);
                    message.warning('验证已过期，请重新验证');
                } else {
                    message.error(response.data.message || '获取保险箱列表失败');
                    setCurrentFiles([]);
                }
            }
        } catch (error) {
            console.error('获取保险箱列表失败:', error);
            
            // 检查是否是认证错误
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setIsVerified(false);
                message.warning('验证已过期，请重新验证');
            } else {
                message.error('获取保险箱列表失败');
                setCurrentFiles([]);
            }
        } finally {
            // 重要：确保无论成功还是失败都重置加载状态
            setLoading(false);
        }
    };

    // 处理文件预览
    const handlePreview = (file) => {
        setPreviewFile(file);
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
            // 显示下载中提示
            const loadingMessage = message.loading('获取下载链接...', 0);
            
            // 使用保险箱专用的下载API
            const response = await getSafeDownloadLink(file.key);
            
            // 关闭加载提示
            loadingMessage();
            
            if (response.data.code === 200) {
                // 获取返回的下载链接
                const downloadUrl = response.data.data;
                
                // 创建一个隐藏的链接元素并触发点击
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = file.name; // 使用文件名
                link.style.display = 'none';
                
                // 添加到文档中并触发点击
                document.body.appendChild(link);
                link.click();
                
                // 清理DOM
                setTimeout(() => {
                    document.body.removeChild(link);
                }, 100);
                
                message.success('文件下载已开始');
            } else {
                // 错误处理
                message.error(response.data.message || '获取下载链接失败');
            }
        } catch (error) {
            console.error('下载文件失败:', error);
            
            // 详细错误信息
            if (error.response && error.response.status === 401) {
                setIsVerified(false);
                message.warning('验证已过期，请重新验证');
            } else {
                message.error('下载文件失败: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // 处理文件移出
    const handleMoveOut = (record) => {
        Modal.confirm({
            title: '确认移出',
            content: `确定要将${record.isFolder ? '文件夹' : '文件'} "${record.name}" 移出保险柜吗？`,
            okText: '移出',
            onOk: async () => {
                try {
                    const response = await moveFromSafe(record.key);
                    if (response.data.code === 200) {
                        // 从当前列表中移除该文件
                        setCurrentFiles(prev => prev.filter(f => f.key !== record.key));
                        message.success('已成功移出保险柜');
                    } else {
                        // 检查是否是因为令牌过期或无效
                        if (response.data.code === 401 || response.data.message?.includes('令牌') || response.data.message?.includes('token')) {
                            setIsVerified(false);
                            message.warning('验证已过期，请重新验证');
                        } else {
                            message.error(response.data.message || '移出失败');
                        }
                    }
                } catch (error) {
                    console.error('移出失败:', error);
                    
                    // 更细致的错误处理
                    if (error.response) {
                        if (error.response.status === 401 || error.response.status === 403) {
                            // 检查令牌是否依然有效（可能是其他认证问题）
                            if (!is2FATokenValid()) {
                                setIsVerified(false);
                                message.warning('验证已过期，请重新验证');
                            } else {
                                message.error('操作未授权，请稍后重试');
                            }
                        } else {
                            message.error(error.response.data?.message || '移出失败');
                        }
                    } else {
                        message.error('移出失败，请检查网络连接');
                    }
                }
            },
        });
    };

    // 处理新建文件夹
    const handleNewFolder = () => {
        setIsNewFolderModalVisible(true);
    };

    // 确认新建文件夹
    const handleNewFolderOk = async () => {
        if (newFolderName) {
            try {
                const response = await createNewSafeFolder(currentFolderId, newFolderName);
                const newFolder = {
                    key: response.data.id,
                    name: response.data.name,
                    isFolder: true,
                    type: 'folder',
                    size: '-',
                    uploadAt: new Date().toISOString(),
                };
                setCurrentFiles(prevFiles => [...prevFiles, newFolder]);
                setIsNewFolderModalVisible(false);
                setNewFolderName("");
                message.success('创建文件夹成功');
            } catch (error) {
                console.error('创建文件夹失败:', error);
                message.error('创建文件夹失败');
            }
        }
    };

    // 获取文件图标
    const getIcon = (file) => {
        if (file.isFolder) return <FolderOutlined />;

        const mimeType = file.type.toLowerCase();
        if (mimeType.includes('image')) return <FileImageOutlined />;
        if (mimeType.includes('video')) return <VideoCameraOutlined />;
        if (mimeType.includes('audio')) return <SoundOutlined />;
        if (mimeType.includes('text')) return <FileTextOutlined />;
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return <FileZipOutlined />;
        if (mimeType.includes('markdown')) return <FileMarkdownOutlined />;
        return <FileOutlined />;
    };

    // 表格列定义
    const columns = [
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div className={styles.fileNameCell}>
                    <Space>
                        {getIcon(record)}
                        <span>{text}</span>
                    </Space>
                    <Space>
                        {!record.isFolder && (
                            <>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreview(record);
                                    }}
                                />
                                <Button
                                    icon={<DownloadOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(record);
                                    }}
                                />
                            </>
                        )}
                        <Button
                            icon={<UnlockOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMoveOut(record);
                            }}
                        />
                    </Space>
                </div>
            ),
        },
        {
            title: "大小",
            dataIndex: "size",
            key: "size",
            width: 120,
        },
        {
            title: "类型",
            dataIndex: "type",
            key: "type",
            width: 150,
            render: (text) => text === 'folder' ? '文件夹' : '文件',
        },
    ];

    // 处理返回上级
    const handleGoBack = () => {
        if (currentPath.length > 1) {
            const newPath = currentPath.slice(0, -1);
            setCurrentPath(newPath);
            setCurrentFolderId(0); // 返回上级时重置文件夹ID
        }
    };

    // 处理文件夹点击
    const handleFolderClick = (folder) => {
        setCurrentPath([...currentPath, folder.name]);
        setCurrentFolderId(folder.key);
    };

    // 修改渲染逻辑，先判断验证状态，再判断加载状态
    
    // 如果未开启两步验证，显示绑定组件
    if (!userInfo.userSetting?.twoFactorStatus) {
        return <NotOpenTwoFactor />;
    }

    // 如果未通过两步验证，显示验证组件
    if (!isVerified) {
        return <VerifyComponent onSuccess={() => setIsVerified(true)} />;
    }

    return (
        <div style={{ padding: "24px", position: "relative", minHeight: "calc(100vh - 184px)" }}>
            {/* 面包屑导航 */}
            <Breadcrumb
                items={currentPath.map((path, index) => ({
                    title: path,
                }))}
                style={{ marginBottom: "16px" }}
            />

            {/* 操作按钮 */}
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleGoBack}
                        disabled={currentPath.length <= 1}
                    >
                        返回上级
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchSafesList}
                    >
                        刷新
                    </Button>
                </Space>
            </div>

            {/* 文件列表 */}
            <Table
                columns={columns}
                dataSource={currentFiles}
                rowKey="key"
                loading={loading}
                onRow={(record) => ({
                    onClick: () => {
                        if (record.isFolder) {
                            handleFolderClick(record);
                        }
                    },
                    style: { cursor: record.isFolder ? 'pointer' : 'default' }
                })}
            />

            {/* 新建文件夹模态框 */}
            <Modal
                title="创建新文件夹"
                open={isNewFolderModalVisible}
                onOk={handleNewFolderOk}
                onCancel={() => setIsNewFolderModalVisible(false)}
            >
                <Input
                    placeholder="输入文件夹名称"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                />
            </Modal>

            {/* 文件预览容器 */}
            <PreviewContainer
                file={previewFile}
                visible={isPreviewVisible}
                onClose={handleClosePreview}
                onDownload={handleDownload}
            />
        </div>
    );
};

export default SafesContent;