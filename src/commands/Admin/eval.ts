import { Command, CommandStore, KlasaMessage, util, Stopwatch, Type } from 'klasa';
import Util from '../../utils/util';
import { inspect } from 'util';

interface IEvalResult {
    success: boolean;
    result: Error | string;
    time: string;
    type: string | Type;
}

interface IHandleMessageOptions {
    success: boolean;
    result: any;
    time: string;
    footer: string;
    language: string;
}


export default class extends Command {

    private timeout = 3000;

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            hidden: true,
            guarded: true,
            permissionLevel: 10,
            quotedStringSupport: false,
            usage: '<expression:...str>',
            description: language => language.get('COMMAND_EVAL_DESCRIPTION'),
            extendedHelp: language => language.get('COMMAND_EVAL_EXTENDEDHELP')
        });
    }

    async run(msg: KlasaMessage, [code]: [string]): Promise<KlasaMessage | KlasaMessage[] | null> {
        const flagTime = 'no-timeout' in msg.flagArgs ? 'wait' in msg.flagArgs ? Number(msg.flagArgs.wait) : this.timeout : Infinity;
        const language = msg.flagArgs.lang || msg.flagArgs.language || (msg.flagArgs.json ? 'json' : 'js');
        const { success, result, time, type } = await this.timedEval(msg, code, flagTime);

        if (msg.flagArgs.silent) {
            if (!success && result) this.client.emit('error', result);
            return null;
        }

        const footer = util.codeBlock('ts', type);
        const sendAs = msg.flagArgs.output || msg.flagArgs['output-to'] || (msg.flagArgs.log ? 'log' : null);
        return this.handleMessage(msg, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer, language });
    }


    async handleMessage(msg: KlasaMessage, options: any, { success, result, time, footer, language }: IHandleMessageOptions): Promise<KlasaMessage | KlasaMessage[] | null> {
        switch (options.sendAs) {
            case 'file': {
                if (msg.channel.attachable) return msg.channel.sendFile(Buffer.from(result), 'output.txt', msg.language.get('COMMAND_EVAL_SENDFILE', time, footer));
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, { success, result, time, footer, language });
            }
            case 'haste':
            case 'hastebin': {
                // eslint-disable-next-line require-atomic-updates
                if (!options.url) options.url = await Util.getHaste(result, language).catch(() => null);
                if (options.url) return msg.sendMessage(msg.language.get('COMMAND_EVAL_SENDHASTE', time, options.url, footer));
                // eslint-disable-next-line require-atomic-updates
                options.hastebinUnavailable = true;
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, { success, result, time, footer, language });
            }
            case 'console':
            case 'log': {
                this.client.emit('log', result);
                return msg.sendMessage(msg.language.get('COMMAND_EVAL_SENDCONSOLE', time, footer));
            }
            case 'none':
                return null;
            default: {
                if (result.length > 2000) {
                    await this.getTypeOutput(msg, options);
                    return this.handleMessage(msg, options, { success, result, time, footer, language });
                }
                return msg.sendMessage(msg.language.get(success ? 'COMMAND_EVAL_OUTPUT' : 'COMMAND_EVAL_ERROR',
                    time, util.codeBlock(language, result), footer));
            }
        }
    }

    async getTypeOutput(msg: KlasaMessage, options: { hastebinUnavailable: boolean, sendAs: string }): Promise<void> {
        const _options = ['log'];
        if (msg.channel.attachable) _options.push('file');
        if (!options.hastebinUnavailable) _options.push('hastebin');
        const _choice = await msg.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch(() => ({ content: 'none' }));

        if (!['file', 'haste', 'hastebin', 'console', 'log', 'default', 'none', null].includes(_choice.content)) {
            // eslint-disable-next-line require-atomic-updates
            options.sendAs = 'none';
        } else {
            // eslint-disable-next-line require-atomic-updates
            options.sendAs = _choice.content;
        }
    }

    private timedEval(msg: KlasaMessage, code: string, flagTime: number): any {
        if (flagTime === Infinity || flagTime === 0) return this.eval(msg, code);
        return Promise.race([
            util.sleep(flagTime).then(() => ({
                success: false,
                result: msg.language.get('COMMAND_EVAL_TIMEOUT', flagTime / 1000),
                time: '⏱ ...',
                type: 'EvalTimeoutError'
            })),
            this.eval(msg, code)
        ]);
    }

    // Eval the input
    private async eval(msg: KlasaMessage, code: string): Promise<IEvalResult> {
        const stopwatch = new Stopwatch();
        let success, syncTime, asyncTime, result;
        let thenable = false;
        let type;
        try {
            if (msg.flagArgs.async) code = `(async () => {\n${code}\n})();`;
            // tslint:disable-next-line: no-eval
            result = eval(code);
            syncTime = stopwatch.toString();
            type = new Type(result);
            if (util.isThenable(result)) {
                thenable = true;
                stopwatch.restart();
                result = await result;
                asyncTime = stopwatch.toString();
            }
            success = true;
        } catch (error) {
            if (!syncTime) syncTime = stopwatch.toString();
            if (thenable && !asyncTime) asyncTime = stopwatch.toString();
            if (!type) type = new Type(error);
            result = error.message;
            success = false;
        }

        stopwatch.stop();
        if (typeof result !== 'string') {
            result = result instanceof Error ? result.stack : msg.flagArgs.json ? JSON.stringify(result, null, 4) : inspect(result, {
                depth: msg.flagArgs.depth ? parseInt(msg.flagArgs.depth) || 0 : 0,
                showHidden: Boolean(msg.flagArgs.showHidden)
            });
        }
        return { success, type, time: Util.formatTime(syncTime, asyncTime), result: util.clean(result!) };
    }

}
