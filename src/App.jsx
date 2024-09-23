import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import router from "./routes/index";

function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#000000", // 主色调
                    colorBgContainer: "#ffffff", // 容器背景色
                    colorText: "#000000", // 主文本颜色
                    colorTextSecondary: "#666666", // 次要文本颜色
                    colorBorder: "#d9d9d9", // 边框颜色
                    colorBgLayout: "#f0f0f0", // 布局背景色
                    colorBorderSecondary: "#e8e8e8", // 次要边框颜色
                    colorPrimaryBorder: "#666666", // 主要边框颜色
                    controlOutlineWidth: 1, // 控件轮廓宽度
                    controlItemBgActive: "#f5f5f5", // 控件激活时的背景色
                    controlItemBgHover: "#fafafa", // 控件悬停时的背景色
                },
                components: {
                    Button: {
                        colorPrimary: "#000000", // 按钮主色
                        colorPrimaryHover: "#333333", // 按钮悬停色
                    },
                    Menu: {
                        itemBg: "#ffffff", // 菜单项背景色
                        itemColor: "#000000", // 菜单项文字颜色
                        itemSelectedColor: "#000000", // 菜单项选中时的文字颜色
                        itemSelectedBg: "#adadac", // 菜单项选中时的背景色
                        itemHoverBg: "#fafafa", // 菜单项悬停时的背景色
                        itemActiveBg: "#7a7a79", // 菜单项激活时的背景色
                    },
                    Input: {
                        activeBorderColor: "#666666", // 输入框激活时的边框颜色
                        hoverBorderColor: "#999999", // 输入框悬停时的边框颜色
                        activeShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)", // 输入框激活时的阴影
                    },
                    Select: {
                        optionSelectedBg: "#f5f5f5", // 选择框选项选中时的背景色
                        optionHoverBg: "#fafafa", // 选择框选项悬停时的背景色
                    },
                    Tree: {
                        nodeSelectedBg: "#f5f5f5", // 树节点选中时的背景色
                        nodeHoverBg: "#fafafa", // 树节点悬停时的背景色
                    },
                    Table: {
                        rowHoverBg: "#fafafa", // 表格行悬停时的背景色
                        rowSelectedBg: "#f5f5f5", // 表格行选中时的背景色
                        rowSelectedHoverBg: "#f0f0f0", // 表格行选中并悬停时的背景色
                    },
                },
            }}
        >
            <RouterProvider router={router} />
        </ConfigProvider>
    );
}

export default App;
