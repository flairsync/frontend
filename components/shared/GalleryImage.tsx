import { useState } from 'react';
import { Blurhash } from 'react-blurhash';
import { PhotoView } from 'react-photo-view';

type MediaItem = {
    url: string;
    blurHash: string;
};

export function GalleryImage({ url, blurHash }: MediaItem) {
    const [loaded, setLoaded] = useState(false);

    return (
        <PhotoView src={url}>
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded overflow-hidden cursor-pointer">
                {!loaded && blurHash && (
                    <Blurhash
                        hash={blurHash}
                        width="100%"
                        height="100%"
                        resolutionX={32}
                        resolutionY={32}
                        punch={1}
                        className="absolute inset-0"
                    />
                )}

                <img
                    src={url}
                    alt="Gallery"
                    onLoad={() => setTimeout(() => {
                        setLoaded(true)
                    }, 1000)}
                    className={`object-cover w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            </div>
        </PhotoView>
    );
}
