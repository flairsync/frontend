import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Users, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscoveryFloor, DiscoveryTableRecord, DiscoveryElementRecord } from "@/features/discovery/useDiscovery";

const PPM = 64; // pixels per meter
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 5;

// ─── Colour tokens ────────────────────────────────────────────────────────────
const colours = {
    neutral: { fill: "#e0f2fe", stroke: "#38bdf8", text: "#0369a1" },
    available: { fill: "#dcfce7", stroke: "#16a34a", text: "#15803d" },
    taken: { fill: "#f1f5f9", stroke: "#cbd5e1", text: "#94a3b8" },
};

// ─── Floor bounds (tables + elements) ────────────────────────────────────────
function floorBounds(tables: DiscoveryTableRecord[], elements: DiscoveryElementRecord[]) {
    let maxX = 5, maxY = 4;
    tables.forEach(t => {
        const x = (t.position?.x ?? 0) + (t.position?.width ?? 1.2);
        const y = (t.position?.y ?? 0) + (t.position?.height ?? 0.8);
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    });
    elements.forEach(el => {
        const x = (el.position?.x ?? 0) + (el.position?.width ?? 1);
        const y = (el.position?.y ?? 0) + (el.position?.height ?? 1);
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    });
    return { w: (maxX + 1.5) * PPM, h: (maxY + 1.5) * PPM };
}

// ─── Element renderer (background, non-interactive) ──────────────────────────
function FloorElement({ el }: { el: DiscoveryElementRecord }) {
    const x = (el.position?.x ?? 0) * PPM;
    const y = (el.position?.y ?? 0) * PPM;
    const w = (el.position?.width ?? 1) * PPM;
    const h = (el.position?.height ?? 1) * PPM;
    const rot = el.position?.rotation ?? 0;
    const cx = x + w / 2;
    const cy = y + h / 2;

    let content: React.ReactNode = null;

    switch (el.type) {
        case 'wall':
            content = <rect x={x} y={y} width={w} height={h} fill="#475569" stroke="#1e293b" strokeWidth="1" />;
            break;
        case 'window':
            content = (
                <g>
                    <rect x={x} y={y} width={w} height={h} fill="#bae6fd" stroke="#0ea5e9" strokeWidth="1" />
                    <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#f0f9ff" strokeWidth="2" />
                    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4,2" />
                </g>
            );
            break;
        case 'door':
            content = (
                <g>
                    <rect x={x} y={y} width={w} height={h} fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
                    <path
                        d={`M${x + w * 0.1} ${y + h / 2} A${w * 0.8} ${w * 0.8} 0 0 1 ${x + w * 0.9} ${y + h / 2}`}
                        fill="none" stroke="#92400e" strokeWidth="1" strokeDasharray="3,2"
                    />
                </g>
            );
            break;
        case 'pillar': {
            const sz = Math.min(w, h);
            const px = x + (w - sz) / 2;
            const py = y + (h - sz) / 2;
            content = (
                <g>
                    <rect x={px + 2} y={py + 2} width={sz - 4} height={sz - 4} rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                    <rect x={px + sz * 0.25} y={py + sz * 0.25} width={sz * 0.5} height={sz * 0.5} rx="2" fill="#64748b" />
                </g>
            );
            break;
        }
        case 'bar':
            content = (
                <g>
                    <rect x={x} y={y} width={w} height={h} rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
                    <rect x={x + 3} y={y + 3} width={w - 6} height={h * 0.4} rx="2" fill="#92400e" />
                </g>
            );
            break;
        case 'stairs':
            content = (
                <g>
                    <rect x={x} y={y} width={w} height={h} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                    {[1, 2, 3, 4].map(i => (
                        <line key={i} x1={x} y1={y + h * i / 5} x2={x + w} y2={y + h * i / 5} stroke="#94a3b8" strokeWidth="1" />
                    ))}
                    <line x1={x + w * 0.3} y1={y} x2={x} y2={y + h} stroke="#64748b" strokeWidth="1" />
                </g>
            );
            break;
        case 'elevator': {
            const sz = Math.min(w, h);
            const ex = x + (w - sz) / 2;
            const ey = y + (h - sz) / 2;
            content = (
                <g>
                    <rect x={ex + 2} y={ey + 2} width={sz - 4} height={sz - 4} rx="4" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="1.5" />
                    <text x={ex + sz / 2} y={ey + sz * 0.42} dominantBaseline="middle" textAnchor="middle" fill="#3730a3" fontSize={sz * 0.32} fontWeight="bold">▲</text>
                    <text x={ex + sz / 2} y={ey + sz * 0.68} dominantBaseline="middle" textAnchor="middle" fill="#3730a3" fontSize={sz * 0.32} fontWeight="bold">▼</text>
                </g>
            );
            break;
        }
        case 'plant': {
            const sz = Math.min(w, h);
            const px = x + (w - sz) / 2;
            const py = y + (h - sz) / 2;
            content = (
                <g>
                    <circle cx={px + sz / 2} cy={py + sz / 2} r={sz / 2 - 3} fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                    <path d={`M${px + sz / 2} ${py + sz / 2 - sz * 0.2} L${px + sz / 2 - sz * 0.15} ${py + sz / 2 + sz * 0.15} M${px + sz / 2} ${py + sz / 2 - sz * 0.2} L${px + sz / 2 + sz * 0.15} ${py + sz / 2 + sz * 0.15}`} stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
                </g>
            );
            break;
        }
        case 'wc': {
            const sz = Math.min(w, h);
            const wx = x + (w - sz) / 2;
            const wy = y + (h - sz) / 2;
            content = (
                <g>
                    <rect x={wx} y={wy} width={sz} height={sz} rx="4" fill="#3b82f6" />
                    <text x={wx + sz / 2} y={wy + sz / 2} dominantBaseline="middle" textAnchor="middle" fill="white" fontSize={sz / 2.5} fontWeight="bold">WC</text>
                </g>
            );
            break;
        }
        case 'label':
            content = <rect x={x} y={y} width={w} height={h} rx="3" fill="rgba(255,255,255,0.5)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,2" />;
            break;
        case 'shape':
            content = <rect x={x} y={y} width={w} height={h} rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4,2" />;
            break;
        default:
            content = <rect x={x} y={y} width={w} height={h} rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />;
    }

    return (
        <g transform={rot ? `rotate(${rot}, ${cx}, ${cy})` : undefined} style={{ pointerEvents: 'none' }}>
            {content}
            {el.label && el.type === 'label' && (
                <text
                    x={x + w / 2} y={y + h / 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.min(w, h) * 0.28} fontWeight="600"
                    fill="#475569"
                >
                    {el.label}
                </text>
            )}
        </g>
    );
}

// ─── Table shape renderer ─────────────────────────────────────────────────────
function TableShape({
    table, canFilter, isAvailable, isHovered, isSelected,
    onClick, onEnter, onLeave,
}: {
    table: DiscoveryTableRecord;
    canFilter: boolean;
    isAvailable: boolean;
    isHovered: boolean;
    isSelected: boolean;
    onClick: () => void;
    onEnter: () => void;
    onLeave: () => void;
}) {
    const x = (table.position?.x ?? 0) * PPM;
    const y = (table.position?.y ?? 0) * PPM;
    const w = (table.position?.width ?? 1.2) * PPM;
    const h = (table.position?.height ?? 0.8) * PPM;
    const rot = table.position?.rotation ?? 0;
    const shape = table.position?.shape ?? "rectangle";
    const clickable = !canFilter || isAvailable;
    const colour = !canFilter ? colours.neutral : isAvailable ? colours.available : colours.taken;
    const label = table.name || `T${table.number}`;
    const seats = table.capacity;
    const scale = isHovered && clickable ? 1.06 : 1;
    const cx = x + w / 2;
    const cy = y + h / 2;

    return (
        <g
            transform={`rotate(${rot}, ${cx}, ${cy})`}
            onClick={clickable ? onClick : undefined}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onMouseDown={e => e.stopPropagation()}
            style={{ cursor: clickable ? "pointer" : "default", transition: "all 0.12s ease" }}
        >
            <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`}>
                {isSelected && (
                    <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8}
                        rx={shape === "circle" ? (w + 8) / 2 : 8}
                        fill="none" stroke="#16a34a" strokeWidth={3}
                        strokeDasharray="6 3"
                        className="animate-[spin_8s_linear_infinite]"
                    />
                )}
                {isHovered && clickable && !isSelected && (
                    <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6}
                        rx={shape === "circle" ? (w + 6) / 2 : 8}
                        fill="none" stroke={colour.stroke} strokeWidth={2} opacity={0.5}
                    />
                )}
                {shape === "circle" ? (
                    <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 2} ry={h / 2 - 2}
                        fill={colour.fill} stroke={colour.stroke}
                        strokeWidth={isHovered && clickable ? 2.5 : 1.8}
                    />
                ) : (
                    <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4}
                        rx={shape === "square" ? 8 : 6}
                        fill={colour.fill} stroke={colour.stroke}
                        strokeWidth={isHovered && clickable ? 2.5 : 1.8}
                    />
                )}
                {canFilter && !isAvailable && (
                    <>
                        <line x1={x + 6} y1={y + 6} x2={x + w - 6} y2={y + h - 6} stroke="#cbd5e1" strokeWidth={1.5} strokeLinecap="round" />
                        <line x1={x + w - 6} y1={y + 6} x2={x + 6} y2={y + h - 6} stroke="#cbd5e1" strokeWidth={1.5} strokeLinecap="round" />
                    </>
                )}
                <text x={x + w / 2} y={y + h / 2 - (seats ? 5 : 0)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.min(w, h) * 0.22} fontWeight="700" fill={colour.text}>
                    {label}
                </text>
                {seats > 0 && (
                    <text x={x + w / 2} y={y + h / 2 + Math.min(w, h) * 0.14}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={Math.min(w, h) * 0.17} fill={colour.text} opacity={0.8}>
                        {seats} seats
                    </text>
                )}
            </g>
        </g>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface FloorPlanPublicViewProps {
    floors: DiscoveryFloor[];
    availableTableIds: string[];
    canFilter: boolean;
    selectedTableId?: string;
    onSelectTable: (table: { id: string; number: string; seats: number }) => void;
}

const FloorPlanPublicView: React.FC<FloorPlanPublicViewProps> = ({
    floors, availableTableIds, canFilter, selectedTableId, onSelectTable,
}) => {
    const [activeFloorId, setActiveFloorId] = useState<string>(() => floors[0]?.id ?? "");
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    const svgRef = useRef<SVGSVGElement>(null);
    const stateRef = useRef({ zoom: 1, pan: { x: 0, y: 0 }, boundsW: 0, boundsH: 0 });
    const dragRef = useRef<{ startClientX: number; startClientY: number; startPanX: number; startPanY: number } | null>(null);
    const touchRef = useRef<{ startDist: number; startZoom: number; startMidX: number; startMidY: number; startPanX: number; startPanY: number } | null>(null);
    const didMoveRef = useRef(false);

    const availableSet = useMemo(() => new Set(availableTableIds), [availableTableIds]);
    const activeFloor = floors.find(f => f.id === activeFloorId) ?? floors[0];
    const tables = activeFloor?.tables ?? [];
    const elements = activeFloor?.elements ?? [];
    const bounds = useMemo(() => floorBounds(tables, elements), [tables, elements]);

    // Keep stateRef in sync so event handlers always read fresh values
    stateRef.current = { zoom, pan, boundsW: bounds.w, boundsH: bounds.h };

    // Reset view when floor changes
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [activeFloorId]);

    const clampPan = useCallback((x: number, y: number, z: number, bw: number, bh: number) => {
        const vw = bw / z;
        const vh = bh / z;
        return {
            x: Math.max(0, Math.min(Math.max(0, bw - vw), x)),
            y: Math.max(0, Math.min(Math.max(0, bh - vh), y)),
        };
    }, []);

    // Wheel → zoom toward cursor
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const { zoom: z, pan: p, boundsW: bw, boundsH: bh } = stateRef.current;
            const rect = svg.getBoundingClientRect();
            const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor));
            const prevVW = bw / z;
            const prevVH = bh / z;
            const newVW = bw / newZoom;
            const newVH = bh / newZoom;
            const cursorSvgX = p.x + (e.clientX - rect.left) / rect.width * prevVW;
            const cursorSvgY = p.y + (e.clientY - rect.top) / rect.height * prevVH;
            const rawPanX = cursorSvgX - (e.clientX - rect.left) / rect.width * newVW;
            const rawPanY = cursorSvgY - (e.clientY - rect.top) / rect.height * newVH;
            const newPan = {
                x: Math.max(0, Math.min(Math.max(0, bw - newVW), rawPanX)),
                y: Math.max(0, Math.min(Math.max(0, bh - newVH), rawPanY)),
            };
            setZoom(newZoom);
            setPan(newPan);
        };
        svg.addEventListener('wheel', onWheel, { passive: false });
        return () => svg.removeEventListener('wheel', onWheel);
    }, []);

    // Mouse drag → pan (only from SVG background; tables stop propagation)
    const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button !== 0) return;
        dragRef.current = {
            startClientX: e.clientX,
            startClientY: e.clientY,
            startPanX: stateRef.current.pan.x,
            startPanY: stateRef.current.pan.y,
        };
        didMoveRef.current = false;
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const d = dragRef.current;
            if (!d) return;
            const { zoom: z, boundsW: bw, boundsH: bh } = stateRef.current;
            const svg = svgRef.current;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const dx = (e.clientX - d.startClientX) / rect.width * (bw / z);
            const dy = (e.clientY - d.startClientY) / rect.height * (bh / z);
            if (Math.abs(e.clientX - d.startClientX) > 4 || Math.abs(e.clientY - d.startClientY) > 4) {
                didMoveRef.current = true;
            }
            if (didMoveRef.current) {
                setPan(clampPan(d.startPanX - dx, d.startPanY - dy, z, bw, bh));
            }
        };
        const onUp = () => { dragRef.current = null; };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [clampPan]);

    // Touch: single-finger pan, two-finger pinch-zoom
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY,
            );
            touchRef.current = {
                startDist: dist,
                startZoom: stateRef.current.zoom,
                startMidX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                startMidY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
                startPanX: stateRef.current.pan.x,
                startPanY: stateRef.current.pan.y,
            };
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchRef.current) {
            e.preventDefault();
            const t = touchRef.current;
            const { boundsW: bw, boundsH: bh } = stateRef.current;
            const svg = svgRef.current;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY,
            );
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, t.startZoom * (dist / t.startDist)));
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const prevVW = bw / t.startZoom;
            const prevVH = bh / t.startZoom;
            const newVW = bw / newZoom;
            const newVH = bh / newZoom;
            const anchorSvgX = t.startPanX + (t.startMidX - rect.left) / rect.width * prevVW;
            const anchorSvgY = t.startPanY + (t.startMidY - rect.top) / rect.height * prevVH;
            const panDx = (midX - t.startMidX) / rect.width * newVW;
            const panDy = (midY - t.startMidY) / rect.height * newVH;
            const rawPanX = anchorSvgX - (midX - rect.left) / rect.width * newVW - panDx;
            const rawPanY = anchorSvgY - (midY - rect.top) / rect.height * newVH - panDy;
            setZoom(newZoom);
            setPan(clampPan(rawPanX, rawPanY, newZoom, bw, bh));
        }
    }, [clampPan]);

    const handleTouchEnd = useCallback(() => { touchRef.current = null; }, []);

    // Zoom button helpers
    const zoomBy = (factor: number) => {
        const { zoom: z, pan: p, boundsW: bw, boundsH: bh } = stateRef.current;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor));
        const newVW = bw / newZoom;
        const newVH = bh / newZoom;
        const centerSvgX = p.x + bw / z / 2;
        const centerSvgY = p.y + bh / z / 2;
        setPan(clampPan(centerSvgX - newVW / 2, centerSvgY - newVH / 2, newZoom, bw, bh));
        setZoom(newZoom);
    };

    const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

    const availCount = canFilter
        ? tables.filter(t => availableSet.has(t.id)).length
        : tables.length;

    const viewW = bounds.w / zoom;
    const viewH = bounds.h / zoom;
    const isPanning = dragRef.current !== null;

    if (floors.length === 0 || tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Users size={28} className="opacity-30" />
                </div>
                <p className="font-medium">No floor plan available</p>
                <p className="text-sm opacity-70">The venue hasn't set up their floor plan yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Floor tabs + legend */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {floors.map(floor => (
                        <button
                            key={floor.id}
                            onClick={() => setActiveFloorId(floor.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                                floor.id === activeFloorId
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {floor.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    {canFilter && (
                        <span className="text-emerald-600 font-semibold">
                            {availCount} table{availCount !== 1 ? "s" : ""} available
                        </span>
                    )}
                    <div className="flex items-center gap-3">
                        <LegendDot color="#dcfce7" stroke="#16a34a" label="Available" />
                        <LegendDot color="#f1f5f9" stroke="#cbd5e1" label="Taken" />
                        {!canFilter && <LegendDot color="#e0f2fe" stroke="#38bdf8" label="Select date & time" />}
                    </div>
                </div>
            </div>

            {/* SVG canvas */}
            <div className="relative rounded-[1.5rem] overflow-hidden border border-border/60 bg-slate-50 shadow-inner select-none">
                <svg
                    ref={svgRef}
                    viewBox={`${pan.x} ${pan.y} ${viewW} ${viewH}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full touch-none"
                    style={{ maxHeight: 460, cursor: didMoveRef.current ? 'grabbing' : 'grab' }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <defs>
                        <pattern id="pub-grid-minor" width={PPM / 2} height={PPM / 2} patternUnits="userSpaceOnUse">
                            <path d={`M ${PPM / 2} 0 L 0 0 0 ${PPM / 2}`} fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
                        </pattern>
                        <pattern id="pub-grid-major" width={PPM} height={PPM} patternUnits="userSpaceOnUse">
                            <path d={`M ${PPM} 0 L 0 0 0 ${PPM}`} fill="none" stroke="#e8edf3" strokeWidth="1" />
                        </pattern>
                    </defs>

                    <rect x={pan.x} y={pan.y} width={viewW} height={viewH} fill="#f0f4f8" />
                    <rect width={bounds.w} height={bounds.h} fill="white" />
                    <rect width={bounds.w} height={bounds.h} fill="url(#pub-grid-minor)" />
                    <rect width={bounds.w} height={bounds.h} fill="url(#pub-grid-major)" />
                    <rect width={bounds.w} height={bounds.h} fill="none" stroke="#e2e8f0" strokeWidth="2" />

                    {/* Scale indicator — pinned to bottom-right of view */}
                    <g transform={`translate(${pan.x + viewW - (PPM + 20) / zoom}, ${pan.y + viewH - 28 / zoom}) scale(${1 / zoom})`} opacity={0.55}>
                        <rect x={-4} y={-10} width={PPM + 8} height={22} rx={4} fill="white" fillOpacity={0.8} />
                        <line x1={0} y1={0} x2={PPM} y2={0} stroke="#64748b" strokeWidth={2} />
                        <line x1={0} y1={-4} x2={0} y2={4} stroke="#64748b" strokeWidth={2} />
                        <line x1={PPM} y1={-4} x2={PPM} y2={4} stroke="#64748b" strokeWidth={2} />
                        <text x={PPM / 2} y={12} textAnchor="middle" fontSize={10} fontWeight={600} fill="#64748b">1 m</text>
                    </g>

                    {/* Background elements */}
                    {elements.map(el => <FloorElement key={el.id} el={el} />)}

                    {/* Tables */}
                    {tables.map(table => (
                        <TableShape
                            key={table.id}
                            table={table}
                            canFilter={canFilter}
                            isAvailable={availableSet.has(table.id)}
                            isHovered={hoveredId === table.id}
                            isSelected={selectedTableId === table.id}
                            onClick={() => onSelectTable({
                                id: table.id,
                                number: table.name || String(table.number),
                                seats: table.capacity,
                            })}
                            onEnter={() => setHoveredId(table.id)}
                            onLeave={() => setHoveredId(null)}
                        />
                    ))}
                </svg>

                {/* Zoom controls */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                    <button
                        onClick={() => zoomBy(1.25)}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-border/60 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => zoomBy(1 / 1.25)}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-border/60 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={resetView}
                        className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm border border-border/60 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                        title="Reset view"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Zoom level badge */}
                <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm border border-border/60 text-[10px] font-mono font-bold text-slate-500 px-2 py-1 rounded-md pointer-events-none">
                    {Math.round(zoom * 100)}%
                </div>

                {!canFilter && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full shadow-sm pointer-events-none">
                        Select a date & time above to see availability
                    </div>
                )}
            </div>

            <p className="text-[10px] text-center text-muted-foreground">
                Scroll to zoom · Drag to pan · Pinch on mobile
            </p>
        </div>
    );
};

function LegendDot({ color, stroke, label }: { color: string; stroke: string; label: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border inline-block" style={{ background: color, borderColor: stroke }} />
            {label}
        </span>
    );
}

export default FloorPlanPublicView;
