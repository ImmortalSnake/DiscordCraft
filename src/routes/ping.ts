import { Route, RouteStore, KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export default class extends Route {

    public constructor(store: RouteStore, file: string[], directory: string) {
        super(store, file, directory, {
            route: 'ping',
            authenticated: false
        });
    }

    public get(req: KlasaIncomingMessage, res: ServerResponse) {
        return res.end('OK');
    }

}
