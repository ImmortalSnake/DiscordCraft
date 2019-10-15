import MinecraftCommand from '../../lib/base/MinecraftCommand';
import { KlasaMessage, CommandStore, KlasaUser } from 'klasa';
import InventoryCommand from '../Minecraft/inventory';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            hidden: true,
            guarded: true,
            permissionLevel: 10,
            subcommands: true,
            usage: '<add|remove|view> <user:user> (itemname:itemname) [...]'
        });

        this.createCustomResolver('itemname', (arg, possible, message, [action]) => {
            if (!['add', 'remove'].includes(action) || arg) return arg;
            throw 'Item should be specified!';
        });
    }

    public async add(msg: KlasaMessage, [user, ...itemname]: [KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(user.id);
        if (!id) return msg.send('This user does not have a player!');

        const amount = 'amount' in msg.flagArgs ? parseInt(msg.flagArgs.amount) : 1;
        const [name, item] = this.client.minecraft.search(itemname.join('_'));
        if (!item) return msg.send('Could not find that item!');

        const invItem = inventory.tools.find(ex => ex[0] === name) || inventory.materials.find(ex => ex[0] === name);

        if (!invItem) {
            if (item.type === 'tools') inventory.tools.push([name, item.durability]);
            else if (item.type === 'materials') inventory.materials.push([name, amount]);
        } else if (item.type === 'materials') {
            invItem[1] += amount;
        } else if (item.type === 'tools') {
            return msg.send('This tool already exists!');
        }

        return this.client.minecraft.update(user.id, { id, inventory }).then(() => msg.send(`Successfully added **${amount} ${name} ${item.emote}** to \`${user.tag}\``));
    }

    public async remove(msg: KlasaMessage, [user, ...itemname]: [KlasaUser, string]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(user.id);
        if (!id) return msg.send('This user does not have a player!');

        let amount = 1;
        const [name, item] = this.client.minecraft.search(itemname.join('_'));
        const check = inventory.tools.find(ex => ex[0] === name) || inventory.materials.find(ex => ex[0] === name);

        if (check && check[1]) {
            amount = 'all' in msg.flagArgs ? check[1] || parseInt(msg.flagArgs.amount) : 1;
            check[1] -= amount;
            if (check[1] <= 0) inventory.materials = inventory.materials.filter(ex => ex[1] > 0);
        } else {
            inventory.tools = inventory.tools.filter(ex => ex[0] !== name);
        }

        return this.client.minecraft.update(user.id, { id, inventory }).then(() => msg.send(`Successfully removed ${amount} ${name} ${item.emote} to ${user.tag}`));
    }

    public async view(msg: KlasaMessage, [user]: [KlasaUser]): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(user.id);
        if (!id) return msg.send('This user does not have a player!');

        return msg.send((this.client.commands.get('inventory') as InventoryCommand).display(user, inventory));
    }

}
