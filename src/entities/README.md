# Entities

This directory contains all entity-related code, including entity definitions, controllers, and factory functions.

## Purpose

Entities are the objects that exist within the game world, including players, enemies, resources, items, projectiles, and environmental objects. This directory contains the code for creating, managing, and controlling these entities.

## Key Components

- Entity definitions and properties
- Entity controllers for behavior
- Factory functions for entity creation
- Entity component systems

## Files

(Files will be added as they are developed)

## Entity Types

Our game includes several types of entities:

1. **Player Entities** - Controlled by human players
2. **Enemy Entities** - Hostile NPCs with AI behavior
3. **Resource Entities** - Collectible objects for crafting
4. **Projectile Entities** - Bullets, energy blasts, etc.
5. **Item Entities** - Weapons, tools, and equipment
6. **Structure Entities** - Buildings, crafting stations, etc.
7. **Environmental Entities** - Decorative or interactive elements

## Usage Examples

```javascript
// Example usage (to be updated as code is written)
import { createEnemyEntity } from '../entities/enemy-factory.js';

const enemyEntity = createEnemyEntity(world, {
  type: 'SECURITY_DRONE',
  position: { x: 10, y: 5, z: 10 },
  difficulty: 2
});
```
