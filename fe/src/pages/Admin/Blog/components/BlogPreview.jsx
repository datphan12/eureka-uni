import { ImageViewer } from "@components";
import parse from "html-react-parser";

const BlogPreview = ({ value }) => {
    const filterHtmlContent = (htmlContent) => {
        return parse(htmlContent, {
            replace: (domNode) => {
                if (domNode.name === "img") {
                    return <ImageViewer src={domNode.attribs.src} className="max-w-[300px] bg-white" />;
                }
            },
        });
    };
    return (
        <div className="bg-gray-100 border border-gray-300 rounded-md p-4 max-h-[400px] overflow-auto">
            {value && <div className="flex flex-col gap-y-4">{filterHtmlContent(value)}</div>}
        </div>
    );
};

export default BlogPreview;
