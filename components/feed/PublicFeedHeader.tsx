import LandingHeader from "@/components/landing/LandingHeader";

type HeaderProps = {
    activeTag?: string;
    className?: string;
    disableEntryAnimation?: boolean;
};

const PublicFeedHeader = (props: HeaderProps) => (
    <LandingHeader {...props} showSectionNav={false} />
);

export default PublicFeedHeader;
