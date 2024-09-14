import React, { useState, useEffect } from 'react';
import { UserOutlined, FolderOutlined, BankOutlined, DeleteOutlined, LockOutlined, SettingOutlined, LogoutOutlined, CreditCardOutlined, PlusOutlined } from '@ant-design/icons';
import { Layout, Menu, theme, Avatar, Dropdown, Space, message, Input, Popover, List, FloatButton, Modal } from 'antd';
import HomeContent from './content/HomeContent';
import StorageProgress from '@/components/progress/SpaceProgress';
import { getUserInfo, logout } from '@/api';
import Loading from '@/components/status/Loading';
import ClientErrorPage from '@/components/status/ClientErrorPage';
import Plans from '@/components/shop/Plans';
import FileContent from './content/FileContent';
import SettingContent from './content/SettingContent';
import UploadModal from '@/components/file/UploadModal';
import UserContent from './content/UserContent';
import useUserStore from '@/store/UserStore';

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;

// 定义对应的组件
const UploadComponent = () => <div>上传组件</div>;
const SafesComponent = () => <div>保险箱组件</div>;

// 头像下拉菜单
const avatarMenuItems = [
  {
    key: '1',
    label: <SettingContent />,
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
  { icon: FolderOutlined, label: '文件', component: FileContent },
  { icon: DeleteOutlined, label: '回收站', component: UploadComponent },
  { icon: LockOutlined, label: '保险箱', component: SafesComponent },
  { icon: CreditCardOutlined, label: '账单', component: Plans },
  { icon: UserOutlined, label: '个人', component: UserContent },
].map((item, index) => ({
  key: String(index + 1),
  icon: React.createElement(item.icon),
  label: item.label,
  component: item.component,
}));

const Home = () => {

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
  const [searchValue, setSearchValue] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsPopoverOpen(value.trim() !== '');
  };

  const searchResults = [
    'Racing car sprays burning fuel into crowd.',
    'Japanese princess to wed commoner.',
    'Australian walks 100km after outback crash.',
    'Man charged over missing wedding girl.',
    'Los Angeles battles huge wildfires.',
  ];

  const searchContent = (
    <List
      header={<div>搜索结果：{searchValue}</div>}
      dataSource={searchResults}
      renderItem={(item) => (
        <List.Item>
          {item}
        </List.Item>
      )}
    />
  );

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

  // 上传文件弹窗
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  const showUploadModal = () => {
    setIsUploadModalVisible(true);
  };

  const handleUploadModalCancel = () => {
    setIsUploadModalVisible(false);
  };

  return (
    <>
      {contextHolder}
      {loading ? (<Loading/>) : error ? (<ClientErrorPage message={error}/>) : (
        <Layout style={{ minHeight: '100vh' }}>
          <FloatButton.Group shape='circle' style={{ insetInlineEnd: 40 }}>
          <FloatButton tooltip={<div>上传文件</div>} icon={<PlusOutlined />} onClick={showUploadModal}/>
          </FloatButton.Group>
          <UploadModal visible={isUploadModalVisible} onCancel={handleUploadModalCancel} message={messageApi}/>
          <Sider
            theme="light"
            breakpoint="lg"
            collapsedWidth="0"
          >
            <div className="demo-logo-vertical flex items-center p-4" style={{
              height: '64px',
              background: '#ffffff',
              color: 'white',
            }}>
              <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="logo" className='w-6 h-6 mr-2' />
              <span className="text-lg font-semibold text-black">Zoi-Drive</span>
            </div>
            <Menu 
              mode="inline"
              theme="light"
              defaultSelectedKeys={['1']} 
              items={items} 
              onClick={handleMenuClick}
            />
          </Sider>
          <Layout>
            <Header style={{ 
              padding: '0 24px', 
              background: colorBgContainer, 
              display: 'flex',
              alignItems: 'center',
              height: '64px', 
              borderBottom: '1px solid #e8e8e8'
            }}>
              <Space size={40} className='ml-6 mt-6'>
                <Popover 
                  content={searchContent} 
                  trigger="click"
                  open={isPopoverOpen}
                  onOpenChange={(open) => setIsPopoverOpen(open && searchValue.trim() !== '')}
                >
                  <Search 
                    placeholder="输入想要搜索的文件" 
                    size="large" 
                    onChange={handleSearchChange}
                    onSearch={() => setIsPopoverOpen(searchValue.trim() !== '')}
                    prefix={<FolderOutlined />} 
                    style={{width: '450px'}}
                  />
                </Popover>
              </Space>
              <Space size={24} className='ml-auto'>
                <Space direction="vertical" size={0} style={{ minWidth: '200px' }}>
                  <StorageProgress used={storageUsed} total={storageTotal} position={{
                    align: 'center',
                    type: 'outer'
                  }} />
                </Space>
                <Dropdown menu={{ items: avatarMenuItems, onClick: handleAvatarMenuClick }} placement="bottomRight">
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    {userInfo ? userInfo?.username : "获取用户信息失败"}
                  </Space>
                </Dropdown>
              </Space>
            </Header>
            <Content style={{ 
              margin: '24px 16px',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <CurrentComponent />
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