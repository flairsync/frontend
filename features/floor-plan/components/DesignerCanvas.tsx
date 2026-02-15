import React, { useRef, useState, useEffect, useMemo } from 'react';
import { FloorPlanLayout, DesignerElement, Point } from "./types";
import { ASSETS } from "./FloorPlanAssets";

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
    const svgRef = useRef<SVGSVGElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [resizeDir, setResizeDir] = useState<ResizeDirection | null>(null);
    const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
    const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPos, setLastPanPos] = useState<Point>({ x: 0, y: 0 });
    const [isRotating, setIsRotating] = useState(false);

    const mToPx = (meters: number) => meters * layout.pixelsPerMeter;
    const pxToM = (px: number) => px / layout.pixelsPerMeter;

    const canvasWidthPx = mToPx(layout.widthMeters);
    const canvasHeightPx = mToPx(layout.heightMeters);

    const getMousePosition = (e: React.MouseEvent | MouseEvent): Point => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const CTM = svg.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };
        const invertedPoint = point.matrixTransform(CTM.inverse());
        return { x: invertedPoint.x, y: invertedPoint.y };
    };

    const getLocalMousePosition = (e: React.MouseEvent | MouseEvent, el: DesignerElement): Point => {
        const pos = getMousePosition(e);
        const elX = mToPx(el.xMeters);
        const elY = mToPx(el.yMeters);
        const elW = mToPx(el.widthMeters);
        const elH = mToPx(el.heightMeters);

        let x = pos.x - elX;
        let y = pos.y - elY;

        const cx = elW / 2;
        const cy = elH / 2;
        const rad = -el.rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const rx = x - cx;
        const ry = y - cy;

        return {
            x: rx * cos - ry * sin + cx,
            y: rx * sin + ry * cos + cy
        };
    };

    const snapToGrid = (coordPx: number) => {
        return Math.round(coordPx / layout.gridSize) * layout.gridSize;
    };

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

            // Constrain dragging within floor bounds
            const el = layout.elements.find(i => i.id === draggingId);
            if (!el) return;

            const newXPx = snapToGrid(pos.x - dragOffset.x);
            const newYPx = snapToGrid(pos.y - dragOffset.y);

            // Clamping
            const minXPx = 0;
            const minYPx = 0;
            const maxXPx = canvasWidthPx - mToPx(el.widthMeters);
            const maxYPx = canvasHeightPx - mToPx(el.heightMeters);

            onUpdateItem(draggingId, {
                xMeters: pxToM(Math.max(minXPx, Math.min(maxXPx, newXPx))),
                yMeters: pxToM(Math.max(minYPx, Math.min(maxYPx, newYPx)))
            });
        } else if (resizingId && resizeDir) {
            const el = layout.elements.find(i => i.id === resizingId);
            if (!el) return;
            const localPos = getLocalMousePosition(e, el);

            const updates: Partial<DesignerElement> = {};
            const minSizeM = pxToM(layout.gridSize);
            const gridSizeM = pxToM(layout.gridSize);

            if (resizeDir.includes('e')) {
                const newWidthPx = snapToGrid(localPos.x);
                const maxAllowedWidthPx = canvasWidthPx - mToPx(el.xMeters); // Simple approximation for now
                updates.widthMeters = Math.max(gridSizeM, pxToM(newWidthPx));
            }
            if (resizeDir.includes('s')) {
                const newHeightPx = snapToGrid(localPos.y);
                updates.heightMeters = Math.max(gridSizeM, pxToM(newHeightPx));
            }
            if (resizeDir.includes('w')) {
                const diffPx = snapToGrid(localPos.x);
                const newWidthM = Math.max(gridSizeM, el.widthMeters - pxToM(diffPx));
                const widthChangeM = el.widthMeters - newWidthM;

                const rad = el.rotation * Math.PI / 180;
                updates.widthMeters = newWidthM;
                updates.xMeters = el.xMeters + widthChangeM * Math.cos(rad);
                updates.yMeters = el.yMeters + widthChangeM * Math.sin(rad);
            }
            if (resizeDir.includes('n')) {
                const diffPx = snapToGrid(localPos.y);
                const newHeightM = Math.max(gridSizeM, el.heightMeters - pxToM(diffPx));
                const heightChangeM = el.heightMeters - newHeightM;

                const rad = (el.rotation + 90) * Math.PI / 180;
                updates.heightMeters = newHeightM;
                updates.xMeters = (updates.xMeters ?? el.xMeters) + heightChangeM * Math.cos(rad);
                updates.yMeters = (updates.yMeters ?? el.yMeters) + heightChangeM * Math.sin(rad);
            }

            onUpdateItem(resizingId, updates);
        } else if (isRotating && selectedId) {
            const el = layout.elements.find(i => i.id === selectedId);
            if (!el) return;
            const pos = getMousePosition(e);

            const centerX = mToPx(el.xMeters) + mToPx(el.widthMeters) / 2;
            const centerY = mToPx(el.yMeters) + mToPx(el.heightMeters) / 2;

            const dx = pos.x - centerX;
            const dy = pos.y - centerY;

            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            angle = (angle + 90 + 360) % 360;

            if (e.shiftKey) {
                angle = Math.round(angle / 15) * 15;
            } else {
                angle = Math.round(angle);
            }

            onUpdateItem(selectedId, { rotation: angle });
        } else if (isPanning) {
            const svg = svgRef.current;
            if (!svg) return;
            const CTM = svg.getScreenCTM();
            if (!CTM) return;

            // Move in screen space then convert to SVG space deltas
            const dx = (e.clientX - lastPanPos.x) / CTM.a;
            const dy = (e.clientY - lastPanPos.y) / CTM.d;

            setPan(prev => ({ x: prev.x - dx, y: prev.y - dy }));
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
        if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle click or Alt+Left Click
            e.preventDefault();
            setIsPanning(true);
            setLastPanPos({ x: e.clientX, y: e.clientY });
        } else if (e.button === 0) {
            onSelect(null);
        }
    };

    const handleWheel = (e: WheelEvent) => {
        if (e.shiftKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            onZoomChange(Math.max(0.1, Math.min(5, zoom + delta)));
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
        const svg = svgRef.current;
        if (svg) {
            svg.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (svg) svg.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, onZoomChange]);

    const sortedElements = useMemo(() => {
        const order = { wall: 1, window: 2, table: 3, object: 4, sign: 5 };
        return [...layout.elements].sort((a, b) => (order[a.type] || 0) - (order[b.type] || 0));
    }, [layout.elements]);

    const renderElement = (el: DesignerElement) => {
        const elX = mToPx(el.xMeters);
        const elY = mToPx(el.yMeters);
        const elW = mToPx(el.widthMeters);
        const elH = mToPx(el.heightMeters);

        let content;
        const sub = el.subType;
        if (el.type === 'table') {
            if (sub === 'circle') content = ASSETS.tables.circle(elW);
            else if (sub === 'square') content = ASSETS.tables.square(elW);
            else content = ASSETS.tables.rectangle(elW, elH);
        } else if (el.type === 'wall') {
            content = ASSETS.architectural.wall(elW, elH);
        } else if (el.type === 'window') {
            content = ASSETS.architectural.window(elW, elH);
        } else if (el.type === 'object') {
            if (sub === 'plant') content = ASSETS.decorations.plant(elW);
            else content = ASSETS.decorations.decor(elW, elH);
        } else if (el.type === 'sign') {
            if (sub === 'wc') content = ASSETS.signs.wc(elW);
            else content = ASSETS.signs.exit(elW);
        }

        const isSelected = selectedId === el.id;

        return (
            <g
                key={el.id}
                transform={`translate(${elX}, ${elY}) rotate(${el.rotation}, ${elW / 2}, ${elH / 2})`}
                onMouseDown={(e) => handleMouseDown(e, el)}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: draggingId === el.id ? 'grabbing' : 'grab' }}
            >
                {content}
                {el.label && (
                    <text
                        x={elW / 2}
                        y={elH / 2}
                        dominantBaseline="middle"
                        textAnchor="middle"
                        className="text-[10px] select-none font-bold pointer-events-none"
                        fill="#1e293b"
                    >
                        {el.label}
                    </text>
                )}
                {isSelected && (
                    <>
                        <rect
                            x="-2" y="-2" width={elW + 4} height={elH + 4}
                            fill="none" stroke="#2563eb" strokeWidth={2 / zoom} strokeDasharray={`${4 / zoom},${2 / zoom}`}
                        />
                        <rect
                            x={elW - (4 / zoom)} y={elH / 2 - (4 / zoom)} width={8 / zoom} height={8 / zoom}
                            className="cursor-ew-resize hover:fill-blue-500 fill-white stroke-blue-600 shadow-sm"
                            onMouseDown={(e) => handleResizeStart(e, el, 'e')}
                        />
                        <rect
                            x={elW / 2 - (4 / zoom)} y={elH - (4 / zoom)} width={8 / zoom} height={8 / zoom}
                            className="cursor-ns-resize hover:fill-blue-500 fill-white stroke-blue-600 shadow-sm"
                            onMouseDown={(e) => handleResizeStart(e, el, 's')}
                        />
                        <rect
                            x={-(4 / zoom)} y={elH / 2 - (4 / zoom)} width={8 / zoom} height={8 / zoom}
                            className="cursor-ew-resize hover:fill-blue-500 fill-white stroke-blue-600 shadow-sm"
                            onMouseDown={(e) => handleResizeStart(e, el, 'w')}
                        />
                        <rect
                            x={elW / 2 - (4 / zoom)} y={-(4 / zoom)} width={8 / zoom} height={8 / zoom}
                            className="cursor-ns-resize hover:fill-blue-500 fill-white stroke-blue-600 shadow-sm"
                            onMouseDown={(e) => handleResizeStart(e, el, 'n')}
                        />
                        {/* Rotation Handle */}
                        <line
                            x1={elW / 2} y1="0" x2={elW / 2} y2={-20 / zoom}
                            stroke="#2563eb" strokeWidth={1 / zoom} strokeDasharray={`${2 / zoom},${2 / zoom}`}
                        />
                        <circle
                            cx={elW / 2} cy={-20 / zoom} r={6 / zoom}
                            className="cursor-alias fill-white stroke-blue-600 hover:fill-blue-500 shadow-md"
                            onMouseDown={(e) => handleRotationStart(e, el)}
                        />
                    </>
                )}
            </g>
        );
    };

    return (
        <svg
            ref={svgRef}
            width={canvasWidthPx}
            height={canvasHeightPx}
            viewBox={`${pan.x} ${pan.y} ${canvasWidthPx / zoom} ${canvasHeightPx / zoom}`}
            className={`bg-white shadow-2xl border-4 border-slate-300 rounded-lg block transition-all duration-75 outline-none max-w-none ${isPanning ? 'cursor-grabbing' : ''}`}
            onMouseDown={handleCanvasMouseDown}
            onContextMenu={(e) => e.preventDefault()}
        >
            <defs>
                <pattern id="grid" width={layout.gridSize} height={layout.gridSize} patternUnits="userSpaceOnUse">
                    <path d={`M ${layout.gridSize} 0 L 0 0 0 ${layout.gridSize}`} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
                <pattern id="majorGrid" width={layout.gridSize * 5} height={layout.gridSize * 5} patternUnits="userSpaceOnUse">
                    <path d={`M ${layout.gridSize * 5} 0 L 0 0 0 ${layout.gridSize * 5}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
            </defs>

            {/* World background */}
            <rect x={pan.x} y={pan.y} width={canvasWidthPx / zoom} height={canvasHeightPx / zoom} fill="#f8fafc" />

            {/* The Floor Area */}
            <rect
                x="0" y="0"
                width={canvasWidthPx} height={canvasHeightPx}
                fill="white"
                stroke="#cbd5e1" strokeWidth={4 / zoom}
            />

            {/* Grid constrained to floor */}
            <rect width={canvasWidthPx} height={canvasHeightPx} fill="url(#grid)" />
            <rect width={canvasWidthPx} height={canvasHeightPx} fill="url(#majorGrid)" />

            {/* Scale Marker - Fixed size and bottom-right position */}
            <g
                transform={`translate(${pan.x + (canvasWidthPx / zoom) - (120 / zoom)}, ${pan.y + (canvasHeightPx / zoom) - (50 / zoom)}) scale(${1 / zoom})`}
                className="opacity-60 select-none pointer-events-none"
            >
                <rect x="-5" y="-15" width={layout.pixelsPerMeter + 10} height="35" rx="4" fill="white" fillOpacity="0.8" />
                <line x1="0" y1="0" x2={layout.pixelsPerMeter} y2="0" stroke="black" strokeWidth="2" />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="black" strokeWidth="2" />
                <line x1={layout.pixelsPerMeter} y1="-5" x2={layout.pixelsPerMeter} y2="5" stroke="black" strokeWidth="2" />
                <text x={layout.pixelsPerMeter / 2} y="15" textAnchor="middle" className="text-[10px] font-extrabold tracking-tight">1m</text>
            </g>

            {sortedElements.map(renderElement)}
        </svg>
    );
};
