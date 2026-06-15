import { usePageContext } from "vike-react/usePageContext";
import PayrollPage from "@/components/management/payroll/PayrollPage";

const Page = () => {
    const { routeParams } = usePageContext();
    return <PayrollPage businessId={routeParams.id as string} />;
};

export default Page;
