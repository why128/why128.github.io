

// 时间格式化
const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDate2 = (d = new Date()) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export function formatTime(time: string) {
    const date = new Date(time);
    return `${formatDate2(new Date(date.toLocaleDateString()))} ${date.toLocaleTimeString()}`;
};
