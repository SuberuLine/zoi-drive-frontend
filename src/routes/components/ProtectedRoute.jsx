import { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { checkLogin } from "@/api";
import Loading from '@/components/status/Loading'; // 假设您有一个Loading组件

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const result = await checkLogin();
                setIsAuthenticated(result);
            } catch (error) {
                console.error("验证登录状态时出错:", error);
                setIsAuthenticated(false);
            }
        };

        verifyAuth();
    }, []);

    if (isAuthenticated === null) {
        return <Loading />; // 显示加载中的状态
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;