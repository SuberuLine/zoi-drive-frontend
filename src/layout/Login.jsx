import { useState, useEffect } from "react";
import { message } from "antd";
import { login } from "@/api";

const Login = () => {

    const [messageApi, contextHolder] = message.useMessage();

    const [view, setView] = useState("login");
    const [cooldown, setCooldown] = useState(0);
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await login(account, password, remember);
            console.log(res);
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

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const toggleView = (newView) => {
        setView(newView);
    };

    const sendVerificationCode = () => {
        // 这里添加发送验证码的逻辑
        setCooldown(60);
    };

    const LoginView = (
        <>
            {contextHolder}
            <h1 className="text-2xl font-semibold mb-4">登录</h1>
            <form onSubmit={handleLogin} action="#" method="POST">
                <div className="mb-4">
                    <label htmlFor="account" className="block text-gray-600">
                        用户名/邮箱
                    </label>
                    <input
                        type="text"
                        id="account"
                        name="account"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-600">
                        密码
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        className="text-blue-500"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
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
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
                >
                    登录
                </button>
            </form>
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

    const RegisterView = (
        <>
            <h1 className="text-2xl font-semibold mb-4">注册</h1>
            <form action="#" method="POST">
                <div className="mb-4">
                    <label htmlFor="username" className="block text-gray-600">
                        用户名
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-600">
                        电子邮箱
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-600">
                        密码
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="confirmPassword"
                        className="block text-gray-600"
                    >
                        确认密码
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
                >
                    注册
                </button>
            </form>
            <div className="mt-6 text-blue-500 text-center">
                <a
                    href="#"
                    onClick={() => toggleView("login")}
                    className="hover:underline"
                >
                    返回登录
                </a>
            </div>
        </>
    );

    const forgotPasswordView = (
        <>
            <h1 className="text-2xl font-semibold mb-4">忘记密码</h1>
            <form action="#" method="POST">
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-600">
                        电子邮箱
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="verificationCode"
                        className="block text-gray-600"
                    >
                        验证码
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            id="verificationCode"
                            name="verificationCode"
                            className="w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:border-blue-500"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={sendVerificationCode}
                            disabled={cooldown > 0}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-r-md px-4 flex items-center justify-center whitespace-nowrap min-w-[100px]"
                        >
                            {cooldown > 0 ? `${cooldown}s` : "发送验证码"}
                        </button>
                    </div>
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="newPassword"
                        className="block text-gray-600"
                    >
                        新密码
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="confirmNewPassword"
                        className="block text-gray-600"
                    >
                        确认新密码
                    </label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
                >
                    重置密码
                </button>
            </form>
            <div className="mt-6 text-blue-500 text-center">
                <a
                    href="#"
                    onClick={() => toggleView("login")}
                    className="hover:underline"
                >
                    返回登录
                </a>
            </div>
        </>
    );

    return (
        <div className="bg-gray-100 flex justify-center items-center h-screen">
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
                {view === "login" &&
                    // 登录视图
                    LoginView}
                {view === "register" &&
                    // 注册视图
                    RegisterView}
                {view === "forgotPassword" && forgotPasswordView}
            </div>
        </div>
    );
};

export default Login;
