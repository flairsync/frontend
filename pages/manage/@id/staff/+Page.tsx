import React, { useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext';
import { redirect } from 'vike/abort';
import { navigate } from 'vike/client/router';

const MainStaffPage = () => {
    const id = usePageContext().routeParams.id
    navigate(`/manage/${id}/staff/dashboard`);

    return (
        <div>123456</div>
    )
}

export default MainStaffPage