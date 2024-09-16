import { useState } from "react";
import { sendResetEmail } from "@/api";

const ForgotPasswordForm = ({ toggleView, messageApi }) => {
    const [email, setEmail] = useState("");

    const resetPassword = async (e) => {
        e.preventDefault();
        var reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
        if (reg.test(email)) {
            // 这里添加发送验证码的逻辑
            await sendResetEmail(email).then((res) => {
                console.log(res);
                if (res.data.code === 200) {
                    messageApi.open({
                        type: 'success',
                        content: '重置邮件已发到您的邮箱,时效10分钟,请及时确认'
                    })
                } else {
                    messageApi.open({
                        type: 'error',
                        content: '重置邮件发送失败：' + res.data.message
                    })
                }
            });
        } else {
            messageApi.open({
                type: 'error',
                content: '邮箱格式不正确',
            });
        }
    };

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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                        autoComplete="off"
                    />
                </div>
                <button
                    type="submit"
                    onClick={resetPassword}
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