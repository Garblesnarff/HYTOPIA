# Constants

This directory contains constant values and configuration settings used throughout the CyberCrawler game.

## Purpose
The constants module provides centralized definitions for values used across multiple game systems, ensuring consistency and making it easier to adjust game parameters.

## Files
- `block-types.ts` - Definitions of block type IDs and properties
- `world-config.ts` - World size, scale, and other configuration settings

## Usage
Constants should be imported rather than hard-coding values in game logic. This makes the code more maintainable and easier to adjust during development.

Example:
```typescript
import { BLOCK_TYPES } from '../constants/block-types';

// Instead of using magic numbers like this:
world.chunkLattice?.setBlock(position, 7); // Using block ID 7

// Use named constants like this:
world.chunkLattice?.setBlock(position, BLOCK_TYPES.GRASS);
```
