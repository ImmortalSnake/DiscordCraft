import { KlasaMessage } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const inventory = await this.client.minecraft.get(msg.author!.id);
        if (inventory.id) return msg.send('You already have a profile. Great!');
        const prefix = msg.guildSettings.get('prefix');

        return this.client.minecraft.create(msg.author!).then(() => msg.send(this.embed(msg)
            .setTitle('Welcome')
            .setLocaleDescription('START_DESCRIPTION', msg.author, prefix)));
    }

}
