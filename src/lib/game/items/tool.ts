type materialType = 'wood' | 'stone' | 'coal' | 'iron' | 'redstone' | 'gold' | 'diamond'

export interface Item {
    emote: string;
    type: string;
}

export interface Tool extends Item {
    durability: number;
    enchants: string[];
    materials: Record<materialType, number>;
}
