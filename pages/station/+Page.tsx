import { useEffect } from "react";

export default function StationIndexPage() {
  useEffect(() => {
    window.location.replace("/station/pos");
  }, []);

  return null;
}
