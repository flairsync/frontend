import React, { useEffect } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { setTableCookie } from '@/utils/cookies';

// Landing target for a scanned table QR code (/tbl/{businessId}/{tableId}). Stashes
// the table in a cookie (DinerModeStore's scannedTableId is hydrated from it once
// the diner Layout mounts) and sends the customer straight to the menu — a full
// navigation, not client-side routing, so the diner Layout always remounts fresh.
export default function ScannedTablePage() {
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const tableId = pageContext.routeParams?.tableId as string;
    // Signed proof this table's own QR/link was what was actually opened — see
    // qr-code.service.ts (issues it) and utils/cookies.ts (why it's optional here).
    const qrToken = pageContext.urlParsed.search.qt;

    useEffect(() => {
        if (!businessId || !tableId) return;
        setTableCookie(businessId, tableId, qrToken);
        window.location.replace(`/diner/${businessId}/menu`);
    }, [businessId, tableId, qrToken]);

    return null;
}
