import { Command, CommandStore, KlasaMessage } from 'klasa';

export default class extends Command {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            guarded: true,
            runIn: ['text', 'dm'],
            description: language => language.get('COMMAND_INVITE_DESCRIPTION')
        });
    }

    public async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        return message.sendLocale('COMMAND_INVITE');
    }

    public async init(): Promise<void> {
        if (this.client.application && !this.client.application.botPublic) this.permissionLevel = 10;
    }

}
