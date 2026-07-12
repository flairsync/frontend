import { usePageContext } from "vike-react/usePageContext";
import TipPoolingPage from "@/components/management/tipPooling/TipPoolingPage";

const Page = () => {
    const { routeParams } = usePageContext();
    return <TipPoolingPage businessId={routeParams.id as string} />;
};

export default Page;
