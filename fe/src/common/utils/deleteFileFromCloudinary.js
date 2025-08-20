const deleteFileFromCloudinary = async (imageUrl) => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_NESTJS_API_URL}/file/delete?url=${encodeURIComponent(imageUrl)}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Delete failed");
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
};

export default deleteFileFromCloudinary;
