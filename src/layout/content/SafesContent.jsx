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
} from "@ant-design/icons";
import { getSafesList, createNewSafeFolder, deleteSafeFile, renameFile } from "@/api";
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
    const [loading, setLoading] = useState(true);
    const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState(0);
    const { userInfo } = useUserStore();

    useEffect(() => {
        if (isVerified) {
            fetchSafesList();
        }
    }, [isVerified, currentFolderId]);

    // 如果未开启两步验证，显示绑定组件
    if (!userInfo.userSetting?.twoFactorStatus) {
        return <NotOpenTwoFactor />;
    }

    // 如果未通过两步验证，显示验证组件
    if (!isVerified) {
        return <VerifyComponent onSuccess={() => setIsVerified(true)} />;
    }

    // 获取保险箱文件列表
    const fetchSafesList = async () => {
        setLoading(true);
        try {
            const response = await getSafesList(currentFolderId);
            if (response.data.code === 200) {
                const files = response.data.data || [];
                const formattedFiles = files.map(file => ({
                    key: file.id,
                    name: file.name,
                    isFolder: file.type === 'folder',
                    type: file.type,
                    size: file.size,
                    uploadAt: file.createAt,
                }));
                setCurrentFiles(formattedFiles);
            } else {
                message.error(response.data.message || '获取保险箱列表失败');
                setCurrentFiles([]);
            }
        } catch (error) {
            console.error('获取保险箱列表失败:', error);
            message.error('获取保险箱列表失败');
            setCurrentFiles([]);
        } finally {
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
            const url = await getDownloadLink(file.key);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('下载文件失败:', error);
            message.error('下载文件失败');
        }
    };

    // 处理文件删除
    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要永久删除${record.isFolder ? '文件夹' : '文件'} "${record.name}" 吗？此操作不可恢复！`,
            okText: '删除',
            okType: 'danger',
            onOk: async () => {
                try {
                    const response = await deleteSafeFile(record.key);
                    if (response.data.code === 200) {
                        setCurrentFiles(prev => prev.filter(f => f.key !== record.key));
                        message.success('删除成功');
                    } else {
                        message.error(response.data.message || '删除失败');
                    }
                } catch (error) {
                    console.error('删除失败:', error);
                    message.error('删除失败');
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
                            icon={<DeleteOutlined />}
                            danger
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(record);
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

                <Button
                    icon={<FolderAddOutlined />}
                    onClick={handleNewFolder}
                >
                    新建文件夹
                </Button>
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