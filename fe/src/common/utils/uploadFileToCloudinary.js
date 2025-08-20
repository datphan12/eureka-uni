const uploadFileToCloudinary = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${import.meta.env.VITE_NESTJS_API_URL}/file/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Upload failed");
        }

        const data = await response.json();
        if (data.success && data.data.url) {
            return data.data.url;
        } else {
            throw new Error("Upload file thất bại");
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export default uploadFileToCloudinary;
