import MinecraftCommand from '../lib/base/MinecraftCommand';
import { KlasaMessage, Command, Inhibitor } from 'klasa';

export default class extends Inhibitor {

    public run(msg: KlasaMessage, command: Command | MinecraftCommand): void {
        if (this.client.owners.has(msg.author!) || !(command instanceof MinecraftCommand)) return;
        const existing = command.cooldowns.get(msg.author!.id);

        if (existing && existing.limited) throw msg.language.get('INHIBITOR_COOLDOWN', Math.ceil(existing.remainingTime / 1000));
    }

}
