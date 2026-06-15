import React, { useRef, useState, useEffect, useMemo } from 'react';
import { FloorPlanLayout, DesignerElement, Point } from "./types";
import { ASSETS } from "./FloorPlanAssets";
import { useOrders } from "@/features/orders/useOrders";
import { usePageContext } from "vike-react/usePageContext";

interface CanvasProps {
    layout: FloorPlanLayout;
    onUpdateItem: (id: string, updates: Partial<DesignerElement>) => void;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
}

type ResizeDirection = 'e' | 'w' | 's' | 'n';

export const DesignerCanvas: React.FC<CanvasProps> = ({ layout, onUpdateItem, selectedId, onSelect, zoom, onZoomChange }) => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { orders } = useOrders(businessId);

    const TERMINAL = new Set(['completed', 'rejected', 'canceled']);
    const activeOrders = useMemo(() => orders?.filter(o => !TERMINAL.has(o.status)) || [], [orders]);

    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [resizeDir, setResizeDir] = useState<ResizeDirection | null>(null);
    const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
    const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPos, setLastPanPos] = useState<Point>({ x: 0, y: 0 });
    const [isRotating, setIsRotating] = useState(false);

    // Track container size for filling layout
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setContainerSize({ width, height });
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Reset pan when floor changes
    useEffect(() => {
        setPan({ x: 0, y: 0 });
    }, [layout.id]);

    const mToPx = (meters: number) => meters * layout.pixelsPerMeter;
    const pxToM = (px: number) => px / layout.pixelsPerMeter;

    const canvasWidthPx = mToPx(layout.widthMeters);
    const canvasHeightPx = mToPx(layout.heightMeters);

    // Visible area in user-space units
    const viewW = canvasWidthPx / zoom;
    const viewH = canvasHeightPx / zoom;

    const getMousePosition = (e: React.MouseEvent | MouseEvent): Point => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const CTM = svg.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };
        const inv = point.matrixTransform(CTM.inverse());
        return { x: inv.x, y: inv.y };
    };

    const getLocalMousePosition = (e: React.MouseEvent | MouseEvent, el: DesignerElement): Point => {
        const pos = getMousePosition(e);
        const elX = mToPx(el.xMeters);
        const elY = mToPx(el.yMeters);
        const elW = mToPx(el.widthMeters);
        const elH = mToPx(el.heightMeters);
        const x = pos.x - elX;
        const y = pos.y - elY;
        const cx = elW / 2;
        const cy = elH / 2;
        const rad = -el.rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rx = x - cx;
        const ry = y - cy;
        return { x: rx * cos - ry * sin + cx, y: rx * sin + ry * cos + cy };
    };

    const snapToGrid = (coordPx: number) => Math.round(coordPx / layout.gridSize) * layout.gridSize;

    const handleMouseDown = (e: React.MouseEvent, el: DesignerElement) => {
        e.stopPropagation();
        onSelect(el.id);
        const pos = getMousePosition(e);
        setDraggingId(el.id);
        setDragOffset({ x: pos.x - mToPx(el.xMeters), y: pos.y - mToPx(el.yMeters) });
    };

    const handleResizeStart = (e: React.MouseEvent, el: DesignerElement, dir: ResizeDirection) => {
        e.stopPropagation();
        setResizingId(el.id);
        setResizeDir(dir);
        onSelect(el.id);
    };

    const handleRotationStart = (e: React.MouseEvent, el: DesignerElement) => {
        e.stopPropagation();
        setIsRotating(true);
        onSelect(el.id);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (draggingId) {
            const pos = getMousePosition(e);
            const el = layout.elements.find(i => i.id === draggingId);
            if (!el) return;
            const newXPx = snapToGrid(pos.x - dragOffset.x);
            const newYPx = snapToGrid(pos.y - dragOffset.y);
            const maxXPx = canvasWidthPx - mToPx(el.widthMeters);
            const maxYPx = canvasHeightPx - mToPx(el.heightMeters);
            onUpdateItem(draggingId, {
                xMeters: pxToM(Math.max(0, Math.min(maxXPx, newXPx))),
                yMeters: pxToM(Math.max(0, Math.min(maxYPx, newYPx))),
            });
        } else if (resizingId && resizeDir) {
            const el = layout.elements.find(i => i.id === resizingId);
            if (!el) return;
            const localPos = getLocalMousePosition(e, el);
            const updates: Partial<DesignerElement> = {};
            const minSizeM = pxToM(layout.gridSize);

            if (resizeDir === 'e') {
                updates.widthMeters = Math.max(minSizeM, pxToM(snapToGrid(localPos.x)));
            }
            if (resizeDir === 's') {
                updates.heightMeters = Math.max(minSizeM, pxToM(snapToGrid(localPos.y)));
            }
            if (resizeDir === 'w') {
                const newW = Math.max(minSizeM, el.widthMeters - pxToM(snapToGrid(localPos.x)));
                const dW = el.widthMeters - newW;
                const rad = el.rotation * Math.PI / 180;
                updates.widthMeters = newW;
                updates.xMeters = el.xMeters + dW * Math.cos(rad);
                updates.yMeters = el.yMeters + dW * Math.sin(rad);
            }
            if (resizeDir === 'n') {
                const newH = Math.max(minSizeM, el.heightMeters - pxToM(snapToGrid(localPos.y)));
                const dH = el.heightMeters - newH;
                const rad = (el.rotation + 90) * Math.PI / 180;
                updates.heightMeters = newH;
                updates.xMeters = (updates.xMeters ?? el.xMeters) + dH * Math.cos(rad);
                updates.yMeters = (updates.yMeters ?? el.yMeters) + dH * Math.sin(rad);
            }
            onUpdateItem(resizingId, updates);
        } else if (isRotating && selectedId) {
            const el = layout.elements.find(i => i.id === selectedId);
            if (!el) return;
            const pos = getMousePosition(e);
            const centerX = mToPx(el.xMeters) + mToPx(el.widthMeters) / 2;
            const centerY = mToPx(el.yMeters) + mToPx(el.heightMeters) / 2;
            let angle = Math.atan2(pos.y - centerY, pos.x - centerX) * 180 / Math.PI;
            angle = (angle + 90 + 360) % 360;
            if (e.shiftKey) angle = Math.round(angle / 15) * 15;
            else angle = Math.round(angle);
            onUpdateItem(selectedId, { rotation: angle });
        } else if (isPanning) {
            const svg = svgRef.current;
            if (!svg) return;
            const CTM = svg.getScreenCTM();
            if (!CTM) return;
            const dx = (e.clientX - lastPanPos.x) / CTM.a;
            const dy = (e.clientY - lastPanPos.y) / CTM.d;
            const maxPanX = Math.max(0, canvasWidthPx - viewW);
            const maxPanY = Math.max(0, canvasHeightPx - viewH);
            setPan(prev => ({
                x: Math.max(0, Math.min(maxPanX, prev.x - dx)),
                y: Math.max(0, Math.min(maxPanY, prev.y - dy)),
            }));
            setLastPanPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
        setResizingId(null);
        setResizeDir(null);
        setIsPanning(false);
        setIsRotating(false);
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            e.preventDefault();
            setIsPanning(true);
            setLastPanPos({ x: e.clientX, y: e.clientY });
        } else if (e.button === 0) {
            onSelect(null);
        }
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (e.shiftKey || e.ctrlKey) {
            // Zoom toward mouse cursor
            const delta = e.deltaY > 0 ? -0.08 : 0.08;
            const newZoom = Math.max(0.2, Math.min(5, zoom + delta));
            onZoomChange(newZoom);
        } else {
            // Pan vertically
            const dy = e.deltaY / zoom;
            const maxPanY = Math.max(0, canvasHeightPx - viewH);
            setPan(prev => ({ ...prev, y: Math.max(0, Math.min(maxPanY, prev.y + dy)) }));
        }
    };

    useEffect(() => {
        if (draggingId || resizingId || isPanning || isRotating) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, resizingId, isPanning, isRotating, dragOffset, resizeDir, lastPanPos]);

    useEffect(() => {
        const el = containerRef.current;
        if (el) {
            el.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (el) el.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, onZoomChange, viewH, canvasHeightPx]);

    const sortedElements = useMemo(() => {
        const order: Record<string, number> = {
            wall: 1, pillar: 2, window: 3, door: 3,
            stairs: 4, elevator: 4, bar: 4,
            plant: 5, wc: 5, label: 5, shape: 5,
            table: 6,
        };
        return [...layout.elements].sort((a, b) => (order[a.type] || 4) - (order[b.type] || 4));
    }, [layout.elements]);

    const renderElement = (el: DesignerElement) => {
        const elX = mToPx(el.xMeters);
        const elY = mToPx(el.yMeters);
        const elW = mToPx(el.widthMeters);
        const elH = mToPx(el.heightMeters);
        const sub = el.subType;

        let content;
        if (el.type === 'table') {
            if (sub === 'circle') content = ASSETS.tables.circle(elW);
            else if (sub === 'square') content = ASSETS.tables.square(elW);
            else content = ASSETS.tables.rectangle(elW, elH);
        } else if (el.type === 'wall') {
            content = ASSETS.elements.wall(elW, elH);
        } else if (el.type === 'window') {
            content = ASSETS.elements.window(elW, elH);
        } else if (el.type === 'door') {
            content = ASSETS.elements.door(elW, elH);
        } else if (el.type === 'pillar') {
            content = ASSETS.elements.pillar(Math.min(elW, elH));
        } else if (el.type === 'bar') {
            content = ASSETS.elements.bar(elW, elH);
        } else if (el.type === 'stairs') {
            content = ASSETS.elements.stairs(elW, elH);
        } else if (el.type === 'elevator') {
            content = ASSETS.elements.elevator(Math.min(elW, elH));
        } else if (el.type === 'plant') {
            content = ASSETS.elements.plant(Math.min(elW, elH));
        } else if (el.type === 'wc') {
            content = ASSETS.elements.wc(Math.min(elW, elH));
        } else if (el.type === 'label') {
            content = ASSETS.elements.label(elW, elH);
        } else if (el.type === 'shape') {
            content = ASSETS.elements.shape(elW, elH);
        }

        const isSelected = selectedId === el.id;
        const linkedOrder = el.tableId ? activeOrders.find(o => o.tableId === el.tableId) : null;
        const handleSz = 8 / zoom;
        const strokeW = 2 / zoom;

        return (
            <g
                key={el.id}
                transform={`translate(${elX}, ${elY}) rotate(${el.rotation}, ${elW / 2}, ${elH / 2})`}
                onMouseDown={(e) => handleMouseDown(e, el)}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: draggingId === el.id ? 'grabbing' : 'grab' }}
            >
                {linkedOrder && (
                    <circle
                        cx={elW / 2} cy={elH / 2}
                        r={Math.min(elW, elH) / 1.5}
                        className={`animate-pulse fill-none stroke-[4] ${
                            linkedOrder.status === 'created' ? 'stroke-blue-400' :
                            linkedOrder.status === 'ready' ? 'stroke-green-400' : 'stroke-amber-400'
                        }`}
                        strokeDasharray="4 2"
                    />
                )}
                {content}
                {el.label && (
                    <text
                        x={elW / 2} y={elH / 2}
                        dominantBaseline="middle" textAnchor="middle"
                        fontSize={Math.min(elW, elH) * 0.28}
                        className="select-none font-bold pointer-events-none"
                        fill="#1e293b"
                    >
                        {el.label}
                    </text>
                )}
                {isSelected && (
                    <>
                        <rect
                            x={-strokeW} y={-strokeW}
                            width={elW + strokeW * 2} height={elH + strokeW * 2}
                            fill="none" stroke="#2563eb" strokeWidth={strokeW}
                            strokeDasharray={`${4 / zoom},${2 / zoom}`}
                        />
                        {/* East handle */}
                        <rect
                            x={elW - handleSz / 2} y={elH / 2 - handleSz / 2}
                            width={handleSz} height={handleSz}
                            className="cursor-ew-resize hover:fill-blue-500 fill-white stroke-blue-600"
                            strokeWidth={strokeW}
                            onMouseDown={(e) => handleResizeStart(e, el, 'e')}
                        />
                        {/* South handle */}
                        <rect
                            x={elW / 2 - handleSz / 2} y={elH - handleSz / 2}
                            width={handleSz} height={handleSz}
                            className="cursor-ns-resize hover:fill-blue-500 fill-white stroke-blue-600"
                            strokeWidth={strokeW}
                            onMouseDown={(e) => handleResizeStart(e, el, 's')}
                        />
                        {/* West handle */}
                        <rect
                            x={-handleSz / 2} y={elH / 2 - handleSz / 2}
                            width={handleSz} height={handleSz}
                            className="cursor-ew-resize hover:fill-blue-500 fill-white stroke-blue-600"
                            strokeWidth={strokeW}
                            onMouseDown={(e) => handleResizeStart(e, el, 'w')}
                        />
                        {/* North handle */}
                        <rect
                            x={elW / 2 - handleSz / 2} y={-handleSz / 2}
                            width={handleSz} height={handleSz}
                            className="cursor-ns-resize hover:fill-blue-500 fill-white stroke-blue-600"
                            strokeWidth={strokeW}
                            onMouseDown={(e) => handleResizeStart(e, el, 'n')}
                        />
                        {/* Rotation handle */}
                        <line
                            x1={elW / 2} y1={0} x2={elW / 2} y2={-20 / zoom}
                            stroke="#2563eb" strokeWidth={strokeW}
                            strokeDasharray={`${2 / zoom},${2 / zoom}`}
                        />
                        <circle
                            cx={elW / 2} cy={-20 / zoom} r={6 / zoom}
                            className="cursor-alias fill-white stroke-blue-600 hover:fill-blue-500"
                            strokeWidth={strokeW}
                            onMouseDown={(e) => handleRotationStart(e, el)}
                        />
                    </>
                )}
            </g>
        );
    };

    // Calculate initial zoom to fit floor in container
    const fitZoom = Math.min(containerSize.width / canvasWidthPx, containerSize.height / canvasHeightPx) * 0.9;

    return (
        <div
            ref={containerRef}
            className={`w-full h-full overflow-hidden relative select-none ${isPanning ? 'cursor-grabbing' : ''}`}
            onContextMenu={(e) => e.preventDefault()}
        >
            <svg
                ref={svgRef}
                width={containerSize.width}
                height={containerSize.height}
                viewBox={`${pan.x} ${pan.y} ${viewW} ${viewH}`}
                className="block outline-none"
                onMouseDown={handleCanvasMouseDown}
            >
                <defs>
                    <pattern id="grid" width={layout.gridSize} height={layout.gridSize} patternUnits="userSpaceOnUse">
                        <path d={`M ${layout.gridSize} 0 L 0 0 0 ${layout.gridSize}`} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    </pattern>
                    <pattern id="majorGrid" width={layout.gridSize * 5} height={layout.gridSize * 5} patternUnits="userSpaceOnUse">
                        <path d={`M ${layout.gridSize * 5} 0 L 0 0 0 ${layout.gridSize * 5}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                    <clipPath id="floorClip">
                        <rect x="0" y="0" width={canvasWidthPx} height={canvasHeightPx} />
                    </clipPath>
                </defs>

                {/* World background (outside floor) */}
                <rect x={pan.x} y={pan.y} width={viewW} height={viewH} fill="#e8ecf0" />

                {/* Floor area */}
                <rect x="0" y="0" width={canvasWidthPx} height={canvasHeightPx} fill="white" stroke="#94a3b8" strokeWidth={2 / zoom} />

                {/* Grid constrained to floor */}
                <g clipPath="url(#floorClip)">
                    <rect width={canvasWidthPx} height={canvasHeightPx} fill="url(#grid)" />
                    <rect width={canvasWidthPx} height={canvasHeightPx} fill="url(#majorGrid)" />
                </g>

                {/* Scale marker */}
                <g
                    transform={`translate(${pan.x + viewW - 110 / zoom}, ${pan.y + viewH - 40 / zoom}) scale(${1 / zoom})`}
                    className="opacity-60 select-none pointer-events-none"
                >
                    <rect x="-5" y="-12" width={layout.pixelsPerMeter + 10} height="28" rx="4" fill="white" fillOpacity="0.85" />
                    <line x1="0" y1="0" x2={layout.pixelsPerMeter} y2="0" stroke="#475569" strokeWidth="2" />
                    <line x1="0" y1="-4" x2="0" y2="4" stroke="#475569" strokeWidth="2" />
                    <line x1={layout.pixelsPerMeter} y1="-4" x2={layout.pixelsPerMeter} y2="4" stroke="#475569" strokeWidth="2" />
                    <text x={layout.pixelsPerMeter / 2} y="13" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569">1m</text>
                </g>

                {sortedElements.map(renderElement)}
            </svg>

            {/* Fit-to-floor button hint */}
            <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 select-none pointer-events-none">
                Scroll to pan · Shift+Scroll or Ctrl+Scroll to zoom · Alt+Drag to pan
            </div>
        </div>
    );
};
