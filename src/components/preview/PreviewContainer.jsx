import { useState } from "react";
import { Modal, Button, Space, Typography } from "antd";
import {
    DownloadOutlined,
    LinkOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    CloseOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const PreviewContainer = ({
    file,
    visible,
    onClose,
    onDownload,
    onGetLink,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(true);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

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
                <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
            </Space>
        </div>
    );

    return (
        <Modal
            title={titleBar}
            open={visible}
            onCancel={onClose}
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
                <div>预览内容占位符</div>
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
