import { usePageContext } from "vike-react/usePageContext";
import { MenuBoardsManager } from "@/components/management/menuBoards/MenuBoardsManager";

const Page = () => {
    const { routeParams } = usePageContext();
    return <MenuBoardsManager businessId={routeParams.id as string} />;
};

export default Page;
