export type ApiElementType = 'wall' | 'wc' | 'plant' | 'pillar' | 'bar' | 'window' | 'door' | 'stairs' | 'elevator' | 'label' | 'shape';
export type DesignerItemType = 'table' | ApiElementType;

export interface Point {
    x: number;
    y: number;
}

export interface DesignerElement {
    id: string;
    apiId?: string;         // server-side element ID; absent for unsaved elements
    type: DesignerItemType;
    subType: string;        // table shape ('circle'|'square'|'rectangle'); 'default' for elements
    xMeters: number;
    yMeters: number;
    widthMeters: number;
    heightMeters: number;
    rotation: number;
    label?: string;
    tableId?: string;
    isLocked?: boolean;
    props?: Record<string, any>;
}

export interface FloorPlanLayout {
    id: string;
    name: string;
    elements: DesignerElement[];
    gridSize: number;
    pixelsPerMeter: number;
    widthMeters: number;
    heightMeters: number;
}
