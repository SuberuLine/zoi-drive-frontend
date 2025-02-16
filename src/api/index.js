import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api",
    timeout: 10000,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Token = token;
    }
    return config;
});

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

export const sendResetEmail = (email) => {
    return instance.get("/auth/sendResetEmail?email=" + email);
};

export const resetPassword = (token, password) => {
    return instance.post("/auth/resetPassword", {
        token,
        password,
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

export const deleteUser = () => {
    return instance.delete("/auth/delete");
};

export const getUserInfo = () => {
    return instance.get("/user/info");
};

export const getQRCode = () => {
    return instance.get("/auth/getLoginQrCodeUrl");
};

export const uploadFile = (file) => {
    return instance.post("/file/upload", file);
};

export const checkIn = () => {
    return instance.get("/user/checkin");
};

export const updateProfile = (type, value) => {
    return instance.post("/user/update-profile?type=" + type + "&value=" + value);
};

export const uploadAvatar = (file) => {
    return instance.post("/user/upload-avatar", file, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const twoFactorGenerate = () => {
    return instance.post("/2fa/generate");
}

export const confirmGenerate = (code) => {
    return instance.post("/2fa/confirm-generate?code=" + code);
}

export const twoFactorValidate = (code) => {
    return instance.post("/2fa/validate?code=" + code);
}

export const twoFactorUnbind = (code) => {
    return instance.post("/2fa/remove?code=" + code);
}

export const getUserFileList = async () => {
    try {
        const response = await instance.get('/file/list');
        return response.data;
    } catch (error) {
        console.error('Error fetching file list:', error);
        throw error;
    }
}

export const moveFile = async (fileId, targetFolderId) => {
    try {
        const response = await instance.get('/file/move?fileId=' + fileId + 
            '&targetFolderId=' + (targetFolderId === 'root' ? 0 : targetFolderId));
        return response.data;
    } catch (error) {
        console.error('Error moving file:', error);
        throw error;
    }
};

export const renameFile = async (fileId, newName) => {
    try {
        const response = await instance.get('/file/rename?fileId=' + fileId + '&newName=' + newName);
        return response.data;
    } catch (error) {
        console.error('Error renaming file:', error);
        throw error;
    }
};

export const createNewFolder = async (parentFolderKey, folderName) => {
    try {
        const response = await instance.get('/file/create-folder?parentFolderId=' + parentFolderKey + 
            '&folderName=' + folderName);
        return response.data;
    } catch (error) {
        console.error('Error creating new folder:', error);
        throw error;
    }
};

export const getDownloadLink = async (fileId) => {
    try {
        const response = await instance.get(`/file/${fileId}/download`);
        if (response.data.code === 200) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '获取下载链接失败');
        }
    } catch (error) {
        console.error('获取下载链接时出错:', error);
        throw error;
    }
};

export const getPreviewLink = async (fileId) => {
    try {
        const response = await instance.get(`/file/${fileId}/preview`);
        if (response.data.code === 200) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '获取预览链接失败');
        }
    } catch (error) {
        console.error('获取预览链接时出错:', error);
        throw error;
    }
};

export const downloadFile = async (fileId, fileName) => {
    try {
        // 获取下载链接
        const downloadLink = await getDownloadLink(fileId);
        
        // 创建一个虚拟的 <a> 元素
        const link = document.createElement('a');
        link.href = downloadLink;
        link.setAttribute('download', fileName);
        link.style.display = 'none';
        
        // 将链接添加到文档中
        document.body.appendChild(link);
        
        // 模拟点击链接
        link.click();
        
        // 清理：从文档中移除链接
        document.body.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error('下载文件时出错:', error);
        throw error;
    }
};

export const downloadFileByPresignedUrl = async (fileId) => {
    try {
        const response = await instance.get(`/file/${fileId}/pre-signed-link`);
        if (response.data.code === 200) {
            return response.data.data;
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
};

export const magnetDownload = async (magnet) => {
    try {
        const response = await instance.get('/file/download-magnet?magnet=' + magnet);
        return response.data;
    } catch (error) {
        console.error('Error magnet downloading file:', error);
        throw error;
    }
};

export const offlineDownload = async (link) => {
    try {
        const encodeLink = encodeURIComponent(link);
        const response = await instance.get('/file/offline-download?link=' + encodeLink);
        return response.data;
    } catch (error) {
        console.error('Error offline downloading file:', error);
        throw error;
    }
};

export const deleteFile = async (fileId) => {
    try {
        const response = await instance.delete(`/file/${fileId}/delete`);
        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

export const http = (method, url, data) => {
    return instance({
        method,
        url,
        [method.toUpperCase() === "GET" ? "params" : "data"]: data, // 根据请求方法选择使用 params 或 data
    });
};

export const deleteFolder = (folderId) => {
    return instance.delete(`/file/folder/${folderId}/delete`);
};

export const getRecycleList = () => {
    return instance.get('/recycle/list');
};

export const restoreFile = (fileId) => {
    return instance.post(`/recycle/${fileId}/restore`);
};

export const deleteRecycleFile = (fileId) => {
    return instance.delete(`/recycle/${fileId}/delete`);
};

export const deleteAllRecycleFiles = () => {
    return instance.delete('/recycle/clear');
};

export default instance;