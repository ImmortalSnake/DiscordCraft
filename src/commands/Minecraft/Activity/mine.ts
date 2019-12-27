import { CommandStore, KlasaMessage } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import quests from '../../../lib/game/quests';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['m']
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const [id, inventory, epaxe, ipaxe] = await this.verify(msg, 'pickaxe');
        const [m, updated] = this.dropRewards(inventory, ipaxe);

        this.reduceDurability(ipaxe);
        const quest = quests[inventory.quests.id];
        if (quest) quest.update(inventory, { action: 'mine', updated });
        this.setCooldown({ id, inventory }, 5000, ipaxe);
        this.addXP(msg, inventory, epaxe);

        const paxe = this.client.minecraft.toolStore[epaxe];
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setLocaleDescription('ACTION_DESCRIPTION', 'mined', this.properName(epaxe), paxe, m)));
    }

}
