import { useState, useEffect } from "react";

const ForgotPasswordForm = ({ toggleView, messageApi }) => {
    const [forgotPasswordForm, setForgotPasswordForm] = useState({
        email: "",
        verificationCode: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [cooldown, setCooldown] = useState(0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForgotPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const sendVerificationCode = () => {
        var reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
        if (reg.test(forgotPasswordForm.email)) {
            setCooldown(60);
            // 这里添加发送验证码的逻辑
        } else {
            messageApi.open({
                type: 'error',
                content: '邮箱格式不正确',
            });
        }
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
                        value={forgotPasswordForm.email}
                        onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })}
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
                            value={forgotPasswordForm.verificationCode}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:border-blue-500"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={sendVerificationCode}
                            disabled={cooldown > 0}
                            className="bg-gray-600 hover:bg-gray-800 text-white font-semibold rounded-r-md px-4 flex items-center justify-center whitespace-nowrap min-w-[100px]"
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
                    className="bg-gray-600 hover:bg-gray-800 text-white font-semibold rounded-md py-2 px-4 w-full"
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
};

export default ForgotPasswordForm;