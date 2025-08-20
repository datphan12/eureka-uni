function formatGiaBan(value) {
    const number = parseFloat(value);
    return number.toLocaleString("vi-VN");
}

export default formatGiaBan;
