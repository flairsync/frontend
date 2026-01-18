export function title(pageContext) {
  const busMeta = pageContext.data.busMeta;
  if (busMeta) {
    return busMeta.name;
  }
  return "Business management";
}
