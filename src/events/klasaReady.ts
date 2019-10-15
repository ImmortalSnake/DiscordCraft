import { Event } from 'klasa';

export default class extends Event {

    public async run(): Promise<void> {
        if (!this.client.schedule.tasks.some(task => task.taskName === 'villager')) {
            this.client.schedule.create('villager', '0 */3 * * *');
        }
    }

}
