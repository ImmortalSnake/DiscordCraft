export type materialType = 'wood' | 'stone' | 'coal' | 'iron' | 'redstone' | 'gold' | 'diamond'

export interface Item {
    emote: string;
    type: string;
}

export interface Tool extends Item {
    durability: number;
    enchants: string[];
    xp: [number, number, number];
    materials: Record<materialType, number>;
    repair: Record<materialType | string, number>;
}
