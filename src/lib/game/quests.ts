/* eslint-disable @typescript-eslint/explicit-function-return-type */
import Inventory from './items/inventory';
import { KlasaMessage } from 'klasa';

interface QuestUpdate {
    action: string;
    updated: any[];
}

export default [
    class Quest1 {

        static title = 'Getting Started!';
        static description = ({ guildSettings }: KlasaMessage) =>
            `Chop your first wood!
        Use the \`${(guildSettings as any).prefix}chop\` command`

        static xp = 5;
        static coins = 25;
        static rewards = {
            wood: 5
        };

        public static start(inventory: Inventory) {
            inventory.quests.current = {
                chopped: 0
            };
        }

        public static checkCompleted(inventory: Inventory) {
            const { chopped } = inventory.quests.current;
            return chopped && chopped >= 1;
        }

        public static update(inventory: Inventory, { action }: QuestUpdate) {
            if (action === 'chop') inventory.quests.current.chopped += 1;
            return inventory;
        }

    },
    class Quest2 {

        static title = 'Crafting First Tool!';
        static description = ({ guildSettings }: KlasaMessage) =>
            `In this bot you can craft many tools using the craft command!
         To craft a tool use \`${(guildSettings as any).prefix}craft <toolname>\`

         Get enough wood by using the chop command and then craft your first pickaxe using \`${(guildSettings as any).prefix}craft wooden_pickaxe\``

        static xp = 10;
        static coins = 50;
        static rewards = {
            wood: 10
        };

        public static start(inventory: Inventory) {
            inventory.quests.current = {
                crafted: 0
            };
        }

        public static checkCompleted(inventory: Inventory): boolean {
            const { crafted } = inventory.quests.current;
            return crafted && crafted >= 1;
        }

        public static update(inventory: Inventory, { action }: QuestUpdate): Inventory {
            if (action === 'craft') inventory.quests.current.crafted += 1;
            return inventory;
        }

    }
];
