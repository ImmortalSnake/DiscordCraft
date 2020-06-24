import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Language } from 'klasa';

export default class LocaleEmbed extends MessageEmbed {

    public language: Language;
    public constructor(msg: KlasaMessage) {
        super();

        this.language = msg.language;
    }

    public setLocaleTitle(title: string, ...args: any[]): this {
        return super.setTitle(this.language.get(title, ...args));
    }

    public setLocaleDescription(args: [string?, ...any[]][]): this;
    public setLocaleDescription(field: string, ...args: any[]): this;
    public setLocaleDescription(field: string | [string?, ...any[]][], ...args: any[]): this {
        if (typeof field === 'string') {
            return super.setDescription(this.language.get(field, ...args));
        }

        return super.setDescription(field.map(([title, ...args]) => {
            if (!title) return;
            return this.language.get(title, ...args)
        }).join('\n'));
    }

    public setLocaleFooter(title: string, ...args: any[]): this {
        return super.setDescription(this.language.get(title, ...args));
    }

}
