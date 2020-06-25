import './structures/schemas/clientStorage';

import { KlasaClient, KlasaClientOptions } from 'klasa';
import { DashboardClient } from 'klasa-dashboard-hooks';
import { MinecraftOptions } from '../config';
import permissionLevel from './structures/permissionLevel';
import Minecraft from './game/minecraft';

const { clientID, developer, support, config } = MinecraftOptions;

KlasaClient.use(DashboardClient);

export default class DiscordCraft extends KlasaClient {

    public minecraft: Minecraft;
    public id = clientID;
    public developer = developer;
    public support = support;
    public version = 'v 1.1.0';

    public constructor(options: KlasaClientOptions) {
        super(options);

        this.permissionLevels = permissionLevel;
        this.minecraft = new Minecraft(this, config);
    }

    public get prefix(): string {
        return Array.isArray(this.options.prefix) ? this.options.prefix[0] : this.options.prefix;
    }

}
