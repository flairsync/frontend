export default (pageContext: any) => {
  const url = pageContext.urlPathname.toLowerCase();
  return url === '/pos' || url === '/pos/';
};
