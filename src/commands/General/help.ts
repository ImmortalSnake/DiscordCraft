import { Command, RichDisplay, util, CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { MessageEmbed, Permissions, MessageReaction, GuildMember, TextChannel, ClientUser } from 'discord.js';
import MinecraftCommand from '../../lib/base/MinecraftCommand';

const { isFunction } = util;
const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);
const time = 1000 * 60 * 3;

export default class extends Command {

    public handlers: Map<any, any>;

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['commands', 'cmd', 'cmds'],
            guarded: true,
            usage: '(Command:command)'
        });

        this.createCustomResolver('command', (arg, possible, message) => {
            if (!arg || arg === '') return undefined;
            return this.client.arguments.get('command').run(arg, possible, message);
        });

        // Cache the handlers
        this.handlers = new Map();
    }

    public async run(message: KlasaMessage, [command]: [Command | MinecraftCommand]): Promise<KlasaMessage | KlasaMessage[] | null> {
        if (command) {
            return message.sendMessage([
                `= ${command.name} = `,
                isFunction(command.description) ? command.description(message.language) : command.description,
                '',
                message.language.get('COMMAND_HELP_ALIASES', command.aliases),
                message.language.get('COMMAND_HELP_USAGE', command instanceof MinecraftCommand ? command.fullUsage(message) : command.usage.fullUsage(message)),
                message.language.get('COMMAND_HELP_EXTENDED'),
                isFunction(command.extendedHelp) ? command.extendedHelp(message.language) : command.extendedHelp
            ], { code: 'asciidoc' });
        }

        if (!('all' in message.flagArgs) && message.guild && ((message.channel as TextChannel).permissionsFor(this.client.user as ClientUser) as Permissions).has(PERMISSIONS_RICHDISPLAY)) {
            // Finish the previous handler
            const previousHandler = this.handlers.get((message.author as KlasaUser).id);
            if (previousHandler) previousHandler.stop();

            const handler = await (await this.buildDisplay(message)).run(await message.send('Loading Commands...') as KlasaMessage, {
                filter: (_reaction: MessageReaction, user: KlasaUser) => user.id === (message.author as KlasaUser).id,
                time
            });
            handler.on('end', () => this.handlers.delete((message.author as KlasaUser).id));
            this.handlers.set((message.author as KlasaUser).id, handler);
            return null;
        }

        (message.author as KlasaUser).send(await this.buildHelp(message), { split: { char: '\n' } })
            .then(() => { if (message.channel.type !== 'dm') message.sendMessage(message.language.get('COMMAND_HELP_DM')); })
            .catch(() => { if (message.channel.type !== 'dm') message.sendMessage(message.language.get('COMMAND_HELP_NODM')); });

        return null;
    }

    public async buildHelp(message: KlasaMessage): Promise<string> {
        const commands = await this._fetchCommands(message);
        const { prefix } = message.guildSettings as any;

        const helpMessage = [];
        for (const [category, list] of commands) {
            helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, message, prefix, false)).join('\n'), '');
        }

        return helpMessage.join('\n');
    }

    public async buildDisplay(message: KlasaMessage): Promise<RichDisplay> {
        const commands = await this._fetchCommands(message);
        const { prefix } = message.guildSettings as any;
        const display = new RichDisplay();
        const color = (message.member as GuildMember).displayColor;
        for (const [category, list] of commands) {
            display.addPage(new MessageEmbed()
                .setTitle(`${category} Commands`)
                .setColor(color)
                .setDescription(list.map(this.formatCommand.bind(this, message, prefix, true)).join('\n'))
            );
        }

        return display;
    }

    public formatCommand(message: KlasaMessage, prefix: string, richDisplay: boolean, command: Command): string {
        const description = isFunction(command.description) ? command.description(message.language) : command.description;
        return richDisplay ? `• **${prefix}${command.name}** → \`${description}\`` : `• **${prefix}${command.name}** → \`${description}\``;
    }

    private async _fetchCommands(message: KlasaMessage): Promise<Map<string, Command[]>> {
        const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
        const commands = new Map();
        await Promise.all(this.client.commands.map((command) => run(command, true)
            .then(() => {
                const category = commands.get(command.category);
                if (category) category.push(command);
                else commands.set(command.category, [command]);
            }).catch(() => {
                // noop
            })
        ));

        return commands;
    }

}
