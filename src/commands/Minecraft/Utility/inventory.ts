import { CommandStore, KlasaMessage, KlasaUser, RichDisplay, Timestamp } from 'klasa';
import { MessageEmbed } from 'discord.js';
import Inventory from '../../../lib/game/items/inventory';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import { UserInventory } from '../../../lib/game/minecraft';
import { Tool } from '../../../lib/game/items/tool';
import { COLORS } from '../../../utils/constants';

type inventoryPage = 'materials' | 'tools' | 'enchants';
export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['inv'],
            requiredPermissions: ['ADD_REACTIONS', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
            usage: '[materials|tools|enchants]'
        });
    }

    public async run(msg: KlasaMessage, [type]: [inventoryPage | undefined]): Promise<KlasaMessage | KlasaMessage[] | null> {
        const user = await this.client.minecraft.get(msg.author!.id);
        if (!user.id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        if (!type) await this.display(msg.author!, user).run(await msg.send('loading...'));
        else return msg.send(this.displayPage(user.inventory, this.template(msg.author!), type));
        return null;
    }

    public display(user: KlasaUser, { inventory }: UserInventory): RichDisplay {
        const display = new RichDisplay(this.template(user));

        return display
            .addPage((template: MessageEmbed) => template
                .setTitle('Profile')
                .setDescription(this.showProfile(user, inventory)))
            .addPage((template: MessageEmbed) => this.displayPage(inventory, template, 'materials'))
            .addPage((template: MessageEmbed) => this.displayPage(inventory, template, 'tools'))
            .addPage((template: MessageEmbed) => this.displayPage(inventory, template, 'enchants'));
    }

    private template(user: KlasaUser): MessageEmbed {
        return new MessageEmbed()
            .setAuthor(`${user.tag}'s Inventory`, user.displayAvatarURL())
            .setColor(COLORS.PRIMARY);
    }

    private showProfile(user: KlasaUser, inventory: Inventory): string {
        return `
        **Name:** \`${user.tag}\`
        **Joined At:** \`${new Timestamp('DD/MM/YYYY').displayUTC(inventory.profile.created)}\`
        **Level:** \`${inventory.profile.level}\`
        **XP:** \`${inventory.profile.xp}\`
        **Coins:** \`${inventory.profile.coins}\`
        **Health:** \`${inventory.profile.health}\`
        **Luck:** \`${inventory.profile.luck}\`
        **Dimension:** \`${inventory.profile.dimension}\`
        `;
    }

    private displayPage(inventory: Inventory, template: MessageEmbed, type: inventoryPage): MessageEmbed {
        return template
            .setTitle(this.properName(type))
            .setDescription(this.ishow(inventory, type));
    }

    private ishow(inventory: Inventory, type: inventoryPage): string {
        const tp = inventory[type];
        const mess = [];

        for (const item of tp) {
            const it = this.client.minecraft.store[item[0]];

            const stat = type === 'tools' ? `[${item[1]}/${(it as Tool).durability}]` : `x${item[1]}`;
            let text = `\`${this.properName(item[0])} ${stat}\``;
            text += item[2] ? ` [${item[2]}]` : '';

            if (type === 'tools' && Object.values(inventory.equipped).includes(item[0])) {
                text = `**${text} (eq)**`;
            }

            mess.push(`${it ? it.emote : ''} ${text}`);
        }

        return mess.join(' **|** ');
    }

}
