import React, { useEffect, useRef } from 'react'
import { animate, createScope, createSpring, createDraggable } from 'animejs';



const AnimatedScrollArrow = () => {

    const root = useRef<any>(null);
    const scope = useRef<any>(null);

    useEffect(() => {
        scope.current = createScope({ root }).add(self => {

            animate(".arrow_logo", {
                y: [
                    { to: '-2.75rem', ease: 'outExpo', duration: 600 },
                    { to: 0, ease: 'outBounce', duration: 800, delay: 100 }
                ],
                loop: true,
                loopDelay: 350,

            })
        })

        // Properly cleanup all anime.js instances declared inside the scope
        return () => scope.current.revert()
    }, []);

    return (
        <div ref={root}>
            <div
                className='arrow_logo 
                 bottom-[-24]   
            md:absolute md:bottom-0 

                  left-0 right-0 self-center justify-center align-middle flex'


            >
                <svg width="137" height="168" viewBox="0 0 137 168" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.52">
                        <path d="M68.5 118.908L34.25 84.6583L42.2417 76.6666L68.5 102.925L94.7583 76.6666L102.75 84.6583L68.5 118.908Z" fill="#BAB8FB" />
                    </g>
                    <g opacity="0.52">
                        <path d="M68.5 87.9083L34.25 53.6583L42.2417 45.6666L68.5 71.925L94.7583 45.6666L102.75 53.6583L68.5 87.9083Z" fill="#BAB8FB" />
                    </g>
                </svg>

            </div>
        </div>
    )
}

export default AnimatedScrollArrow