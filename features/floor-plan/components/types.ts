export type DesignerItemType = 'table' | 'wall' | 'window' | 'object' | 'sign';

export interface Point {
    x: number;
    y: number;
}

export interface DesignerElement {
    id: string;
    type: DesignerItemType;
    subType: string;
    xMeters: number;
    yMeters: number;
    widthMeters: number;
    heightMeters: number;
    rotation: number;
    label?: string;
    isLocked?: boolean;
    props?: Record<string, any>;
}

export interface FloorPlanLayout {
    id: string;
    name: string;
    elements: DesignerElement[];
    gridSize: number; // in pixels
    pixelsPerMeter: number; // conversion factor
    widthMeters: number;
    heightMeters: number;
}
