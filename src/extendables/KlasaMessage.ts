import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

export default class extends Extendable {

    public constructor(store: ExtendableStore, file: string[], directory: string) {
        super(store, file, directory, { appliesTo: [KlasaMessage] });
    }

    public get commandPrefix(this: KlasaMessage): string {
        return this.guildSettings.get('prefix') as string;
    }

}
