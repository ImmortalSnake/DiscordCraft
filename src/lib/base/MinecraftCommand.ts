/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Command, CommandStore, CommandOptions, KlasaMessage, RateLimit, RateLimitManager } from 'klasa';
import DiscordCraft from '../client';
import Inventory, { InventoryItem } from '../game/items/inventory';
import util from '../../utils/util';
import { MessageEmbed } from 'discord.js';
import { Tool } from '../game/items/tool';

export type ToolType = 'hoe' | 'axe' | 'pickaxe' | 'rod';
type verifyResult = [string, Inventory, string, InventoryItem];

interface MinecraftCommandOptions extends CommandOptions {
    usageString?: string;
}

export default class extends Command {

    public client: DiscordCraft;
    public cooldowns: RateLimitManager;
    public usageStr: string;

    public constructor(store: CommandStore, file: string[], directory: string, options = {} as MinecraftCommandOptions) {
        if (!options.extendedHelp) options.extendedHelp = (language) => language.get(`COMMAND_${this.name.toUpperCase()}_EXTENDED`);
        if (!options.description) options.description = (language) => language.get(`COMMAND_${this.name.toUpperCase()}_DESCRIPTION`);

        super(store, file, directory, options);

        // Define client as DiscordCraft
        this.client = store.client as DiscordCraft;

        // For custom usage strings
        this.usageStr = options.usageString || this.usageString;

        // For custom cooldowns
        this.cooldowns = new RateLimitManager(options.bucket || 0, (options.cooldown || 0) * 1000);
    }

    public fullUsage(msg: KlasaMessage): string {
        const prefix = msg.guildSettings.get('prefix') || (Array.isArray(this.client.options.prefix) ? this.client.options.prefix[0] : this.client.options.prefix);
        return `${prefix}${this.name} ${this.usageStr}`;
    }

    public itemName(item: string) {
        return util.toTitleCase(item.replace('_', ' '));
    }

    protected embed(msg: KlasaMessage): MessageEmbed {
        return new MessageEmbed()
            .setColor(msg.member ? msg.member.displayHexColor : '#5d97f5')
            .setTitle(util.toTitleCase(this.name))
            .setFooter(`Requested by ${msg.author!.tag}`);
    }

    protected async verify(msg: KlasaMessage, type: ToolType): Promise<verifyResult> {
        const prefix = msg.guildSettings.get('prefix');
        const { inventory, id } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', prefix);

        const etool = inventory.equipped[type];
        const itool = inventory.tools.find(ex => ex[0] === etool);
        if (!etool || !itool) throw msg.language.get('TOOL_NOT_FOUND', type, prefix);

        if (itool[1] <= 0) throw msg.language.get('BROKEN_TOOL', type, prefix);
        return [id, inventory, etool, itool];
    }

    protected dropRewards(inventory: Inventory, itool: InventoryItem, tool?: any): [string, any[]] {
        if (!tool) tool = this.client.minecraft.store[itool[0]];
        const updated = [];
        let mess = '';

        for (const mat of Object.keys(tool.drops)) {
            if (Math.random() * 100 <= tool.drops[mat][2]) {
                let drop = Math.floor(Math.random() * tool.drops[mat][0]) + tool.drops[mat][1] as number;
                const item = this.client.minecraft.store[mat] as Tool;

                // handle fortune enchantments
                if (itool[2] && !itool[2].startsWith('fortune')) {
                    const lvl = parseInt(itool[2].split('-')[1]);
                    if (Math.random() <= 1 / (2 + lvl)) drop *= 2 + Math.floor(Math.random() * lvl);
                }

                updated.push([mat, drop]);
                if (mat === 'coins') { inventory.profile.coins += drop; } else {
                    const imat = inventory.materials.find(ex => ex[0] === mat);
                    imat ? imat[1] += drop : inventory.materials.push([mat, drop]);
                }

                mess += `\n${item ? item.emote : ''} **${drop} ${util.toTitleCase(mat)}**`;
            }
        }

        return [mess, updated];
    }

    protected reduceDurability(itool: InventoryItem) {
        // eslint-disable-next-line no-return-assign
        if (!itool[2] || !itool[2].startsWith('unbreaking')) return itool[1] -= 1;

        const lvl = parseInt(itool[2].split('-')[1]);
        if (Math.random() < 1 / (lvl + 1)) itool[1] -= 1;

        return itool;
    }

    protected addXP(msg: KlasaMessage, inventory: Inventory, etool: string) {
        const tool = this.client.minecraft.toolStore[etool];
        const potion = inventory.potions.find(px => px[0] === 'xp_boost');
        let drop = Math.floor(Math.random() * tool.xp[0]) + tool.xp[1] as number;

        if (potion) drop *= 2;
        inventory.profile.xp += drop;

        const lvlup = this.client.minecraft.updateLevel(inventory);
        if (lvlup) {
            msg.send(new MessageEmbed()
                .setColor('#5d97f5')
                .setTitle(`Level UP!`)
                .setDescription(`${msg.author!.toString()}, You have levelled up to: \`Level ${inventory.profile.level}\`
                You got: \`${25 * (inventory.profile.level - 1)} coins\``));
        }
    }

    /**
     * Sets a custom cooldown for the command in order to be able to change it accordingly for potions and enchants
     * @protected
     */
    protected setCooldown(user: { id: string, inventory: Inventory }, cooldown: number, itool: [string, number, string?]): void {
        if (itool[2] && itool[2].startsWith('efficiency')) {
            const lvl = parseInt(itool[2].split('-')[1]);
            // 95% - 75%
            cooldown *= (100 - (lvl * 5)) / 100;
        }

        const haste = user.inventory.boosts.find(ex => ex[0].startsWith('haste'));
        if (haste) {
            const lvl = parseInt(haste[0].split('-')[1]);
            // 90%, 75%, 50%
            cooldown *= ((100 - ((lvl ** 2) + 1)) * 5) / 100;
        }

        if (!this.client.owners.has(this.client.users.get(user.id)!)) {
            (this.cooldowns.get(user.id) || this.cooldowns.set(user.id, new RateLimit(1, cooldown)).get(user.id)!).drip();
        }
    }

}
