import { Task } from 'klasa';

export default class extends Task {

    readonly cron = '0 */3 * * *';

    public async run(): Promise<void> {
        this.client.console.log('Updating Villager');
        this.client.settings!.update([
            ['villager.time', Date.now()],
            ['villager.deals', {
                coal: [this.rand(80, 50), 1],
                stone: [this.rand(120, 80), 1],
                iron: [this.rand(50, 20), 1],
                redstone: [this.rand(6, 2), 1],
                lapis: [this.rand(6, 2), 1],
                gold: [1, this.rand(2, 1)],
                diamond: [1, this.rand(4, 2)]
            }]
        ]).catch(console.log);
    }

    /**
     * Returns an integer between num2 and num2 + num1
     * @param {number} num1
     * @param {number} num2
     * @returns {number}
     */
    private rand(num1: number, num2: number): number {
        return Math.floor(Math.random() * num1) + num2;
    }

}
