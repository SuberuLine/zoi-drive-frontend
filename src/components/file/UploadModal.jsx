import { useState, useEffect } from "react";
import { Modal, Upload, Progress, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import instance from "@/api";

const { Dragger } = Upload;

// 格式化文件大小
const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const UploadModal = ({ visible, onCancel, message }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!visible) {
            setFileList([]);
        }
    }, [visible]);

    const props = {
        name: "file",
        multiple: true,
        fileList,
        beforeUpload: (file) => {
            setFileList((prev) => [
                ...prev,
                {
                    uid: file.uid,
                    name: file.name,
                    status: "ready",
                    percent: 0,
                    size: file.size,
                    originFileObj: file,
                },
            ]);
            return false;
        },
        onRemove: (file) => {
            // 关闭窗口时移除列表
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
        },
        itemRender: (originNode, file) => {
            if (file.status === "uploading") {
                const uploadedSize = file.size * (file.percent / 100);
                return (
                    <div>
                        <div>{file.name}</div>
                        <Progress percent={file.percent} size="small" />
                        <div style={{ fontSize: "12px", color: "#888" }}>
                            {formatFileSize(uploadedSize)} /{" "}
                            {formatFileSize(file.size)}
                        </div>
                    </div>
                );
            }
            return originNode;
        },
    };

    const handleOk = async () => {
        if (fileList.length === 0) {
            message.warning("请先选择要上传的文件");
            return;
        }

        setUploading(true);

        const uploadPromises = fileList.map(async (file) => {
            if (file.status === "done") return; // 跳过已上传的文件

            const formData = new FormData();
            formData.append("file", file.originFileObj);

            try {
                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === file.uid ? { ...f, status: "uploading" } : f
                    )
                );

                // 替换为您的实际上传 API
                const response = await instance.post(
                    "http://localhost:9088/api/user/upload",
                    formData,
                    {
                        onUploadProgress: (progressEvent) => {
                            const percent = Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total
                            );
                            setFileList((prev) =>
                                prev.map((f) =>
                                    f.uid === file.uid ? { ...f, percent } : f
                                )
                            );
                        },
                    }
                );

                if (response.status === 200) {
                    message.success(`文件 ${file.name} 上传成功`);
                    return file.uid;
                } else {
                    message.error(`${file.name} 上传失败: ${response.data.message}`);
                    return null;
                }

                // 设置为完成状态： 显示上传成功的文件
                // setFileList((prev) =>
                //     prev.map((f) =>
                //         f.uid === file.uid ? { ...f, status: "done"} : f
                //     )
                // );
            } catch (error) {
                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === file.uid ? { ...f, status: "error" } : f
                    )
                );
                message.error(`${file.name} 上传失败: ${error.message}`);
            }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(Boolean);

        // 将上传成功的文件从列表中删除
        setTimeout(() => {
            setFileList((prev) => prev.filter(file => !successfulUploads.includes(file.uid)));
        }, 5000);

        setUploading(false);

        if (successfulUploads.length === fileList.length) {
            message.success("所有文件上传完成");
        }
    };

    const handleCancel = () => {
        setFileList([]);
        onCancel();
    };

    return (
        <Modal
            title="上传文件"
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    取消
                </Button>,
                <Button
                    key="upload"
                    type="primary"
                    onClick={handleOk}
                    disabled={fileList.length === 0 || uploading}
                >
                    {uploading ? '上传中' : '开始上传'}
                </Button>
            ]}
        >
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                    支持单个或批量上传。严禁上传公司数据或其他敏感文件。
                </p>
            </Dragger>
        </Modal>
    );
};

export default UploadModal;
