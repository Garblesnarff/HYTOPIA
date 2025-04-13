/**
 * index.ts - Main entry point for player house area generation.
 * 
 * This file exports the primary `buildPlayerHouse` function which orchestrates
 * the construction of the entire player house area. It handles terrain 
 * modifications (creating a hill and path) and calls functions from other 
 * modules in this directory to build the house structure, garden, and fence.
 * 
 * Dependencies:
 * - Hytopia SDK (World)
 * - Project constants (BLOCK_TYPES, WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT)
 * - Project utilities (createHill, createPath, findGroundHeight)
 *   - See: ../../terrain.ts
 *   - See: ../../../utils/terrain-utils.ts
 * - Local component modules:
 *   - ./house-structure.ts (buildMainHouse)
 *   - ./garden.ts (buildGarden)
 *   - ./fence.ts (buildFence)
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Imports
// ====================================

// Hytopia SDK
import { World } from 'hytopia';

// Project Constants
import { BLOCK_TYPES } from '../../../constants/block-types';
import { WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT } from '../../../constants/world-config';

// Project Utilities
import { createHill, createPath } from '../../terrain'; // See: ../../terrain.ts
import { findGroundHeight } from '../../../utils/terrain-utils'; // See: ../../../utils/terrain-utils.ts

// Local Component Modules
import { buildMainHouse } from './house-structure'; // See: ./house-structure.ts
import { buildGarden } from './garden'; // See: ./garden.ts
import { buildFence } from './fence'; // See: ./fence.ts

// ====================================
// Public Functions
// ====================================

/**
 * Builds the player's house and surrounding property area.
 * Includes creating a hill, the house structure, garden, fence, and path.
 * 
 * @param {World} world - The game world
 */
export function buildPlayerHouse(world: World): void {
  console.log('Building player house area...');
  
  // Get the area dimensions
  const area = WORLD_AREAS.PLAYER_HOUSE;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  const areaCenterX = startX + area.width / 2;
  const areaCenterZ = startZ + area.depth / 2;
  
  // --- Terrain Modification ---
  // Removed hill/platform generation so the house is at ground level
  // createHill(
  //   world,
  //   { 
  //     x: areaCenterX, 
  //     y: WORLD_HEIGHT.BASE, 
  //     z: areaCenterZ 
  //   },
  //   30, // Radius
  //   3   // Height
  // );
  
  // --- Structure Generation ---
  // Build the main house structure (which includes interior)
  buildMainHouse(world); // Note: buildMainHouse now calculates its own position based on area constants
  
  // Add a garden
  buildGarden(world);
  
  // Add a fence around the property
  buildFence(world);
  
  // --- Path Generation ---
  // Add a path from near the house door to the edge of the property fence
  const houseDoorZ = areaCenterZ - (12 / 2) + 12 - 1; // Approximate Z of house front wall (centerZ - depth/2 + depth - 1)
  const pathStartX = areaCenterX;
  const pathStartZ = houseDoorZ + 2; // Start path a couple blocks in front of the door
  const pathEndX = areaCenterX;
  const pathEndZ = startZ - 5 + area.depth + 10 - 1; // End path just inside the south fence line

  // Find ground height for path start/end dynamically
  const pathStartY = findGroundHeight(world, pathStartX, pathStartZ) + 1;
  const pathEndY = findGroundHeight(world, pathEndX, pathEndZ) + 1;

  createPath(
    world,
    { x: pathStartX, y: pathStartY, z: pathStartZ },
    { x: pathEndX, y: pathEndY, z: pathEndZ },
    3, // Width
    BLOCK_TYPES.STONE_BRICK
  );
  
  console.log('Player house area complete!');
}
