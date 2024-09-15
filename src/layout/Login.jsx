import { useState, useEffect } from "react";
import { message, Modal } from "antd";
import LoginForm from "@/components/login/Login";
import RegisterForm from "@/components/login/Register";
import ForgotPasswordForm from "@/components/login/Forgot";
import LoginQR from "@/components/qrcode/LoginQR";
import { getQRCode } from "@/api";

const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [view, setView] = useState("login");

    // 二维码相关状态
    const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
    const [qrCodeStatus, setQrCodeStatus] = useState("loading");
    const [qrCodeValue, setQrCodeValue] = useState("www.yuzoi.com");
    const [qrCodeTimer, setQrCodeTimer] = useState(null);
    const [qrCodeError, setQrCodeError] = useState(null);

    const toggleView = (newView) => {
        setView(newView);
    };

    // 显示二维码登录的Modal
    const showQRCodeModal = () => {
        setIsQRCodeModalOpen(true);
        renderQRCode();
        
        // 设置60秒后将二维码状态设置为过期
        const timer = setTimeout(() => {
            setQrCodeStatus("expired");
        }, 60000);
        setQrCodeTimer(timer);
    };

    // 关闭二维码登录的Modal
    const handleQRCodeModalClose = () => {
        setIsQRCodeModalOpen(false);
        clearQRCodeTimer();
        setQrCodeStatus("loading");
        setQrCodeError(null);
    };

    const renderQRCode = async () => {
        setQrCodeStatus("loading");
        setQrCodeError(null);
        try {
            const res = await getQRCode();
            if (res.data.code === 200) {
                setQrCodeValue(res.data.data);
                setQrCodeStatus(null);
                
                // 重新设置60秒过期定时器
                if (qrCodeTimer) {
                    clearTimeout(qrCodeTimer);
                }
                const newTimer = setTimeout(() => {
                    setQrCodeStatus("expired");
                }, 60000);
                setQrCodeTimer(newTimer);
            } else {
                setQrCodeStatus("error");
                setQrCodeError(res.data.message || "获取二维码失败");
                clearQRCodeTimer();
            }
        } catch (error) {
            console.error("获取二维码失败:", error);
            setQrCodeStatus("error");
            setQrCodeError(error.message || "网络错误，请稍后重试");
            clearQRCodeTimer();
        }
    };

    const clearQRCodeTimer = () => {
        if (qrCodeTimer) {
            clearTimeout(qrCodeTimer);
            setQrCodeTimer(null);
        }
    };

    const refreshQRCode = () => {
        renderQRCode();
    };

    useEffect(() => {
        return () => {
            clearQRCodeTimer();
        };
    }, []);

    return (
        <div className="bg-gray-100 flex justify-center items-center h-screen">
            {contextHolder}
            {/* Left: Image */}
            <div className="w-1/2 h-screen hidden lg:block">
                <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1352&q=80"
                    alt="Placeholder Image"
                    className="object-cover w-full h-full"
                />
            </div>
            {/* Right: Login/Register Form */}
            <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
                {view === "login" && (
                    <LoginForm
                        toggleView={toggleView}
                        showQRCodeModal={showQRCodeModal}
                        messageApi={messageApi}
                    />
                )}
                {view === "register" && (
                    <RegisterForm
                        toggleView={toggleView}
                        messageApi={messageApi}
                    />
                )}
                {view === "forgotPassword" && (
                    <ForgotPasswordForm
                        toggleView={toggleView}
                        messageApi={messageApi}
                    />
                )}
            </div>
            <Modal
                title="二维码登录"
                open={isQRCodeModalOpen}
                onCancel={handleQRCodeModalClose}
                footer={null}
            >
                <div className="flex justify-center">
                    <LoginQR
                        value={qrCodeValue}
                        status={qrCodeStatus}
                        size={200}
                        onRefresh={refreshQRCode}
                        errorMessage={qrCodeError}
                    />
                </div>
                <p className="text-center mt-4">请使用移动设备扫描二维码登录</p>
            </Modal>
        </div>
    );
};

export default Login;
