import { CommandStore, KlasaMessage } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<food:...str>',
            requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'EMBED_LINKS'],
            examples: ['baked potato', 'bread --amount=2'],
            cooldown: 60000
        });
    }

    public async run(msg: KlasaMessage, [food]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        const foodName = food.toLowerCase().replace(' ', '_');
        const it = this.client.minecraft.store[foodName] as any;
        const amount = parseInt(msg.flagArgs.amount) || 1;
        if (!it.recipe) throw 'This item cannot be cooked!';

        if (!inventory.storage.furnace) throw 'You need a furnace to do this. Buy one from the shop!';

        for (const mat of Object.keys(it.recipe)) {
            const imat = inventory.materials.find(ex => ex[0] === mat) || inventory.crops.find(ex => ex[0] === mat);

            if (!imat || imat[1] < it.recipe[mat] * amount) return msg.send(`You need ${it.recipe[mat] * amount} ${mat} to cook ${amount} ${food}!`);
            imat[1] -= it.recipe[mat] * amount;
        }

        const item = inventory.materials.find(ix => ix[0] === foodName);
        item ? item[1] += amount : inventory.materials.push([foodName, amount]);

        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setDescription(`You have successfully cooked **${amount} ${this.properName(foodName)}**`)));
    }

}
