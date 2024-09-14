import { Progress } from "antd";

const StorageProgress = ({ used, total, position, size="small", type="percentage" }) => {

    const enoughtColors = {
        '0%': '#108ee9',
        '100%': '#87d068',
    };

    const alertColors = {
        '0%': '#f5be9e',
        '100%': '#ffc',
    };

    const notEnoughtColors = {
        '0%': '#ffccf4',
        '100%': '#cccfff',
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

    const percentage = Math.round((used / total) * 100);

    if (type === 'percentage') {
        return (
            <Progress
                percent={percentage}
                status="active"
                size={size}
                strokeColor={switchColors(percentage)}
                percentPosition={position}
                format={() => `${used}MB / ${total}MB`}
            />
        );
    } 

    return (
        <Progress
            percent={used}
            status="active"
            size={size}
            strokeColor={switchColors(percentage)}
            percentPosition={position}
        />
    );
};

export default StorageProgress;
