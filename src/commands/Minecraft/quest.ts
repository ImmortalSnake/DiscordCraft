import { KlasaMessage, util } from 'klasa';
import { MessageEmbed } from 'discord.js';
import quests from '../../lib/game/quests';
import MinecraftCommand from '../../lib/base/MinecraftCommand';

export default class extends MinecraftCommand {

    public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
        const { id, inventory } = await this.client.minecraft.get(msg.author!.id);
        if (!id) return msg.send('You do not have a player! Please use the start command to begin playing');

        if (!Object.keys(inventory.quests.current).length) {
            const quest = quests[inventory.quests.id];
            if (!quest) return msg.send('Sorry, there are no quests available right now!');

            quest.start(inventory);
            return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(new MessageEmbed()
                .setColor('#5d97f5')
                .setTitle(`Quest - ${quest.title}`)
                .setDescription(quest.description(msg))
                .addField('Rewards', this.stringify(quest.rewards))));
        } else {
            const quest = quests[inventory.quests.id];
            if (quest.checkCompleted(inventory)) {
                inventory.quests.current = {};
                inventory.quests.id += 1;

                inventory.profile.xp += quest.xp;
                inventory.profile.coins += quest.coins;

                for (const re in quest.rewards) {
                    const item = this.client.minecraft.store[re];
                    const reward = inventory[item.type as 'tools' | 'materials'].find(ex => ex[0] === re);

                    if (item.type === 'tools') {
                        // eslint-disable-next-line no-unused-expressions
                        reward ? reward[1] = item.durability : inventory.tools.push([re, item.durability]);
                    } else {
                        // eslint-disable-next-line no-unused-expressions
                        reward ? reward[1] += (quest.rewards as any)[re] : inventory[item.type as 'materials'].push([re, (quest.rewards as any)[re]]);
                    }
                }

                return this.client.minecraft.update(msg.author!.id, { id, inventory }).then(() => msg.send(new MessageEmbed()
                    .setColor('#5d97f5')
                    .setTitle(`Quest Complete: ${quest.title}`)
                    .setDescription('**Congratulations! You have completed the quest\nYou have recieved your rewards\nUse the quest command again to get a new quest!**')));
            } else {
                return msg.send(new MessageEmbed()
                    .setColor('#5d97f5')
                    .setTitle(`Quest In Progress - ${quest.title}`)
                    .setDescription(quest.description(msg))
                    .addField('Rewards', this.stringify(quest.rewards), true)
                    .addField('Progress', this.stringify(inventory.quests.current), true));
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
