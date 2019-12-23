import { Command, util, CommandStore, KlasaMessage, SettingsFolderUpdateResult, SchemaEntry, SchemaFolder, Schema } from 'klasa';

export default class extends Command {

    constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            permissionLevel: 6,
            guarded: true,
            subcommands: true,
            description: language => language.get('COMMAND_CONF_SERVER_DESCRIPTION'),
            usage: '<set|show|remove|reset> (key:key) (value:value)'
        });

        this
            .createCustomResolver('key', (arg, __, msg, [action]) => {
                if (action === 'show' || arg) return arg;
                throw msg.language.get('COMMAND_CONF_NOKEY');
            })
            .createCustomResolver('value', (arg, possible, msg, [action]) => {
                if (!['set', 'remove'].includes(action)) return null;
                if (arg) return this.client.arguments.get('...string')!.run(arg, possible, msg);
                throw msg.language.get('COMMAND_CONF_NOVALUE');
            });
    }

    public async show(msg: KlasaMessage, [key]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const entry = this.getPath(key);
        if (!entry || (entry.type === 'Folder' ? !entry.configurableKeys.length : !(entry as Schema).configurableKeys.length)) return msg.sendLocale('COMMAND_CONF_GET_NOEXT', [key]);
        if (entry.type === 'Folder') {
            return msg.sendLocale('COMMAND_CONF_SERVER', [
                key ? `: ${key.split('.').map(util.toTitleCase).join('/')}` : '',
                util.codeBlock('asciidoc', msg.guild!.settings.display(msg, entry))
            ]);
        }
        return msg.sendLocale('COMMAND_CONF_GET', [entry.path, msg.guild!.settings.display(msg, entry)]);
    }

    public async set(msg: KlasaMessage, [key, valueToSet]: [string, string]): Promise<KlasaMessage | KlasaMessage[]> {
        const entry = this.check(msg, key, await msg.guild!.settings.update(key, valueToSet, { onlyConfigurable: true, arrayAction: 'add' }));
        return msg.sendLocale('COMMAND_CONF_UPDATED', [key, msg.guild!.settings.display(msg, entry)]);
    }

    public async remove(msg: KlasaMessage, [key, valueToRemove]: [string, string]): Promise<KlasaMessage | KlasaMessage[]> {
        const entry = this.check(msg, key, await msg.guild!.settings.update(key, valueToRemove, { onlyConfigurable: true, arrayAction: 'remove' }));
        return msg.sendLocale('COMMAND_CONF_UPDATED', [key, msg.guild!.settings.display(msg, entry)]);
    }

    public async reset(msg: KlasaMessage, [key]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
        const entry = this.check(msg, key, await msg.guild!.settings.reset(key));
        return msg.sendLocale('COMMAND_CONF_RESET', [key, msg.guild!.settings.display(msg, entry)]);
    }

    private check(msg: KlasaMessage, key: string, { errors, updated }: SettingsFolderUpdateResult): SchemaEntry {
        if (errors.length) throw String(errors[0]);
        if (!updated.length) throw msg.language.get('COMMAND_CONF_NOCHANGE', key);
        return updated[0].entry;
    }

    private getPath(key: string): SchemaFolder | Schema | undefined {
        const { schema } = this.client.gateways.get('guilds')!;
        if (!key) return schema;
        try {
            return schema.get(key);
        } catch (__) {
            return undefined;
        }
    }

}
