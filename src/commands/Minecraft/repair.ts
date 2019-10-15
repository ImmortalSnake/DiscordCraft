import { CommandStore, KlasaMessage, util } from 'klasa';
import { MessageEmbed } from 'discord.js';
import MinecraftCommand from '../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<tool:...str>'
        });
    }

    public async run(msg: KlasaMessage, [itemName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');

        itemName = itemName.trim().toLowerCase().replace(' ', '_');
        const xitem = inventory.tools.find(ex => ex[0] === itemName);
        if (!xitem) return msg.send('Could not find the item in your inventory');

        const item = this.client.minecraft.store[xitem[0]];
        for (const mat of Object.keys(item.repair)) {
            const imat = inventory.materials.find(ex => ex[0] === mat);

            if (!imat || imat[1] < item.repair[mat]) return msg.send(`You need ${item.repair[mat]} ${mat} to repair this item!`);
            imat[1] -= item.repair[mat];
        }

        xitem[1] = item.durability;
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(new MessageEmbed()
            .setTitle('Repair')
            .setColor('#5d97f5')
            .setDescription(`You have successfully repaired your **${util.toTitleCase(itemName.replace('_', ' '))} ${item.emote}**`)));
    }

}
