import { useState, useEffect } from "react";
import { Modal, Upload, Progress, Button, message } from "antd";
import { InboxOutlined, CloseCircleOutlined } from "@ant-design/icons";
import instance from "@/api";
import { computeFileMD5, uploadChunk } from "@/utils/file";
const { Dragger } = Upload;

const formatSpeed = (speedBps) => {
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let unitIndex = 0;
    let speed = speedBps;

    while (speed >= 1024 && unitIndex < units.length - 1) {
        speed /= 1024;
        unitIndex++;
    }

    return `${speed.toFixed(2)} ${units[unitIndex]}`;
};

const UploadModal = ({ visible, onCancel }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [cancelTokens, setCancelTokens] = useState({});
    const [uploadSpeeds, setUploadSpeeds] = useState({});

    useEffect(() => {
        if (!visible) {
            setFileList([]);
            setCancelTokens({});
        }
    }, [visible]);

    const handleOk = async () => {
        if (fileList.length === 0) {
            message.warning("请先选择要上传的文件");
            return;
        }

        setUploading(true);

        for (const fileItem of fileList) {
            if (fileItem.status === "done" || fileItem.status === "canceled") continue;

            const file = fileItem.originFileObj;
            const cancelToken = {};
            setCancelTokens(prev => ({ ...prev, [fileItem.uid]: cancelToken }));

            console.log('Processing file:', file.name, 'Size:', file.size);

            try {
                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === fileItem.uid ? { ...f, status: "calculating", percent: 0 } : f
                    )
                );
                const md5 = await computeFileMD5(file, (progress) => {
                    setFileList((prev) =>
                        prev.map((f) =>
                            f.uid === fileItem.uid ? { ...f, percent: progress } : f
                        )
                    );
                }, cancelToken);

                if (cancelToken.isCanceled) {
                    console.log(`MD5 calculation canceled for ${file.name}`);
                    continue;
                }

                console.log(`Computed MD5 for ${file.name}: ${md5}`);

                const checkResponse = await instance.get(`/file/check?hash=${md5}`);
                
                if (checkResponse.data.data !== null) {
                    console.log(`File ${file.name} already exists`);
                    setFileList((prev) =>
                        prev.map((f) =>
                            f.uid === fileItem.uid ? { ...f, status: "done", percent: 100 } : f
                        )
                    );
                    message.success(`文件 ${file.name} 已存在，秒传成功`);
                    continue;
                }

                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === fileItem.uid ? { ...f, status: "uploading", percent: 0 } : f
                    )
                );

                await uploadChunk(file, md5, (progress, speedBps) => {
                    setFileList((prev) =>
                        prev.map((f) =>
                            f.uid === fileItem.uid ? { ...f, percent: progress } : f
                        )
                    );
                    setUploadSpeeds((prev) => ({ ...prev, [fileItem.uid]: speedBps }));
                }, cancelToken);

                if (cancelToken.isCanceled) {
                    console.log(`Upload canceled for ${file.name}`);
                    continue;
                }

                console.log(`File upload completed for ${file.name}, MD5: ${md5}`);

                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === fileItem.uid ? { ...f, status: "done", percent: 100 } : f
                    )
                );
                message.success(`文件 ${file.name} 上传成功`);
            } catch (error) {
                if (error.message === "canceled") {
                    console.log(`Operation canceled for ${file.name}`);
                } else {
                    console.error(`Error processing file ${file.name}:`, error);
                    message.error(`${file.name} 上传失败: ${error.message}`);
                }
            }
        }

        setUploading(false);

        // 在所有文件上传完成后，设置一个定时器来清除文件列表
        setTimeout(() => {
            setFileList([]);
        }, 3000); // 3秒后清除列表
    };

    const handleCancel = (file) => {
        const cancelToken = cancelTokens[file.uid];
        if (cancelToken) {
            cancelToken.isCanceled = true;
        }
        setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        setCancelTokens((prev) => {
            const newTokens = { ...prev };
            delete newTokens[file.uid];
            return newTokens;
        });
    };

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
            handleCancel(file);
        },
        itemRender: (originNode, file) => {
            if (file.status === "uploading" || file.status === "calculating") {
                return (
                    <div>
                        <div>{file.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {file.status === "uploading" && (
                                <span style={{ marginRight: '8px', fontSize: '12px', color: '#888' }}>
                                    {/* 上传速度展示 */}
                                    {uploadSpeeds[file.uid] ? formatSpeed(uploadSpeeds[file.uid]) : ''}
                                </span>
                            )}
                            <Progress percent={file.percent} size="small" style={{ flex: 1 }} />
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                            {file.status === "calculating" ? "计算MD5中..." : "上传中..."}
                            <CloseCircleOutlined
                                onClick={() => handleCancel(file)}
                                style={{ marginLeft: 8, cursor: "pointer" }}
                            />
                        </div>
                    </div>
                );
            }
            return originNode;
        },
    };

    return (
        <Modal
            title="上传文件"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    取消
                </Button>,
                <Button
                    key="upload"
                    type="primary"
                    onClick={handleOk}
                    disabled={fileList.length === 0 || uploading}
                    loading={uploading}
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