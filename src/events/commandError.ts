import { Event, KlasaMessage, Command } from 'klasa';
import DiscordCraft from '../lib/client';
import util from '../utils/util';

export default class extends Event {

    public async run(msg: KlasaMessage, command: Command, __: any, error: any): Promise<void> {
        if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
        const dev = this.client.users.get((this.client as DiscordCraft).developer) || await this.client.users.fetch((this.client as DiscordCraft).developer);
        await msg.send('An error has occured... Please try again later!');

        if (error.stack) {
            dev.send(util.codeBlock('js', error.stack.slice(0, 2000))).catch((err: Error) => this.client.emit('wtf', err));
        } else {
            dev.send(error).catch((err: Error) => this.client.emit('wtf', err));
        }
    }

}