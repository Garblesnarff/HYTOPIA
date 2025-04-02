# Utils

This directory contains utility functions and helper classes used throughout the CyberCrawler game.

## Purpose
The utils module provides reusable code that handles common tasks across different game systems, reducing code duplication and centralizing frequently used functions.

## Files
- `block-placer.ts` - Helper functions for placing and manipulating blocks
- `vector-helpers.ts` - Utility functions for vector calculations and transformations

## Usage
Utility functions should be kept small, focused, and well-documented. They should handle one specific task rather than combining multiple operations.

Example:
```typescript
import { placeBlock, placeCuboid } from '../utils/block-placer';

// Instead of manually creating loops to place blocks:
for (let x = 0; x < width; x++) {
  for (let z = 0; z < depth; z++) {
    world.chunkLattice?.setBlock({ x: startX + x, y: startY, z: startZ + z }, blockType);
  }
}

// Use utility functions:
placeCuboid(world, { x: startX, y: startY, z: startZ }, { width, height: 1, depth }, blockType);
```
