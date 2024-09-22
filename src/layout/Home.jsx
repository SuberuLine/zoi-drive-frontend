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
    CreditCardOutlined,
    PlusOutlined,
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
    { key: "5", icon: CreditCardOutlined, label: "账单", path: "plans" },
    { key: "6", icon: UserOutlined, label: "个人", path: "user" },
].map((item) => ({
    key: item.key,
    icon: React.createElement(item.icon),
    label: item.label,
    path: item.path,
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 进入主页时使用Token获取用户信息
    useEffect(() => {
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

        fetchUserInfo();
    }, [setUserInfo]);

    // 修改这里以从Zustand store读取用户信息
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
    const handleMenuClick = (e) => {
        const selectedItem = items.find((item) => item.key === e.key);
        if (selectedItem) {
            navigate(`/home/${selectedItem.path}`);
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

    // 根据当前路径获取默认选中的菜单项
    const getDefaultSelectedKey = () => {
        const path = location.pathname.split('/').pop();
        const item = items.find(item => item.path === path);
        return item ? item.key : "1"; // 如果没有匹配项，默认选中主页
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
                            tooltip={<div>上传文件</div>}
                            icon={<PlusOutlined />}
                            onClick={showUploadModal}
                        />
                    </FloatButton.Group>
                    <UploadModal
                        visible={isUploadModalVisible}
                        onCancel={handleUploadModalCancel}
                        message={messageApi}
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
                            defaultSelectedKeys={[getDefaultSelectedKey()]} // 获取菜单选中
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
                                        <Avatar src={`${import.meta.env.VITE_API_URL}${userInfo?.avatar}`} />
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
