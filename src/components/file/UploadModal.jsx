import { useState, useEffect } from "react";
import { Modal, Upload, Progress, Button, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import instance from "@/api";
import computeFileMD5 from "@/utils/file";
const { Dragger } = Upload;

// 格式化文件大小
const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const UploadModal = ({ visible, onCancel }) => {
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
            if (file.status === "uploading" || file.status === "calculating") {
                const uploadedSize = file.size * (file.percent / 100);
                return (
                    <div>
                        <div>{file.name}</div>
                        <Progress percent={file.percent} size="small" />
                        <div style={{ fontSize: "12px", color: "#888" }}>
                            {file.status === "calculating" ? "准备文件中..." : "上传中..."}
                            {formatFileSize(uploadedSize)} / {formatFileSize(file.size)}
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

            try {
                // 计算文件的 MD5，并显示进度
                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === file.uid ? { ...f, status: "calculating", percent: 0 } : f
                    )
                );
                const md5 = await computeFileMD5(file.originFileObj, (progress) => {
                    setFileList((prev) =>
                        prev.map((f) =>
                            f.uid === file.uid ? { ...f, percent: progress } : f
                        )
                    );
                });

                // 检查文件是否已存在
                const checkResponse = await instance.get(`/file/check?hash=${md5}`);
                
                if (checkResponse.data.data !== null) {
                    // 文件已存在，直接标记为上传成功
                    setFileList((prev) =>
                        prev.map((f) =>
                            f.uid === file.uid ? { ...f, status: "done", percent: 100 } : f
                        )
                    );
                    message.success(`文件 ${file.name} 已存在，无需重复上传`);
                    return file.uid;
                }

                // 文件不存在，需要上传
                const formData = new FormData();
                formData.append("file", file.originFileObj);
                formData.append("md5", md5);

                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === file.uid ? { ...f, status: "uploading", percent: 0 } : f
                    )
                );

                const response = await instance.post(
                    "/file/upload",
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: (progressEvent) => {
                            const percent = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setFileList((prev) =>
                                prev.map((f) =>
                                    f.uid === file.uid ? { ...f, percent } : f
                                )
                            );
                        },
                        timeout: 0
                    }
                );

                console.log(response);

                if (response.status === 200) {
                    message.success(`文件 ${file.name} 上传成功`);
                    setFileList((prev) =>
                        prev.map((f) =>
                            f.uid === file.uid ? { ...f, status: "done" } : f
                        )
                    );
                    return file.uid;
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === file.uid ? { ...f, status: "error" } : f
                    )
                );
                message.error(`${file.name} 上传失败: ${error.message}`);
            }
        });

        await Promise.all(uploadPromises);
        setUploading(false);

        // 在所有文件上传完成后，设置一个定时器来清除文件列���
        setTimeout(() => {
            setFileList([]);
        }, 3000); // 3秒后清除列表
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