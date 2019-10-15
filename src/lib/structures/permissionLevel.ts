import { PermissionLevels, KlasaUser } from 'klasa';
import { GuildMember, Guild } from 'discord.js';

export default new PermissionLevels()
// @everyone
    .add(0, () => true)
// PLAYER
    .add(2, ({ author }) => (author as KlasaUser).settings.get('inventory.id'))
// MANAGE_MESSAGES
    .add(4, ({ guild, member }) => guild ? true : false && (member as GuildMember).permissions.has('MANAGE_MESSAGES'), { fetch: true })
// ADMINISTRATOR
    .add(6, ({ guild, member }) => guild ? true : false && (member as GuildMember).permissions.has('ADMINISTRATOR'), { fetch: true })
// GUILD OWNER
    .add(7, ({ guild, member }) => guild ? true : false && member === (guild as Guild).owner, { fetch: true })
// Bot Owner
    .add(10, ({ author, client }) => client.owners.has(author!));
