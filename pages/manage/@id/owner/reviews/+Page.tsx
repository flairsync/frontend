import React from "react";
import { usePageContext } from "vike-react/usePageContext";
import BusinessReviewsDashboard from "@/components/management/reviews/BusinessReviewsDashboard";

const OwnerReviewsPage: React.FC = () => {
    const { routeParams } = usePageContext();
    return <BusinessReviewsDashboard businessId={routeParams.id} />;
};

export default OwnerReviewsPage;
