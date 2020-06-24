import { CommandStore, KlasaMessage, Settings } from 'klasa';
import util from '../../../utils/util';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    private readonly emerald: any;
    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '[item:str] [amount:int{1,}]',
            requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'EMBED_LINKS'],
            examples: ['', 'gold', 'iron 5']
        });

        this.emerald = this.client.minecraft.store.emerald;
    }

    public async run(msg: KlasaMessage, [itemName, amount = 1]: [string, number]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));
        const villager = (this.client.settings as Settings).get('villager')! as any;

        if (itemName && amount) {
            itemName = itemName.toLowerCase().replace(' ', '_');
            if (!villager.deals[itemName]) throw msg.language.get('VILLAGER_NO_SALE');

            const ie = inventory.materials.find(ex => ex[0] === 'emerald');
            const imat = inventory.materials.find(ex => ex[0] === itemName);
            const deal = villager.deals[itemName];

            if (!ie || ie[1] < amount) throw msg.language.get('MATERIAL_REQUIRED', amount, 'emeralds');
            if (deal[1] > 1 && amount % deal[1] !== 0) throw msg.language.get('VILLAGER_MULTIPLE_EXCEPT', deal[1], this.properName(itemName));

            ie[1] -= amount;
            const namount = (deal[1] > 1 ? amount / deal[1] : amount) * deal[0];
            imat ? imat[1] += namount : inventory.materials.push([itemName, namount]);

            if (ie[1] <= 0) inventory.materials = inventory.materials.filter(it => it[1] > 0);
            return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
                msg.send(this.embed(msg)
                    .setLocaleDescription('VILLAGER_BUY_DESCRIPTION', namount, this.properName(itemName), this.client.minecraft.store[itemName], amount, this.emerald)));
        }

        return msg.send(this.embed(msg)
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

        mess += msg.language.get('VILLAGER_FOOTER', msg.guildSettings.get('prefix'), util.msToTime(parseInt(villager.time) + this.client.minecraft.villageTimer - Date.now()));

        return mess;
    }

}
