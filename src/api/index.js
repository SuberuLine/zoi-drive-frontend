import axios from "axios";

const instance = axios.create({
    baseURL: "/api",
    timeout: 10000,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Token = token;
    }
    return config;
});

// 检查2FA令牌是否有效（5分钟内）
export function is2FATokenValid() {
    try {
        const tokenDataStr = localStorage.getItem('2fa_temp_token');
        if (!tokenDataStr) return false;
        
        const tokenData = JSON.parse(tokenDataStr);
        const tokenTimestamp = tokenData.timestamp;
        const currentTime = Date.now();
        
        // 检查是否在5分钟内（5分钟 = 300000毫秒）
        const isValid = currentTime - tokenTimestamp < 300000;

        console.log("is2FATokenValid:", isValid);
        
        return isValid;
    } catch (error) {
        console.error('检查2FA令牌时出错:', error);
        return false;
    }
}

// 获取有效的2FA令牌
export function getValid2FAToken() {
    if (!is2FATokenValid()) return null;
    
    try {
        const tokenDataStr = localStorage.getItem('2fa_temp_token');
        const tokenData = JSON.parse(tokenDataStr);
        return tokenData.token;
    } catch (error) {
        return null;
    }
}

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
        const response = await instance.get('/file/offline-download?url=' + encodeLink);
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

// 获取保险箱文件列表
export const getSafesList = () => {
    return instance.get('/safes/list?token=' + getValid2FAToken());
};

// 删除保险箱文件
export const deleteSafeFile = (fileId) => {
    return instance.delete(`/safes/${fileId}`);
};

// 获取保险箱文件下载链接
export const getSafeDownloadLink = (fileId) => {
    return instance.get(`/safes/${fileId}/download?token=` + getValid2FAToken());
};

// 移动文件到保险箱（从普通文件区加密到保险箱）
export const moveToSafe = (fileIds) => {
    return instance.post('/safes/encrypt', {
        fileIds: Array.isArray(fileIds) ? fileIds : [fileIds]
    });
};

// 从保险箱移出（解密）
export const moveFromSafe = (fileIds) => {
    return instance.get('/safes/decrypt?fileId=' + fileIds + '&token=' + getValid2FAToken());
};

// 获取下载任务列表
export const getDownloadTasks = async () => {
    try {
        const response = await instance.get('/downloadTask/progress');
        return response.data;
    } catch (error) {
        console.error('获取下载任务列表失败:', error);
        throw error;
    }
};

// 清空下载任务记录
export const clearDownloadTasks = async () => {
    try {
        const response = await instance.delete('/downloadTask/clear');
        return response.data;
    } catch (error) {
        console.error('清空下载任务记录失败:', error);
        throw error;
    }
};

// 获取文件统计信息
export const getFileStats = async () => {
    try {
        const response = await instance.get('/statistical/file_stats');
        return response.data;
    } catch (error) {
        console.error('获取文件统计信息失败:', error);
        throw error;
    }
};

// 获取最近查看的文件
export const getRecentViews = async () => {
    try {
        const response = await instance.get('/statistical/recent_view');
        return response.data;
    } catch (error) {
        console.error('获取最近查看文件失败:', error);
        throw error;
    }
};

// 获取最近保存的文件
export const getRecentSaved = async () => {
    try {
        const response = await instance.get('/statistical/recent_saved');
        return response.data;
    } catch (error) {
        console.error('获取最近保存文件失败:', error);
        throw error;
    }
};

// 创建文件分享
export const createShare = async (shareRequest) => {
    try {
        const response = await instance.post('/share/create', shareRequest);
        return response.data;
    } catch (error) {
        console.error('创建分享失败:', error);
        throw error;
    }
};

// 验证分享密码
export const verifySharePassword = async (verifyRequest) => {
    try {
        const response = await instance.post('/share/verify', verifyRequest);
        return response.data;
    } catch (error) {
        console.error('验证分享密码失败:', error);
        throw error;
    }
};

// 获取分享信息
export const getShareInfo = async (shareCode) => {
    try {
        const response = await instance.get(`/share/info/${shareCode}`);
        return response.data;
    } catch (error) {
        console.error('获取分享信息失败:', error);
        throw error;
    }
};

// 获取分享内容
export const getShareContent = async (shareCode, password) => {
    try {
        const url = `/share/content/${shareCode}${password ? `?password=${encodeURIComponent(password)}` : ''}`;
        const response = await instance.get(url);
        return response.data;
    } catch (error) {
        console.error('获取分享内容失败:', error);
        throw error;
    }
};

// 保存分享文件到个人网盘
export const saveShareFiles = async (saveRequest) => {
    try {
        const response = await instance.post('/share/save', saveRequest);
        return response.data;
    } catch (error) {
        console.error('保存分享文件失败:', error);
        throw error;
    }
};

// 获取用户创建的分享列表
export const getUserShares = async (pageNum = 1, pageSize = 10) => {
    try {
        const response = await instance.get(`/share/my/created?pageNum=${pageNum}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('获取用户分享列表失败:', error);
        throw error;
    }
};

// 获取用户保存的分享列表
export const getUserSavedShares = async (pageNum = 1, pageSize = 10) => {
    try {
        const response = await instance.get(`/share/my/saved?pageNum=${pageNum}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('获取用户保存的分享列表失败:', error);
        throw error;
    }
};

// 取消分享
export const cancelShare = async (shareId) => {
    try {
        const response = await instance.post(`/share/cancel/${shareId}`);
        return response.data;
    } catch (error) {
        console.error('取消分享失败:', error);
        throw error;
    }
};

// 延长分享有效期
export const extendShareExpiration = async (shareId, days) => {
    try {
        const response = await instance.post(`/share/extend/${shareId}?days=${days}`);
        return response.data;
    } catch (error) {
        console.error('延长分享有效期失败:', error);
        throw error;
    }
};

export const downloadShareFile = (shareCode, fileId, password) => {
    return `/api/share/download/${shareCode}/${fileId}${password ? `?password=${encodeURIComponent(password)}` : ''}`;
};

export default instance;