import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/icon/icon.png";
import {
    UserOutlined,
    FolderOutlined,
    BankOutlined,
    DeleteOutlined,
    LockOutlined,
    SettingOutlined,
    LogoutOutlined,
    CloudDownloadOutlined,
    CreditCardOutlined,
    PlusOutlined,
    ShareAltOutlined
} from "@ant-design/icons";
import {
    Layout,
    Menu,
    theme,
    Avatar,
    Dropdown,
    Space,
    message,
    Input,
    Popover,
    List,
    FloatButton,
} from "antd";
import StorageProgress from "@/components/progress/SpaceProgress";
import { getUserInfo, logout } from "@/api";
import Loading from "@/components/status/Loading";
import ClientErrorPage from "@/components/status/ClientErrorPage";
import UploadModal from "@/components/file/UploadModal";
import useUserStore from "@/store/UserStore";
import DownloadTaskModal from "@/components/file/DownloadTaskModal";

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;

// 头像下拉菜单
const avatarMenuItems = [
    {
        key: "1",
        label: "个人设置",
        icon: <SettingOutlined />,
    },
    {
        key: "2",
        label: "退出登录",
        icon: <LogoutOutlined />,
    },
];

const items = [
    { key: "1", icon: BankOutlined, label: "主页", path: "" },
    { key: "2", icon: FolderOutlined, label: "文件", path: "file" },
    { key: "3", icon: DeleteOutlined, label: "回收站", path: "recycle" },
    { key: "4", icon: LockOutlined, label: "保险箱", path: "safes" },
    { key: "5", icon: ShareAltOutlined, label: "分享", path: "share" },
    { key: "6", icon: CreditCardOutlined, label: "会员套餐", children: [
        { key: "6-1", label: "会员套餐", path: "plans" },
        { key: "6-2", label: "空间拓展", path: "extra" },
        { key: "6-3", label: "持有券码", path: "coupons" },
    ] },
    { key: "7", icon: UserOutlined, label: "个人", path: "user" },
].map((item) => ({
    key: item.key,
    icon: React.createElement(item.icon),
    label: item.label,
    path: item.path,
    children: item.children,
}));

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 用于获取当前路径，控制菜单选中

    // 组件样式管理
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [messageApi, contextHolder] = message.useMessage();

    const { userInfo, setUserInfo } = useUserStore();
    const [isDownloadTaskModalVisible, setIsDownloadTaskModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 进入主页时使用Token获取用户信息
    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            setLoading(true);
            const response = await getUserInfo();
            setUserInfo(response.data.data);
            console.log(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // 从Zustand store读取用户信息
    const storageUsed = userInfo?.userDetail.usedStorage;
    const storageTotal = userInfo?.userDetail.totalStorage;

    // 修改搜索框的状态和处理函数
    const [searchValue, setSearchValue] = useState("");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        setIsPopoverOpen(value.trim() !== "");
    };

    const searchResults = [
        "Racing car sprays burning fuel into crowd.",
        "Japanese princess to wed commoner.",
        "Australian walks 100km after outback crash.",
        "Man charged over missing wedding girl.",
        "Los Angeles battles huge wildfires.",
    ];

    const searchContent = (
        <List
            header={<div>搜索结果：{searchValue}</div>}
            dataSource={searchResults}
            renderItem={(item) => <List.Item>{item}</List.Item>}
        />
    );

    // 处理菜单项点击事件
    const handleMenuClick = ({ key }) => {
        const [parentKey, childKey] = key.split('-');
        
        if (childKey) {
            // 处理子菜单点击
            const parentItem = items.find(item => item.key === parentKey);
            const childItem = parentItem.children.find(child => child.key === key);
            if (childItem) {
                navigate(`/home/${childItem.path}`);
            }
        } else {
            // 处理主菜单点击
            const selectedItem = items.find(item => item.key === key);
            if (selectedItem && !selectedItem.children) {
                navigate(`/home/${selectedItem.path}`);
            }
        }
    };

    // 头像下拉菜单点击事件
    const handleAvatarMenuClick = ({ key }) => {
        if (key === "1") {
            navigate("/home/usersettings");
        } else if (key === "2") {
            console.log("执行退出登录操作");
            logout();
            messageApi.open({
                type: "success",
                content: "退出登录成功",
            });
            setTimeout(() => {
                window.location.href = "/";
            }, 3000);
        }
    };

    // 上传文件弹窗
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

    const showUploadModal = () => {
        setIsUploadModalVisible(true);
    };

    const handleUploadModalCancel = () => {
        setIsUploadModalVisible(false);
    };

    const handleUploadComplete = () => {
        setIsUploadModalVisible(false);
    };

    // 根据当前路径获取默认选中的菜单项和展开的子菜单
    const getDefaultKeys = () => {
        const path = location.pathname.split('/').pop();
        
        // 检查是否是子菜单项
        const parentItem = items.find(item => 
            item.children?.some(child => child.path === path)
        );

        if (parentItem) {
            // 如果是子菜单项，返回父菜单key和子菜单key
            const childItem = parentItem.children.find(child => child.path === path);
            return {
                selectedKey: childItem.key,
                openKey: parentItem.key
            };
        }

        // 如果是主菜单项，查找对应的菜单项
        const mainItem = items.find(item => item.path === path);
        return {
            selectedKey: mainItem ? mainItem.key : "1",
            openKey: null
        };
    };

    // 获取默认值
    const { selectedKey, openKey } = getDefaultKeys();
    
    // 添加展开的子菜单状态
    const [openKeys, setOpenKeys] = useState(openKey ? [openKey] : []);

    // 下载任务弹窗
    const showDownloadTaskModal = () => {
        setIsDownloadTaskModalVisible(true);
    };

    const handleDownloadTaskModalCancel = () => {
        setIsDownloadTaskModalVisible(false);
    };

    return (
        <>
            {contextHolder}
            {loading ? (
                <Loading />
            ) : error ? (
                <ClientErrorPage message={error} />
            ) : (
                <Layout style={{ minHeight: "100vh" }}>
                    <FloatButton.Group
                        shape="circle"
                        style={{ insetInlineEnd: 40 }}
                    >
                        <FloatButton
                            tooltip={<div>下载任务</div>}
                            icon={<CloudDownloadOutlined />}
                            onClick={showDownloadTaskModal}
                            badge={{ count: 2, overflowCount: 99 }}
                        />
                        <FloatButton
                            tooltip={<div>上传文件</div>}
                            icon={<PlusOutlined />}
                            onClick={showUploadModal}
                        />
                    </FloatButton.Group>
                    <DownloadTaskModal
                        visible={isDownloadTaskModalVisible}
                        onCancel={handleDownloadTaskModalCancel}
                    />
                    <UploadModal
                        visible={isUploadModalVisible}
                        onCancel={handleUploadModalCancel}
                        onUploadComplete={handleUploadComplete}
                    />
                    <Sider theme="light" breakpoint="lg" collapsedWidth="0">
                        <div
                            className="demo-logo-vertical flex items-center p-4"
                            style={{
                                height: "64px",
                                background: "#ffffff",
                                color: "white",
                            }}
                        >
                            <img
                                src={logo}
                                alt="logo"
                                className="w-8 h-6 mr-2"
                            />
                            <span className="text-lg font-semibold text-black">
                                Zoi-Drive
                            </span>
                        </div>
                        <Menu
                            mode="inline"
                            theme="light"
                            defaultSelectedKeys={[selectedKey]}
                            defaultOpenKeys={openKeys}
                            openKeys={openKeys}
                            onOpenChange={setOpenKeys}
                            items={items}
                            onClick={handleMenuClick}
                        />
                    </Sider>
                    <Layout>
                        <Header
                            style={{
                                padding: "0 24px",
                                background: colorBgContainer,
                                display: "flex",
                                alignItems: "center",
                                height: "64px",
                                borderBottom: "1px solid #e8e8e8",
                            }}
                        >
                            <Space size={40} className="ml-6 mt-6">
                                <Popover
                                    content={searchContent}
                                    trigger="click"
                                    open={isPopoverOpen}
                                    onOpenChange={(open) =>
                                        setIsPopoverOpen(
                                            open && searchValue.trim() !== ""
                                        )
                                    }
                                >
                                    <Search
                                        placeholder="输入想要搜索的文件"
                                        size="large"
                                        onChange={handleSearchChange}
                                        onSearch={() =>
                                            setIsPopoverOpen(
                                                searchValue.trim() !== ""
                                            )
                                        }
                                        prefix={<FolderOutlined />}
                                        style={{ width: "450px" }}
                                    />
                                </Popover>
                            </Space>
                            <Space size={24} className="ml-auto">
                                <Space
                                    direction="vertical"
                                    size={0}
                                    style={{ minWidth: "200px" }}
                                >
                                    <StorageProgress
                                        used={storageUsed}
                                        total={storageTotal}
                                        position={{
                                            align: "center",
                                            type: "outer",
                                        }}
                                    />
                                </Space>
                                <Dropdown
                                    menu={{
                                        items: avatarMenuItems,
                                        onClick: handleAvatarMenuClick,
                                    }}
                                    placement="bottomRight"
                                >
                                    <Space>
                                        {userInfo.avatar ? <Avatar src={`${userInfo.avatar}`} /> : 
                                        <Avatar icon={<UserOutlined />} />}
                                        {userInfo.username
                                            ? userInfo?.username
                                            : "获取用户信息失败"}
                                    </Space>
                                </Dropdown>
                            </Space>
                        </Header>
                        <Content
                            style={{
                                margin: "24px 16px",
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Outlet />
                            </div>
                        </Content>
                        <Footer style={{ textAlign: "center" }}>
                            Ant Design ©{new Date().getFullYear()} Created by
                            Ant UED
                        </Footer>
                    </Layout>
                </Layout>
            )}
        </>
    );
};

export default Home;
