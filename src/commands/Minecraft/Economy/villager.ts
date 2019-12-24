import { CommandStore, KlasaMessage, KlasaUser, Settings } from 'klasa';
import util from '../../../utils/util';
import { MessageEmbed } from 'discord.js';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    private readonly emerald: any;
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '[item:str] [amount:int{1,}]'
        });

        this.emerald = this.client.minecraft.store.emerald;
    }

    public async run(msg: KlasaMessage, [itemName, amount = 1]: [string, number]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get((msg.author as KlasaUser).id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');
        const villager = (this.client.settings as Settings).get('villager')! as any;

        if (itemName && amount) {
            itemName = itemName.toLowerCase().replace(' ', '_');
            if (!villager.deals[itemName]) return msg.send('This item is not for sale');

            const ie = inventory.materials.find(ex => ex[0] === 'emerald');
            const imat = inventory.materials.find(ex => ex[0] === itemName);
            const deal = villager.deals[itemName];

            if (!ie || ie[1] < amount) return msg.send('You do not have enough emeralds!');
            if (deal[1] > 1 && amount % deal[1] !== 0) return msg.send(`You can trade only multiples of ${deal[1]} for ${itemName}`);

            ie[1] -= amount;
            const namount = (deal[1] > 1 ? amount / deal[1] : amount) * deal[0];
            imat ? imat[1] += namount : inventory.materials.push([itemName, namount]);

            if (ie[1] <= 0) inventory.materials = inventory.materials.filter(it => it[1] > 0);
            return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
                msg.send(this.embed(msg)
                    .setDescription(`You brought **${namount} ${this.properName(itemName)} ${this.client.minecraft.store[itemName].emote}** for **${amount} Emeralds ${this.emerald.emote}**`)));
        }

        return msg.send(new MessageEmbed()
            .setColor('#5d97f5')
            .setTitle('Villager Deals')
            .setDescription(this.displayDeals(msg, villager)));
    }

    private displayDeals(msg: KlasaMessage, villager: any): string {
        let mess = '**';
        for (const deal in villager.deals) {
            const item = this.client.minecraft.store[deal];
            if (!item) continue;

            mess += `${villager.deals[deal][1]} ${this.emerald.emote} = ${villager.deals[deal][0]} ${util.toTitleCase(deal)} ${item.emote}\n`;
        }

        mess += `**
        Use \`${msg.guildSettings.get('prefix')}villager [item] [amount of emeralds]\` to buy an item

        Trade deals reset in ${util.msToTime(parseInt(villager.time) + this.client.minecraft.villageTimer - Date.now())}`;

        return mess;
    }

}
