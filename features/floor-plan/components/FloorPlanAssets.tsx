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
    elements: {
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
        door: (w: number, h: number) => (
            <g>
                <rect width={w} height={h} fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
                <path
                    d={`M${w * 0.1} ${h / 2} A${w * 0.8} ${w * 0.8} 0 0 1 ${w * 0.9} ${h / 2}`}
                    fill="none" stroke="#92400e" strokeWidth="1" strokeDasharray="3,2"
                />
            </g>
        ),
        pillar: (size: number) => (
            <g>
                <rect x="2" y="2" width={size - 4} height={size - 4} rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                <rect x={size * 0.25} y={size * 0.25} width={size * 0.5} height={size * 0.5} rx="2" fill="#64748b" />
            </g>
        ),
        bar: (w: number, h: number) => (
            <g>
                <rect width={w} height={h} rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
                <rect x="3" y="3" width={w - 6} height={h * 0.4} rx="2" fill="#92400e" />
            </g>
        ),
        stairs: (w: number, h: number) => (
            <g>
                <rect width={w} height={h} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                {[1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={h * i / 5} x2={w} y2={h * i / 5} stroke="#94a3b8" strokeWidth="1" />
                ))}
                <line x1={w * 0.3} y1="0" x2="0" y2={h} stroke="#64748b" strokeWidth="1" />
            </g>
        ),
        elevator: (size: number) => (
            <g>
                <rect x="2" y="2" width={size - 4} height={size - 4} rx="4" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="1.5" />
                <text x={size / 2} y={size * 0.42} dominantBaseline="middle" textAnchor="middle" fill="#3730a3" fontSize={size * 0.32} fontWeight="bold">▲</text>
                <text x={size / 2} y={size * 0.68} dominantBaseline="middle" textAnchor="middle" fill="#3730a3" fontSize={size * 0.32} fontWeight="bold">▼</text>
            </g>
        ),
        plant: (size: number) => (
            <g>
                <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="#22c55e" stroke="#15803d" strokeWidth="1" />
                <path d={`M${size / 2} ${size / 2 - 6} L${size / 2 - 4} ${size / 2 + 4} M${size / 2} ${size / 2 - 6} L${size / 2 + 4} ${size / 2 + 4}`} stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
            </g>
        ),
        wc: (size: number) => (
            <g>
                <rect width={size} height={size} rx="4" fill="#3b82f6" />
                <text x={size / 2} y={size / 2} dominantBaseline="middle" textAnchor="middle" fill="white" fontSize={size / 2.5} fontWeight="bold">WC</text>
            </g>
        ),
        label: (w: number, h: number) => (
            <rect width={w} height={h} rx="3" fill="rgba(255,255,255,0.6)" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,2" />
        ),
        shape: (w: number, h: number) => (
            <rect width={w} height={h} rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4,2" />
        ),
    },
};
