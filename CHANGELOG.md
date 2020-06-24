# Changelog

All changes to DiscordCraft will be documented here

## Vwrsion 1.1.0

- Added `Stone Hoe`, `Gold Hoe`
- Added `potatoes`
- Fixed Farm bugs
- Updated `info`, `stats` command
  
## Version 1.0.7

- Localization **(94%)**
- Commands reorganized to folders

## Version 1.0.6

- Improved help command [Reminders, Examples]
- Amount of crops sowed now depends on type of hoe
- [Cook Command](src/commands/Minecraft/Other/cook.ts) in beta testing

## Version 1.0.5

- Equipped tools are now highlighted
- Gain xp from `chop`, `mine`, `farm`, `fish` commands

## Version 1.0.4

- Updated [inventory command](src/commands/Minecraft/Utility/inventory.ts)
- Inventories now show up as reaction menus (profile, materials, tools, ...)
- Coins reward for level ups `floor(new level * 2.5)`

## Version 1.0.3

- Added [Rare Crate](assets/game/crates.json)
- `toolStore` property in `client.minecraft` class for ease of use
- `repair` property for each tool
- Added support for `coins` in [`owner add`](src/commands/Owner/owner.ts) subcommand
- [recipes.json](assets/game/recipes.json) added, for storing all recipes that will be used later for a `cook` command
- Adding support for level ups `(25 * current level)` xp required for levelling up atm
  