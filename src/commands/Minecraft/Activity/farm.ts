import { CommandStore, KlasaMessage } from 'klasa';
import Util from '../../../utils/util';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';
const cooldown = 5 * 60 * 1000;

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<sow|harvest|view> [cropName:...str]',
            subcommands: true,
            examples: ['view', 'sow wheat', 'sow wheat --amount=5', 'harvest all']
        });
    }

    public async sow(msg: KlasaMessage, [cropname]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const [id, inventory, ehoe, ihoe] = await this.verify(msg, 'hoe');
        if (!cropname) throw msg.language.get('FARM_NO_CROP');

        const [cropName, crop] = this.client.minecraft.search(cropname);
        const icrop = inventory.crops.find(ex => ex[0] === cropName);
        if (!icrop || icrop[1] <= 0) throw msg.language.get('INVENTORY_ITEM_NOT_FOUND', cropname, 'crop');

        const hoe = this.client.minecraft.store[ehoe] as any;
        const amount = hoe.size[icrop[0]] <= icrop[1] ? hoe.size[icrop[0]] : icrop[1];

        inventory.farm.planted.push([cropName, amount, Date.now()]);
        icrop[1] -= amount;
        ihoe[1] -= amount;

        this.setCooldown({ id, inventory }, cooldown, ihoe);
        inventory.crops = inventory.crops.filter(it => it[1] > 0);
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setTitle('Farm - Sow')
            .setLocaleDescription('FARM_SOW_DESCRIPTION', amount, this.properName(cropName), crop)));
    }

    public async view(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const [, inventory] = await this.verify(msg, 'hoe');

        return msg.send(this.embed(msg)
            .setTitle(`${msg.author!.tag}'s Farm`)
            .addField('Planted', inventory.farm.planted.map((icrop) => {
                const crop = this.client.minecraft.store[icrop[0]] as any;
                const tleft = icrop[2] + crop.time - Date.now();

                return `**${Util.toTitleCase(icrop[0].replace('_', ' '))}${crop.emote} x${icrop[1]}** \`[${tleft > 0 ? Util.msToTime(tleft) : 'Ready'}]\``;
            })
                .join('\n') || '**')
            .addField('Crops', inventory.crops.map((icrop) => {
                const crop = this.client.minecraft.store[icrop[0]];

                return `**${Util.toTitleCase(icrop[0].replace('_', ' '))}${crop.emote} x${icrop[1]}**`;
            })
                .join('\n') || '**'));
    }

    public async harvest(msg: KlasaMessage, [cropName = 'all']: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const [id, inventory, ehoe] = await this.verify(msg, 'hoe');
        const hoe = this.client.minecraft.store[ehoe] as any;

        cropName = cropName.toLowerCase().replace(' ', '_');

        const rcrops = inventory.farm.planted.filter(ex => {
            const crop = this.client.minecraft.store[ex[0]] as any;
            return ex[2] + crop.time - Date.now() < 0;
        });

        const icrops = cropName === 'all' ? rcrops : rcrops.filter(ex => ex[0] === cropName);
        if (!icrops.length) throw msg.language.get('FARM_NO_HARVEST', cropName === 'all');

        const mess = this.join(icrops).map((cr) => {
            if (Math.random() * 100 <= hoe.drops[cr[0]][2]) {
                const crop = this.client.minecraft.store[cr[0]];
                const icrop = inventory.crops.find(ex => ex[0] === cr[0]);
                const amount = Math.ceil(((Math.random() * hoe.drops[cr[0]][0]) + hoe.drops[cr[0]][1]) * cr[1]);

                // eslint-disable-next-line no-unused-expressions
                icrop ? icrop[1] += amount : inventory.crops.push([cr[0], amount]);

                return `${Util.toTitleCase(cr[0].replace('_', ' '))}${crop.emote} x${cr[1]} | Recieved: x${amount}\n`;
            }

            return '';
        }).join();

        inventory.farm.planted = inventory.farm.planted.filter(cr => !rcrops.includes(cr));
        this.addXP(msg, inventory, ehoe);

        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
            .setTitle('Farm - Harvest')
            .setLocaleDescription('FARM_HARVEST_DESCRIPTION', mess)));
    }

    private join(arr: [string, number, number?][]): [string, number, number?][] {
        const arr2 = [] as [string, number, number?][];
        for (const el of arr) {
            if (!arr2.some(ex => ex[0] === el[0])) {
                let total = 0;
                arr.forEach(ex => { total += ex[1]; });

                arr2.push([el[0], total]);
            }
        }

        return arr2;
    }

}
