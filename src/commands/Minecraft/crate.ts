import { KlasaMessage, CommandStore } from 'klasa';
import MinecraftCommand from '../../lib/base/MinecraftCommand';
import Crates from '../../../assets/game/crates.json';
import util from '../../utils/util';
import Inventory from '../../lib/game/items/inventory';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '[crate:...str]',
            description: (language) => language.get('COMMAND_CRATE_DESCRIPTION'),
            extendedHelp: (language) => language.get('COMMAND_CRATE_EXTENDED')
        });
    }

    public async run(msg: KlasaMessage, [crateName]: [string?]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');

        if (crateName) {
            crateName = crateName.replace(' ', '_').toLowerCase();
            const crate = Crates.find(ex => ex.name === crateName);
            const icrate = inventory.crates.findIndex(ex => ex[0] === crateName);
            if (!crate || icrate === -1) return msg.send('Could not find that crate in your inventory');

            const [m] = this.dropRewards(inventory, inventory.crates[icrate], crate);

            return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
                msg.send(this.embed(msg).setDescription(`You opened a **${util.toTitleCase(crateName!.replace('_', ' '))}** and found: ${m}`)
                ));
        } else {
            const { prefix } = msg.guildSettings as any;
            return msg.send(this.embed(msg)
                .setDescription(`Use \`${prefix}${this.name} <crate name>\` to open a crate!
Here are the Crates that you own:\n${this.displayCrates(inventory)}`));
        }
    }

    private displayCrates(inventory: Inventory): string {
        return inventory.crates.map((crate, i) => `**${i + 1}] ${util.toTitleCase(crate[0].replace('_', ' '))}** - \`x${crate[1]}\``).join('\n');
    }

}
