import Inventory from './items/inventory';
import { KlasaMessage } from 'klasa';

interface QuestUpdate {
    action: string;
    updated: any[];
}

interface QuestConstructor {
    title: string;
    xp: number;
    coins: number;
    rewards: Record<string, number>;
    description(msg: KlasaMessage): string;
    start(inventory: Inventory): void;
    checkCompleted(inventory: Inventory): boolean;
    update(inventory: Inventory, data: QuestUpdate): Inventory;
}


const quest1: QuestConstructor = class Quest1 {

    static title = 'Getting Started!';
    static description = ({ guildSettings }: KlasaMessage) => `Chop your first wood!\nUse the \`${guildSettings.get('prefix')}chop\` command`

    static xp = 5;
    static coins = 25;
    static rewards = { wood: 5 };

    public static start(inventory: Inventory) {
        inventory.quests.current = { chopped: 0 };
    }

    public static checkCompleted(inventory: Inventory) {
        const { chopped } = inventory.quests.current;
        return chopped && chopped >= 1;
    }

    public static update(inventory: Inventory, { action }: QuestUpdate) {
        if (action === 'chop') inventory.quests.current.chopped += 1;
        return inventory;
    }

};

const quest2: QuestConstructor = class Quest2 {

    static title = 'Crafting First Tool!';
    static description = ({ guildSettings }: KlasaMessage) =>
        `In this bot you can craft many tools using the craft command!
     To craft a tool use \`${guildSettings.get('prefix')}craft <toolname>\`

     Get enough wood by using the chop command and then craft your first pickaxe using \`${guildSettings.get('prefix')}craft wooden pickaxe\``

    static xp = 10;
    static coins = 50;
    static rewards = { wood: 10 };

    public static start(inventory: Inventory) {
        inventory.quests.current = { crafted: 0 };
    }

    public static checkCompleted(inventory: Inventory): boolean {
        const { crafted } = inventory.quests.current;
        return crafted && crafted >= 1;
    }

    public static update(inventory: Inventory, { action }: QuestUpdate): Inventory {
        if (action === 'craft') inventory.quests.current.crafted += 1;
        return inventory;
    }

};


const quest3: QuestConstructor = class Quest3 {

    static title = 'Stone Age'
    static description = ({ guildSettings }: KlasaMessage) =>
        `Crafted a pickaxe? Great! Now you can mine stone, use \`${guildSettings.get('prefix')}mine\`
        
        stone tools are better and stronger than wooden tools. So get enough stone to get your first stone tool!`

    static xp = 25;
    static coins = 100;
    static rewards = { wood: 25, stone: 10 };

    public static start(inventory: Inventory) {
        inventory.quests.current = { chopped: 0 };
    }

    public static checkCompleted(inventory: Inventory): boolean {
        const { crafted } = inventory.quests.current;
        return crafted && crafted >= 1;
    }

    public static update(inventory: Inventory, { action, updated }: QuestUpdate): Inventory {
        if (action === 'craft' && updated[0][0].includes('stone')) inventory.quests.current.crafted += 1;
        return inventory;
    }

};

export default [
    quest1,
    quest2,
    quest3
];
