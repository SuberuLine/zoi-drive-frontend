import React from 'react';
import { Space, Button, Badge } from 'antd';
import {
    ShareAltOutlined,
    DragOutlined,
    DeleteOutlined,
    DownloadOutlined,
    CloseOutlined,
    LockOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { Divider } from 'antd';
const DockContainer = styled.div`
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;

    &:hover {
        background: rgba(255, 255, 255, 0.95);
    }
`;

const ActionButton = styled(Button)`
    border: none;
    background: transparent;
    padding: 8px;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    &:hover {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
    }

    .anticon {
        font-size: 20px;
    }

    .button-text {
        font-size: 12px;
        margin-top: 4px;
    }
`;

const FileActionDock = ({ 
    selectedCount, 
    onShare, 
    onMove, 
    onDelete, 
    onDownload, 
    onMoveToSafe,
    disableMoveToSafe,
    onCancel 
}) => {
    return (
        <DockContainer>
            <Badge count={selectedCount} offset={[-15, 0]}>
                <Space size={16}>
                    <ActionButton onClick={onShare}>
                        <ShareAltOutlined />
                        <span className="button-text">分享</span>
                    </ActionButton>
                    <Divider type="vertical" />
                    <ActionButton onClick={onMove}>
                        <DragOutlined />
                        <span className="button-text">移动</span>
                    </ActionButton>
                    <ActionButton onClick={onDownload}>
                        <DownloadOutlined />
                        <span className="button-text">下载</span>
                    </ActionButton>
                    <Divider type="vertical" />
                    <ActionButton 
                        onClick={onMoveToSafe}
                        disabled={disableMoveToSafe}
                        title={disableMoveToSafe ? "文件夹不能转入保险箱" : ""}
                    >
                        <LockOutlined />
                        <span className="button-text">转入保险箱</span>
                    </ActionButton>
                    <Divider type="vertical" />
                    <ActionButton onClick={onDelete} danger>
                        <DeleteOutlined />
                        <span className="button-text">删除</span>
                    </ActionButton>
                    <Divider type="vertical" />
                    <ActionButton onClick={onCancel}>
                        <CloseOutlined />
                        <span className="button-text">取消</span>
                    </ActionButton>
                </Space>
            </Badge>
        </DockContainer>
    );
};

export default FileActionDock; 