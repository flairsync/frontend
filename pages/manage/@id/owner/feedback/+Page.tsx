import { usePageContext } from "vike-react/usePageContext";
import BusinessFeedbackDashboard from "@/components/management/feedback/BusinessFeedbackDashboard";

const Page = () => {
    const { routeParams } = usePageContext();
    return <BusinessFeedbackDashboard businessId={routeParams.id as string} />;
};

export default Page;
