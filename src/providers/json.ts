import { Provider, util, ProviderStore } from 'klasa';
import { resolve } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs-nextra');

export default class extends Provider {

    public baseDirectory: string;

    public constructor(store: ProviderStore, file: string[], directory: string) {
        super(store, file, directory);
        this.baseDirectory = resolve(this.client.userBaseDirectory, 'bwd', 'provider', 'json');
    }

    /**
	 * Initializes the database
	 * @private
	 */
    async init(): Promise<void> {
        await fs.ensureDir(this.baseDirectory).catch((err: Error) => this.client.emit('error', err));
    }

    /* Table methods */

    /**
	 * Checks if a directory exists.
	 * @param {string} table The name of the table you want to check
	 * @returns {Promise<boolean>}
	 */
    public hasTable(table: string): Promise<boolean> {
        return fs.pathExists(resolve(this.baseDirectory, table));
    }

    /**
	 * Creates a new directory.
	 * @param {string} table The name for the new directory
	 * @returns {Promise<void>}
	 */
    public createTable(table: string): Promise<void> {
        return fs.mkdir(resolve(this.baseDirectory, table));
    }

    /**
	 * Recursively deletes a directory.
	 * @param {string} table The directory's name to delete
	 * @returns {Promise<void>}
	 */
    public async deleteTable(table: string): Promise<void | null> {
        return this.hasTable(table)
            .then(exists => exists ? fs.emptyDir(resolve(this.baseDirectory, table)).then(() => fs.remove(resolve(this.baseDirectory, table))) : null);
    }

    /* Document methods */

    /**
	 * Get all documents from a directory.
	 * @param {string} table The name of the directory to fetch from
	 * @param {string[]} [entries] The entries to download, defaults to all keys in the directory
	 * @returns {Object[]}
	 */
    public async getAll(table: string, entries: string[] = []): Promise<(object | null)[]> {
        if (!Array.isArray(entries) || !entries.length) entries = await this.getKeys(table);
        if (entries.length < 5000) {
            return Promise.all(entries.map(this.get.bind(this, table)));
        }

        const chunks = util.chunk(entries, 5000);
        const output = [];
        for (const chunk of chunks) output.push(...await Promise.all(chunk.map(this.get.bind(this, table))));
        return output;
    }

    /**
	 * Get all document names from a directory, filter by json.
	 * @param {string} table The name of the directory to fetch from
	 * @returns {string[]}
	 */
    public async getKeys(table: string): Promise<string[]> {
        const dir = resolve(this.baseDirectory, table);
        const filenames = await fs.readdir(dir);
        const files = [];
        for (const filename of filenames) {
            if (filename.endsWith('.json')) files.push(filename.slice(0, filename.length - 5));
        }
        return files;
    }

    /**
	 * Get a document from a directory.
	 * @param {string} table The name of the directory
	 * @param {string} id The document name
	 * @returns {Promise<?Object>}
	 */
    public async get(table: string, id: string): Promise<object | null> {
        return fs.readJSON(resolve(this.baseDirectory, table, `${id}.json`)).catch(() => null);
    }

    /**
	 * Check if the document exists.
	 * @param {string} table The name of the directory
	 * @param {string} id The document name
	 * @returns {Promise<boolean>}
	 */
    public async has(table: string, id: string): Promise<boolean> {
        return fs.pathExists(resolve(this.baseDirectory, table, `${id}.json`));
    }

    /**
	 * Get a random document from a directory.
	 * @param {string} table The name of the directory
	 * @returns {Promise<Object>}
	 */
    public async getRandom(table: string): Promise<object | null> {
        return this.getKeys(table).then(data => this.get(table, data[Math.floor(Math.random() * data.length)]));
    }

    /**
	 * Insert a new document into a directory.
	 * @param {string} table The name of the directory
	 * @param {string} document The document name
	 * @param {Object} data The object with all properties you want to insert into the document
	 * @returns {Promise<void>}
	 */
    public create(table: string, document: string, data: object = {}): Promise<void> {
        return fs.outputJSONAtomic(resolve(this.baseDirectory, table, `${document}.json`), { id: document, ...data });
    }

    /**
	 * Update a document from a directory.
	 * @param {string} table The name of the directory
	 * @param {string} document The document name
	 * @param {Object} data The object with all the properties you want to update
	 * @returns {void}
	 */
    public async update(table: string, document: string, data: object): Promise<void> {
        const existent = await this.get(table, document);
        return fs.outputJSONAtomic(resolve(this.baseDirectory, table, `${document}.json`), util.mergeObjects(existent || { id: document }, this.parseUpdateInput(data)));
    }

    /**
	 * Replace all the data from a document.
	 * @param {string} table The name of the directory
	 * @param {string} document The document name
	 * @param {Object} data The new data for the document
	 * @returns {Promise<void>}
	 */
    public replace(table: string, document: string, data: object): Promise<void> {
        return fs.outputJSONAtomic(resolve(this.baseDirectory, table, `${document}.json`), { id: document, ...this.parseUpdateInput(data) });
    }

    /**
	 * Delete a document from the table.
	 * @param {string} table The name of the directory
	 * @param {string} document The document name
	 * @returns {Promise<void>}
	 */
    public delete(table: string, document: string): Promise<void> {
        return fs.unlink(resolve(this.baseDirectory, table, `${document}.json`));
    }

}
