require('dotenv').config();

// tslint:disable: no-trailing-whitespace
console.log(`
________  .__                              .____________                _____  __   
\\______ \\ |__| ______ ____  ___________  __| _/\\_   ___ \\____________ _/ ____\\/  |_ 
 |    |  \\|  |/  ___// ___\\/  _ \\_  __ \\/ __ | /    \\  \\/\\_  __ \\__  \\\\   __\\\\   __\\
 |    \`   \\  |\\___  \\  \\__(  <_> )  | \\/ /_/ | \\     \\____|  | \\// __ \\|  |   |  |  
/_______  /__/____  >\\___  >____/|__|  \\____ |  \\______  /|__|  (____  /__|   |__|  
        \\/        \\/     \\/                 \\/         \\/            \\/ 
`);

import DiscordCraft from './lib/client';
import { config } from './config';

// eslint-disable-next-line no-process-env
new DiscordCraft(config).login(process.env.token);
