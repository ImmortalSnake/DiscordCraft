import { PermissionLevels, KlasaMessage } from 'klasa';
import { GuildMember, Guild } from 'discord.js';

export default new PermissionLevels()
// @everyone
    .add(0, () => true)
// PLAYER
// .add(2, ({ author }) => Boolean((author as KlasaUser).settings.get('inventory.id')))
// MANAGE_MESSAGES
    .add(4, ({ guild, member }: KlasaMessage) => guild ? true : false && member?.permissions.has('MANAGE_MESSAGES'), { fetch: true })
// ADMINISTRATOR
    .add(6, ({ guild, member }: KlasaMessage) => guild ? true : false && member?.permissions.has('ADMINISTRATOR'), { fetch: true })
// GUILD OWNER
    .add(7, ({ guild, member }: KlasaMessage) => guild ? true : false && member === guild?.owner, { fetch: true })
// Bot Owner
    .add(10, ({ author, client }: KlasaMessage) => client.owners.has(author!));
