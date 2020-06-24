/** 
 * [Name of the tool,
 * Amount or Durability,
 * Enchants (if any)]
 * */
export type InventoryItem = [
    string,
    number,
    string?
];

export interface InventoryStorage extends Record<string, number> {
    enchantment_table: number;
    chest: number;
    furnace: number;
}

export default interface Inventory {
    equipped: {
        axe: string,
        sword: string,
        pickaxe: string,
        rod: string,
        hoe: string,
        boots: string,
        helmet: string,
        chestplate: string
    };

    tools: InventoryItem[];
    materials: InventoryItem[];
    enchants: InventoryItem[];
    potions: InventoryItem[];
    storage: InventoryStorage;
    trade: {
        user: string,
        confirmed: boolean,
        trade: any
    };
    crates: InventoryItem[];
    codes: any[];
    quests: {
        id: number,
        current: any
    };

    crops: InventoryItem[];
    farm: {
        planted: any[]
    };

    boosts: InventoryItem[];

    profile: {
        xp: number,
        level: number,
        dimension: string,
        health: number,
        luck: number,
        coins: number,
        name: string,
        created: number
    };
// eslint-disable-next-line semi
}

export const userSchema = {
    id: '',
    inventory: {
        equipped: {
            axe: 'wooden_axe',
            rod: '',
            sword: '',
            pickaxe: '',
            hoe: '',
            boots: '',
            helmet: '',
            chestplate: ''
        },

        tools: [
            ['wooden_axe', 50]
        ],
        materials: [],
        enchants: [],
        potions: [],

        trade: {
            confirmed: false,
            trade: {},
            user: ''
        },
        crates: [],
        codes: [],
        boosts: [],
        storage: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            enchantment_table: 0,
            chest: 0,
            furnace: 0
        },
        quests: {
            id: 0,
            current: {}
        },

        crops: [
            ['wheat', 2]
        ],

        farm: {
            planted: []
        },

        profile: {
            xp: 0,
            level: 1,
            dimension: 'Overworld',
            health: 100,
            speed: 1,
            luck: 0,
            coins: 0,
            created: 0,
            name: 'unknown'
        }
    } as Inventory
};

