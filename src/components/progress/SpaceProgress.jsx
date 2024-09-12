import { Space, Progress } from "antd";

const StorageProgress = ({ used, total, style }) => {

    const enoughtColors = {
        '0%': '#108ee9',
        '100%': '#87d068',
    };

    const alertColors = {
        '0%': '#ffe650',
        '100%': '#ffba50',
    };

    const notEnoughtColors = {
        '0%': '#FB6D6D',
        '100%': '#F51E1E',
    };

    const switchColors = (percentage) => {
        if (percentage > 80) {
            return notEnoughtColors;
        } else if (percentage > 50) {
            return alertColors;
        } else {
            return enoughtColors;
        }
    };


    const percentage = (used / total) * 100;

    return (
        <Space
            direction="vertical"
            size={0}
            style={{ minWidth: "200px", ...style }}
        >
            <Progress
                percent={percentage}
                status="active"
                size="small"
                strokeColor={switchColors(percentage)}
                percentPosition={{
                    align: 'center',
                    type: 'outer'
                }}
                format={() => `${used}GB / ${total}GB`}
            />
        </Space>
    );
};

export default StorageProgress;
