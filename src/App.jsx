import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import router from "./routes/index";

function App() {
    return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#000000',
          colorBgContainer: '#ffffff',
          colorText: '#000000',
          colorTextSecondary: '#666666',
          colorBorder: '#d9d9d9',
          colorBgLayout: '#f0f0f0',
        },
        components: {
          Button: {
            colorPrimary: '#000000',
            colorPrimaryHover: '#333333',
          },
          Menu: {
            itemBg: '#ffffff',
            itemColor: '#000000',
            itemSelectedColor: '#000000',
            itemSelectedBg: '#dcdcdc',
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
    
  );
}

export default App;
