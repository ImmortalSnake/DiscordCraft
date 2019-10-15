import { KlasaClient, SchemaFolder } from 'klasa';

KlasaClient.defaultClientSchema
    .add('villager', (folder: SchemaFolder) => folder
        .add('deals', 'any')
        .add('time', 'string'));
