# Changelog

All changes to DiscordCraft will be documented here

## Version 1.0.4

- Updated [inventory command](src/commands/Minecraft/inventory.ts)
- Inventories now show up as reaction menus (profile, materials, tools, ...)
- Coins reward for level ups `floor(new level * 2.5)`

## Version 1.0.3

- Added [Rare Crate](assets/game/crates.json)
- `toolStore` property in `client.minecraft` class for ease of use
- `repair` property for each tool
- Added support for `coins` in [`owner add`](src/commands/Owner/owner.ts) subcommand
- [recipes.json](assets/game/recipes.json) added, for storing all recipes that will be used later for a `cook` command
- Adding support for level ups `(25 * current level)` xp required for levelling up atm
  