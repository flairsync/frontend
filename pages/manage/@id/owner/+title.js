// Deliberately a constant. This used to read `pageContext.data.busMeta` to show the
// business name, but the +data hook it read from returned `businessMeta` — a different
// key — so `busMeta` was always undefined and the tab has always said "Business
// management". That hook has been removed (see below), so reading pageContext.data
// here would now throw.
//
// The hook it depended on fetched https://api.flairsync.com/.../metadata on every
// navigation into /manage/:id/*, with a hardcoded production host and no timeout, and
// nothing ever consumed the result. Because Vike blocks the navigation until the data
// hook settles, a slow or hanging response left the page transition unfinished — the
// nprogress bar stuck at the top and the old page still on screen.
//
// To show the real business name here again, set it client-side from the business the
// manage layout already loads (useMyBusiness) rather than re-adding a blocking fetch.
export function title() {
  return "Business management";
}
