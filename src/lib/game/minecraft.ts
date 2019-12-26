import DiscordCraft from '../client';
import axe from '../../../assets/items/tools/axe.json';
import hoe from '../../../assets/items/tools/hoe.json';
import materials from '../../../assets/items/materials/materials.json';
import food from '../../../assets/items/materials/food.json';
import pickaxe from '../../../assets/items/tools/pickaxe.json';
import rod from '../../../assets/items/tools/rod.json';
import shop from '../../../assets/game/shop.json';
import recipes from '../../../assets/game/recipes.json';
import { KlasaUser, Provider } from 'klasa';
import Inventory, { userSchema } from './items/inventory';
import util from '../../utils/util';
import { Item, Tool } from './items/tool';

interface MinecraftOptions {
    provider: string | undefined;
}

export interface UserInventory {
    id: string;
    inventory: Inventory;
}

export default class Minecraft {

    public client: DiscordCraft;
    public options: MinecraftOptions;

    public store: Record<string, Item | Tool> = Object.assign({}, pickaxe, axe, hoe, materials, food, rod);
    public toolStore: Record<string, Tool> = Object.assign({}, pickaxe, axe, hoe, rod)
    public villageTimer = 10800000;
    public shop = shop;
    public recipes: any = recipes;

    public constructor(client: DiscordCraft, options: MinecraftOptions) {
        this.client = client;
        this.options = options;
    }

    public get provider(): Provider {
        return this.client.providers.get(this.options.provider || 'mongodb')!;
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
            res.inventory.profile.name = player.tag;
            res.inventory.profile.created = Date.now();
            return this.provider.create('users', player.id, res);
        });
    }

    public updateLevel(inventory: Inventory): boolean {
        const nxtLevel = 25 * inventory.profile.level;
        if (inventory.profile.xp >= nxtLevel) {
            inventory.profile.xp = 0;
            inventory.profile.level += 1;
            inventory.profile.coins += Math.floor(nxtLevel / 10);

            return true;
        }

        return false;
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
