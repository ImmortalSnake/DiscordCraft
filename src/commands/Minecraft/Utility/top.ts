import { CommandStore, KlasaMessage, RichDisplay, KlasaUser } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import { MessageEmbed } from 'discord.js';
import { UserInventory } from '../../../lib/game/minecraft';

// number of users to show per page
const npage = 10;
const time = 1000 * 60 * 3;

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<level|coins:default> [page:int{1,10}]',
            examples: ['', 'level']
        });
    }

    public async run(msg: KlasaMessage, [type = 'coins']: ['coins' | 'level', number]): Promise<KlasaMessage | KlasaMessage[] | null> {
        const { id } = await this.client.minecraft.get((msg.author as KlasaUser).id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        const all = await this.client.minecraft.provider.getAll('users') as UserInventory[];
        const sorted = all.sort((a, b) => {
            if (b.inventory && b.inventory.profile && b.inventory.profile[type]) {
                if (a.inventory && a.inventory.profile && a.inventory.profile[type]) {
                    return a.inventory.profile[type] > b.inventory.profile[type] ? -1 : 1;
                } else { return 1; }
            } else { return -1; }
        });

        const display = new RichDisplay(this.embed(msg)
            .setLocaleTitle('TOP_TITLE', type)
            .setLocaleFooter('TOP_FOOTER', sorted.findIndex(ex => ex.id === msg.author!.id), sorted.length));

        for (let i = 0; i < sorted.length; i += npage) {
            display.addPage((template: MessageEmbed) => template
                .setDescription(sorted.slice(i, ((i / npage) + 1) * npage).map((eh, ek) => {
                    const pl = this.client.users.get(eh.id);
                    const val = eh.inventory && eh.inventory.profile ? eh.inventory.profile[type] || 0 : 0;
                    return `**${ek + i + 1}] ${pl ? pl.tag : eh.inventory.profile.name}** - \`${val} ${type}\``;
                }).join('\n')
                ));
        }

        const { LOADING } = msg.language.KEYWORDS;
        await display.run(await msg.send(LOADING), {
            filter: (__, user: KlasaUser) => user.id === msg.author!.id,
            time
        });
        return null;
    }

}
