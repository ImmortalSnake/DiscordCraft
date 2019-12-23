import { Client } from 'discord.js';
import { KlasaClientOptions } from 'klasa';

export const config = {
    fetchAllMembers: false,
    disableEveryone: true,
    prefix: 's!',
    commandEditing: true,
    owners: ['410806297580011520'],
    pieceDefaults: {
        commands: {
            runIn: ['text'],
            usageDelim: ' ',
            quotedStringSupport: true
        }
    },

    readyMessage: (client: Client) => `Logged in as ${client.user!.tag}. Ready to serve ${client.guilds.size} guilds.`
} as KlasaClientOptions;

export const mongoOptions = {
    // eslint-disable-next-line no-process-env
    uri: process.env.MONGO_PASS,
    options: {
        useNewUrlParser: true,
        reconnectInterval: 500,
        reconnectTries: Number.MAX_VALUE,
        poolSize: 5,
        connectTimeoutMS: 10000,
        autoIndex: false
    }
};

export const MinecraftOptions = {
    clientID: '557831541653241857',
    developer: '410806297580011520',
    config: {
        // eslint-disable-next-line no-process-env
        provider: process.env.DATABASE
    }
};
