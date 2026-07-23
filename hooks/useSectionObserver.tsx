import { useEffect, useState } from "react";

export function useSectionObserver(ids: string[]) {
    const [activeId, setActiveId] = useState<string>("");


    useEffect(() => {

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting);

                if (visible.length > 0) {
                    // Pick the one closest to the top of the viewport
                    const topMost = visible.reduce((prev, curr) =>
                        prev.boundingClientRect.top < curr.boundingClientRect.top
                            ? prev
                            : curr
                    );

                    const newId = topMost.target.getAttribute("id");
                    if (newId && activeId !== newId) {
                        setActiveId(newId);
                        window.history.replaceState(null, "", `#${newId}`);
                    }
                }
            },
            {
                root: null,
                // A fixed 0.5 ratio threshold requires half of the *section's own*
                // height to be visible — sections taller than 2x the viewport
                // (e.g. the pricing section, with its cards grid) can never reach
                // that ratio and so never register as active. Using a thin
                // activation band near the top of the viewport instead makes
                // "active" depend on scroll position, not section height.
                rootMargin: "-20% 0px -70% 0px",
                threshold: 0,
            }
        );

        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            observer.disconnect();
        };
    }, [ids]);
    return activeId;

}
