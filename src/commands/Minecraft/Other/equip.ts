import { CommandStore, KlasaMessage } from 'klasa';
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
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        const iName = itemName.trim().toLowerCase().replace(' ', '_');
        const item = inventory.tools.find(ex => ex[0] === iName);

        if (!item) throw msg.language.get('INVENTORY_ITEM_NOT_FOUND', iName);
        const sitem = this.client.minecraft.store[iName];
        const type = iName.split('_')[1] as ToolType;

        inventory.equipped[type] = iName;
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
            msg.sendEmbed(this.embed(msg)
                .setLocaleDescription('EQUIP_SUCCESS_DESCRIPTION', this.properName(iName), sitem)));
    }

}
