/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Language, util, LanguageStore } from 'klasa';
import DiscordCraft from '../lib/client';
import { LanguageHelp } from '../lib/structures/LanguageHelp';

const builder = new LanguageHelp()
    .setExplainedUsage('⚙ | ***Explained usage***')
    .setPossibleFormats('🔢 | ***Possible formats***')
    .setReminder('⏰ | ***Reminder***');

export default class extends Language {

    constructor(store: LanguageStore, file: string[], directory: string) {
        super(store, file, directory);


        this.language = {

            /**
             * Klasa Defaults
             * More available at klasa-pieces repo
             */

            DEFAULT: (key) => `${key} has not been localized for en-US yet.`,
            DEFAULT_LANGUAGE: 'Default Language',
            PREFIX_REMINDER: (prefix = `@${this.client.user!.tag}`) => `The prefix${Array.isArray(prefix) ?
                `es for this guild are: ${prefix.map(pre => `\`${pre}\``).join(', ')}` :
                ` in this guild is set to: \`${prefix}\``
            }`,

            // settings gateway locales
            SETTING_GATEWAY_EXPECTS_GUILD: 'The parameter <Guild> expects either a Guild or a Guild Object.',
            SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) => `The value ${data} for the key ${key} does not exist.`,
            SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) => `The value ${data} for the key ${key} already exists.`,
            SETTING_GATEWAY_SPECIFY_VALUE: 'You must specify the value to add or filter.',
            SETTING_GATEWAY_KEY_NOT_ARRAY: (key) => `The key ${key} is not an Array.`,
            SETTING_GATEWAY_KEY_NOEXT: (key) => `The key ${key} does not exist in the current data schema.`,
            SETTING_GATEWAY_INVALID_TYPE: 'The type parameter must be either add or remove.',
            SETTING_GATEWAY_INVALID_FILTERED_VALUE: (piece, value) => `${piece.key} doesn't accept the value: ${value}`,

            // resolver locales
            RESOLVER_MULTI_TOO_FEW: (name, min = 1) => `Provided too few ${name}s. At least ${min} ${min === 1 ? 'is' : 'are'} required.`,
            RESOLVER_INVALID_BOOL: (name) => `${name} must be true or false.`,
            RESOLVER_INVALID_CHANNEL: (name) => `${name} must be a channel tag or valid channel id.`,
            RESOLVER_INVALID_CUSTOM: (name, type) => `${name} must be a valid ${type}.`,
            RESOLVER_INVALID_DATE: (name) => `${name} must be a valid date.`,
            RESOLVER_INVALID_DURATION: (name) => `${name} must be a valid duration string.`,
            RESOLVER_INVALID_EMOJI: (name) => `${name} must be a custom emoji tag or valid emoji id.`,
            RESOLVER_INVALID_FLOAT: (name) => `${name} must be a valid number.`,
            RESOLVER_INVALID_GUILD: (name) => `${name} must be a valid guild id.`,
            RESOLVER_INVALID_INT: (name) => `${name} must be an integer.`,
            RESOLVER_INVALID_LITERAL: (name) => `Your option did not match the only possibility: ${name}`,
            RESOLVER_INVALID_MEMBER: (name) => `${name} must be a mention or valid user id.`,
            RESOLVER_INVALID_MESSAGE: (name) => `${name} must be a valid message id.`,
            RESOLVER_INVALID_PIECE: (name, piece) => `${name} must be a valid ${piece} name.`,
            RESOLVER_INVALID_REGEX_MATCH: (name, pattern) => `${name} must follow this regex pattern \`${pattern}\`.`,
            RESOLVER_INVALID_ROLE: (name) => `${name} must be a role mention or role id.`,
            RESOLVER_INVALID_STRING: (name) => `${name} must be a valid string.`,
            RESOLVER_INVALID_TIME: (name) => `${name} must be a valid duration or date string.`,
            RESOLVER_INVALID_URL: (name) => `${name} must be a valid url.`,
            RESOLVER_INVALID_USER: (name) => `${name} must be a mention or valid user id.`,
            RESOLVER_STRING_SUFFIX: ' characters',
            RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `${name} must be exactly ${min}${suffix}.`,
            RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `${name} must be between ${min} and ${max}${suffix}.`,
            RESOLVER_MINMAX_MIN: (name, min, suffix) => `${name} must be greater than ${min}${suffix}.`,
            RESOLVER_MINMAX_MAX: (name, max, suffix) => `${name} must be less than ${max}${suffix}.`,

            REACTIONHANDLER_PROMPT: 'Which page would you like to jump to?',
            COMMANDMESSAGE_MISSING: 'Missing one or more required arguments after end of input.',
            COMMANDMESSAGE_MISSING_REQUIRED: (name) => `${name} is a required argument.`,
            COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) => `Missing a required option: (${possibles})`,
            COMMANDMESSAGE_NOMATCH: (possibles) => `Your option didn't match any of the possibilities: (${possibles})`,
            // eslint-disable-next-line max-len
            MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time, abortOptions) => `${tag} | **${error}** | You have **${time}** seconds to respond to this prompt with a valid argument. Type **${abortOptions.join('**, **')}** to abort this prompt.`,
            // eslint-disable-next-line max-len
            MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time, cancelOptions) => `${tag} | **${name}** is a repeating argument | You have **${time}** seconds to respond to this prompt with additional valid arguments. Type **${cancelOptions.join('**, **')}** to cancel this prompt.`,
            MONITOR_COMMAND_HANDLER_ABORTED: 'Aborted',
            // eslint-disable-next-line max-len
            INHIBITOR_COOLDOWN: (remaining, guildCooldown) => `${guildCooldown ? 'Someone has' : 'You have'} already used this command. You can use this command again in ${remaining} seconds.`,
            INHIBITOR_DISABLED_GUILD: 'This command has been disabled by an admin in this guild.',
            INHIBITOR_DISABLED_GLOBAL: 'This command has been globally disabled by the bot owner.',
            INHIBITOR_MISSING_BOT_PERMS: (missing) => `Insufficient permissions, missing: **${missing}**`,
            INHIBITOR_NSFW: 'You can only use NSFW commands in NSFW channels.',
            INHIBITOR_PERMISSIONS: 'You do not have permission to use this command.',
            INHIBITOR_REQUIRED_SETTINGS: (settings) => `The guild is missing the **${settings.join(', ')}** guild setting${settings.length !== 1 ? 's' : ''} and thus the command cannot run.`,
            INHIBITOR_RUNIN: (types) => `This command is only available in ${types} channels.`,
            INHIBITOR_RUNIN_NONE: (name) => `The ${name} command is not configured to run in any channel.`,
            COMMAND_BLACKLIST_DESCRIPTION: 'Blacklists or un-blacklists users and guilds from the bot.',
            COMMAND_BLACKLIST_SUCCESS: (usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
                usersAdded.length ? `**Users Added**\n${util.codeBlock('', usersAdded.join(', '))}` : '',
                usersRemoved.length ? `**Users Removed**\n${util.codeBlock('', usersRemoved.join(', '))}` : '',
                guildsAdded.length ? `**Guilds Added**\n${util.codeBlock('', guildsAdded.join(', '))}` : '',
                guildsRemoved.length ? `**Guilds Removed**\n${util.codeBlock('', guildsRemoved.join(', '))}` : ''
            ].filter(val => val !== '').join('\n'),
            COMMAND_EVAL_DESCRIPTION: 'Evaluates arbitrary Javascript. Reserved for bot owner.',
            COMMAND_EVAL_EXTENDEDHELP: [
                'The eval command evaluates code as-in, any error thrown from it will be handled.',
                'It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.',
                'The --silent flag will make it output nothing.',
                'The --depth flag accepts a number, for example, --depth=2, to customize util.inspect\'s depth.',
                'The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword.',
                'The --showHidden flag will enable the showHidden option in util.inspect.',
                'If the output is too large, it\'ll send the output as a file, or in the console if the bot does not have the ATTACH_FILES permission.'
            ].join('\n'),
            COMMAND_EVAL_ERROR: (time, output, type) => `**Error**:${output}\n**Type**:${type}\n${time}`,
            COMMAND_EVAL_OUTPUT: (time, output, type) => `**Output**:${output}\n**Type**:${type}\n${time}`,
            COMMAND_EVAL_SENDFILE: (time, type) => `Output was too long... sent the result as a file.\n**Type**:${type}\n${time}`,
            COMMAND_EVAL_SENDCONSOLE: (time, type) => `Output was too long... sent the result to console.\n**Type**:${type}\n${time}`,
            COMMAND_EVAL_SENDHASTE: (time, url, type) => `Output was too long... sent the result to hastebin - ${url}.\n**Type**:${type}\n${time}`,
            COMMAND_UNLOAD: (type, name) => `✅ Unloaded ${type}: ${name}`,
            COMMAND_UNLOAD_DESCRIPTION: 'Unloads the klasa piece.',
            COMMAND_UNLOAD_WARN: 'You probably don\'t want to unload that, since you wouldn\'t be able to run any command to enable it again',
            COMMAND_TRANSFER_ERROR: '❌ That file has been transfered already or never existed.',
            COMMAND_TRANSFER_SUCCESS: (type, name) => `✅ Successfully transferred ${type}: ${name}.`,
            COMMAND_TRANSFER_FAILED: (type, name) => `Transfer of ${type}: ${name} to Client has failed. Please check your Console.`,
            COMMAND_TRANSFER_DESCRIPTION: 'Transfers a core piece to its respective folder.',
            COMMAND_RELOAD: (type, name, time) => `✅ Reloaded ${type}: ${name}. (Took: ${time})`,
            COMMAND_RELOAD_FAILED: (type, name) => `❌ Failed to reload ${type}: ${name}. Please check your Console.`,
            COMMAND_RELOAD_ALL: (type, time) => `✅ Reloaded all ${type}. (Took: ${time})`,
            COMMAND_RELOAD_EVERYTHING: (time) => `✅ Reloaded everything. (Took: ${time})`,
            COMMAND_RELOAD_DESCRIPTION: 'Reloads a klasa piece, or all pieces of a klasa store.',
            COMMAND_REBOOT: 'Rebooting...',
            COMMAND_REBOOT_DESCRIPTION: 'Reboots the bot.',
            COMMAND_LOAD: (time, type, name) => `✅ Successfully loaded ${type}: ${name}. (Took: ${time})`,
            COMMAND_LOAD_FAIL: 'The file does not exist, or an error occurred while loading your file. Please check your console.',
            COMMAND_LOAD_ERROR: (type, name, error) => `❌ Failed to load ${type}: ${name}. Reason:${util.codeBlock('js', error)}`,
            COMMAND_LOAD_DESCRIPTION: 'Load a piece from your bot.',
            COMMAND_PING: 'Ping?',
            COMMAND_PING_DESCRIPTION: 'Runs a connection test to Discord.',
            COMMAND_PINGPONG: (diff, ping) => `Pong! (Roundtrip took: ${diff}ms. Heartbeat: ${ping}ms.)`,
            COMMAND_INVITE: () => [
                `To add ${this.client.user!.username} to your discord guild:`,
                `<${this.client.invite}>`
            ],
            COMMAND_INVITE_DESCRIPTION: 'Displays the invite link of the bot, to invite it to your guild.',

            COMMAND_HELP_DESCRIPTION: 'Display help for a command.',
            COMMAND_HELP_NO_EXTENDED: 'No extended help available.',
            COMMAND_HELP_DM: '📥 | The list of commands you have access to has been sent to your DMs.',
            COMMAND_HELP_NODM: '❌ | You have DMs disabled, I couldn\'t send you the commands in DMs.',
            COMMAND_ENABLE: (type, name) => `+ Successfully enabled ${type}: ${name}`,
            COMMAND_ENABLE_DESCRIPTION: 'Re-enables or temporarily enables a command/inhibitor/monitor/finalizer. Default state restored on reboot.',
            COMMAND_DISABLE: (type, name) => `+ Successfully disabled ${type}: ${name}`,
            COMMAND_DISABLE_DESCRIPTION: 'Re-disables or temporarily disables a command/inhibitor/monitor/finalizer/event. Default state restored on reboot.',
            COMMAND_DISABLE_WARN: 'You probably don\'t want to disable that, since you wouldn\'t be able to run any command to enable it again',
            COMMAND_CONF_NOKEY: 'You must provide a key',
            COMMAND_CONF_NOVALUE: 'You must provide a value',
            COMMAND_CONF_GUARDED: (name) => `${util.toTitleCase(name)} may not be disabled.`,
            COMMAND_CONF_UPDATED: (key, response) => `Successfully updated the key **${key}**: \`${response}\``,
            COMMAND_CONF_KEY_NOT_ARRAY: 'This key is not array type. Use the action \'reset\' instead.',
            COMMAND_CONF_GET_NOEXT: (key) => `The key **${key}** does not seem to exist.`,
            COMMAND_CONF_GET: (key, value) => `The value for the key **${key}** is: \`${value}\``,
            COMMAND_CONF_RESET: (key, response) => `The key **${key}** has been reset to: \`${response}\``,
            COMMAND_CONF_NOCHANGE: (key) => `The value for **${key}** was already that value.`,
            COMMAND_CONF_SERVER_DESCRIPTION: 'Define per-guild settings.',
            COMMAND_CONF_SERVER: (key, list) => `**Guild Settings${key}**\n${list}`,
            COMMAND_CONF_USER_DESCRIPTION: 'Define per-user settings.',
            COMMAND_CONF_USER: (key, list) => `**User Settings${key}**\n${list}`,
            COMMAND_STATS: (memUsage, uptime, users, guilds, channels, klasaVersion, discordVersion, processVersion, message) => [
                '= STATISTICS =',
                '',
                `• Version      :: ${(this.client as DiscordCraft).version}`,
                `• Memory Usage :: ${memUsage} MB`,
                `• Uptime       :: ${uptime}`,
                `• Users        :: ${users}`,
                `• Guilds       :: ${guilds}`,
                `• Channels     :: ${channels}`,
                `• Klasa        :: v${klasaVersion}`,
                `• Discord.js   :: v${discordVersion}`,
                `• Node.js      :: ${processVersion}`,
                `• Shard        :: ${(message.guild ? message.guild.shardID : 0) + 1} / ${this.client.options.shardCount}`
            ],
            COMMAND_STATS_DESCRIPTION: 'Provides some details about the bot and stats.',
            MESSAGE_PROMPT_TIMEOUT: 'The prompt has timed out.',
            TEXT_PROMPT_ABORT_OPTIONS: ['abort', 'stop', 'cancel'],

            /**
             * KEYWORDS
             */

            KEYWORDS_LOADING: 'loading...',

            /**
             * General Commands
             */

            COMMAND_HELP_ALL_FLAG: prefix => `Displaying one category per page. Have issues with the embed? Run \`${prefix}help --all\` for a full list in DMs.`,
            COMMAND_HELP_COMMAND_COUNT: num => `${num} command${num === 1 ? '' : 's'}`,
            COMMAND_HELP_TITLE: (name, description) => `📃 | **Help Message** | __**${name}**__\n${description}\n`,
            COMMAND_HELP_USAGE: usage => `📝 | **Command Usage**\n\`${usage}\`\n`,
            COMMAND_HELP_EXTENDED: extendedHelp => `🔍 | **Extended Help**\n${extendedHelp}`,
            COMMAND_HELP_ALIASES: aliases => aliases.length ? `**Aliases**\n${aliases.join(', ')}` : '',
            COMMAND_HELP_EXAMPLE: examples => `**:link: | Examples**\n${examples}`,

            /**
             * Minecraft Locales
             * General
             */

            INVENTORY_NOT_FOUND: (prefix) => `You do not have a player! Please type \`${prefix}start\` to begin playing`,
            TOOL_NOT_FOUND: (type, prefix) => `You do not have a ${type}! Use \`${prefix}craft\` to craft a ${type} and \`${prefix}equip\` to equip it`,
            BROKEN_TOOL: (type, prefix) => `This ${type} is broken! Repair it using \`${prefix}repair\``,
            INVENTORY_ITEM_NOT_FOUND: (item, type = 'item') => `Could not find that ${type} \`(${item})\` in your inventory`,
            ITEM_NOT_FOUND: item => `Could not find that item \`(${item})\``,
            INSUFFICIENT_MATERIALS: (type = 'items') => `You do not have that many ${type}!`,
            MATERIAL_REQUIRED: (amount, name) => `You need **${amount}** \`${name}\` to get this item!`,

            LEVEL_UP_TITLE: 'Level UP!!',
            LEVEL_UP_DESCRIPTION: (user, profile) => `${user.toString()}, You have levelled up to: \`Level ${profile.level}\`
            You got: \`${Math.floor(2.5 * (profile.level - 1))} coins\``,

            ACTION_DESCRIPTION: (action, name, tool, mess) => `You have ${action} with **${name}** ${tool.emote}: ${mess}`,

            /**
             * Command Specific Locales
             */

            CRAFT_EMBED_DESCRIPTION: (amount, name, item) => `You have successfully crafted **${amount} ${name} ${item.emote}**`,

            CRATE_OPEN_DESCRIPTION: (name, mess) => `You opened a **${name}** and found: ${mess}`,
            CRATE_DISPLAY_DESCRIPTION: (prefix, name, mess) => `Use \`${prefix}${name} <crate name>\` to open a crate!
            Here are the Crates that you own:\n${mess}`,

            EQUIP_SUCCESS_DESCRIPTION: (name, item) => `Successfully equipped ${name} ${item.emote}!`,

            FARM_NO_CROP: 'Specify which crop you would like to sow!',
            FARM_NO_HARVEST: all => `You do not have ${all ? 'any' : 'that'} crop ready for harvesting!`,
            FARM_SOW_DESCRIPTION: (amount, name, crop) => `You have sown:\n**${name}${crop.emote} x${amount}**`,
            FARM_HARVEST_DESCRIPTION: mess => `You harvested:\n**${mess}**`,

            FISH_DESCRIPTION: mess => `You have fished: ${mess || 'Nothing!\nBetter luck next time!'}`,

            QUEST_UNAVAILABLE: 'Sorry, there are no quests available right now!',
            QUEST_START_TITLE: title => `Quest - ${title}`,
            QUEST_COMPLETE_TITLE: title => `Quest Complete - ${title}`,
            QUEST_COMPLETE_DESCRIPTION: '**Congratulations! You have completed the quest\nYou have recieved your rewards\nUse the quest command again to get a new quest!**',
            QUEST_PROGRESS_TITLE: title => `Quest In Progress - ${title}`,

            SELL_DESCRIPTION: (amount, name, item) => `You have successfully sold **${amount} ${name} ${item.emote}** for **${item.price * amount} coins**!`,

            SHOP_CATEGORY_DESCRIPTION: (prefix, name, categories) => `Use \`${prefix}${name} <category>\` to see all the items in it!
            \n**Categories**:
            ${categories}`,
            SHOP_NO_ITEM: id => `There is no item in this category with id: ${id}`,
            SHOP_DISPLAY_TITLE: (prefix, name, catname) => `Use \`${prefix}${name} ${catname} <item_number> [amount]\` to buy an item!\n\n`,
            SHOP_PURCHASE_DESCRIPTION: (amount, name) => `You have successfully purchased **${amount} ${name}**!`,

            START_DESCRIPTION: (user, prefix) => `Welcome ${user}
            You received your **Wooden Axe** <:woodenaxe:560778791643774976>
            You can now type \`${prefix}chop\` to collect some wood
            
            Type \`${prefix}quest\` to start quests and recieve rewards!`,

            TOP_TITLE: type => `Top players for ${type}`,
            TOP_FOOTER: (position, total) => `Your position: ${position}/${total}`,

            VILLAGER_NO_SALE: 'This item is not for sale',
            VILLAGER_MULTIPLE_EXCEPT: (emerald, name) => `You can trade only multiples of ${emerald} for ${name}`,
            VILLAGER_FOOTER: (prefix, time) => `**
            Use \`${prefix}villager [item] [amount of emeralds]\` to buy an item
    
            Trade deals reset in ${time}`,

            /**
              * Minecraft command descriptions + extended help
              */

            COMMAND_CHOP_DESCRIPTION: 'Chop trees to get wood!',
            COMMAND_CHOP_EXTENDED: builder.display({
                extendedHelp: `Once you recieve an axe, you can chop wood
                Better the axe more are the drops!
                Gold and Diamond axe can even drop fruits`
            }),

            COMMAND_CRAFT_DESCRIPTION: 'Craft tools, armor and other items that will help you on your adventure!',
            COMMAND_CRAFT_EXTENDED: builder.display({
                extendedHelp: 'Currently tools can be crafted only once'
            }),

            COMMAND_CRATE_DESCRIPTION: 'Recieved a crate? open them to recieve exciting rewards',
            COMMAND_CRATE_EXTENDED: builder.display({
                extendedHelp: `Better the crates better the rewards`
            }),

            COMMAND_ENCHANT_DESCRIPTION: 'Enchant your tools to make them more powerful!',
            COMMAND_ENCHANT_EXTENDED: builder.display({
                extendedHelp: `Before you start enchanting you must have an enchanting table which can be brought from the shop.
                To get enchants purchase them from the shop.
                All tools can have only 1 enchantment at a time, using the enchantment on the same tool will overwrite the previous enchantment`
            }),

            COMMAND_EQUIP_DESCRIPTION: 'Equip a tool to use them!',
            COMMAND_EQUIP_EXTENDED: builder.display({
                extendedHelp: 'Before you start using a tool make sure that you have them equipped'
            }),

            COMMAND_FARM_DESCRIPTION: 'Sow crops and harvest them!',
            COMMAND_FARM_EXTENDED: builder.display({
                extendedHelp: `Before you start farming you must craft a hoe and equip it
                Better the hoe, more are the crops you can sow at a time
                Different crops take different amounts of time to get ready for harvesting
                \`farm view\` to see all crops you have as well as the status of your planted crops
                \`farm sow <crop_name>\` to sow a crop
                \`farm harvest <crop_name>\` to harvest crops use \`farm harvest all\` to harvest them all`
            }),

            COMMAND_FISH_DESCRIPTION: 'Catch fish!',
            COMMAND_FISH_EXTENDED: builder.display({
                extendedHelp: `Fishing requires a fishing rod which can be crafted
                Better the rod more are the catches`
            }),

            COMMAND_INFO_DESCRIPTION: 'Shows all details of any item in this game!',
            COMMAND_INFO_EXTENDED: '',

            COMMAND_INVENTORY_DESCRIPTION: 'Shows you your current inventory',
            COMMAND_INVENTORY_EXTENDED: builder.display({
                extendedHelp: 'View your inventory using reactions'
            }),

            COMMAND_MINE_DESCRIPTION: 'Mine for materials and diamonds!',
            COMMAND_MINE_EXTENDED: builder.display({
                extendedHelp: `Mining requires a pickaxe which can be crafted
                Better the pickaxe more and better are the drops!`
            }),

            COMMAND_QUEST_DESCRIPTION: 'Start your quests and recieve rewards!',
            COMMAND_QUEST_EXTENDED: builder.display({
                extendedHelp: `Start your quest by using this command
                When you feel that you have completed the quest use this command again to recieve your rewards

                More Quests coming soon!`
            }),

            COMMAND_REPAIR_DESCRIPTION: 'Broken tool? No problem!',
            COMMAND_REPAIR_EXTENDED: builder.display({
                extendedHelp: `When your tool's durability reaches 0, it cannot be used until it is repaired
                Repairing your tool will give it full durability`
            }),

            COMMAND_SELL_DESCRIPTION: 'Sell unwanted materials for coins!',
            COMMAND_SELL_EXTENDED: '',

            COMMAND_SHOP_DESCRIPTION: 'View and purchase enchants, potions, and others here!',
            COMMAND_SHOP_EXTENDED: builder.display({
                extendedHelp: `Currently \`enchants\`, \`storage\` and \`potions\` categories are available
                More coming soon...`
            }),

            COMMAND_START_DESCRIPTION: 'Start your new minecraft adventure!',
            COMMAND_START_EXTENDED: builder.display({
                extendedHelp: 'Once this command is used you will recieve an axe to get started',
                reminder: 'This command must be used in order to use most other minecraft commands'
            }),

            COMMAND_TOP_DESCRIPTION: 'View the top players based on xp and coins!',
            COMMAND_TOP_EXTENDED: '',

            COMMAND_TRADE_DESCRIPTION: 'Trade items with your friends!',
            COMMAND_TRADE_EXTENDED: builder.display({
                extendedHelp: `To start a trade, use \`trade [@user]\`, the trade will begin only when the other user accepts your request
                Once the trade request is accepted you can add or remove items from the trade
                You cannot add or remove items from the trade once you confirm, however you can cancel it anytime
                Currently you cant trade tools but you can trade coins`
            }),

            COMMAND_VILLAGER_DESCRIPTION: 'Displays trade deals with the villager, trade emeralds for materials with the villager',
            COMMAND_VILLAGER_EXTENDED: builder.display({
                extendedHelp: `The villager only accepts emeralds and in return gives materials
                Trade deals reset every 3 hours`
            }),


            /**
             * Owner Command Descriptions and Extended Help
             */

            COMMAND_OWNER_DESCRIPTION: 'Secret commands for bot owners to manage the bot',
            COMMAND_OWNER_EXTENDED: builder.display({
                extendedHelp: `\`owner view <user>\` to view a user's inventory
                \`owner add <user> <item name>\` to add an item to a user's inventory
                \`owner remove <user> <item name>\` to remove an item from the user's inventory
                Use flags: \`--amount=<amount>\` or \`all\`, to specify the amount`
            })
        };
    }

    async init() {
        await super.init();
    }

}
