import { clientOnly } from "vike-react/clientOnly";

// Station auth reads localStorage — must run client-only
const StationBootstrap = clientOnly(() => import("@/components/station/StationBootstrap"));

export default function StationPosPage() {
  return <StationBootstrap stationType="pos" />;
}
