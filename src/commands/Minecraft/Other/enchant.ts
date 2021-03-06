import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import { KlasaMessage, CommandStore } from 'klasa';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            usage: '<tool:str> <enchantment:str>',
            usageDelim: ':',
            requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'EMBED_LINKS'],
            examples: ['stone axe : efficiency-2']
        });
    }

    public async run(msg: KlasaMessage, [toolName, enchantName]: [string, string]): Promise<KlasaMessage | KlasaMessage[] | null> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));
        if (!inventory.storage.enchantment_table) return msg.send('You need an enchantment table to do this. Buy one from the shop!');

        const [name, tool] = this.client.minecraft.search(toolName);
        enchantName = enchantName.trim().toLowerCase().replace(' ', '_');

        const xitem = inventory.tools.find(ex => ex[0] === name);
        if (!xitem) return msg.send('This tool does not exist in your inventory!');
        const enchant = inventory.enchants.findIndex(ex => ex[0] === enchantName);
        if (enchant === -1) return msg.send('This enchantment does not exist in your inventory');
        if (!tool.enchants.includes(enchantName.replace(/[0-9]/g, ''))) return msg.send('This tool cannot be enchanted with this enchantment');


        xitem[2] = enchantName;
        inventory.enchants.splice(enchant, 1);
        return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() =>
            msg.send(this.embed(msg).setDescription(`You have enchanted your \`${name}\`${tool.emote} with **${enchantName}**`)));
    }

}
