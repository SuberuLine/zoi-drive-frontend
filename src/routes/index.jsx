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
import Extra from "@/components/shop/Extra";
import Coupons from "@/components/shop/Coupons";
import ResetPassword from "@/components/login/ResetPassword";
import HomeContent from "@/layout/content/HomeContent";
import FileContent from "@/layout/content/FileContent";
import RecycleContent from "@/layout/content/RecycleContent";
import SafesContent from "@/layout/content/SafesContent";
import UserContent from "@/layout/content/UserContent";
import UserSettings from "@/layout/content/UserSettings";
import ShareContent from "@/layout/content/ShareContent";
import SharePage from "@/components/share/SharePage";

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
        path: "/reset_password",
        element: <ResetPassword />,
    },
    {
        path: "/s/:shareCode",
        element: <SharePage />,
    },
    {
        path: "/home",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "",
                element: <HomeContent />,
            },
            {
                path: "home",
                element: <HomeContent />,
            },
            {
                path: "file",
                element: <FileContent />,
            },
            {
                path: "recycle",
                element: <RecycleContent />,
            },
            {
                path: "safes",
                element: <SafesContent />,
            },
            {
                path: "share",
                element: <ShareContent />,
            },
            {
                path: "plans",
                element: <Plans />,
            },
            {
                path: "extra",
                element: <Extra />,
            },
            {
                path: "coupons",
                element: <Coupons />,
            },
            {
                path: "user",
                element: <UserContent />,
            },
            {
                path: "usersettings",
                element: <UserSettings />,
            },
        ],
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
