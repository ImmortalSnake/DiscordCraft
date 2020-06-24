import { CommandStore, KlasaMessage, util } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<item:...str>',
            requiredPermissions: ['EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
            examples: ['diamond pickaxe']
        });
    }

    public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const [itemName, item] = this.client.minecraft.search(query);
        if (!itemName) throw msg.language.get('ITEM_NOT_FOUND', query);

        const embed = this.embed(msg)
            .setDescription(`**${util.toTitleCase(itemName.replace('_', ' '))} ${item.emote} Stats**`);

        if (this.stats(item)) embed.addField('General Stats', this.stats(item));
        if (item.materials) embed.addField('Materials Required', this.getStat(item.materials), true);
        if (item.drops) embed.addField('Drops', this.getStat(item.drops), true);
        if (item.repair) embed.addField('Repair', this.getStat(item.repair), true);
        if (item.recipe) embed.addField('Recipe', this.getStat(item.recipe), true);

        return msg.send(embed);
    }

    private getStat(val: any): string {
        let mess = '**';
        for (const i of Object.keys(val)) {
            const emote = this.client.minecraft.store[i].emote || '';
            let amt = `x${val[i]}`;
            if (Array.isArray(val[i])) amt = `${val[i][0] || 1} - ${val[i][1] || 1} | ${val[i][2]}%`;

            mess += `${util.toTitleCase(i)} ${emote} ${amt}\n`;
        }

        mess += '**';
        return mess;
    }

    private stats(item: any): string {
        let mess = '';

        if (item.price) mess += `**Price:** ${item.price}\n`;
        if (item.durability) mess += `**Durability:** ${item.durability}\n`;
        if (item.dmg) mess += `**Damage** ${item.dmg}\n`;
        if (item.speed) mess += `**Speed** ${item.speed}\n`;
        if (item.energy) mess += `**Energy** ${item.energy}\n`;
        if (item.critical) mess += `**Critical Damage** ${item.critical}\n`;
        if (item.health) mess += `**Health** ${item.health}\n`;

        return mess;
    }

}
