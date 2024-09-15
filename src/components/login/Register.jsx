import { useState, useEffect } from "react";
import { register } from "@/api";

const RegisterForm = ({ toggleView, messageApi }) => {
    const [registerForm, setRegisterForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [cooldown, setCooldown] = useState(0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const sendVerificationCode = () => {
        var reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
        if (reg.test(registerForm.email)) {
            setCooldown(60);
            // 这里添加发送验证码的逻辑
        } else {
            messageApi.open({
                type: 'error',
                content: '邮箱格式不正确',
            });
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (registerForm.username === "" || registerForm.email === "" || registerForm.password === "" || registerForm.confirmPassword === "") {
            messageApi.open({
                type: 'error',
                content: '用户名、邮箱、密码和确认密码不能为空',
            });
            return;
        }
        if (registerForm.password !== registerForm.confirmPassword) {
            messageApi.open({
                type: 'error',
                content: '密码和确认密码不匹配',
            });
            return;
        }
        register(registerForm.username, registerForm.email, registerForm.password).then((res) => {
            if (res.data.code === 200) {
                messageApi.open({
                    type: 'success',
                    content: '已发送验证邮件到' + registerForm.email + '，请前往邮箱验证',
                });
                setTimeout(() => {
                    toggleView("login");
                }, 3000);
            } else {
                messageApi.open({
                    type: 'error',
                    content: '注册失败:' + res.data.message,
                });
            }
        });
    };

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    return (
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
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value.replace(/[^a-zA-Z0-9]/g,'') })}
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
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
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
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
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
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <button
                    type="submit"
                    onClick={handleRegister}
                    className="bg-gray-600 hover:bg-gray-800 text-white font-semibold rounded-md py-2 px-4 w-full"
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
};

export default RegisterForm;