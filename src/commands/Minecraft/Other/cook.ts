import { CommandStore, KlasaMessage } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<food:...str>'
        });
    }

    public async run(msg: KlasaMessage, [food]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.commandPrefix);

        const foodName = food.toLowerCase().replace(' ', '_');
        const recipe = this.client.minecraft.recipes[foodName];
        const amount = 1;
        if (!recipe) throw 'This item cannot be cooked!';

        if (!inventory.storage.furnace) throw 'You need a furnace to do this. Buy one from the shop!';

        for (const mat of Object.keys(recipe)) {
            const imat = inventory.materials.find(ex => ex[0] === mat) || inventory.crops.find(ex => ex[0] === mat);

            if (!imat || imat[1] < recipe[mat] * amount) return msg.send(`You need ${recipe[mat] * amount} ${mat} to cook ${amount} ${food}!`);
            imat[1] -= recipe[mat];
        }

        const item = inventory.materials.find(ix => ix[0] === foodName);
        item ? item[1] += amount : inventory.materials.push([foodName, amount]);

        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setDescription(`You have successfully cooked **${amount} ${this.properName(foodName)}**`)));
    }

}
