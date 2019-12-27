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

    public setLocaleDescription(title: string, ...args: any[]): this {
        return super.setDescription(this.language.get(title, ...args));
    }

    public setLocaleFooter(title: string, ...args: any[]): this {
        return super.setDescription(this.language.get(title, ...args));
    }

}
