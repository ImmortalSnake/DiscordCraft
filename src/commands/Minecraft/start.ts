import { KlasaMessage, KlasaUser } from 'klasa';
import DiscordCraft from '../../lib/client';
import Minecraft from '../../lib/game/minecraft';
import MinecraftCommand from '../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        // const inventory = (msg.author as KlasaUser).settings.get('inventory');
        // if (inventory.id) return msg.send('You already have a profile. Great!');
        const { prefix } = msg.guildSettings as any;

        return ((this.client as DiscordCraft).minecraft as Minecraft).create(msg.author as KlasaUser)
            .then(() =>
                msg.send(this.embed(msg)
                    .setTitle('Welcome')
                    .setDescription(`Welcome ${msg.author}
            You received your <:woodenaxe:560778791643774976>
            You can now type \`${prefix}chop\` to collect some wood
            
            Type \`${prefix}quest\` to start quests and recieve rewards!`)))
            .catch(() =>
                msg.send('Uh oh! something went wrong... Please try again later'));
    }

}
