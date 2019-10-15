import MinecraftCommand from '../../lib/base/MinecraftCommand';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { MessageReaction } from 'discord.js';
import util from '../../utils/util';
import Inventory from '../../lib/game/items/inventory';
import { UserInventory } from '../../lib/game/minecraft';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<add|remove|confirm|cancel|info|user:user> [item:...str]'
        });

        this.createCustomResolver('item', (arg, _possible, _message, [action]) => {
            if (arg || !['add', 'remove'].includes(action)) return arg;
            throw 'Item should be specified';
        });
    }

    // eslint-disable-next-line complexity
    public async run(msg: KlasaMessage, [action, itemName = '']: [string | KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[] | null> {
        const { prefix } = msg.guildSettings as any;

        if (action instanceof KlasaUser) {
            if (action.id === msg.author!.id) return msg.send('You cant trade with yourself!');

            const mess = await msg.channel.send(this.embed(msg)
                .setTitle('Trade Request')
                .setDescription(`**\`${action.tag}\` has recieved a trade request from \`${msg.author!.tag}\`**
            React to confirm or deny the trade request`));
            await mess.react('❎');
            await mess.react('✅');

            const collector = mess.createReactionCollector((re: MessageReaction, us: KlasaUser) => us.id === action.id && ['❎', '✅'].includes(re.emoji.name), { max: 1 });
            collector.on('collect', async (re: MessageReaction) => {
                if (re.emoji.name === '❎') { return msg.send(`**${action.tag}** did not accept the trade request`); } else {
                    try {
                        const { inv1, inv2 } = await this.checkTraders(msg, action);

                        inv1.inventory.trade = { user: action.id, confirmed: false, trade: {} };
                        inv2.inventory.trade = { user: msg.author!.id, confirmed: false, trade: {} };

                        await this.client.minecraft.set(msg.author!.id, inv1);
                        await this.client.minecraft.set(action.id, inv2);

                        await msg.channel.send(this.embed(msg)
                            .setTitle('Trade Request Accepted')
                            .setDescription(`**\`${action.tag}\`, confirmed the trade request from \`${msg.author!.tag}\`**

                            Use \`${prefix}trade add <item> [--amount=number]\` to add materials or food to the trade
                            Use \`${prefix}trade remove <item>\` to remove materials or food to trade
                            Use \`${prefix}trade info\` to view the current trade
                            Use \`${prefix}trade confirm\` to confirm
                            Use \`${prefix}trade cancel\` to cancel the trade`));
                    } catch (err) {
                        return msg.send(err);
                    }
                }

                // never gonna happen
                return null;
            });

            return null;
        } else {
            const { inv1, inv2 } = await this.checkTraders(msg);
            const trader = await this.client.users.fetch(inv2.id);
            if (!trader) return msg.send('Cannot find the other user. Make sure they are in atleast 1 guild where I am in');

            switch (action.toLowerCase()) {
                case 'add': {
                    if (inv1.inventory.trade.confirmed) return msg.send(`You have already confirmed the trade use \`${prefix}trade cancel\` to cancel this trade`);

                    itemName = itemName.toLowerCase().replace(' ', '_');
                    const xitem = itemName === 'coins' ? ['coins', inv1.inventory.profile.coins] as [string, number] : inv1.inventory.materials.find(ex => ex[0] === itemName);
                    if (!xitem) return msg.send('Could not find that item in your inventory');
                    const amount = 'all' in msg.flagArgs ? xitem[1] : parseInt(msg.flagArgs.amount) || 1;

                    const total = inv1.inventory.trade.trade[itemName] ? inv1.inventory.trade.trade[itemName] + amount : amount;
                    if (total > xitem[1]) return msg.send('You do not have that much of material');

                    xitem[1] -= amount;
                    // eslint-disable-next-line no-unused-expressions
                    inv1.inventory.trade.trade[itemName] ? inv1.inventory.trade.trade[itemName] += amount : inv1.inventory.trade.trade[itemName] = amount;
                    await this.client.minecraft.set(msg.author!.id, inv1);

                    return msg.send(this.embed(msg)
                        .setTitle('Trade Add')
                        .setDescription(`Successfully added **${util.toTitleCase(xitem[0].replace('_', ' '))} x${amount}** to the trade!`));
                }

                case 'remove': {
                    if (inv1.inventory.trade.confirmed) return msg.send(`You have already confirmed the trade use \`${prefix}trade cancel\` to cancel this trade`);

                    itemName = itemName.toLowerCase().replace(' ', '_');
                    // eslint-disable-next-line max-len
                    if (!inv1.inventory.trade.trade[itemName]) return msg.send(`That item is not in the trade. Use \`${prefix}trade add [item] -[amount]\` to add materials or food ot money to the trade`);

                    const xitem = itemName === 'coins' ? ['coins', inv1.inventory.profile.coins] as [string, number] : inv1.inventory.materials.find(ex => ex[0] === itemName);
                    const amount = inv1.inventory.trade.trade[itemName];

                    if (itemName === 'coins') inv1.inventory.profile.coins += amount;
                    // eslint-disable-next-line no-unused-expressions
                    else xitem ? xitem[1] += amount : inv1.inventory.materials.push([itemName, amount]);
                    delete inv1.inventory.trade.trade[itemName];

                    await this.client.minecraft.set(msg.author!.id, inv1);

                    return msg.send(this.embed(msg)
                        .setTitle('Trade Remove')
                        .setDescription(`Successfully removed **${util.toTitleCase(itemName.replace('_', ' '))}** from the trade!`));
                }

                case 'info': {
                    return msg.send(this.embed(msg)
                        .setTitle('Trade Info')
                        .addField('You are giving', this.displayTrade(inv1.inventory.trade.trade))
                        .addField('You will recieve', this.displayTrade(inv2.inventory.trade.trade)));
                }

                case 'confirm': {
                    if (inv1.inventory.trade.confirmed) return msg.send(`You have already confirmed the trade use \`${prefix}trade cancel\` to cancel this trade`);

                    const mess = await msg.reply(`Do you wish to confirm the trade with **${trader.tag}**\nReact with ✅ to confirm the trade`);

                    await mess.react('✅');
                    await mess.react('❎');
                    const collector = mess.createReactionCollector((re, us) => us.id === msg.author!.id && ['❎', '✅'].includes(re.emoji.name), { max: 1 });

                    collector.on('collect', async (re) => {
                        if (re.emoji.name === '❎') {
                            return msg.send('The trade was not confirmed!');
                        } else if (re.emoji.name === '✅') {
                            if (inv2.inventory.trade.confirmed) {
                                this.trade(inv2.inventory, inv1.inventory);
                                this.trade(inv1.inventory, inv2.inventory);

                                inv1.inventory.trade = inv2.inventory.trade = { user: '', trade: {}, confirmed: false };
                                await this.client.minecraft.set(inv1.id, inv1);
                                await this.client.minecraft.set(inv2.id, inv2);

                                return msg.send(`The trade between <@${msg.author!.id}> and <@${trader.id}> was completed!`);
                            }

                            inv1.inventory.trade.confirmed = true;
                            await this.client.minecraft.set(inv1.id, inv1);

                            // eslint-disable-next-line max-len
                            return msg.send(`<@${msg.author!.id}> confirmed! Waiting confirmation from **${trader.tag}**\n<@${trader.id}>, please use \`${prefix}trade confirm\` to confirm from your end!`);
                        }

                        return null;
                    });

                    return null;
                }

                // stuff to be added back
                case 'cancel': {
                    const mess = await msg.channel.send(`Do you wish to cancel the trade with **${trader.tag}**\nReact with ✅ to cancel the trade`);
                    await mess.react('✅');
                    await mess.react('❎');

                    const collector = mess.createReactionCollector((re, us) => us.id === msg.author!.id && ['❎', '✅'].includes(re.emoji.name), { max: 1 });
                    collector.on('collect', async (re) => {
                        if (re.emoji.name === '❎') {
                            return msg.send('Trade was not cancelled');
                        } else if (re.emoji.name === '✅') {
                            this.cancelTrade(inv1.inventory);
                            this.cancelTrade(inv2.inventory);

                            inv1.inventory.trade.trade = inv2.inventory.trade.trade = {};
                            await this.client.minecraft.set(inv1.id, inv1);
                            await this.client.minecraft.set(inv2.id, inv2);

                            return msg.send(`The trade between <@${inv1.id}> and <@${inv2.id}> was cancelled by <@${msg.author!.id}>`);
                        }

                        return null;
                    });

                    return null;
                }

                // should never happen...
                default: return null;
            }
        }
    }

    private displayTrade(trade1: any): string {
        const mess = [];

        for (const key of Object.keys(trade1)) {
            const mat = this.client.minecraft.search(key)[1] || { emote: '' };
            mess.push(`**${util.toTitleCase(key.replace('_', ' '))}${mat.emote} x${trade1[key]}**`);
        }

        return mess.join(', ') || '****';
    }

    // general check function
    private async checkTraders({ guildSettings, author }: KlasaMessage, user2?: KlasaUser): Promise<{ inv1: UserInventory, inv2: UserInventory}> {
        const inv1 = await this.client.minecraft.get(author!.id);
        if (!inv1.id) throw `<@${author!.id}> does not have a player! Please use the start command to begin playing`;
        if (user2 && inv1.inventory.trade.user) throw `<@${author!.id}> is already in a trade with someone else!`;
        else if (!user2 && !inv1.inventory.trade.user) throw `You are not in a trade with anyone. Use \`${(guildSettings as any).prefix}trade [@user]\` to start trading!`;

        const id = user2 ? user2.id : inv1.inventory.trade.user;
        const inv2 = await this.client.minecraft.get(id);
        if (!inv2.id) throw `<@${id}> does not have a player! Please use the start command to begin playing`;
        if (user2 && inv2.inventory.trade.user) throw `<@${id}> is already in a trade with someone else!`;

        return { inv1, inv2 };
    }

    private cancelTrade(inv: Inventory): void {
        for (const mat in inv.trade.trade) {
            const amount = inv.trade.trade[mat];
            const imat = mat === 'coins' ? ['coins', inv.profile.coins] : inv.materials.find(ex => ex[0] === mat);

            if (mat === 'coins') inv.profile.coins += amount;
            else imat ? imat[1] += amount : inv.materials.push([mat, amount]);
        }
    }

    private trade(inv1: Inventory, inv2: Inventory): void {
        for (const mat in inv1.trade.trade) {
            const amount = inv1.trade.trade[mat];

            if (mat === 'coins') { inv2.profile.coins += amount; } else {
                const imat2 = inv2.materials.find(ex => ex[0] === mat);
                imat2 ? imat2[1] += amount : inv2.materials.push([mat, amount]);
            }
        }
    }

}
