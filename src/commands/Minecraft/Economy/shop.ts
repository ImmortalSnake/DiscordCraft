import { KlasaMessage, CommandStore, RichDisplay, KlasaUser } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import { MessageEmbed } from 'discord.js';
import Shop from '../../../../assets/game/shop.json';
import util from '../../../utils/util';
import { Tool } from '../../../lib/game/items/tool';

const time = 1000 * 60 * 3;
type ShopCategory = 'enchants' | 'potions' | 'storage' | 'crops';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '[enchants|potions|storage|crops|crates] [item:number] [amount:number]'
        });
    }

    public async run(msg: KlasaMessage, [category, itemno, amount = 1]: [ShopCategory, number, number]): Promise<KlasaMessage | KlasaMessage[] | null> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');

        const prefix = msg.guildSettings.get('prefix') as string;
        if (!category) {
            return msg.send(new MessageEmbed()
                .setTitle('Shop')
                .setColor('#5d97f5')
                .setDescription(`Use \`${prefix}${this.name} <category>\` to see all the items in it!
            \n**Categories**:
            ${['enchants', 'potions', 'storage', 'crops', 'crates'].map(ex => `\n\`${prefix}${this.name} ${ex}\``).join('\n')}`));
        }

        const shop = Shop[category];
        if (!itemno) {
            await this.buildDisplay(msg, [category, shop], prefix).run(await msg.send('Loading shop...') as KlasaMessage, {
                filter: (__, user: KlasaUser) => user.id === msg.author!.id,
                time
            });

            return null;
        }

        const item = shop[itemno - 1];
        if (!item) return msg.send('There is no item in this category with that id');

        for (const mat in item.price) {
            if (mat === 'coin') {
                if (inventory.profile.coins < (item.price as any)[mat] * amount) return msg.send('You do not have enough coins!');
                inventory.profile.coins -= (item.price as any)[mat] * amount;
            } else {
                const imat = inventory.materials.find(ex => ex[0] === mat);
                if (!imat || imat[1] < (item.price as any)[mat] * amount) return msg.send('You do not have enough materials!');

                imat[1] -= (item.price as any)[mat] * amount;
            }
        }

        if (category === 'storage') { inventory.storage[item.name] = true; } else {
            const xitem = inventory[category].find(ex => ex[0] === item.name);
            // eslint-disable-next-line no-unused-expressions
            xitem ? xitem[1] += amount : inventory[category].push([item.name, amount]);
        }

        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setTitle('Shop Purchase')
            .setDescription(`You have successfully purchased **${amount} ${util.toTitleCase(item.name.replace('_', ' '))}**!`)));
    }

    public buildDisplay(msg: KlasaMessage, [catname, category]: [string, any[]], prefix: string): RichDisplay {
        const text = `Use \`${prefix}${this.name} ${catname} <item_number> [amount]\` to buy an item!\n\n`;
        const display = new RichDisplay(this.embed(msg)
            .setTitle(`${util.toTitleCase(catname)} Shop`));

        for (let i = 0; i < category.length; i += 5) {
            display.addPage((template: MessageEmbed) => template
                // eslint-disable-next-line max-len
                .setDescription(text + category.slice(i, ((i / 5) + 1) * 5).map((ex, ik) => `**${ik + i + 1}] ${util.toTitleCase(ex.name.replace('_', ' '))}** ${ex.description ? `- ${ex.description}` : ''}\n**Price: ${this.displayPrice(ex).join(', ')}**\n`).join('\n')));
        }

        return display;
    }

    private displayPrice(item: any): string[] {
        const mess = [];

        for (const mat in item.price) {
            const it = this.client.minecraft.store[mat] as Tool;
            mess.push(`${util.toTitleCase(mat)}${it ? it.emote : ''} x${item.price[mat]}`);
        }

        return mess;
    }

}
