import { Command, CommandStore } from 'klasa';

// Disable this default klasa command
export default class extends Command {

    public constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            enabled: false
        });
    }

}
