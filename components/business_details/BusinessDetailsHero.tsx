import React from 'react'

const BusinessDetailsHero = () => {
    return (
        <div className="bg-gray-100  font-sans">
            <div
                className="relative w-full h-[500px] flex items-center justify-center text-center p-4 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg')",
                    backgroundBlendMode: 'multiply',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)'
                }}
            >
                <div className="z-10 text-white p-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                        Restaurant name
                    </h1>
                </div>
            </div>
        </div>
    )
}

export default BusinessDetailsHero