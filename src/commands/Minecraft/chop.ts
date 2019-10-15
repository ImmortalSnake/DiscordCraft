import { KlasaMessage, CommandStore } from 'klasa';
import quests from '../../lib/game/quests';
import MinecraftCommand from '../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['c']
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const [id, inventory, , iaxe] = await this.verify(msg, 'axe');
        const [m, updated] = this.dropRewards(inventory, iaxe);
        this.reduceDurability(iaxe);

        const quest = quests[inventory.quests.id];
        if (quest) quest.update(inventory, { action: 'chop', updated });
        this.setCooldown({ id, inventory }, 5000, iaxe);

        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg).setDescription(`You have chopped: ${m}`)));
    }

}
