import React from 'react'

const PublicFeedSearchHero = () => {
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
                        Stop looking for a restaurant - find it.
                    </h1>
                    <form className="relative w-full">
                        <div className="relative flex items-center bg-white rounded-full shadow-lg overflow-hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-500 absolute left-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-4 text-lg text-gray-800 focus:outline-none bg-transparent"
                            />
                        </div>
                        {/* The search button is omitted as it's not in the design,
            but we can add one if needed. */}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PublicFeedSearchHero