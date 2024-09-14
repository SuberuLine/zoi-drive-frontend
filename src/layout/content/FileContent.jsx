import { useState } from "react";
import { Table, Space, Button, Breadcrumb, Upload, message } from "antd";
import {
    FileOutlined,
    FolderOutlined,
    EyeOutlined,
    DownloadOutlined,
    DeleteOutlined,
    UploadOutlined,
} from "@ant-design/icons";

export default function FileContent() {
    const [files, setFiles] = useState([
        {
            key: "1",
            name: "Documents",
            isFolder: true,
            size: "-",
            modifiedDate: "2023-05-15",
        },
        {
            key: "2",
            name: "Images",
            isFolder: true,
            size: "-",
            modifiedDate: "2023-05-14",
        },
        {
            key: "3",
            name: "report.pdf",
            isFolder: false,
            size: "2.5 MB",
            modifiedDate: "2023-05-13",
        },
        {
            key: "4",
            name: "presentation.pptx",
            isFolder: false,
            size: "5.7 MB",
            modifiedDate: "2023-05-12",
        },
    ]);

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space>
                    {record.isFolder ? <FolderOutlined /> : <FileOutlined />}
                    {text}
                </Space>
            ),
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
        },
        {
            title: "Modified Date",
            dataIndex: "modifiedDate",
            key: "modifiedDate",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(record)}
                    >
                        Preview
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(record)}
                    >
                        Download
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const handlePreview = (file) => {
        message.info(`Previewing ${file.name}`);
    };

    const handleDownload = (file) => {
        message.success(`Downloading ${file.name}`);
    };

    const handleDelete = (file) => {
        setFiles(files.filter((f) => f.key !== file.key));
        message.success(`Deleted ${file.name}`);
    };

    const handleUpload = (info) => {
        if (info.file.status === "done") {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === "error") {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    return (
        <div style={{ padding: "24px" }}>
            <Breadcrumb style={{ marginBottom: "16px" }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Files</Breadcrumb.Item>
            </Breadcrumb>

            <div style={{ marginBottom: "16px" }}>
                <Upload onChange={handleUpload}>
                    <Button icon={<UploadOutlined />}>Upload File</Button>
                </Upload>
            </div>

            <Table columns={columns} dataSource={files} />
        </div>
    );
}
