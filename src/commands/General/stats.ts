import { CommandStore, KlasaMessage, Duration, version as klasaVersion } from 'klasa';
import { version as discordVersion } from 'discord.js';
import MinecraftCommand from '../../lib/base/MinecraftCommand';
import util from '../../utils/util';

export default class extends MinecraftCommand {

    constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            guarded: true,
            description: language => language.get('COMMAND_STATS_DESCRIPTION')
        });
    }

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        let [users, guilds, channels, memory] = [0, 0, 0, 0];

        if (this.client.shard) {
            const results = await this.client.shard.broadcastEval(`[this.users.size, this.guilds.size, this.channels.size, (process.memoryUsage().heapUsed / 1024 / 1024)]`);
            for (const result of results) {
                users += result[0];
                guilds += result[1];
                channels += result[2];
                memory += result[3];
            }
        }

        return msg.send(this.embed(msg)
            .addField('Support', `[Click Here](${this.client.support})`, true)
            .addField('Invite', `[Click Here](${this.client.invite})`, true)
            .setDescription(util.codeBlock('asciidoc', msg.language.get('COMMAND_STATS',
                (memory || process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
                Duration.toNow(Date.now() - (process.uptime() * 1000)),
                (users || this.client.users.size).toLocaleString(),
                (guilds || this.client.guilds.size).toLocaleString(),
                (channels || this.client.channels.size).toLocaleString(),
                klasaVersion, discordVersion, process.version, msg
            ))));
    }

}
