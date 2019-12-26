import { CommandStore, KlasaMessage, util } from 'klasa';
import MinecraftCommand, { ToolType } from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<item:...str>',
            examples: ['stone axe', 'wooden pickaxe']
        });
    }

    public async run(msg: KlasaMessage, [itemName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');

        itemName = itemName.trim().toLowerCase().replace(' ', '_');
        const item = inventory.tools.find(ex => ex[0] === itemName);

        if (!item) return msg.send('Could not find that item in your inventory!');
        const sitem = this.client.minecraft.store[itemName];
        const type = itemName.split('_')[1] as ToolType;

        inventory.equipped[type] = itemName;
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
            msg.sendEmbed(this.embed(msg)
                .setDescription(`Successfully equipped ${util.toTitleCase(itemName.replace('_', ' '))} ${sitem.emote}!`)));
    }

}
