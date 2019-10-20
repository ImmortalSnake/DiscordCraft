import DiscordCraft from '../client';
import axe from '../../../assets/items/tools/axe.json';
import hoe from '../../../assets/items/tools/hoe.json';
import materials from '../../../assets/items/materials/materials.json';
import other from '../../../assets/items/other.json';
import food from '../../../assets/items/materials/food.json';
import pickaxe from '../../../assets/items/tools/pickaxe.json';
import rod from '../../../assets/items/tools/rod.json';
import shop from '../../../assets/game/shop.json';
import { KlasaUser, Provider } from 'klasa';
import Inventory, { userSchema } from './items/inventory';
import util from '../../utils/util';

interface MinecraftOptions {
    provider: string;
}

export interface UserInventory {
    id: string;
    inventory: Inventory;
}

export default class Minecraft {

    public client: DiscordCraft;
    public options: MinecraftOptions;

    public store = Object.assign({}, pickaxe, axe, hoe, materials, other, food, rod);
    public villageTimer = 10800000;
    public shop = shop;

    public constructor(client: DiscordCraft, options: MinecraftOptions) {
        this.client = client;
        this.options = options;
    }

    public get provider(): Provider {
        return this.client.providers.get(this.options.provider)!;
    }

    public search(key: string): [string, any | null] {
        key = key.trim().toLowerCase().replace(' ', '_');
        if (this.store[key]) return [key, this.store[key]];
        return ['', null];
    }

    public async get(id: string): Promise<UserInventory> {
        const res = await this.provider.get('users', id);
        return util.mergeDefault(userSchema, res);
    }

    public set(id: string, val: any): Promise<any> {
        return this.provider.replace('users', id, val);
    }

    public update(id: string, val: any): Promise<any> {
        return this.set(id, util.remDefault(userSchema, val));
    }

    public async create(player: KlasaUser): Promise<any> {
        return this.get(player.id).then(res => {
            res.id = player.id;
            return this.provider.create('users', player.id, res);
        });
    }

    /**
     * Shortens and serializes the data
     * Not used, but might be in the future :)
     * @param data Data to serialize
     */
    private serialize(data: any): any {
        for (const key of Object.keys(data)) {
            if (util.isObject(data[key])) {
                data[key] = this.serialize(data[key]);
            } else if (Array.isArray(data[key])) {
                const obj = {} as any;
                // eslint-disable-next-line no-return-assign
                data[key].map((ex: any) => obj[ex.name] = ex.amount || ex.durability);
                data[key] = obj;
            }
        }
        return data;
    }

}
