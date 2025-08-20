function formatDate(dateString) {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        date.setHours(date.getHours());
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
    }
}

export default formatDate;
