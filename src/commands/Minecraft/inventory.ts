import { util, CommandStore, KlasaMessage, KlasaUser, RichDisplay } from 'klasa';
import { MessageEmbed } from 'discord.js';
import Inventory from '../../lib/game/items/inventory';
import MinecraftCommand from '../../lib/base/MinecraftCommand';
import { Tool } from '../../lib/game/items/tool';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['inv'],
            usage: '[materials|tools]'
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');

        await this.display(msg.author!, inventory).run(await msg.send('loading..'));
        return null;
    }

    public display(user: KlasaUser, inventory: Inventory): RichDisplay {
        const display = new RichDisplay(new MessageEmbed()
            .setAuthor(`${user.tag}'s Inventory`, user.displayAvatarURL())
            .setColor('#5d97f5'));

        return display
            .addPage((template: MessageEmbed) => template
                .setTitle('Profile')
                .setDescription(`
                **Name:** \`${user.tag}\`
                **Level:** \`${inventory.profile.level}\`
                **XP:** \`${inventory.profile.xp}\`
                **Coins:** \`${inventory.profile.coins}\`
                **Health:** \`${inventory.profile.health}\`
                **Luck:** \`${inventory.profile.luck}\`
                **Dimension:** \`${inventory.profile.dimension}\`
                `))
            .addPage((template: MessageEmbed) => template
                .setTitle('Materials')
                .setDescription(this.ishow(inventory, 'materials')))
            .addPage((template: MessageEmbed) => template
                .setTitle('Tools')
                .setDescription(this.ishow(inventory, 'tools')));
    }

    private ishow(inventory: Inventory, type: 'materials' | 'tools'): string {
        const tp = inventory[type];
        let mess = '**';

        for (const item of tp) {
            const { emote } = this.client.minecraft.store[item[0]] as Tool;

            const stat = (type === 'tools' ? ` | Durability ` : `x`) + item[1];
            mess += `${util.toTitleCase(item[0].replace('_', ' '))}${emote} ${stat}, `;
        }

        mess += '**';
        return mess;
    }

}
