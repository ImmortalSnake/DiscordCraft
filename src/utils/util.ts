import { util, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';
import { Message } from 'discord.js';

export default abstract class extends util {

    static formatTime(syncTime: string, asyncTime?: string): string {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    }

    static async getHaste(evalResult: string, language: string): Promise<string> {
        // eslint-disable-next-line no-undef
        const key = await fetch('https://hasteb.in/documents', { method: 'POST', body: evalResult })
            .then(response => response.json())
            .then(body => body.key);
        return `https://hasteb.in/${key}.${language}`;
    }

    static async prompt(msg: KlasaMessage, text: string): Promise<Message | KlasaMessage> {
        await msg.send(text);
        const messages = await msg.channel.awaitMessages(mes => mes.author === msg.author, { time: 60000, max: 1 });
        if (messages.size === 0) throw null;
        return messages.first()!;
    }

    static remDefault(def: any, given: any): any {
        const obj: any = {};

        for (const key in given) {
            if (typeof def[key] === 'undefined') {
                obj[key] = given[key];
            } else if (util.isObject(given[key])) {
                const res = this.remDefault(def[key], given[key]);
                if (Object.keys(res).length) obj[key] = res;
            } else if (JSON.stringify(def[key]) !== JSON.stringify(given[key])) { obj[key] = given[key]; }
        }

        return obj;
    }

    static msToTime(duration: number): string {
        const seconds = Math.floor((duration / 1000) % 60) as string | number,
            minutes = Math.floor((duration / (1000 * 60)) % 60) as string | number,
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24) as string | number;

        // hours = (hours < 10) ? '0' + hours : hours;
        // minutes = (minutes < 10) ? '0' + minutes : minutes;
        // seconds = (seconds < 10) ? '0' + seconds : seconds;

        return `${hours}h ${minutes}m ${seconds}s`;
    }

}
