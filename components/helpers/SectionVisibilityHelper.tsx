import { useEffect, useRef } from "react";

interface ObservedSectionProps {
    id: string;
    className?: string;
    children: React.ReactNode;
}

const SectionVisibilityHelper: React.FC<ObservedSectionProps> = ({
    id,
    children,
    className,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const section = ref.current;
        if (!section) return;

        let activeId = "";

        const observer = new IntersectionObserver(
            (entries) => {
                // Filter only visible sections
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
                        activeId = newId;
                        window.history.replaceState(null, "", `#${newId}`);
                    }
                }
            },
            {
                root: null,
                threshold: 0.5, // adjust how much needs to be visible before triggering
            }
        );

        observer.observe(section);

        return () => {
            observer.unobserve(section);
        };
    }, [id]);

    return (
        <div id={id} ref={ref} className={className}>
            {children}
        </div>
    );
};

export default SectionVisibilityHelper;
