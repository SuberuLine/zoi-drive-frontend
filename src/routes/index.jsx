import { createBrowserRouter } from "react-router-dom";
import Login from "../layout/Login";
import Index from "../layout/Index";
import Home from "../layout/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthedRoute from "./components/AuthedRoute";
import ClientErrorPage from "@/components/status/ClientErrorPage";
import ServerErrorPage from "@/components/status/ServerErrorPage";
import MaintenancePage from "@/components/status/MaintenancePage";
import Plans from "@/components/shop/Plans";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Index />,
    },
    {
        path: "/login",
        element: (
            <AuthedRoute>
                <Login />
            </AuthedRoute>
        ),
    },
    {
        path: "/home",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        ),
    },
    {
        path: "/plans",
        element: <Plans />,
    },
    {
        path: "/error",
        element: <ClientErrorPage />,
    },
    {
        path: "/500",
        element: <ServerErrorPage />,
    },
    {
        path: "/maintenance",
        element: <MaintenancePage />,
    },
    {
        path: "*",
        element: <ClientErrorPage message="页面不存在" />,
    },
]);

export default router;
