/**
 * interior.ts - Generates the interior details of the player's house.
 * 
 * This file contains the function to build internal walls and place
 * basic furniture like a bed, table, and chest inside the house.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (BLOCK_TYPES)
 * - Project utilities (placeXWall, placeBlock, placeCuboid)
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Imports
// ====================================

// Hytopia SDK
import { Vector3Like, World } from 'hytopia';

// Project Constants
import { BLOCK_TYPES } from '../../../constants/block-types';

// Project Utilities
import {
  placeXWall,
  placeBlock,
  placeCuboid
} from '../../../utils/block-placer';

// ====================================
// Public Functions
// ====================================

/**
 * Builds interior features for the house, including walls and furniture.
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} houseStart - Starting corner of the house (used for relative positioning)
 * @param {number} width - Width of the house
 * @param {number} depth - Depth of the house
 */
export function buildInterior(
  world: World,
  houseStart: Vector3Like,
  width: number,
  depth: number
): void {
  // Interior walls
  // Add a wall dividing the house roughly in half
  placeXWall(
    world,
    // Start wall 1 block inside the house walls, Y is relative to houseStart.y
    { x: houseStart.x + 1, y: houseStart.y, z: houseStart.z + depth / 2 }, 
    width - 2, // Wall width is house width minus 2 (for outer walls)
    3, // Wall height
    BLOCK_TYPES.BRICK
  );
  
  // Add a doorway in the wall (clear blocks)
  placeBlock(
    world,
    { x: houseStart.x + width / 2, y: houseStart.y, z: houseStart.z + depth / 2 },
    BLOCK_TYPES.AIR
  );
  placeBlock(
    world,
    { x: houseStart.x + width / 2, y: houseStart.y + 2, z: houseStart.z + depth / 2 },
    BLOCK_TYPES.AIR
  );
  
  // Add some basic furniture (Y position is relative to houseStart.y)
  // Bed
  placeCuboid(
    world,
    { x: houseStart.x + 3, y: houseStart.y, z: houseStart.z + 2 },
    { width: 4, height: 1, depth: 3 },
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Table
  placeCuboid(
    world,
    { x: houseStart.x + width - 5, y: houseStart.y, z: houseStart.z + 2 },
    { width: 2, height: 1, depth: 2 },
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Storage chest
  placeCuboid(
    world,
    { x: houseStart.x + 2, y: houseStart.y, z: houseStart.z + depth - 4 },
    { width: 2, height: 1, depth: 2 },
    BLOCK_TYPES.LOG
  );
}
