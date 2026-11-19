import { ClientOnly } from "vike-react/ClientOnly";
import StationBootstrap from "@/components/station/StationBootstrap";

// Station auth reads localStorage — must run client-only
export default function StationKdsPage() {
  return (
    <ClientOnly>
      <StationBootstrap stationType="kds" />
    </ClientOnly>
  );
}
