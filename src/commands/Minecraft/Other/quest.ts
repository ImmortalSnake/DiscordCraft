import { KlasaMessage, util } from 'klasa';
import quests from '../../../lib/game/quests';
import MinecraftCommand from '../../../lib/base/MinecraftCommand';
import { Tool } from '../../../lib/game/items/tool';

export default class extends MinecraftCommand {

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) throw msg.language.get('INVENTORY_NOT_FOUND', msg.guildSettings.get('prefix'));

        const { REWARDS, PROGRESS } = msg.language.KEYWORDS;
        if (!Object.keys(inventory.quests.current).length) {
            const quest = quests[inventory.quests.id];
            if (!quest) throw msg.language.get('QUEST_UNAVAILABLE');

            quest.start(inventory);
            return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
                .setLocaleTitle('QUEST_START_TITLE', quest.title)
                .setDescription(quest.description(msg))
                .addField(REWARDS, this.stringify(quest.rewards))));
        } else {
            const quest = quests[inventory.quests.id];
            if (quest.checkCompleted(inventory)) {
                inventory.quests.current = {};
                inventory.quests.id += 1;

                inventory.profile.xp += quest.xp;
                inventory.profile.coins += quest.coins;

                for (const re in quest.rewards) {
                    const item = this.client.minecraft.store[re] as Tool;
                    const reward = inventory[item.type as 'tools' | 'materials'].find(ex => ex[0] === re);

                    if (item.type === 'tools') {
                        // eslint-disable-next-line no-unused-expressions
                        reward ? reward[1] = item.durability : inventory.tools.push([re, item.durability]);
                    } else {
                        // eslint-disable-next-line no-unused-expressions
                        reward ? reward[1] += (quest.rewards as any)[re] : inventory[item.type as 'materials'].push([re, (quest.rewards as any)[re]]);
                    }
                }

                return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(this.embed(msg)
                    .setLocaleTitle('QUEST_COMPLETE_TITLE', quest.title)
                    .setLocaleDescription('QUEST_COMPLETE_DESCRIPTION')));
            } else {
                return msg.send(this.embed(msg)
                    .setLocaleTitle('QUEST_PROGRESS_TITLE', quest.title)
                    .setDescription(quest.description(msg))
                    .addField(REWARDS, this.stringify(quest.rewards), true)
                    .addField(PROGRESS, this.stringify(inventory.quests.current), true));
            }
        }
    }

    private stringify(obj: any): string {
        let mess = '**';
        for (const key in obj) {
            mess += `${util.toTitleCase(key)} x${obj[key]}`;
        }

        mess += '**';
        return mess;
    }

}
