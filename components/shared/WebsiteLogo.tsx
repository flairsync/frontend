import React from 'react'

const WebsiteLogo = () => {
    return (
        <div className="text-2xl font-bold text-foreground flex-row flex items-center gap-2">
            <img src="/fs_logo.svg" alt="FlairSync" width={33} height={33} />
            FlairSync
        </div>
    )
}

export default WebsiteLogo