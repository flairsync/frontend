import React from 'react';

export const ASSETS = {
    tables: {
        circle: (size: number) => (
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
        ),
        square: (size: number) => (
            <rect x="2" y="2" width={size - 4} height={size - 4} rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
        ),
        rectangle: (w: number, h: number) => (
            <rect x="2" y="2" width={w - 4} height={h - 4} rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
        ),
    },
    architectural: {
        wall: (w: number, h: number) => (
            <rect width={w} height={h} fill="#475569" stroke="#1e293b" strokeWidth="1" />
        ),
        window: (w: number, h: number) => (
            <g>
                <rect width={w} height={h} fill="#bae6fd" stroke="#0ea5e9" strokeWidth="1" />
                <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="#f0f9ff" strokeWidth="2" />
                <rect width={w} height={h} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4,2" />
            </g>
        ),
    },
    decorations: {
        plant: (size: number) => (
            <g>
                <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                <path d={`M${size / 2} ${size / 2 - 6} L${size / 2 - 4} ${size / 2 + 4} M${size / 2} ${size / 2 - 6} L${size / 2 + 4} ${size / 2 + 4}`} stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
            </g>
        ),
        decor: (w: number, h: number) => (
            <rect width={w} height={h} rx="2" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
        )
    },
    signs: {
        wc: (size: number) => (
            <g>
                <rect width={size} height={size} rx="4" fill="#3b82f6" />
                <text x={size / 2} y={size / 2} dominantBaseline="middle" textAnchor="middle" fill="white" fontSize={size / 2.5} fontWeight="bold">WC</text>
            </g>
        ),
        exit: (size: number) => (
            <g>
                <rect width={size} height={size} rx="4" fill="#ef4444" />
                <text x={size / 2} y={size / 2} dominantBaseline="middle" textAnchor="middle" fill="white" fontSize={size / 3} fontWeight="bold">EXIT</text>
            </g>
        )
    }
};
