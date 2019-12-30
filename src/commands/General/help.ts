import { MessageEmbed, Permissions, TextChannel, Collection } from 'discord.js';
import { CommandStore, KlasaMessage, util, Command } from 'klasa';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import MinecraftCommand from '../../lib/base/MinecraftCommand';
import { COLORS } from '../../utils/constants';

const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);

export default class extends MinecraftCommand {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            aliases: ['commands', 'cmd', 'cmds'],
            guarded: true,
            usage: '(Command:command|page:integer|category:category)',
            flagSupport: true,
            runIn: ['text', 'dm'],
            examples: ['', 'start', 'general', '3']
        });

        this.createCustomResolver('command', (arg, possible, msg) => {
            if (!arg) return undefined;
            return this.client.arguments.get('command')!.run(arg, possible, msg);
        });
        this.createCustomResolver('category', async (arg, __, msg) => {
            if (!arg) return undefined;
            arg = arg.toLowerCase();
            const commandsByCategory = await this._fetchCommands(msg);
            for (const [page, category] of commandsByCategory.keyArray().entries()) {
                // Add 1, since 1 will be subtracted later
                if (category.toLowerCase() === arg) return page + 1;
            }
            return undefined;
        });
    }

    // eslint-disable-next-line complexity
    public async run(msg: KlasaMessage, [commandOrPage]: [Command | number | undefined]): Promise<KlasaMessage | KlasaMessage[] | null> {
        if (msg.flagArgs.categories || msg.flagArgs.cat) {
            const commandsByCategory = await this._fetchCommands(msg);
            const { language } = msg;
            let i = 0;
            const commandCategories: string[] = [];
            for (const [category, commands] of commandsByCategory) {
                const line = String(++i).padStart(2, '0');
                commandCategories.push(`\`${line}.\` **${category}** → ${language.get('COMMAND_HELP_COMMAND_COUNT', commands.length)}`);
            }
            return msg.sendMessage(commandCategories);
        }

        // Handle case for a single command
        const command = typeof commandOrPage === 'object' ? commandOrPage : null;
        if (command) {
            return msg.sendMessage([
                msg.language.get('COMMAND_HELP_TITLE', command.name, util.isFunction(command.description) ? command.description(msg.language) : command.description),
                msg.language.get('COMMAND_HELP_ALIASES', command.aliases),
                msg.language.get('COMMAND_HELP_USAGE', command instanceof MinecraftCommand ? command.fullUsage(msg) : command.usage.fullUsage(msg)),
                msg.language.get('COMMAND_HELP_EXTENDED', util.isFunction(command.extendedHelp) ? command.extendedHelp(msg.language) : command.extendedHelp),
                command instanceof MinecraftCommand ? msg.language.get('COMMAND_HELP_EXAMPLE', command.displayExamples) : ''
            ].join('\n'));
        }

        if (!msg.flagArgs.all && msg.guild && (msg.channel as TextChannel).permissionsFor(this.client.user!)!.has(PERMISSIONS_RICHDISPLAY)) {
            const response = await msg.sendMessage(
                msg.language.get('COMMAND_HELP_ALL_FLAG', msg.guildSettings.get('prefix')),
                new MessageEmbed({ description: msg.language.get('SYSTEM_LOADING'), color: COLORS.PRIMARY })
            );
            const display = await this.buildDisplay(msg);

            // Extract start page and sanitize it
            const page = util.isNumber(commandOrPage) ? commandOrPage - 1 : null;
            const startPage = page === null || page < 0 || page >= display.pages.length ? null : page;
            await display.start(response, msg.author!.id, startPage === null ? undefined : { startPage });
            return response;
        }

        try {
            const response = await msg.author!.send(await this.buildHelp(msg), { split: { char: '\n' } });
            msg.channel.type === 'dm' ? response : await msg.sendLocale('COMMAND_HELP_DM');
            return null;
        } catch {
            return msg.channel.type === 'dm' ? null : msg.sendLocale('COMMAND_HELP_NODM');
        }
    }

    private async buildHelp(msg: KlasaMessage): Promise<string> {
        const commands = await this._fetchCommands(msg);
        const prefix = msg.guildSettings.get('prefix') as string;

        const helpMessage: string[] = [];
        for (const [category, list] of commands) {
            helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, msg, prefix, false)).join('\n'), '');
        }

        return helpMessage.join('\n');
    }

    private async buildDisplay(msg: KlasaMessage): Promise<UserRichDisplay> {
        const commandsByCategory = await this._fetchCommands(msg);
        const prefix = msg.guildSettings.get('prefix') as string;

        const display = new UserRichDisplay(this.embed(msg));
        for (const [category, commands] of commandsByCategory) {
            display.addPage((template: MessageEmbed) => template
                .setTitle(`${category} Commands`)
                .setDescription(commands.map(this.formatCommand.bind(this, msg, prefix, true)).join('\n')));
        }

        return display;
    }


    private formatCommand(msg: KlasaMessage, prefix: string, richDisplay: boolean, command: Command): string {
        const description = util.isFunction(command.description) ? command.description(msg.language) : command.description;
        return richDisplay ? `• **${prefix}${command.name}** → \`${description}\`` : `• **${prefix}${command.name}** → \`${description}\``;
    }

    private async _fetchCommands(msg: KlasaMessage): Promise<Collection<string, Command[]>> {
        const run = this.client.inhibitors.run.bind(this.client.inhibitors, msg);
        const commands = new Collection<string, Command[]>();
        await Promise.all(this.client.commands.map(command => run(command, true)
            .then(() => {
                const cat = command.fullCategory.join(' ');
                const category = commands.get(cat);
                if (category) category.push(command);
                else commands.set(cat, [command]);
                return null;
            }).catch(() => {
                // noop
            })));

        return commands;
    }

}
