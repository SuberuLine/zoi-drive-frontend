import { useState, useEffect } from "react";
import { Table, Space, Button, Breadcrumb, message, Modal, Input, Dropdown, Tree } from "antd";
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
    EditOutlined,
    MoreOutlined,
    LinkOutlined,
    DragOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { getUserFileList, moveFile, createNewFolder, deleteFile, magnetDownload, offlineDownload, getDownloadLink, renameFile } from "@/api";
import {formatDate} from "@/utils/formatter";
import UploadModal from "@/components/file/UploadModal";
import styles from "@/styles/FileContent.module.css"; 
import PreviewContainer from '@/components/preview/PreviewContainer';

export default function FileManager() {

    const [currentPath, setCurrentPath] = useState(["root"]); // 当前路径
    const [currentFiles, setCurrentFiles] = useState(null); // 当前显示的文件列表
    const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false); // 新建文件夹模态框可见性
    const [newFolderName, setNewFolderName] = useState(""); // 新文件夹名称
    const [isMagnetModalVisible, setIsMagnetModalVisible] = useState(false); // 磁力下载模态框可见性
    const [magnetLink, setMagnetLink] = useState(""); // 磁力链接
    const [draggingFile, setDraggingFile] = useState(null); // 正在拖动的文件
    const [dragOverFolder, setDragOverFolder] = useState(null); // 拖动悬停的文件夹
    const [fileTree, setFileTree] = useState([]); // 完整的文件树结构
    const [loading, setLoading] = useState(true); // 加载文件列表
    const [isOfflineDownloadModalVisible, setIsOfflineDownloadModalVisible] = useState(false); // 离线下载模态框可见性
    const [offlineDownloadLink, setOfflineDownloadLink] = useState(""); // 离线下载链接
    const [currentFolderId, setCurrentFolderId] = useState(0);  // 跟踪当前文件夹的 ID
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);  // 控制上传模态框的可见性
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false); // 控制重命名模态框的可见性
    const [fileToRename, setFileToRename] = useState(null); // 当前正在重命名的文件
    const [newFileName, setNewFileName] = useState(""); // 新文件名
    const [fileExtension, setFileExtension] = useState(""); // 文件扩展名
    const [isMoveModalVisible, setIsMoveModalVisible] = useState(false); // 控制移动文件模态框的可见性
    const [fileToMove, setFileToMove] = useState(null); // 当前正在移动的文件
    const [selectedFolderId, setSelectedFolderId] = useState(null); // 当前选择的目标文件夹ID
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    // 初始化：获取文件列表
    useEffect(() => {
        fetchFileList();
    }, []);

    const fetchFileList = async () => {
        setLoading(true);
        try {
            const res = await getUserFileList();
            console.log('Fetched data:', res);
            setFileTree(res.data);
            
            // 保持在当前目录
            let files = res.data;
            for (let i = 1; i < currentPath.length; i++) {
                const folder = files.find(f => f.name === currentPath[i] && f.isFolder);
                if (folder) {
                    files = folder.children;
                } else {
                    // 如果找不到对应的文件夹，回到根目录
                    setCurrentPath(['root']);
                    files = res.data;
                    break;
                }
            }
            setCurrentFiles(files);
        } catch (error) {
            console.error('Error fetching file list:', error);
            message.error('获取文件列表失败');
        } finally {
            setLoading(false);
        }
    };

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
        console.log('File clicked:', file);
        if (file.isFolder) {
            console.log('Folder clicked, key:', file.key);
            setCurrentPath(prevPath => [...prevPath, file.name]);
            setCurrentFiles(file.children || []);
            setCurrentFolderId(file.key);
        } else {
            handlePreview(file);
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
                    message.success(res.data);
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

    // 处理新建文件夹
    const handleNewFolder = () => {
        setIsNewFolderModalVisible(true);
    };

    // 获取当前文件夹的数值型 key
    const getCurrentFolderKey = (path = currentPath) => {
        if (path.length === 1) {
            return 0; // 根目录
        }
        let currentFolder = fileTree;
        for (let i = 1; i < path.length; i++) {
            const folder = currentFolder.find(f => f.name === path[i] && f.isFolder);
            if (!folder) return null;
            currentFolder = folder.children;
            if (i === path.length - 1) return folder.key;
        }
        return null;
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
        if (mimeType === 'folder') return '文件夹';
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
        } catch (error) {
            console.error('移动文件失败:', error);
            message.error('移动文件失败');
        }

        setDraggingFile(null);
    };

    // 处理上传按钮点击
    const handleUploadClick = () => {
        setIsUploadModalVisible(true);
    };

    // 处理上传完成
    const handleUploadComplete = async () => {
        setIsUploadModalVisible(false);
        setLoading(true);
        try {
            const res = await getUserFileList();
            setFileTree(res.data);
            
            // 导航到当前文件夹
            let files = res.data;
            for (let i = 1; i < currentPath.length; i++) {
                const folder = files.find(f => f.name === currentPath[i] && f.isFolder);
                if (folder) {
                    files = folder.children;
                } else {
                    // 如果找不到对应的文件夹，可能是因为重命名或删除，我们就停在上一级
                    setCurrentPath(prev => prev.slice(0, i));
                    break;
                }
            }
            setCurrentFiles(files);
        } catch (error) {
            console.error('Error fetching file list:', error);
            message.error('更新文件列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 添加返回上一级的函数
    const handleGoBack = () => {
        if (currentPath.length > 1) {
            const newPath = currentPath.slice(0, -1);
            setCurrentPath(newPath);
            let files = fileTree;
            let folderId = 0;
            for (let i = 1; i < newPath.length; i++) {
                const folder = files.find(f => f.name === newPath[i] && f.isFolder);
                if (folder) {
                    files = folder.children || [];
                    folderId = folder.key;
                } else {
                    console.warn(`Folder not found: ${newPath[i]}`);
                    break;
                }
            }
            setCurrentFiles(files);
            setCurrentFolderId(folderId);
        }
    };

    // 定义菜单项
    const getMenuItems = (record) => [
        {
            key: 'preview',
            icon: <EyeOutlined />,
            label: '预览文件',
            onClick: (e) => {
                e.domEvent.stopPropagation();
                handlePreview(record);
            },
        },
        {
            key: 'download',
            icon: <DownloadOutlined />,
            label: '下载文件',
            onClick: (e) => {
                e.domEvent.stopPropagation();
                handleDownload(record);
            },
        },
        {
            key: 'getDownloadLink',
            icon: <LinkOutlined />,
            label: '获取直链',
            onClick: (e) => {
                e.domEvent.stopPropagation();
                handleGetDownloadLink(record);
            },
        },
        {
            key: 'divider-1',
            type: 'divider',
        },
        {
            key: 'move',
            icon: <DragOutlined />,
            label: '移动文件',
            onClick: (e) => {
                e.domEvent.stopPropagation();
                handleMove(record);
            },
        },
        {
            key: 'rename',
            icon: <EditOutlined />,
            label: '重命名文件',
            onClick: (e) => {
                e.domEvent.stopPropagation();
                handleRename(record);
            },
        },
        {
            key: 'divider-2',
            type: 'divider',
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除文件',
            danger: true,
            onClick: (e) => {
                e.domEvent.stopPropagation();
                handleDelete(record);
            },
        },
    ];

    // 修改表格列定义
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
                    {!record.isFolder && (
                        <Dropdown
                            menu={{ items: getMenuItems(record) }}
                            trigger={['click']}
                        >
                            <Button
                                icon={<MoreOutlined />}
                                className={styles.actionButton}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Dropdown>
                    )}
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
            render: (text) => getFileTypeName(text),
        },
        {
            title: "上传日期",
            dataIndex: "uploadAt",
            key: "uploadAt",
            width: 250,
            render: (text) => formatDate(text),
        },
    ];

    // 生成面包屑项
    const breadcrumbItems = currentPath.map((path, index) => ({
        title: <a onClick={() => handlePathClick(index)}>{path}</a>,
        key: index,
    }));

    // 处理重命名
    const handleRename = (file) => {
        const nameParts = file.name.split('.');
        const extension = nameParts.length > 1 ? nameParts.pop() : '';
        const nameWithoutExtension = nameParts.join('.');
        setFileToRename(file);
        setNewFileName(nameWithoutExtension);
        setFileExtension(extension);
        setIsRenameModalVisible(true);
    };

    // 确认重命名
    const handleRenameOk = async () => {
        if (newFileName && fileToRename) {
            const fullNewName = fileExtension ? `${newFileName}.${fileExtension}` : newFileName;
            try {
                // 调用后端 API 重命名文件
                await renameFile(fileToRename.key, fullNewName);

                // 更新前端状态
                setCurrentFiles(prevFiles => 
                    prevFiles.map(f => 
                        f.key === fileToRename.key 
                            ? { ...f, name: fullNewName } 
                            : f
                    )
                );

                setIsRenameModalVisible(false);
                setFileToRename(null);
                setNewFileName("");
                setFileExtension("");
            } catch (error) {
                console.error('重命名文件失败:', error);
                message.error('重命名文件失败');
            }
        }
    };

    // 处理移动文件
    const handleMove = (file) => {
        setFileToMove(file);
        setSelectedFolderId(null);  // 重置选中的文件夹
        setIsMoveModalVisible(true);
    };

    // 确认移动文件
    const handleMoveOk = async () => {
        if (fileToMove && selectedFolderId !== null) {
            try {
                // 调用后端 API 移动文件
                await moveFile(fileToMove.key, selectedFolderId);

                // 更新前端状态
                await fetchFileList();  // 重新获取文件列表

                setIsMoveModalVisible(false);
                setFileToMove(null);
                setSelectedFolderId(null);
                message.success(`已将 ${fileToMove.name} 移动到新位置`);
            } catch (error) {
                console.error('移动文件失败:', error);
                message.error('移动文件失败');
            }
        }
    };

    // 生成树形结构数据
    const generateTreeData = (files) => {
        if (!files || !Array.isArray(files)) {
            return [];
        }
        return files
            .filter(file => file.isFolder)
            .map(file => ({
                title: file.name,
                key: file.key,
                icon: <FolderOutlined />,
                children: generateTreeData(file.children),
            }));
    };

    // 处理树节点选择
    const onSelect = (selectedKeys) => {
        setSelectedFolderId(selectedKeys[0]);
    };

    // 准备树形数据，包括根目录
    const treeData = [
        {
            title: "Root",
            key: 0,
            icon: <FolderOutlined />,
            children: generateTreeData(fileTree)
        }
    ];

    return (
        <div style={{ padding: "24px" }}>
            {/* 面包屑导航 */}
            <Breadcrumb items={breadcrumbItems} style={{ marginBottom: "16px" }} />

            {/* 操作按钮 */}
            <div style={{ 
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                {/* 左侧按钮组 */}
                <Space>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={handleGoBack}
                        disabled={currentPath.length <= 1} // 在根目录时禁用
                    >
                        返回上级
                    </Button>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={fetchFileList}
                    >
                        刷新
                    </Button>
                </Space>

                {/* 右侧按钮组 */}
                <Space>
                    <Button icon={<UploadOutlined />} onClick={handleUploadClick}>
                        上传文件
                    </Button>
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
            </div>

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

            {/* 上传模态框 */}
            <UploadModal
                visible={isUploadModalVisible}
                onCancel={() => setIsUploadModalVisible(false)}
                folderId={currentFolderId}
                currentPath={currentPath}
                onUploadComplete={handleUploadComplete}
            />

            {/* 重命名模态框 */}
            <Modal
                title="重命名文件"
                open={isRenameModalVisible}
                onOk={handleRenameOk}
                onCancel={() => {
                    setIsRenameModalVisible(false);
                    setFileToRename(null);
                    setNewFileName("");
                    setFileExtension("");
                }}
            >
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        placeholder="输入新的文件名"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        style={{ width: 'calc(100% - 60px)' }}
                    />
                    {fileExtension && (
                        <Input
                            style={{ width: '60px' }}
                            value={`.${fileExtension}`}
                            disabled
                        />
                    )}
                </Space.Compact>
            </Modal>

            {/* 移动文件模态框 */}
            <Modal
                title="移动文件"
                open={isMoveModalVisible}
                onOk={handleMoveOk}
                onCancel={() => {
                    setIsMoveModalVisible(false);
                    setFileToMove(null);
                    setSelectedFolderId(null);
                }}
            >
                <Tree
                    showLine={true}
                    showIcon={true}
                    treeData={treeData}
                    onSelect={onSelect}
                    defaultExpandAll
                    defaultSelectedKeys={[selectedFolderId]}
                />
            </Modal>
            <PreviewContainer
                file={previewFile}
                visible={isPreviewVisible}
                onClose={handleClosePreview}
                onDownload={handleDownload}
                onGetLink={handleGetLink}
            />
        </div>
    );
}