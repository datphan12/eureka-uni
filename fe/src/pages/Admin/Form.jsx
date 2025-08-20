import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, Eye, EyeOff } from "lucide-react";
import { avatar } from "@assets";
import LectureManager from "./Course/components/LectureManager";
import MemberList from "./Group/components/MemberList";
import ChangePassword from "./User/components/ChangePassword";
import BlogPreview from "./Blog/components/BlogPreview";
import BlogEditor from "./Blog/components/BlogEditor";

const Form = ({
    title,
    fields = [],
    data = null,
    onSubmit,
    onCancel,
    mode = "view",
    loading = false,
    error = null,
    submitButtonText = "Lưu",
    cancelButtonText = "Hủy",
    disabled = false,
}) => {
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [imagePreview, setImagePreview] = useState({});
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRefs = useRef({});
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (data) {
            const initialValues = {};
            const initialPreviews = {};
            fields.forEach((field) => {
                if (field.name in data) {
                    initialValues[field.name] = data[field.name];
                    if (field.type === "image" && data[field.name]) {
                        initialPreviews[field.name] = data[field.name];
                    }
                } else if (field.name === "matKhau" && field.type === "password-button") {
                    return;
                } else if (field.type === "lectures") {
                    return;
                } else if (field.type === "member-list") {
                    return;
                } else {
                    initialValues[field.name] = field.defaultValue || "";
                }
            });

            setFormValues(initialValues);
            setImagePreview(initialPreviews);
        } else {
            const initialValues = {};
            fields.forEach((field) => {
                initialValues[field.name] = field.defaultValue || "";
            });
            setFormValues(initialValues);
        }
    }, [data, fields]);

    const getId = () => {
        if (data) {
            return data.id;
        } else {
            const params = new URLSearchParams(location.search);
            return params.get("id");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview((prev) => ({
                ...prev,
                [field.name]: e.target.result,
            }));
        };
        reader.readAsDataURL(file);

        try {
            setIsUploadingImage(true);
            const uploadedImageUrl = await field.uploadFunction(file);

            setFormValues((prev) => ({
                ...prev,
                [field.name]: uploadedImageUrl,
            }));

            if (formErrors[field.name]) {
                setFormErrors((prev) => ({
                    ...prev,
                    [field.name]: null,
                }));
            }
        } catch (error) {
            setFormErrors((prev) => ({
                ...prev,
                [field.name]: "Lỗi khi tải ảnh lên: " + error.message,
            }));
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSelectChange = (name, value) => {
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validate = () => {
        const errors = {};
        let isValid = true;

        fields.forEach((field) => {
            if (field.required && !formValues[field.name]) {
                errors[field.name] = `${field.label} không được để trống`;
                isValid = false;
            }

            if (field.validator && formValues[field.name]) {
                const validationError = field.validator(formValues[field.name]);
                if (validationError) {
                    errors[field.name] = validationError;
                    isValid = false;
                }
            }
        });

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "view") {
            onCancel();
            return;
        }

        if (validate()) {
            onSubmit(formValues);
        }
    };

    const triggerFileInput = (fieldName) => {
        if (fileInputRefs.current[fieldName]) {
            fileInputRefs.current[fieldName].click();
        }
    };

    const renderField = (field) => {
        const isViewMode = mode === "view";
        const isDisabled = isViewMode || disabled || field.disabled;

        switch (field.type) {
            case "text":
            case "email":
            case "number":
                return (
                    <input
                        type={field.type}
                        name={field.name}
                        id={field.name}
                        value={field.render ? field.render(formValues[field.name]) : formValues[field.name] || ""}
                        onChange={handleChange}
                        disabled={isDisabled}
                        className={`px-3 py-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm ${
                            isDisabled ? "bg-gray-200" : ""
                        } ${formErrors[field.name] ? "border-red-500" : "border-gray-300"}`}
                        placeholder={field.placeholder || ""}
                    />
                );
            case "password":
                return (
                    <div className="flex w-full rounded-md border border-gray-300 shadow-sm mt-1">
                        <input
                            type={isPasswordVisible ? "text" : field.type}
                            name={field.name}
                            id={field.name}
                            value={formValues[field.name] || ""}
                            onChange={handleChange}
                            disabled={mode === "view" || isDisabled}
                            className={`flex-1 px-3 py-2 outline-none sm:text-sm ${
                                mode === "view" || isDisabled ? "bg-gray-200" : ""
                            } ${formErrors[field.name] ? "border-red-500" : "border-gray-300"}`}
                            placeholder={field.placeholder || ""}
                        />
                        <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="px-3">
                            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                );
            case "textarea":
                return (
                    <textarea
                        name={field.name}
                        id={field.name}
                        rows={field.rows || 5}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        disabled={isDisabled}
                        className={`px-2 py-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm ${
                            isDisabled ? "bg-gray-200" : ""
                        } ${formErrors[field.name] ? "border-red-500" : "border-gray-300"}`}
                        placeholder={field.placeholder || ""}
                    />
                );
            case "password-button":
                return <ChangePassword labelButton={field.labelButton} userId={getId()} />;
            case "select":
                return (
                    <select
                        name={field.name}
                        id={field.name}
                        value={field.render ? field.render(formValues[field.name]) : formValues[field.name] || ""}
                        onChange={handleChange}
                        disabled={isDisabled}
                        className={`px-2 py-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm ${
                            isDisabled ? "bg-gray-200" : ""
                        } ${formErrors[field.name] ? "border-red-500" : "border-gray-300"}`}
                    >
                        <option value="">-- Chọn --</option>
                        {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case "checkbox":
                return (
                    <div className="mt-1 flex items-center">
                        <input
                            type="checkbox"
                            name={field.name}
                            id={field.name}
                            checked={formValues[field.name] || false}
                            onChange={handleChange}
                            disabled={isDisabled}
                            className={`h-4 w-4 rounded border-gray-300 text-blue-600  ${
                                isDisabled ? "bg-gray-100" : ""
                            }`}
                        />
                        <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900 cursor-pointer">
                            {field.checkboxLabel || field.label}
                        </label>
                    </div>
                );
            case "image":
                return (
                    <div className="mt-1">
                        {(imagePreview[field.name] || formValues[field.name]) && (
                            <div className="mb-3">
                                <img
                                    src={imagePreview[field.name] || formValues[field.name] || avatar}
                                    alt={field.label}
                                    className="h-32 w-auto object-cover rounded-md"
                                />
                            </div>
                        )}

                        {!isViewMode && (
                            <div className="mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={(el) => (fileInputRefs.current[field.name] = el)}
                                    onChange={(e) => handleImageUpload(e, field)}
                                    className="hidden"
                                    disabled={isDisabled || isUploadingImage}
                                />
                                <button
                                    type="button"
                                    onClick={() => triggerFileInput(field.name)}
                                    disabled={isDisabled || isUploadingImage}
                                    className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-200 ${
                                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    <Upload size={16} className="mr-2" />
                                    {isUploadingImage ? "Đang tải lên..." : "Chọn ảnh"}
                                </button>
                            </div>
                        )}
                    </div>
                );
            case "lectures":
                if (mode !== "create") {
                    return <LectureManager courseId={mode === "create" ? null : data.id} mode={mode} />;
                }
            case "member-list":
                return <MemberList mode={mode} />;
            case "blog-preview":
                return <BlogPreview value={formValues[field.name]} />;
            case "blog-editor":
                return (
                    <BlogEditor
                        value={formValues[field.name] || ""}
                        onChange={(editorData) => {
                            setFormValues((prev) => ({
                                ...prev,
                                [field.name]: editorData.noiDungMarkdown,
                                noiDungHTML: editorData.noiDungHTML,
                                hinhAnh: editorData.hinhAnh,
                            }));

                            if (formErrors[field.name]) {
                                setFormErrors((prev) => ({
                                    ...prev,
                                    [field.name]: null,
                                }));
                            }
                        }}
                        disabled={isDisabled}
                    />
                );
            case "custom":
                return field.render({
                    value: formValues[field.name],
                    onChange: (value) => handleSelectChange(field.name, value),
                    disabled: isDisabled,
                    error: formErrors[field.name],
                    mode,
                });
            default:
                return null;
        }
    };

    return (
        <div className="bg-white shadow rounded-lg h-full">
            <div className="px-4 py-5 sm:px-6 flex items-center justify-between border-b border-gray-200">
                <div onClick={onCancel} className="flex items-center cursor-pointer">
                    <button
                        type="button"
                        className="mr-3 inline-flex items-center rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[90%] overflow-auto">
                <div className="flex justify-end space-x-3 sticky top-0 z-10 bg-white py-2 px-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        disabled={loading}
                    >
                        {cancelButtonText}
                    </button>

                    {mode !== "view" && (
                        <button
                            type="submit"
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : submitButtonText}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 px-6 pb-6">
                    {fields.map((field) => (
                        <div key={field.name} className={field.fullWidth ? "sm:col-span-3" : ""}>
                            <label htmlFor={field.name} className="block font-medium text-gray-700">
                                {field.label}
                                {field.required && !field.hideRequired && <span className="text-red-500">*</span>}
                            </label>
                            {renderField(field)}
                            {formErrors[field.name] && (
                                <p className="mt-1 text-sm text-red-600">{formErrors[field.name]}</p>
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Đã xảy ra lỗi khi xử lý biểu mẫu</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>
                                        {error} <br />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Form;
