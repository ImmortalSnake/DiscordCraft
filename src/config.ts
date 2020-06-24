import { KlasaClientOptions } from 'klasa';

const provider = process.env.NODE_ENV === 'development' ? 'json' : 'mongodb';
export const config = {
    fetchAllMembers: false,
    disableEveryone: true,
    prefix: 'd!',
    commandEditing: true,
    owners: ['410806297580011520'],
    presence: {
        activity: {
            type: 'LISTENING',
            name: 'to d!help'
        }
    },
    providers: {
        default: provider
    },
    pieceDefaults: {
        commands: {
            runIn: ['text'],
            usageDelim: ' ',
            quotedStringSupport: true
        }
    },

    readyMessage: (client) => `Logged in as ${client.user!.tag}. Ready to serve ${client.guilds.cache.size} guilds.`
} as KlasaClientOptions;

export const mongoOptions = {
    // eslint-disable-next-line no-process-env
    uri: process.env.MONGO_PASS,
    options: {
        useNewUrlParser: true,
        poolSize: 5,
        connectTimeoutMS: 10000,
        useUnifiedTopology: true
    }
};

export const MinecraftOptions = {
    clientID: '557831541653241857',
    developer: '410806297580011520',
    support: 'https://discord.gg/RZjVQ6',
    config: {
        // eslint-disable-next-line no-process-env
        provider: provider
    }
};
