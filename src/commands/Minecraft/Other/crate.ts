import { KlasaMessage, CommandStore } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import Crates from '../../../../assets/game/crates.json';
import util from '../../../utils/util';
import Inventory from '../../../lib/game/items/inventory';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '[crate:...str]',
            examples: ['common crate', 'rare crate']
        });
    }

    public async run(msg: KlasaMessage, [crateName]: [string?]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        if (crateName) {
            const cName = crateName.replace(' ', '_').toLowerCase();
            const crate = Crates.find(ex => ex.name === cName);
            const icrate = inventory.crates.findIndex(ex => ex[0] === cName);
            if (!crate || icrate === -1) throw msg.language.get('INVENTORY_ITEM_NOT_FOUND', cName);

            const [m] = this.dropRewards(inventory, inventory.crates[icrate], crate);

            return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
                .setLocaleDescription('CRATE_OPEN_DESCRIPTION', this.properName(cName), m)));
        } else {
            const prefix = msg.guildSettings.get('prefix');
            return msg.send(this.embed(msg)
                .setLocaleDescription('CRATE_DISPLAY_DESCRIPTION', prefix, this.name, this.displayCrates(inventory)));
        }
    }

    private displayCrates(inventory: Inventory): string {
        return inventory.crates.map((crate, i) => `**${i + 1}] ${util.toTitleCase(crate[0].replace('_', ' '))}** - \`x${crate[1]}\``).join('\n');
    }

}
