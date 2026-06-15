import React, { useEffect } from 'react';
import { usePageContext } from 'vike-react/usePageContext';

export default function DinerRootPage() {
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;

    useEffect(() => {
        window.location.replace(`/diner/${businessId}/menu`);
    }, [businessId]);

    return null;
}
