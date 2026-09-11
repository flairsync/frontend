import { PointerEvent, ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Shared pointer-driven 3D tilt wrapper — used by the Andorra themes' dish
// and waypoint cards (Alpine Snow, Pyrenean Peak) for a depth cue beyond a
// flat hover state. Direct pointer manipulation, not an ambient/autoplaying
// effect, so it stays on even under prefers-reduced-motion; only the
// magnitude is user-controlled (it settles back to flat the instant the
// pointer leaves).
export function TiltCard({
    children,
    className,
    maxDeg = 8,
    scaleOnHover = 1.03,
}: {
    children: ReactNode;
    className?: string;
    maxDeg?: number;
    scaleOnHover?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const hovering = useMotionValue(0);

    const spring = { stiffness: 220, damping: 22 };
    const rotateX = useSpring(useTransform(py, [0, 1], [maxDeg, -maxDeg]), spring);
    const rotateY = useSpring(useTransform(px, [0, 1], [-maxDeg, maxDeg]), spring);
    const scale = useSpring(useTransform(hovering, [0, 1], [1, scaleOnHover]), spring);

    const handleMove = (e: PointerEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        px.set((e.clientX - rect.left) / rect.width);
        py.set((e.clientY - rect.top) / rect.height);
    };
    const handleEnter = () => hovering.set(1);
    const handleLeave = () => {
        px.set(0.5);
        py.set(0.5);
        hovering.set(0);
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            style={{ rotateX, rotateY, scale, transformPerspective: 700 }}
            onPointerMove={handleMove}
            onPointerEnter={handleEnter}
            onPointerLeave={handleLeave}
        >
            {children}
        </motion.div>
    );
}
