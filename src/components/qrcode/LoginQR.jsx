import {
    CheckCircleFilled,
    CloseCircleFilled,
    ReloadOutlined,
} from "@ant-design/icons";
import { Button, QRCode, Space, Spin } from "antd";

const customStatusRender = (info) => {
    switch (info.status) {
        case "expired":
            return (
                <div>
                    <CloseCircleFilled
                        style={{
                            color: "red",
                        }}
                    />{" "}
                    {info.locale?.expired}
                    <p>
                        <Button type="link" onClick={info.onRefresh}>
                            <ReloadOutlined /> {info.locale?.refresh}
                        </Button>
                    </p>
                </div>
            );
        case "loading":
            return (
                <Space direction="vertical">
                    <Spin />
                    <p>Loading...</p>
                </Space>
            );
        case "scanned":
            return (
                <div>
                    <CheckCircleFilled
                        style={{
                            color: "green",
                        }}
                    />{" "}
                    {info.locale?.scanned}
                </div>
            );
        case "error":
            return (
                <div>
                    <CloseCircleFilled
                        style={{
                            color: "red",
                        }}
                    />{" "}
                    {info.errorMessage || "获取二维码失败"}
                    <p>
                        <Button type="link" onClick={info.onRefresh}>
                            <ReloadOutlined /> 重试
                        </Button>
                    </p>
                </div>
            );
        default:
            return null;
    }
};

const LoginQR = ({ value, status, size, onRefresh, errorMessage }) => (

    status !== null ? (
        <QRCode
            value={value}
            status={status}
            statusRender={(info) => customStatusRender({ ...info, onRefresh, errorMessage })}
            size={size}
        />
    ) : (
        <QRCode value={value} size={size} />
    )
);

export default LoginQR;
