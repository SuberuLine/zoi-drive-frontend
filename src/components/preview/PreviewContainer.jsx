import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Space, Typography, Spin } from "antd";
import {
    DownloadOutlined,
    LinkOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import mammoth from 'mammoth';
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [previewLink, setPreviewLink] = useState(null);
    const [loading, setLoading] = useState(false);
    const [textContent, setTextContent] = useState(null);
    const [wordContent, setWordContent] = useState(null);

    // 判断文件类型
    const isImage = file?.type?.startsWith('image/');
    const isMedia = file?.type?.startsWith('video/') || file?.type?.startsWith('audio/');
    const isPdf = file?.type === 'application/pdf';
    const isWord = file?.type === 'application/msword' || 
                  file?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isText = file?.type?.startsWith('text/') || file?.name?.endsWith('.txt') || 
                  file?.name?.endsWith('.md') || file?.name?.endsWith('.json') || 
                  file?.name?.endsWith('.csv');
    
    // 需要获取预览链接的文件类型
    const needsPreviewLink = isImage || isMedia || isPdf || isWord || isText;

    // 加载 Word 文档内容
    const loadWordContent = useCallback(async (url) => {
        try {
            setLoading(true);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误：${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            
            // 使用 mammoth 将 docx 转换为 HTML
            const result = await mammoth.convertToHtml(
                { arrayBuffer }, 
                {
                    // 可选的转换选项
                    styleMap: [
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                        "p[style-name='Heading 4'] => h4:fresh"
                    ]
                }
            );
            
            // 设置转换后的 HTML 内容
            setWordContent(result.value);
            
            // 记录转换过程中的警告信息（调试用）
            if (result.messages.length > 0) {
                console.log("Mammoth warnings:", result.messages);
            }
        } catch (error) {
            console.error('解析Word文档失败:', error);
            setWordContent('<div class="error">无法解析此Word文档</div>');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchPreviewLink = async () => {
            if (!visible || !file) return;
            
            if (needsPreviewLink) {
                setLoading(true);
                try {
                    const data = await getPreviewLink(file.key);
                    if (mounted) {
                        setPreviewLink(data);
                        
                        // 如果是Word文档，加载并解析内容
                        if (isWord && data) {
                            await loadWordContent(data);
                        }
                        
                        // 如果是文本文件，获取内容
                        else if (isText && data) {
                            try {
                                const response = await fetch(data);
                                const text = await response.text();
                                if (mounted) {
                                    setTextContent(text);
                                }
                            } catch (err) {
                                console.error('加载文本内容失败:', err);
                            } finally {
                                if (mounted) {
                                    setLoading(false);
                                }
                            }
                        } else {
                            if (mounted) {
                                setLoading(false);
                            }
                        }
                    }
                } catch (error) {
                    console.error('获取预览链接失败:', error);
                    if (mounted) {
                        setLoading(false);
                    }
                }
            }
        };

        fetchPreviewLink();

        return () => {
            mounted = false;
        };
    }, [file, visible, needsPreviewLink, isText, isWord, loadWordContent]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleClose = useCallback(() => {
        setPreviewLink(null);
        setTextContent(null);
        setWordContent(null);
        onClose();
    }, [onClose]);

    const modalStyle = isFullscreen
        ? { top: 0, margin: 0, padding: 0, maxWidth: "100%" }
        : { top: "20%", maxWidth: "85%" };

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
        
        if (loading) {
            return <Spin tip="加载预览中..." />;
        }

        // 处理图片预览
        if (isImage) {
            return previewLink ? (
                <div style={{ maxHeight: '100%', maxWidth: '100%', overflow: 'auto' }}>
                    <img 
                        src={previewLink} 
                        alt={file.name}
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '50vh',
                            objectFit: 'contain' 
                        }} 
                    />
                </div>
            ) : (
                <div>无法加载图片预览</div>
            );
        }

        // 处理视频和音频预览
        if (isMedia) {
            return previewLink ? (
                <MediaPlayer 
                    src={previewLink} 
                    type={file.type === 'video/quicktime' ? 'video/mp4' : file.type}
                    onClose={handleClose}
                />
            ) : (
                <div>无法加载媒体预览</div>
            );
        }

        // 处理PDF预览
        if (isPdf) {
            return previewLink ? (
                <div style={{ width: '100%', height: '100%' }}>
                    <iframe 
                        src={`${previewLink}#toolbar=0&navpanes=0`}
                        title={file.name}
                        width="100%" 
                        height="100%"
                        style={{ border: 'none' }}
                    />
                </div>
            ) : (
                <div>无法加载PDF预览</div>
            );
        }

        // 处理Word文档预览 - 使用mammoth.js
        if (isWord) {
            return wordContent ? (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        padding: '20px',
                        backgroundColor: 'white',
                        overflow: 'auto',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    <div 
                        className="word-document-preview"
                        dangerouslySetInnerHTML={{ __html: wordContent }}
                    />
                </div>
            ) : (
                <div>无法加载Word预览</div>
            );
        }

        // 处理文本文件预览
        if (isText) {
            return textContent !== null ? (
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    overflow: 'auto',
                    backgroundColor: '#f6f8fa',
                    borderRadius: '4px',
                    padding: '16px'
                }}>
                    <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        margin: 0,
                        fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                        fontSize: '14px',
                        lineHeight: 1.5
                    }}>
                        {textContent}
                    </pre>
                </div>
            ) : (
                <div>无法加载文本内容</div>
            );
        }

        // 其他类型文件
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>不支持预览此文件类型</p>
                <p>您可以下载文件后查看</p>
            </div>
        );
    };

    return (
        <Modal
            title={titleBar}
            open={visible}
            onCancel={handleClose}
            afterClose={handleClose}
            footer={null}
            width={isFullscreen ? "100%" : "80%"}
            style={modalStyle}
            styles={{
                body: {
                    height: isFullscreen ? "calc(100vh - 80px)" : "70vh",
                    display: "flex",
                    flexDirection: "column",
                    padding: 16,
                    overflow: "hidden",
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
                {renderPreviewContent()}
            </div>
            <div
                style={{
                    borderTop: "1px solid #f0f0f0",
                    padding: "10px 16px",
                    textAlign: "right",
                    marginTop: "auto",
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
