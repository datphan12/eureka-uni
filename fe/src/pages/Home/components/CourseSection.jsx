import SectionHeader from "./SectionHeader";
import CourseGrid from "./CourseGrid";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

const CourseSection = ({
    title,
    icon,
    badgeText,
    badgeColor,
    courses,
    isLoading = false,
    owner = false,
    emptyState,
}) => {
    return (
        <div className="animate-fade-in">
            <SectionHeader icon={icon} title={title} badgeText={badgeText} badgeColor={badgeColor} />

            {isLoading ? (
                <LoadingSkeleton />
            ) : courses && courses.length > 0 ? (
                <CourseGrid courses={courses} owner={owner} />
            ) : emptyState ? (
                <EmptyState title={emptyState.title} description={emptyState.description} icon={emptyState.icon} />
            ) : null}
        </div>
    );
};

export default CourseSection;
