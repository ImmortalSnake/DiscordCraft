import { CommandStore, KlasaMessage, util } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<tool:...str>'
        });
    }

    public async run(msg: KlasaMessage, [iName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        const itemName = iName.trim().toLowerCase().replace(' ', '_');
        const xitem = inventory.tools.find(ex => ex[0] === itemName);
        if (!xitem) throw msg.language.get('INVENTORY_ITEM_NOT_FOUND', iName);

        const item = this.client.minecraft.toolStore[xitem[0]];
        for (const mat of Object.keys(item.repair)) {
            const imat = inventory.materials.find(ex => ex[0] === mat);

            if (!imat || imat[1] < item.repair[mat]) return msg.send(`You need ${item.repair[mat]} ${mat} to repair this item!`);
            imat[1] -= item.repair[mat];
        }

        xitem[1] = item.durability;
        inventory.materials = inventory.materials.filter(it => it[1] > 0);
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setDescription(`You have successfully repaired your **${util.toTitleCase(itemName.replace('_', ' '))} ${item.emote}**`)));
    }

}
