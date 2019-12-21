import { CommandStore, KlasaMessage } from 'klasa';
import Inventory from '../../lib/game/items/inventory';
import quests from '../../lib/game/quests';
import MinecraftCommand from '../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<item:...str>'
        });
    }

    public async run(msg: KlasaMessage, [itemName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');

        const item = this.client.minecraft.search(itemName);
        if (!item[0]) return msg.send('Could not find that item!');

        return this.craft(msg, [id, inventory], item);
    }

    private async craft(msg: KlasaMessage, [id, inventory]: [string, Inventory], [itemName, item, amount = 1]: [string, any, number?]): Promise<KlasaMessage | KlasaMessage[]> {
        if (!item.materials) return msg.send('This item is not craftable!');
        if (item.type === 'tools' && inventory.tools.find(ex => ex[0] === itemName)) return msg.send('You cannot have more than 1 of the same tool or armor');

        for (const mat of Object.keys(item.materials)) {
            const imat = inventory.materials.find(ex => ex[0] === mat);

            if (!imat || imat[1] < item.materials[mat] * amount) return msg.send(`You need ${item.materials[mat]} ${mat} to craft this item!`);
            imat[1] -= item.materials[mat] * amount;
        }

        if (item.type === 'tools') inventory.tools.push([itemName, item.durability]);
        const quest = quests[inventory.quests.id];
        if (quest) quest.update(inventory, { action: 'craft', updated: [[itemName, amount]] });

        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setDescription(`You have successfully crafted **${amount} ${this.properName(itemName)} ${item.emote}**`)));
    }

}
