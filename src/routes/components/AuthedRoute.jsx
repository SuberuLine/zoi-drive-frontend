import { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { checkLogin } from "@/api";
import Loading from '@/components/status/Loading';

const PublicRoute = ({ children }) => {
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
        return <Loading />;
    }

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default PublicRoute;