import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<item:...str>'
        });
    }

    public async run(msg: KlasaMessage, [itemName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        const [name, item] = this.client.minecraft.search(itemName);
        const xitem = inventory.materials.find(ex => ex[0] === name);

        if (!item || !xitem) throw msg.language.get('INVENTORY_ITEM_NOT_FOUND', itemName);
        const amount = 'all' in msg.flagArgs ? xitem[1] : parseInt(msg.flagArgs.amount) || 1;
        if (xitem[1] < amount) throw msg.language.get('INSUFFICIENT_MATERIALS');

        xitem[1] -= amount;
        inventory.profile.coins += item.price * amount;

        if (xitem[1] <= 0) inventory.materials = inventory.materials.filter(it => it[1] > 0);
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
            msg.send(this.embed(msg)
                .setLocaleDescription('SELL_DESCRIPTION', amount, this.properName(itemName), item)));
    }

}
