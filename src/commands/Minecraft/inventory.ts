import { util, CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { MessageEmbed } from 'discord.js';
import Inventory from '../../lib/game/items/inventory';
import MinecraftCommand from '../../lib/base/MinecraftCommand';

export default class InventoryCommand extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['inv'],
            usage: '[materials|tools]'
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');

        return msg.send(this.display(msg.author!, inventory));
    }

    public display(user: KlasaUser, inventory: Inventory): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${user.username}'s Inventory`)
            .setColor('#5d97f5')
            .addField('Materials', this.ishow(inventory, 'materials'), true)
            .addField('Tools', this.ishow(inventory, 'tools'), true);
    }

    private ishow(inventory: Inventory, type: 'materials' | 'tools'): string {
        const tp = inventory[type];
        let mess = '**';

        for (const item of tp) {
            const { emote } = this.client.minecraft.store[item[0]];

            const stat = (type === 'tools' ? ` | Durability ` : `x`) + item[1];
            mess += `${util.toTitleCase(item[0].replace('_', ' '))}${emote} ${stat}\n`;
        }

        mess += '**';
        return mess;
    }

}
