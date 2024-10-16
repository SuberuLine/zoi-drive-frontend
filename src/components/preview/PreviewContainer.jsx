import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Space, Typography } from "antd";
import {
    DownloadOutlined,
    LinkOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import MediaPlayer from './MediaPlayer';
import { getPreviewLink } from "@/api";

const { Text } = Typography;

const PreviewContainer = ({
    file,
    visible,
    onClose,
    onDownload,
    onGetLink,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [previewLink, setPreviewLink] = useState(null);

    useEffect(() => {
        if (visible && file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
            getPreviewLink(file.key)
                .then(data => setPreviewLink(data))
                .catch(error => console.error('Error fetching preview link:', error));
        } else {
            setPreviewLink(null);
        }
    }, [file, visible]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleClose = useCallback(() => {
        setPreviewLink(null);
        onClose();
    }, [onClose]);

    const modalStyle = isFullscreen
        ? { top: 0, margin: 0, padding: 0, maxWidth: "100%" }
        : { top: "20%", maxWidth: "50%" };

    const titleBar = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text ellipsis style={{ maxWidth: 'calc(100% - 80px)' }}>{file?.name}</Text>
            <Space>
                <Button 
                    type="text" 
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                    onClick={toggleFullscreen}
                />
                <Button type="text" icon={<CloseOutlined />} onClick={handleClose} />
            </Space>
        </div>
    );

    const renderPreviewContent = () => {
        if (!file) return null;

        if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
            console.log(previewLink)
            return previewLink ? (
                <MediaPlayer src={previewLink} type={file.type} />
            ) : (
                <div>加载中...</div>
            );
        }

        // 处理其他文件类型的预览...
        return <div>不支持预览此文件类型</div>;
    };

    return (
        <Modal
            title={titleBar}
            open={visible}
            onCancel={handleClose}
            afterClose={handleClose}
            footer={null}
            width="100%"
            style={modalStyle}
            styles={{
                body: {
                    height: isFullscreen ? "calc(100vh - 80px)" : "50vh",
                    display: "flex",
                    flexDirection: "column",
                    padding: 0,
                },
            }}
            wrapClassName="file-preview-modal"
            closeIcon={null}
            destroyOnClose={true}
        >
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "auto",
                }}
            >
                {/* 预览内容将在这里渲染 */}
                {renderPreviewContent()}
            </div>
            <div
                style={{
                    borderTop: "1px solid #f0f0f0",
                    padding: "10px 16px",
                    textAlign: "right",
                }}
            >
                <Space>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => onDownload(file)}
                    >
                        下载
                    </Button>
                    <Button
                        icon={<LinkOutlined />}
                        onClick={() => onGetLink(file)}
                    >
                        获取直链
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

export default PreviewContainer;
