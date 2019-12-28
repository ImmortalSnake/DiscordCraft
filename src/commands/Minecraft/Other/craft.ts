import { CommandStore, KlasaMessage } from 'klasa';
import Inventory from '../../../lib/game/items/inventory';
import quests from '../../../lib/game/quests';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<item:...str>',
            examples: ['wooden pickaxe', 'stone axe']
        });
    }

    public async run(msg: KlasaMessage, [itemName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        const item = this.client.minecraft.search(itemName);
        if (!item[0]) throw msg.language.get('ITEM_NOT_FOUND', itemName);

        return this.craft(msg, [id, inventory], item);
    }

    private async craft(msg: KlasaMessage, [id, inventory]: [string, Inventory], [itemName, item, amount = 1]: [string, any, number?]): Promise<KlasaMessage | KlasaMessage[]> {
        if (!item.materials) throw msg.language.get('CRAFT_INVALID');
        if (item.type === 'tools' && inventory.tools.find(ex => ex[0] === itemName)) throw msg.language.get('CRAFT_TOOL_1');

        for (const mat of Object.keys(item.materials)) {
            const imat = inventory.materials.find(ex => ex[0] === mat);

            if (!imat || imat[1] < item.materials[mat] * amount) throw msg.language.get('MATERIAL_REQUIRED', item.materials[mat] * amount, this.properName(itemName));
            imat[1] -= item.materials[mat] * amount;
        }

        if (item.type === 'tools') inventory.tools.push([itemName, item.durability]);
        const quest = quests[inventory.quests.id];
        if (quest) quest.update(inventory, { action: 'craft', updated: [[itemName, amount]] });

        inventory.materials = inventory.materials.filter(it => it[1] > 0);
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setLocaleDescription('CRAFT_EMBED_DESCRIPTION', amount, this.properName(itemName), item)));
    }

}
