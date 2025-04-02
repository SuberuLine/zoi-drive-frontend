export const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

export const daysStats = () => {
    let date = new Date();
    if (date.getHours() >= 6 && date.getHours() < 12) {
        return "上午好"
    } else if (date.getHours() >= 12 && date.getHours() < 18) {
        return "下午好"
    } else {
        return "晚上好"
    }
}