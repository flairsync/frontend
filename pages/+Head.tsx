// https://vike.dev/Head

//# BATI.has("mantine")
import logoUrl from "../assets/logo.svg";

export default function HeadDefault() {
  return <>
    <link rel="icon" href={logoUrl} />
    <script src="https://app.lemonsqueezy.com/js/lemon.js"></script>
  </>
}
