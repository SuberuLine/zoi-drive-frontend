import { useState } from "react";
import { resetPassword } from "@/api";
import { message } from "antd";
import ClientErrorPage from "../status/ClientErrorPage";

const ResetPassword = () => {
    const [submitted, setSubmitted] = useState({status: false, msg: ''});
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const token = params.get("token");

    const [messageApi, contextHolder] = message.useMessage();
    const [resetPasswordForm, setResetPasswordForm] = useState({
        email: email,
        password: "",
        confirmPassword: "",
    });

    const submitReset = async (e) => {
        e.preventDefault();
        if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
            messageApi.open({
                type: "error",
                content: "两次输入的密码不一致",
            });
            return;
        }
        await resetPassword(
            token,
            resetPasswordForm.password
        ).then((res) => {
            if (res.data.code === 200) {
                setSubmitted({status: true, msg: res.data.message});
            } else {
                setSubmitted({status: false, msg: res.data.message});
            }
        });
    };

    const submittedView = ({ msg }) => {
        return (
            <>
                <h1 className="text-2xl font-semibold mb-4">{msg}</h1>
                <button
                    className="bg-gray-600 hover:bg-gray-800 text-white font-semibold rounded-md py-2 px-4 w-full"
                    onClick={() => (window.location.href = "/login")}
                >
                    返回登录
                </button>
            </>
        );
    };

    if (!email || !token) {
        return <ClientErrorPage message="错误的参数" />;
    }

    return (
        <>
            {contextHolder}
            <div className="min-h-screen h-screen flex flex-col justify-center items-center w-full bg-slate-500">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    {submitted.status ? (
                        submittedView({ msg: "密码重置成功" })
                    ) : (
                        <>
                            <h1 className="text-2xl font-semibold mb-4">
                                忘记密码
                            </h1>
                            <form action="#" method="POST">
                                <div className="mb-4">
                                    <label
                                        htmlFor="email"
                                        className="block text-gray-600"
                                    >
                                        电子邮箱
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        disabled={true}
                                        value={resetPasswordForm.email}
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="password"
                                        className="block text-gray-600"
                                    >
                                        新密码
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={resetPasswordForm.password}
                                        onChange={(e) =>
                                            setResetPasswordForm({
                                                ...resetPasswordForm,
                                                password: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="password"
                                        className="block text-gray-600"
                                    >
                                        确认新密码
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={
                                            resetPasswordForm.confirmPassword
                                        }
                                        onChange={(e) =>
                                            setResetPasswordForm({
                                                ...resetPasswordForm,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    onClick={submitReset}
                                    className="bg-gray-600 hover:bg-gray-800 text-white font-semibold rounded-md py-2 px-4 w-full"
                                >
                                    {" "}
                                    重置密码{" "}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ResetPassword;
