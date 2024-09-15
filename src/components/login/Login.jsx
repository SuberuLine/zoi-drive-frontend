import { useState } from "react";
import { QrcodeOutlined } from "@ant-design/icons";
import { login } from "@/api";

const LoginForm = ({ toggleView, showQRCodeModal, messageApi }) => {
    const [loginForm, setLoginForm] = useState({
        account: "",
        password: "",
        remember: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loginForm.account === "" || loginForm.password === "") {
            messageApi.open({
                type: 'error',
                content: '用户名和密码不能为空',
            });
            return;
        }
        try {
            const res = await login(loginForm.account, loginForm.password, loginForm.remember);
            if (res.data.code === 200) {
                localStorage.setItem("token", res.data.data.tokenValue);
                messageApi.open({
                    type: 'success',
                    content: '登录成功',
                });
                setTimeout(() => {
                    window.location.href = "/home";
                }, 1000);
            } else if (res.data.code >= 400) {
                messageApi.open({
                    type: 'error',
                    content: res.data.message,
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <h1 className="text-2xl font-semibold mb-4">登录</h1>
            <form onSubmit={handleLogin} action="#" method="POST">
                <div className="mb-4">
                    <label htmlFor="account" className="block text-gray-600">
                        用户名/邮箱
                    </label>
                    <input
                        minLength={3}
                        maxLength={20}
                        type="text"
                        id="account"
                        name="account"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                        value={loginForm.account}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-600">
                        密码
                    </label>
                    <input
                        minLength={6}
                        maxLength={20}
                        type="password"
                        id="password"
                        name="password"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                        value={loginForm.password}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        className="text-blue-500"
                        checked={loginForm.remember}
                        onChange={handleInputChange}
                    />
                    <label htmlFor="remember" className="text-gray-600 ml-2">
                        记住我
                    </label>
                </div>
                <div className="mb-6 text-blue-500">
                    <a
                        href="#"
                        onClick={() => toggleView("forgotPassword")}
                        className="hover:underline"
                    >
                        忘记密码?
                    </a>
                </div>
                <button
                    type="submit"
                    className="bg-gray-600 hover:bg-gray-800 text-white font-semibold rounded-md py-2 px-4 w-full"
                >
                    登录
                </button>
            </form>
            <div className="mt-4 flex justify-center items-center">
                <span className="text-gray-500">其他登录方式：</span>
                <QrcodeOutlined
                    className="text-2xl text-blue-500 ml-2 cursor-pointer"
                    onClick={showQRCodeModal}
                />
            </div>
            <div className="mt-6 text-blue-500 text-center">
                <a
                    href="#"
                    onClick={() => toggleView("register")}
                    className="hover:underline"
                >
                    还没有账号？点击注册
                </a>
            </div>
        </>
    );
};

export default LoginForm;