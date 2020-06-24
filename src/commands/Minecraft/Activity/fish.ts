import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import { KlasaMessage, CommandStore } from 'klasa';
import quests from '../../../lib/game/quests';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'EMBED_LINKS']
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const [id, inventory, erod, irod] = await this.verify(msg, 'rod');
        const [m, updated] = this.dropRewards(inventory, irod);

        this.reduceDurability(irod);
        const quest = quests[inventory.quests.id];
        if (quest) quest.update(inventory, { action: 'chop', updated });
        this.setCooldown({ id, inventory }, 5 * 60 * 1000, irod);
        this.addXP(msg, inventory, erod);

        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
            msg.send(this.embed(msg)
                .setLocaleDescription('FISH_DESCRIPTION', m)));
    }

}
