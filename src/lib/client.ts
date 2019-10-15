import './structures/schemas/clientStorage';
import { KlasaClient, KlasaClientOptions } from 'klasa';
import { MinecraftOptions } from '../config';
import permissionLevel from './structures/permissionLevel';
import Minecraft from './game/minecraft';

const { clientID, config } = MinecraftOptions;

export default class DiscordCraft extends KlasaClient {

    public minecraft: Minecraft;
    public id = clientID;

    public constructor(options: KlasaClientOptions) {
        super(options);

        this.permissionLevels = permissionLevel;
        this.minecraft = new Minecraft(this, config);
    }

}
