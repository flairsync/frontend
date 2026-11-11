import React, { useEffect } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { useTranslation } from 'react-i18next';
import { setTableCookie } from '@/utils/cookies';

// Landing target for a scanned table QR code (/tbl/{businessId}/{tableId}). Stashes
// the table in a cookie (DinerModeStore's scannedTableId is hydrated from it once
// the diner Layout mounts) and sends the customer straight to the menu — a full
// navigation, not client-side routing, so the diner Layout always remounts fresh.
export default function ScannedTablePage() {
    const { t } = useTranslation('diner');
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

    // A damaged/truncated QR code or hand-typed URL can land here with a
    // missing param — show the diner something instead of a dead blank page.
    if (!businessId || !tableId) {
        return (
            <div className="h-dvh w-screen flex flex-col items-center justify-center bg-background text-foreground gap-2 px-6 text-center">
                <h1 className="text-xl font-bold">{t('errors.invalid_link.title')}</h1>
                <p className="text-muted-foreground max-w-sm">{t('errors.invalid_link.description')}</p>
                <a href="/" className="text-primary underline text-sm mt-2">
                    {t('errors.invalid_link.home_link')}
                </a>
            </div>
        );
    }

    return null;
}
