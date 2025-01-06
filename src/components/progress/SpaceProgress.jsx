import { Progress } from "antd";

const StorageProgress = ({ used, total, position, size="small", type="percentage", showInfo=true }) => {

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

    const formatStorage = (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)}${units[unitIndex]}`;
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
                showInfo={showInfo}
                format={() => `${formatStorage(used)} / ${formatStorage(total)}`}
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
            showInfo={showInfo}
        />
    );
};

export default StorageProgress;
