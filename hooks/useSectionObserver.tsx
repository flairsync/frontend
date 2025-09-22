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
                threshold: 0.5, // tweak if needed
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
