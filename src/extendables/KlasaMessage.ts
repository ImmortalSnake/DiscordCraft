import { Extendable, ExtendableStore } from 'klasa';
import { Message } from 'discord.js';

export default class extends Extendable {

    public constructor(store: ExtendableStore, file: string[], directory: string) {
        super(store, file, directory, { appliesTo: [Message] });
    }

    public async prompt(this: Message, content: string, time = 60000): Promise<Message> {
        await this.channel.send(content);
        const messages = await this.channel.awaitMessages(mes => mes.author === this.author, { time, max: 1 });
        if (messages.size === 0) throw null;
        return messages.first()!;
    }

}
