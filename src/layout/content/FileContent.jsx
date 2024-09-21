import React, { useState } from "react";
import {
    Table,
    Space,
    Button,
    Breadcrumb,
    Upload,
    message,
    Modal,
    Input,
} from "antd";
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
    RollbackOutlined,
} from "@ant-design/icons";

const initialFiles = [
    {
        key: "1",
        name: "Documents",
        isFolder: true,
        type: "folder",
        size: "-",
        modifiedDate: "2023-05-20",
        children: [
            {
                key: "1-1",
                name: "Work",
                isFolder: true,
                type: "folder",
                size: "-",
                modifiedDate: "2023-05-21",
                children: [
                    {
                        key: "1-1-1",
                        name: "Project A",
                        isFolder: false,
                        type: "pdf",
                        size: "5.2 MB",
                        modifiedDate: "2023-05-22",
                    },
                ],
            },
            {
                key: "1-2",
                name: "Personal",
                isFolder: true,
                type: "folder",
                size: "-",
                modifiedDate: "2023-05-21",
                children: [],
            },
        ],
    },
    {
        key: "2",
        name: "Images",
        isFolder: true,
        type: "folder",
        size: "-",
        modifiedDate: "2023-05-19",
        children: [
            {
                key: "2-1",
                name: "Vacation.jpg",
                isFolder: false,
                type: "image",
                size: "3.5 MB",
                modifiedDate: "2023-05-20",
            },
        ],
    },
    {
        key: "3",
        name: "report.pdf",
        isFolder: false,
        type: "pdf",
        size: "2.5 MB",
        modifiedDate: "2023-05-18",
    },
    {
        key: "4",
        name: "video.mp4",
        isFolder: false,
        type: "video",
        size: "100 MB",
        modifiedDate: "2023-05-17",
    },
    {
        key: "5",
        name: "audio.mp3",
        isFolder: false,
        type: "audio",
        size: "5 MB",
        modifiedDate: "2023-05-16",
    },
    {
        key: "6",
        name: "document.docx",
        isFolder: false,
        type: "word",
        size: "2 MB",
        modifiedDate: "2023-05-15",
    },
    
];

export default function FileManager() {
    const [currentPath, setCurrentPath] = useState(["Home"]);
    const [currentFiles, setCurrentFiles] = useState(initialFiles);
    const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isMagnetModalVisible, setIsMagnetModalVisible] = useState(false);
    const [magnetLink, setMagnetLink] = useState("");

    const handlePathClick = (index) => {
        setCurrentPath(currentPath.slice(0, index + 1));
        let files = initialFiles;
        for (let i = 1; i <= index; i++) {
            const folder = files.find(f => f.name === currentPath[i] && f.isFolder);
            if (folder) {
                files = folder.children;
            }
        }
        setCurrentFiles(addParentFolder(files, index > 0));
    };

    const handleFileClick = (file) => {
        if (file.isFolder) {
            if (file.isBack) {
                handlePathClick(currentPath.length - 2);
            } else {
                setCurrentPath([...currentPath, file.name]);
                setCurrentFiles(addParentFolder(file.children || [], true));
            }
        } else {
            handlePreview(file);
        }
    };

    // 非根目录添加置顶返回上一级文件夹
    const addParentFolder = (files, addParent) => {
        if (addParent) {
            return [{ key: 'parent', name: '...', isFolder: true, type: '', size: '', modifiedDate: '', isBack: true }, ...files];
        }
        return files;
    };

    const handlePreview = (file) => {
        message.info(`预览文件: ${file.name}`);
    };

    const handleDownload = (file) => {
        message.success(`下载文件: ${file.name}`);
    };

    const handleDelete = (file) => {
        Modal.confirm({
            title: '确认删除',
            content: `你确定要删除 ${file.name} 吗？`,
            onOk: () => {
                setCurrentFiles(currentFiles.filter((f) => f.key !== file.key));
                message.success(`删除文件: ${file.name}`);
            },
        });
    };

    const handleUpload = (info) => {
        if (info.file.status === "done") {
            message.success(`上传文件成功: ${info.file.name}`);
        } else if (info.file.status === "error") {
            message.error(`上传文件失败: ${info.file.name}`);
        }
    };

    const handleNewFolder = () => {
        setIsNewFolderModalVisible(true);
    };

    const handleNewFolderOk = () => {
        if (newFolderName) {
            const newFolder = {
                key: `folder-${Date.now()}`,
                name: newFolderName,
                isFolder: true,
                type: "folder",
                size: "-",
                modifiedDate: new Date().toISOString().split("T")[0],
                children: [],
            };
            setCurrentFiles([...currentFiles, newFolder]);
            setIsNewFolderModalVisible(false);
            setNewFolderName("");
            message.success(`创建新文件夹: ${newFolderName}`);
        }
    };

    const handleMagnetDownload = () => {
        setIsMagnetModalVisible(true);
    };

    const handleMagnetDownloadOk = () => {
        if (magnetLink) {
            message.success(`开始磁力下载: ${magnetLink}`);
            setIsMagnetModalVisible(false);
            setMagnetLink("");
        }
    };

    const getIcon = (file) => {
        if (file.isFolder && !file.isBack) return <FolderOutlined />;
        if (file.name === '...') return <RollbackOutlined />;
        switch (file.type) {
            case "back":
                return <RollbackOutlined />;
            case "pdf":
                return <FilePdfOutlined />;
            case "word":
                return <FileWordOutlined />;
            case "excel":
                return <FileExcelOutlined />;
            case "powerpoint":
                return <FilePptOutlined />;
            case "image":
                return <FileImageOutlined />;
            case "video":
                return <VideoCameraOutlined />;
            case "audio":
                return <SoundOutlined />;
            case "text":
                return <FileTextOutlined />;
            case "zip":
                return <FileZipOutlined />;
            case "markdown":
                return <FileMarkdownOutlined />;
            default:
                return <FileOutlined />;
        }
    };

    const columns = [
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space>
                    {getIcon(record)}
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
        },
        {
            title: "修改日期",
            dataIndex: "modifiedDate",
            key: "modifiedDate",
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

    const breadcrumbItems = currentPath.map((path, index) => ({
        title: <a onClick={() => handlePathClick(index)}>{path}</a>,
        key: index,
    }));

    return (
        <div style={{ padding: "24px" }}>
            <Breadcrumb items={breadcrumbItems} style={{ marginBottom: "16px" }} />

            <Space style={{ marginBottom: "16px" }}>
                <Upload onChange={handleUpload}>
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                </Upload>
                <Button icon={<FolderAddOutlined />} onClick={handleNewFolder}>
                    新建文件夹
                </Button>
                <Button
                    icon={<ThunderboltOutlined />}
                    onClick={handleMagnetDownload}
                >
                    磁力下载
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={currentFiles}
                rowKey="key"
                expandIcon={() => null}
                onRow={(record) => ({
                    onClick: () => handleFileClick(record),
                })}
            />

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
        </div>
    );
}
