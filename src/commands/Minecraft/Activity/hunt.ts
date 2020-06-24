import { CommandStore, KlasaMessage } from 'klasa';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            enabled: false,
            requiredPermissions: ['USE_EXTERNAL_EMOJIS', 'EMBED_LINKS']
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [id, inventory, eaxe, iaxe] = await this.verify(msg, 'sword');

        if (Math.random() > 0.5) {
            // Mobs
        } else {
            // Animals

        }
        return msg.send('This command is not ready yet!');
    }

}
