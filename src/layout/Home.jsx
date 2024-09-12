import React, { useState, useEffect } from 'react';
import { UserOutlined, FolderOutlined, BankOutlined, DeleteOutlined, LockOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { Layout, Menu, theme, Avatar, Dropdown, Space, message } from 'antd';
import HomeContent from './content/HomeContent';
import StorageProgress from '@/components/progress/SpaceProgress';
import { getUserInfo, logout } from '@/api';
import Loading from '@/components/status/Loading';
import ClientErrorPage from '@/components/status/ClientErrorPage';

const { Header, Content, Footer, Sider } = Layout;

// 定义对应的组件
const VideoComponent = () => <div>视频组件</div>;
const UploadComponent = () => <div>上传组件</div>;
const SettingsComponent = () => <div>设置组件</div>;
const SafesComponent = () => <div>保险箱组件</div>;

// 头像下拉菜单
const avatarMenuItems = [
  {
    key: '1',
    label: '个人设置',
    icon: <SettingOutlined />,
  },
  {
    key: '2',
    label: '退出登录',
    icon: <LogoutOutlined />,
  },
];

const items = [
  { icon: BankOutlined, label: '主页', component: HomeContent },
  { icon: FolderOutlined, label: '文件', component: VideoComponent },
  { icon: DeleteOutlined, label: '回收站', component: UploadComponent },
  { icon: LockOutlined, label: '保险箱', component: SafesComponent },
  { icon: UserOutlined, label: '设置', component: SettingsComponent },
].map((item, index) => ({
  key: String(index + 1),
  icon: React.createElement(item.icon),
  label: item.label,
  component: item.component,
}));

const Home = () => {

  const [messageApi, contextHolder] = message.useMessage();

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await getUserInfo();
        console.log(response);
        setUserInfo(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  


  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 添加状态来跟踪当前选中的菜单项
  const [selectedKey, setSelectedKey] = useState('1');

  // 处理菜单项点击事件
  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  // 获取当前选中菜单项对应的组件
  const CurrentComponent = items.find(item => item.key === selectedKey)?.component || (() => <div>默认内容</div>);

  // 头像下拉菜单点击事件
  const handleAvatarMenuClick = ({ key }) => {
    if (key === '1') {
      console.log('跳转到个人设置页面');
    } else if (key === '2') {
      console.log('执行退出登录操作');
      logout();
      messageApi.open({
        type: 'success',
        content: '退出登录成功',
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  };

  // 用户存储空间进度条
  const storageUsed = 175;
  const storageTotal = 200;

  return (
    <>
      {contextHolder}
      {loading ? (<Loading/>) : error ? (<ClientErrorPage message={error}/>) : (
        <Layout style={{ minHeight: '100vh' }}>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          // onBreakpoint={(broken) => {
          //   // 侧边栏断点事件
          // }}
          // onCollapse={(collapsed, type) => {
          //   // 侧边栏折叠事件
          // }}
        >
          <div className="demo-logo-vertical flex items-center justify-center p-4">
            <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="logo" className='w-6 h-6 mr-2' />
            <span className="text-white text-lg font-semibold">MyDrive</span>
          </div>
          <Menu 
            theme="dark" 
            mode="inline" 
            defaultSelectedKeys={['1']} 
            items={items} 
            onClick={handleMenuClick} // 添加点击事件处理
          />
        </Sider>
        <Layout>
          <Header style={{ 
            padding: '0 24px', 
            background: colorBgContainer, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            hover: 'cursor-pointer',
            borderBottom: '1px solid #e8e8e8'
          }}>
            <Space size={24}>
              <Space direction="vertical" size={0} style={{ minWidth: '200px' }}>
                <StorageProgress used={storageUsed} total={storageTotal} />
              </Space>
              <Dropdown menu={{ items: avatarMenuItems, onClick: handleAvatarMenuClick }} placement="bottomRight">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  {loading ? '加载中...' : error ? '加载失败' : userInfo?.username}
                </Space>
              </Dropdown>
            </Space>
          </Header>
          <Content style={{ margin: '24px 16px 0', display: 'flex', flexDirection: 'column' }}> {/* 修改这里 */}
            <div
              style={{
                padding: 24,
                flex: 1, // 添加这个
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <CurrentComponent /> {/* 渲染当前选中的组件 */}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
      )}
    </>
  );
};

export default Home;