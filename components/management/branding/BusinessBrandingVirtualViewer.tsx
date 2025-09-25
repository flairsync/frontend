import React, { useEffect } from 'react'
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';
const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';


const BusinessBrandingVirtualViewer = () => {

    useEffect(() => {
        if (typeof window === "undefined") return; // SSR safety
        new Viewer({
            container: 'vr_viewer',
            panorama: baseUrl + 'sphere.jpg',
            caption: 'Parc national du Mercantour <b>&copy; Damien Sorel</b>',
            fisheye: false,

        });

    }, []);
    return (
        <div
            id='vr_viewer'
            className='w-full h-96'
        >

        </div>
    )
}

export default BusinessBrandingVirtualViewer