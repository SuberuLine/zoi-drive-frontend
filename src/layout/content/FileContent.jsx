import { useState, useEffect } from "react";
import { Table, Space, Button, Breadcrumb, Upload, message, Modal, Input } from "antd";
import {
    FileOutlined,
    FolderOutlined,
    EyeOutlined,
    DownloadOutlined,
    DeleteOutlined,
    UploadOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    FolderAddOutlined,
    ThunderboltOutlined,
    FileImageOutlined,
    FileTextOutlined,
    FileZipOutlined,
    VideoCameraOutlined,
    SoundOutlined,
    FileMarkdownOutlined,
    ArrowLeftOutlined,
    CloudDownloadOutlined,
} from "@ant-design/icons";
import { getUserFileList, moveFile, createNewFolder, downloadFileByPresignedUrl, deleteFile, magnetDownload, offlineDownload } from "@/api";
import {formatDate} from "@/utils/formatter";
import styles from "@/styles/FileContent.module.css"; 

export default function FileManager() {

    const [currentPath, setCurrentPath] = useState(["root"]); // 当前路径
    const [currentFiles, setCurrentFiles] = useState(null); // 当前显示的文件列表
    const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false); // 新建文件夹模态框可见性
    const [newFolderName, setNewFolderName] = useState(""); // 新文件夹名称
    const [isMagnetModalVisible, setIsMagnetModalVisible] = useState(false); // 磁力下载模态框可见性
    const [magnetLink, setMagnetLink] = useState(""); // 磁力链接
    const [draggingFile, setDraggingFile] = useState(null); // 正在拖动的文件
    const [dragOverFolder, setDragOverFolder] = useState(null); // 拖动悬停的文件夹
    const [fileTree, setFileTree] = useState(null); // 完整的文件树结构
    const [loading, setLoading] = useState(true); // 加载文件列表
    const [isOfflineDownloadModalVisible, setIsOfflineDownloadModalVisible] = useState(false); // 离线下载模态框可见性
    const [offlineDownloadLink, setOfflineDownloadLink] = useState(""); // 离线下载链接

    // 初始化：获取文件列表
    useEffect(() => {
        setLoading(true);
        getUserFileList().then((res) => {
            console.log(res);
            setFileTree(res.data);
            setCurrentFiles(Array.isArray(res.data) ? res.data : []);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    // 处理面包屑路径点击
    const handlePathClick = (index) => {
        const newPath = currentPath.slice(0, index + 1);
        setCurrentPath(newPath);
        let files = fileTree;
        for (let i = 1; i < newPath.length; i++) {
            const folder = files.find(f => f.name === newPath[i] && f.isFolder);
            if (folder) {
                files = folder.children;
            }
        }
        setCurrentFiles(files);
    };

    // 修改处理文件/文件夹点击的函数
    const handleFileClick = (file) => {
        if (file.isFolder) {
            setCurrentPath([...currentPath, file.name]);
            setCurrentFiles(Array.isArray(file.children) ? file.children : []);
        } else {
            handlePreview(file);
        }
    };

    // 处理文件预览
    const handlePreview = (file) => {
        message.info(`预览文件: ${file.name}`);
    };

    // 处理文件下载
    const handleDownload = async (file) => {
        try {
            const presignedUrl = await downloadFileByPresignedUrl(file.key);
            // 创建一个隐藏的 <a> 元素并触发点击
            const link = document.createElement('a');
            link.href = presignedUrl;
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

    // 处理离线下载
    const handleOfflineDownload = () => {
        setIsOfflineDownloadModalVisible(true);
    };

    // 确认离线下载
    const handleOfflineDownloadOk = async () => {
        if (offlineDownloadLink) {
            try {
                const res = await offlineDownload(offlineDownloadLink);
                console.log(res.data);
                if (res.code === 200) {
                    message.success(`开始离线下载: ${offlineDownloadLink}`);
                } else {
                    message.error(`离线下载失败: ${res.message}`);
                }
                setIsOfflineDownloadModalVisible(false);
                setOfflineDownloadLink("");
            } catch (error) {
                console.error('离线下载失败:', error);
                message.error('离线下载失败');
            }
        }
    };
    

    // 处理文件删除
    const handleDelete = (file) => {
        Modal.confirm({
            title: '确认删除',
            content: `你确定要删除 ${file.name} 吗？`,
            onOk: async () => {
                const res = await deleteFile(file.key);
                console.log(res);
                setCurrentFiles(currentFiles.filter((f) => f.key !== file.key));
                message.success(`删除文件: ${file.name}`);
            },
        });
    };

    // 处理文件上传
    const handleUpload = (info) => {
        if (info.file.status === "done") {
            message.success(`上传文件成功: ${info.file.name}`);
        } else if (info.file.status === "error") {
            message.error(`上传文件失败: ${info.file.name}`);
        }
    };

    // 处理新建文件夹
    const handleNewFolder = () => {
        setIsNewFolderModalVisible(true);
    };

    // 获取当前文件夹的数值型 key
    const getCurrentFolderKey = () => {
        if (currentPath.length === 1) {
            return 0; // 根目录为0 表示
        }
        const currentFolder = findFolderByPath(fileTree, currentPath.slice(1));
        return currentFolder ? currentFolder.key : null;
    };

    // 递归查找文件夹
    const findFolderByPath = (files, path) => {
        if (path.length === 0) {
            return files;
        }
        const folder = files.find(f => f.name === path[0] && f.isFolder);
        if (!folder) {
            return null;
        }
        if (path.length === 1) {
            return folder;
        }
        return findFolderByPath(folder.children, path.slice(1));
    };

    // 确认新建文件夹
    const handleNewFolderOk = async () => {
        if (newFolderName) {
            const currentFolderKey = getCurrentFolderKey();
            console.log(getCurrentFolderKey());
            try {
                // 调用后端 API 创建新文件夹
                const response = await createNewFolder(currentFolderKey, newFolderName);

                const newFolder = {
                    key: response.data.id, // 假设后端返回的是 id
                    name: response.data.name,
                    isFolder: true,
                    type: 'folder', // 添加一个默认的 type
                    size: '-',
                    uploadAt: new Date().toISOString(),
                    children: []
                };


                // 更新前端状态
                setCurrentFiles(prevFiles => [...prevFiles, newFolder]);
                setIsNewFolderModalVisible(false);
                setNewFolderName("");
                message.success(`创建新文件夹: ${newFolderName}`);
            } catch (error) {
                console.error('创建文件夹失败:', error);
                message.error('创建文件夹失败');
            }
        }
    };

    // 处理磁力下载
    const handleMagnetDownload = () => {
        setIsMagnetModalVisible(true);
    };

    // 确认磁力下载
    const handleMagnetDownloadOk = async () => {
        if (magnetLink) {
            if (!magnetLink.startsWith("magnet:?xt=urn:btih:")) {
                message.error('无效的磁力链接');
                return;
            }
            try {
                const res = await magnetDownload(magnetLink);
                console.log(res.data);
                if (res.code === 200) {
                    message.success(`开始磁力下载: ${magnetLink}`);
                } else {
                    message.error(`磁力下载失败: ${res.message}`);
                }
                setIsMagnetModalVisible(false);
                setMagnetLink("");
            } catch (error) {
                console.error('磁力下载失败:', error);  
                message.error('磁力下载失败');
            }
        }
    };
    

    // 转换MimeType名称
    const getFileTypeName = (mimeType) => {
        mimeType = mimeType.toLowerCase();
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Excel';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PowerPoint';
        if (mimeType.includes('image')) return '图片';
        if (mimeType.includes('video')) return '视频';
        if (mimeType.includes('audio')) return '音频';
        if (mimeType.includes('text')) return '文本';
        if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) return '压缩文件';
        if (mimeType.includes('executable') || mimeType.includes('x-msdownload')) return '可执行文件';
        if (mimeType.includes('markdown')) return 'Markdown';
        return '其他';
    };

    // 获取文件图标
    const getIcon = (file) => {
        if (file.isFolder && !file.isBack) return <FolderOutlined />;

        const mimeType = file.type.toLowerCase();

        if (mimeType.includes('pdf')) {
            return <FilePdfOutlined />;
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return <FileWordOutlined />;
        } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
            return <FileExcelOutlined />;
        } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
            return <FilePptOutlined />;
        } else if (mimeType.includes('image')) {
            return <FileImageOutlined />;
        } else if (mimeType.includes('video')) {
            return <VideoCameraOutlined />;
        } else if (mimeType.includes('audio')) {
            return <SoundOutlined />;
        } else if (mimeType.includes('text')) {
            return <FileTextOutlined />;
        } else if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) {
            return <FileZipOutlined />;
        } else if (mimeType.includes('executable') || mimeType.includes('x-msdownload')) {
            return <ThunderboltOutlined />;
        } else if (mimeType.includes('markdown')) {
            return <FileMarkdownOutlined />;
        } else {
            return <FileOutlined />;
        }
    };

    // 处理拖动开始
    const handleDragStart = (file, e) => {
        if (file.isFolder) return;  // 防止拖动文件夹
        setDraggingFile(file);
        e.dataTransfer.setData('text/plain', file.key);
        e.dataTransfer.effectAllowed = 'move';
    };

    // 处理拖动悬停
    const handleDragOver = (folder, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (folder.isFolder && folder.key !== draggingFile?.key) {
            setDragOverFolder(folder.key);
            e.dataTransfer.dropEffect = 'move';
        }
    };

    // 处理拖动离开
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverFolder(null);
    };

    // 修改处理拖放的函数
    const handleDrop = async (targetFolder, e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverFolder(null);

        if (!draggingFile || !targetFolder.isFolder || draggingFile.key === targetFolder.key) {
            return;
        }

        try {
            const targetFolderId = targetFolder.key;

            console.log(draggingFile.key, "--->", targetFolderId);
            // 调用后端 API 来移动文件
            await moveFile(draggingFile.key, targetFolderId);

            // 更新前端状态
            setCurrentFiles(prevFiles => {
                const updatedFiles = prevFiles.filter(f => f.key !== draggingFile.key);
                const updatedTargetFolder = {
                    ...targetFolder,
                    children: [...(targetFolder.children || []), draggingFile]
                };
                return updatedFiles.map(f => f.key === targetFolder.key ? updatedTargetFolder : f);
            });

            message.success(`已将 ${draggingFile.name} 移动到 ${targetFolder.name}`);
        } catch (error) {
            console.error('移动文件失败:', error);
            message.error('移动文件失败');
        }

        setDraggingFile(null);
    };

    // 添加返回上一级的函数
    const handleGoBack = () => {
        if (currentPath.length > 1) {
            const newPath = currentPath.slice(0, -1);
            setCurrentPath(newPath);
            let files = fileTree;
            for (let i = 1; i < newPath.length; i++) {
                const folder = files.find(f => f.name === newPath[i] && f.isFolder);
                if (folder) {
                    files = folder.children;
                }
            }
            setCurrentFiles(files);
        }
    };

    // 表格列定义
    const columns = [
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space>
                    {getIcon(record)}
                    {/* {record.isFolder ? <FolderOutlined /> : <FileOutlined />} */}
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: "大小",
            dataIndex: "size",
            key: "size",
        },
        {
            title: "类型",
            dataIndex: "type",
            key: "type",
            render: (text) => getFileTypeName(text),
        },
        {
            title: "上传日期",
            dataIndex: "uploadAt",
            key: "uploadAt",
            render: (text) => formatDate(text),
        },
        {
            title: "操作",
            key: "action",
            fixed: "right",
            width: 100,
            align: "right",
            render: (record) => (
                <Space>
                {!record.isFolder && (
                    <>
                        <Button icon={<EyeOutlined />} onClick={(e) => {
                            handlePreview(record)
                            e.stopPropagation();
                        }}>
                            预览
                        </Button>
                        <Button icon={<DownloadOutlined />} onClick={(e) => {
                            handleDownload(record)
                            e.stopPropagation();
                        }}>
                            下载
                        </Button>
                        <Button icon={<DeleteOutlined />} onClick={(e) => {
                            handleDelete(record)
                            e.stopPropagation();
                        }}>
                            删除
                        </Button>
                    </>
                )}
            </Space>
            ),
        },
    ];

    // 生成面包屑项
    const breadcrumbItems = currentPath.map((path, index) => ({
        title: <a onClick={() => handlePathClick(index)}>{path}</a>,
        key: index,
    }));

    return (
        <div style={{ padding: "24px" }}>
            {/* 面包屑导航 */}
            <Breadcrumb items={breadcrumbItems} style={{ marginBottom: "16px" }} />

            {/* 操作按钮 */}
            <Space style={{ marginBottom: "16px" }}>
                {currentPath.length > 1 && (
                    <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
                        返回上级
                    </Button>
                )}
                <Upload onChange={handleUpload}>
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                </Upload>
                <Button icon={<FolderAddOutlined />} onClick={handleNewFolder}>
                    新建文件夹
                </Button>
                <Button
                    icon={<ThunderboltOutlined />}
                    onClick={handleMagnetDownload}
                    disabled={true}
                >
                    磁力下载
                </Button>
                <Button
                    icon={<CloudDownloadOutlined />}
                    onClick={handleOfflineDownload}
                >
                    离线下载
                </Button>
            </Space>

            {/* 文件列表表格 */}
            <Table
                columns={columns}
                dataSource={currentFiles}
                rowKey="key"
                expandable={{
                    expandIcon: () => false
                }}
                loading={loading}
                onRow={(record) => ({
                    onClick: () => handleFileClick(record),
                    onDragStart: (e) => handleDragStart(record, e),
                    onDragOver: (e) => handleDragOver(record, e),
                    onDragLeave: handleDragLeave,
                    onDrop: (e) => handleDrop(record, e),
                    draggable: !record.isFolder,
                    className: `${styles.tableRow} ${dragOverFolder === record.key ? styles.dragOver : ''} ${draggingFile?.key === record.key ? styles.dragging : ''}`,
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

            {/* 磁力下载模态框 */}
            <Modal
                title="磁力下载"
                open={isMagnetModalVisible}
                onOk={handleMagnetDownloadOk}
                onCancel={() => setIsMagnetModalVisible(false)}
            >
                <Input
                    placeholder="输入磁力链接"
                    value={magnetLink}
                    onChange={(e) => setMagnetLink(e.target.value)}
                />
            </Modal>

            {/* 离线下载模态框 */}
            <Modal
                title="离线下载"
                open={isOfflineDownloadModalVisible}
                onOk={handleOfflineDownloadOk}
                onCancel={() => setIsOfflineDownloadModalVisible(false)}
            >
                <Input
                    placeholder="输入离线下载链接"
                    value={offlineDownloadLink}
                    onChange={(e) => setOfflineDownloadLink(e.target.value)}
                />
            </Modal>
        </div>
    );
}