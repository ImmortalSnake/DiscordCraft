import { KlasaMessage, CommandStore, RichDisplay, KlasaUser } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import { MessageEmbed } from 'discord.js';
import Shop from '../../../../assets/game/shop.json';
import util from '../../../utils/util';
import { Tool } from '../../../lib/game/items/tool';

const time = 1000 * 60 * 3;
const categories = ['enchants', 'potions', 'storage', 'crops', 'crates'];
type ShopCategory = 'enchants' | 'potions' | 'storage' | 'crops' | 'crates';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: `[${categories.join('|')}] [item:number] [amount:number]`
        });
    }

    public async run(msg: KlasaMessage, [category, itemno, amount = 1]: [ShopCategory, number, number]): Promise<KlasaMessage | KlasaMessage[] | null> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        const prefix = msg.guildSettings.get('prefix') as string;
        if (!category) {
            return msg.send(this.embed(msg)
                .setLocaleDescription('SHOP_CATEGORY_DESCRIPTION', prefix, this.name, categories.map(ex => `\n\`${prefix}${this.name} ${ex}\``).join('\n')));
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
        if (!item) throw msg.language.get('SHOP_NO_ITEM', itemno);

        for (const mat in item.price) {
            if (mat === 'coin') {
                if (inventory.profile.coins < (item.price as any)[mat] * amount) throw msg.language.get('MATERIAL_REQUIRED', (item.price as any)[mat] * amount, 'coins');
                inventory.profile.coins -= (item.price as any)[mat] * amount;
            } else {
                const imat = inventory.materials.find(ex => ex[0] === mat);
                if (!imat || imat[1] < (item.price as any)[mat] * amount) throw msg.language.get('MATERIAL_REQUIRED', (item.price as any)[mat] * amount, this.properName(mat));

                imat[1] -= (item.price as any)[mat] * amount;
            }
        }

        if (category === 'storage') {
            inventory.storage[item.name] += amount;
        } else {
            const xitem = inventory[category].find(ex => ex[0] === item.name);
            // eslint-disable-next-line no-unused-expressions
            xitem ? xitem[1] += amount : inventory[category].push([item.name, amount]);
        }

        inventory.materials = inventory.materials.filter(it => it[1] > 0);
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setTitle('Shop Purchase')
            .setLocaleDescription('SHOP_PURCHASE_DESCRIPTION', amount, this.properName(item.name))));
    }

    public buildDisplay(msg: KlasaMessage, [catname, category]: [string, any[]], prefix: string): RichDisplay {
        const text = msg.language.get('SHOP_DISPLAY_TITLE', prefix, this.name, catname);
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
