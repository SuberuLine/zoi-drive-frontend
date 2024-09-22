import { useState } from "react";
import {
    Input,
    Button,
    Upload,
    Card,
    List,
    Modal,
    message,
    Typography,
    Space,
    Row,
    Col,
    Divider,
    Tag,
    Avatar
} from "antd";
import {
    PlusOutlined,
    LockOutlined,
    MailOutlined,
    MobileOutlined,
    UserOutlined,
    SecurityScanOutlined,
    LaptopOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";
import ImgCrop from 'antd-img-crop';
import useUserStore from "@/store/UserStore";
import { updateProfile } from "@/api";
import TwoFactorBind from "@/components/two_factor/TwoFactorBind";
import TwoFactorVerify from "@/components/two_factor/TwoFactorVerify";
import TwoFactorUnBind from "@/components/two_factor/TwoFactorUnbind";
import { uploadAvatar } from "@/api";

const { Text } = Typography;

const UserSettings = () => {
    const { userInfo, setUserInfo } = useUserStore();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(userInfo.userSetting?.twoFactorStatus);
    const [imageUrl, setImageUrl] = useState(userInfo.avatar);
    const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
    const [isChangePasswordConfirmModalOpen, setIsChangePasswordConfirmModalOpen] = useState(false);
    const [is2FABindModalOpen, setIs2FABindModalOpen] = useState(false);
    const [is2FAVerifyModalOpen, setIs2FAVerifyModalOpen] = useState(false);
    const [is2FAUnbindModalOpen, setIs2FAUnbindModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const [devices, setDevices] = useState([
        { id: 1, name: "iPhone 12", lastLogin: "2023-05-20 14:30" },
        { id: 2, name: "MacBook Pro", lastLogin: "2023-05-19 09:15" },
        { id: 3, name: "iPad Air", lastLogin: "2023-05-18 18:45" },
    ]);

    const handleAvatarChange = async (info) => {
        const file = info.file;
        if (file.size > 1024 * 1024) {
            message.error('头像大小不能超过1MB');
            return;
        }
    
        const formData = new FormData();
        formData.append('avatar', file);
    
        try {
            const response = await uploadAvatar(formData);
            console.log(response);
            if (response.data.code === 200 && response.data.data) {
                setImageUrl(response.data.data);
                setUserInfo({ ...userInfo, avatar: response.data.data });
                message.success('头像上传成功');
            } else {
                message.error(response.data.msg || '头像上传失败');
            }
        } catch (error) {
            console.error('上传头像时发生错误:', error);
            message.error('头像上传失败，请稍后重试');
        }
    };

    const handleBlur = async (field, value) => {
        if (value !== userInfo[field]) {
            if (field === 'phone' && !value) return; // 如果phone为空且没有修改则不发起请求
            try {
                await updateProfile(field, value);
                //await axios.post(`/api/update-${field}`, { [field]: value });
                setUserInfo({ ...userInfo, [field]: value });
                message.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
            } catch (error) {
                message.error(`Failed to update ${field}`);
            }
        }
    };

    // 绑定2FA成功
    const bindSuccess = () => {
        setTimeout(() => {
            setTwoFactorEnabled(true);
            setIs2FABindModalOpen(false);
        }, 1000);
    }

    // 解绑2FA成功
    const unbindSuccess = (code) => {
        if (code == 123456) {
            setTimeout(() => {
                setTwoFactorEnabled(false);
                setIs2FAUnbindModalOpen(false);
            }, 1000);
        } else {
            message.error("验证码错误");
        }
    }

    const validateUsername = (value) => {
        const regex = /^[a-zA-Z0-9]{3,20}$/;
        return regex.test(value);
    };

    const validatePhone = (value) => {
        const regex = /^(\d{11})?$/;
        return regex.test(value);
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const handleChangePassword = () => {
        if (twoFactorEnabled) {
            setPendingAction('password');
            setIs2FAVerifyModalOpen(true);
        } else {
            setIsChangePasswordConfirmModalOpen(true);
        }
    };

    const handleChangeEmail = () => {
        if (twoFactorEnabled) {
            setPendingAction('email');
            setIs2FAVerifyModalOpen(true);
        } else {
            setIsEmailModalVisible(true);
        }
    };

    const handleTwoFactorVerify = (verificationCode) => {
        // todo: 这里应该调用API来验证两步验证码
        console.log(verificationCode);
        // 假设验证成功
        if (verificationCode == 123456) {
            setIs2FAVerifyModalOpen(false);
            if (pendingAction === 'email') {
                setIsEmailModalVisible(true);
            } else if (pendingAction === 'password') {
                message.success("已发送重置密码邮件，10分钟内有效")
            }
        } else {
            message.error("验证码错误");
        }
    };

    return (
        <div className="p-4">
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Edit Profile">
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <div style={{ marginBottom: 16 }}>
                                    <label>Avatar</label>
                                    <ImgCrop rotationSlider>
                                        <Upload
                                            name="avatar"
                                            listType="picture-circle"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            beforeUpload={(file) => {
                                                handleAvatarChange({file});
                                                return false;
                                            }} // 禁止组件上传操作
                                        >
                                            {imageUrl ? (
                                                <Avatar
                                                    src={`${import.meta.env.VITE_API_URL}${userInfo?.avatar}`}
                                                    alt="avatar"
                                                    size={100}
                                                />
                                            ) : (
                                                uploadButton
                                            )}
                                        </Upload>
                                    </ImgCrop>
                                </div>
                            </Col>
                            <Col span={1}>
                                <Divider type="vertical" style={{ height: '100%' }} />
                            </Col>
                            <Col span={15}>
                                <div style={{ marginBottom: 16 }}>
                                    <label>Username</label>
                                    <Input
                                        prefix={<UserOutlined />}
                                        defaultValue={userInfo.username}
                                        onBlur={(e) => {
                                            const value = e.target.value;
                                            if (validateUsername(value)) {
                                                handleBlur('username', value);
                                            } else {
                                                message.error("Username must be 3-20 characters long and contain only letters and numbers.");
                                            }
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <label>Phone Number</label>
                                    <Input
                                        prefix={<MobileOutlined />}
                                        defaultValue={userInfo.phone}
                                        onBlur={(e) => {
                                            const value = e.target.value;
                                            if (validatePhone(value)) {
                                                handleBlur('phone', value);
                                            } else {
                                                message.error("Phone number must be 11 digits or empty.");
                                            }
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Row gutter={[0, 16]}>
                        <Col xs={24}>
                            <Card title="Email and Password">
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                >
                                    <Space>
                                        <Text>Email: {userInfo.email}</Text>
                                        <Button 
                                            onClick={() => handleChangeEmail()}
                                            icon={<MailOutlined />}
                                        >
                                            Change Email
                                        </Button>
                                        <Button
                                            onClick={() => handleChangePassword()}
                                            icon={<LockOutlined />}
                                        >
                                            Reset Password
                                        </Button>
                                    </Space>
                                    
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24}>
                            <Card title="Two-Factor Authentication">
                                <Space>
                                    <Text>两步验证状态：</Text>
                                    {twoFactorEnabled ? <Tag color="success" icon={<CheckCircleOutlined />}>已开启</Tag> : 
                                    <Tag color="error" icon={<CloseCircleOutlined />}>未开启</Tag>}
                                    {twoFactorEnabled && (
                                        <Button
                                            onClick={() => setIs2FAUnbindModalOpen(true)}
                                            icon={<SecurityScanOutlined />}
                                            danger
                                        >
                                            解绑两步认证
                                        </Button>
                                    )}
                                </Space>
                                {!twoFactorEnabled && (
                                    <div style={{ marginTop: 16 }}>
                                        <Text type="secondary">
                                            Two-factor authentication adds an
                                            extra layer of security to your
                                            account.
                                        </Text>
                                        <br />
                                        <Button
                                            onClick={() => setIs2FABindModalOpen(true)}
                                            icon={<SecurityScanOutlined />}
                                            style={{ marginTop: 8 }}
                                        >
                                            Set Up Two-Factor Authentication
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Col>

                <Col xs={24}>
                    <Card title="Logged In Devices">
                        <List
                            itemLayout="horizontal"
                            dataSource={devices}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key={item.id}
                                            onClick={() => {
                                                setDevices(devices.filter((device) => device.id !== item.id));
                                                message.success("Device has been removed.");
                                            }}
                                            danger
                                        >
                                            Remove
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <LaptopOutlined
                                                style={{ fontSize: 24 }}
                                            />
                                        }
                                        title={item.name}
                                        description={`Last login: ${item.lastLogin}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* 进行两步验证Modal */}
                <Modal
                    title="两步验证"
                    open={is2FAVerifyModalOpen}
                    onCancel={() => {
                        setIs2FAVerifyModalOpen(false);
                        setPendingAction(null);
                    }}
                    footer={null}
                    destroyOnClose={true}
                >
                    <TwoFactorVerify onVerify={handleTwoFactorVerify} />
                </Modal>

                {/* 修改邮箱Modal */}
                <Modal
                    title="Change Email"
                    open={isEmailModalVisible}
                    onOk={() => {
                        setIsEmailModalVisible(false);
                        message.success("Email change request has been sent.");
                    }}
                    onCancel={() => setIsEmailModalVisible(false)}
                >
                    <div>
                        <label>New Email</label>
                        <Input prefix={<MailOutlined />} />
                    </div>
                </Modal>

                {/* 修改密码确认Modal */}
                <Modal
                    title="Confirm Password Change"
                    open={isChangePasswordConfirmModalOpen}
                    onOk={() => {
                        setIsChangePasswordConfirmModalOpen(false);
                        message.success("Password change request has been sent.");
                    }}
                    onCancel={() => setIsChangePasswordConfirmModalOpen(false)}
                >
                    <p>Are you sure you want to change your password?</p>
                </Modal>
                

                {/* 解绑两步验证Modal */}
                <Modal
                    title="解绑两步验证"
                    open={is2FAUnbindModalOpen}
                    onCancel={() => setIs2FAUnbindModalOpen(false)}
                    footer={null}
                >
                    <TwoFactorUnBind onUnbind={unbindSuccess} />
                </Modal>

                {/* 绑定两步验证Modal */}
                <Modal
                    open={is2FABindModalOpen}
                    onCancel={() => setIs2FABindModalOpen(false)}
                    footer={null}
                    width={600}
                >
                    <div className="mt-6" />
                    <TwoFactorBind onSuccess={bindSuccess}/>
                </Modal>
            </Row>
        </div>
    );
};

export default UserSettings;
