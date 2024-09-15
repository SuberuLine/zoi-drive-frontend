import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:9088/api",
    timeout: 10000,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Token = token;
    }
    return config;
});

// instance.interceptors.response.use((response) => {
//     return response;
// }, (error) => {
//     // 二进制数据错误不处理
//     if ((error && error.request.responseType === 'blob') || error.request.responseType === 'arraybuffer') {
//         return Promise.reject(error);
//     }
//     return Promise.reject(error);
// });

export const checkLogin = async () => {
    try {
        const result = await instance.get("/user/check");
        console.log("checkToken:", result.data.code);
        if (localStorage.getItem("token") && result.data.code === 200) {
            return true;
        } else {
            localStorage.removeItem("token");
            return false;
        }
    } catch (error) {
        console.error("检查登录状态时出错:", error);
        localStorage.removeItem("token");
        return false;
    }
};

export const login = (account, password, remember) => {
    return instance.post("/auth/login", {
        account,
        password,
        remember,
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const register = (username, email, password) => {
    return instance.post("/auth/register", {
        username,
        password,
        email,
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const logout = async () => {
    const result = await instance.post("/auth/logout");
    console.log("logout:", result.data.code);
    checkLogin();
};

export const getUserInfo = () => {
    return instance.get("/user/info");
};

export const getQRCode = () => {
    return instance.get("/auth/getLoginQrCodeUrl");
};

export const uploadFile = (file) => {
    return instance.post("/upload", file);
};

export const checkIn = () => {
    return instance.get("/user/checkin");
};

export const http = (method, url, data) => {
    return instance({
        method,
        url,
        [method.toUpperCase() === "GET" ? "params" : "data"]: data, // 根据请求方法选择使用 params 或 data
    });
};

export default instance;