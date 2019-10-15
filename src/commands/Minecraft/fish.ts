import MinecraftCommand from '../../lib/base/MinecraftCommand';
import { KlasaMessage } from 'klasa';
import quests from '../../lib/game/quests';

export default class extends MinecraftCommand {

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const [id, inventory, , irod] = await this.verify(msg, 'rod');
        const [m, updated] = this.dropRewards(inventory, irod);

        this.reduceDurability(irod);
        const quest = quests[inventory.quests.id];
        if (quest) quest.update(inventory, { action: 'chop', updated });
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
            msg.send(this.embed(msg)
                .setDescription(`You have fished: ${m || 'Nothing!\nBetter luck next time!'}`)));
    }

}
