import { useState, useEffect } from "react";
import { Table, Space, Button, message, Modal, Dropdown } from "antd";
import {
    FolderOutlined,
    EyeOutlined,
    DeleteOutlined,
    ReloadOutlined,
    UndoOutlined,
    MoreOutlined,
    FileOutlined,
} from "@ant-design/icons";
import { getRecycleList, restoreFile, deleteRecycleFile, deleteAllRecycleFiles } from "@/api";
import { formatDate } from "@/utils/formatter";
import styles from "@/styles/FileContent.module.css";
import PreviewContainer from '@/components/preview/PreviewContainer';

export default function RecycleBin() {
    const [currentFiles, setCurrentFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    // 初始化：获取回收站文件列表
    useEffect(() => {
        fetchRecycleList();
    }, []);

    // 获取回收站文件列表
    const fetchRecycleList = async () => {
        setLoading(true);
        try {
            const response = await getRecycleList();
            console.log(response.data.data);
            if (response.data.code === 200) {
                const files = response.data.data || [];
                // 使用新的数据结构
                const formattedFiles = files.map(file => ({
                    key: file.id,           // 使用 tid 作为唯一标识
                    name: file.name,         // 使用实际文件名
                    isFolder: file.type === 'folder',  // 根据 type 判断是否为文件夹
                    type: file.type,         // 保存文件类型
                    deleteTime: file.createAt,  // 删除时间
                    expireTime: file.expiredAt, // 使用后端提供的过期时间
                }));
                setCurrentFiles(formattedFiles);
            } else {
                message.error(response.data.message || '获取回收站列表失败');
                setCurrentFiles([]);
            }
        } catch (error) {
            console.error('获取回收站列表失败:', error);
            message.error('获取回收站列表失败');
            setCurrentFiles([]);
        } finally {
            setLoading(false);
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

    // 处理文件恢复
    const handleRestore = async (record) => {
        try {
            const response = await restoreFile(record.key);
            if (response.data.code === 200) {
                setCurrentFiles(prev => prev.filter(f => f.key !== record.key));
                message.success(response.data.data || '文件恢复成功');
            } else {
                message.error(response.data.message || '恢复失败');
            }
        } catch (error) {
            console.error('恢复文件失败:', error);
            message.error('恢复文件失败');
        }
    };

    // 处理彻底删除
    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要彻底删除${record.isFolder ? '文件夹' : '文件'} "${record.name}" 吗？此操作不可恢复！`,
            okText: '彻底删除',
            okType: 'danger',
            onOk: async () => {
                try {
                    const response = await deleteRecycleFile(record.key);
                    if (response.data.code === 200) {
                        setCurrentFiles(prev => prev.filter(f => f.key !== record.key));
                        message.success(response.data.data || '删除成功');
                    } else {
                        message.error(response.data.message || '删除失败');
                    }
                } catch (error) {
                    console.error('删除失败:', error);
                    message.error('删除失败');
                }
            },
        });
    };

    // 批量恢复
    const handleBatchRestore = async () => {
        try {
            let successCount = 0;
            let failCount = 0;

            for (const file of selectedRows) {
                try {
                    const response = await restoreFile(file.key);
                    if (response.data.code === 200) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    failCount++;
                }
            }

            if (successCount > 0) {
                setCurrentFiles(prev => 
                    prev.filter(f => !selectedRows.map(sf => sf.key).includes(f.key))
                );
                setSelectedRowKeys([]);
                setSelectedRows([]);
            }

            if (successCount === selectedRows.length) {
                message.success(`成功恢复 ${successCount} 个文件`);
            } else if (successCount > 0) {
                message.warning(`部分恢复成功：${successCount} 个成功，${failCount} 个失败`);
            } else {
                message.error('恢复失败');
            }
        } catch (error) {
            console.error('批量恢复失败:', error);
            message.error('批量恢复失败');
        }
    };

    // 批量彻底删除
    const handleBatchDelete = () => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要彻底删除选中的 ${selectedRows.length} 个文件吗？此操作不可恢复！`,
            okText: '彻底删除',
            okType: 'danger',
            onOk: async () => {
                try {
                    let successCount = 0;
                    let failCount = 0;

                    for (const file of selectedRows) {
                        try {
                            const response = await deleteRecycleFile(file.key);
                            if (response.data.code === 200) {
                                successCount++;
                            } else {
                                failCount++;
                            }
                        } catch (error) {
                            failCount++;
                        }
                    }

                    if (successCount > 0) {
                        setCurrentFiles(prev => 
                            prev.filter(f => !selectedRows.map(sf => sf.key).includes(f.key))
                        );
                        setSelectedRowKeys([]);
                        setSelectedRows([]);
                    }

                    if (successCount === selectedRows.length) {
                        message.success(`成功删除 ${successCount} 个文件`);
                    } else if (successCount > 0) {
                        message.warning(`部分删除成功：${successCount} 个成功，${failCount} 个失败`);
                    } else {
                        message.error('删除失败');
                    }
                } catch (error) {
                    console.error('批量删除失败:', error);
                    message.error('批量删除失败');
                }
            },
        });
    };

    // 添加清空所有的函数
    const handleClearAll = () => {
        Modal.confirm({
            title: '确认清空',
            content: '确定要清空回收站吗？此操作不可恢复！',
            okText: '清空',
            okType: 'danger',
            onOk: async () => {
                try {
                    const response = await deleteAllRecycleFiles();
                    if (response.data.code === 200) {
                        setCurrentFiles([]);
                        setSelectedRowKeys([]);
                        setSelectedRows([]);
                        message.success('回收站已清空');
                    } else {
                        message.error(response.data.message || '清空失败');
                    }
                } catch (error) {
                    console.error('清空回收站失败:', error);
                    message.error('清空回收站失败');
                }
            },
        });
    };

    // 获取文件图标
    const getIcon = (file) => {
        if (file.isFolder) return <FolderOutlined />;

        const mimeType = file.type.toLowerCase();
        // ... (与 FileContent 相同的图标逻辑)
    };

    // 添加一个计算剩余天数的函数
    const getRemainingDays = (expireTime) => {
        const now = new Date();
        const expireDate = new Date(expireTime);
        const diffTime = expireDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // 表格列定义
    const columns = [
        {
            title: "名称",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div className={styles.fileNameCell}>
                    <Space>
                        {record.isFolder ? <FolderOutlined /> : <FileOutlined />}
                        <span>{text}</span>
                    </Space>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'restore',
                                    icon: <UndoOutlined />,
                                    label: '恢复',
                                    onClick: (e) => {
                                        e.domEvent.stopPropagation();
                                        handleRestore(record);
                                    },
                                },
                                {
                                    key: 'delete',
                                    icon: <DeleteOutlined />,
                                    label: '彻底删除',
                                    danger: true,
                                    onClick: (e) => {
                                        e.domEvent.stopPropagation();
                                        handleDelete(record);
                                    },
                                },
                            ]
                        }}
                        trigger={['click']}
                    >
                        <Button
                            icon={<MoreOutlined />}
                            className={styles.actionButton}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>
                </div>
            ),
        },
        {
            title: "类型",
            dataIndex: "type",
            key: "type",
            render: (text) => text === 'folder' ? '文件夹' : '文件'
        },
        {
            title: "删除时间",
            dataIndex: "deleteTime",
            key: "deleteTime",
            render: (text) => formatDate(text),
        },
        {
            title: "过期时间",
            dataIndex: "expireTime",
            key: "expireTime",
            render: (text) => {
                const remainingDays = getRemainingDays(text);
                if (remainingDays < 0) {
                    return <span style={{ color: '#ff4d4f' }}>已过期</span>;
                } else if (remainingDays === 0) {
                    return <span style={{ color: '#faad14' }}>今天过期</span>;
                } else {
                    return <span>{remainingDays}天后过期</span>;
                }
            },
        },
    ];

    // 行选择配置
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys, selectedItems) => {
            setSelectedRowKeys(selectedKeys);
            setSelectedRows(selectedItems);
        }
    };

    return (
        <div style={{ padding: "24px", position: "relative", minHeight: "calc(100vh - 184px)" }}>
            {/* 操作按钮 */}
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchRecycleList}
                >
                    刷新
                </Button>

                <Space>
                    {selectedRowKeys.length > 0 && (
                        <>
                            <Button 
                                icon={<UndoOutlined />}
                                onClick={handleBatchRestore}
                            >
                                恢复选中文件
                            </Button>
                            <Button 
                                icon={<DeleteOutlined />}
                                danger
                                onClick={handleBatchDelete}
                            >
                                彻底删除
                            </Button>
                        </>
                    )}
                    <Button 
                        icon={<DeleteOutlined />}
                        danger
                        onClick={handleClearAll}
                    >
                        清空所有
                    </Button>
                </Space>
            </div>

            {/* 文件列表表格 */}
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={currentFiles}
                rowKey="key"
                loading={loading}
            />

            {/* 预览容器 */}
            <PreviewContainer
                file={previewFile}
                visible={isPreviewVisible}
                onClose={handleClosePreview}
            />
        </div>
    );
}