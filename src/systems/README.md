# Game Systems

This directory contains the game's major systems that implement core gameplay mechanics.

## Purpose

Game systems are high-level modules that implement specific gameplay features like combat, crafting, inventory management, and progression. These systems often integrate with each other and interact with entities in the game world.

## Key Systems

- **Combat System** - Handles attacks, damage, and combat mechanics
- **Crafting System** - Manages recipes, crafting stations, and item creation
- **Inventory System** - Player inventory management
- **Progression System** - Character advancement and upgrades
- **Resource System** - Resource collection and management
- **AI System** - Enemy behavior and pathfinding
- **Dungeon System** - Procedural dungeon generation and management

## Files

(Files will be added as they are developed)

## System Interactions

Game systems interact with each other through defined interfaces and events. For example:

- Combat System → Inventory System: Weapon selection and ammunition
- Resource System → Inventory System: Collecting resources
- Inventory System → Crafting System: Using resources to craft items
- Progression System → Combat System: Applying stat bonuses to combat

## Usage Examples

```javascript
// Example usage (to be updated as code is written)
import { CraftingSystem } from '../systems/crafting-system.js';

const craftingSystem = new CraftingSystem(world);
craftingSystem.registerRecipe({
  id: 'ENERGY_BLADE',
  ingredients: [
    { type: 'ENERGY_CELL', quantity: 2 },
    { type: 'SCRAP_METAL', quantity: 5 }
  ],
  result: 'ENERGY_BLADE',
  craftingStation: 'TECH_WORKBENCH'
});
```
