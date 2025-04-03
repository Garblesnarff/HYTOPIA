/**
 * shop.ts - Generates a small shop building for the village.
 * 
 * This file contains the function to construct a small, clay-walled shop
 * with a wooden floor, door, windows, awning, counter, and pitched roof.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (BLOCK_TYPES, WORLD_HEIGHT)
 * - Project utilities (placeBlock, placeCuboid, placeFloor, placeHollowBox, 
 *   placeDetailedDoor, placeDetailedWindow, placePitchedRoof, findGroundHeight)
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
import { WORLD_HEIGHT } from '../../../constants/world-config';

// Project Utilities
import {
  placeBlock,
  placeCuboid,
  placeFloor,
  placeHollowBox,
  placeDetailedDoor,
  placeDetailedWindow,
  placePitchedRoof
} from '../../../utils/block-placer';
import { findGroundHeight } from '../../../utils/terrain-utils';

/**
 * Builds a small shop building
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Center position for the building
 */
export function buildSmallShop(world: World, position: Vector3Like): void {
  // Building dimensions
  const width = 8;
  const depth = 10;
  const height = 4;
  
  // Calculate starting corner
  const startX = position.x - Math.floor(width / 2);
  const startZ = position.z - Math.floor(depth / 2);
  const groundY = findGroundHeight(world, startX, startZ); // Check one corner
  const buildingStartY = groundY; // Place walls starting AT ground level

  // Build the main structure
  placeHollowBox(
    world,
    { x: startX, y: buildingStartY, z: startZ }, // Use buildingStartY
    width,
    height,
    depth,
    BLOCK_TYPES.CLAY
  );
  
  // Wooden floor - Place explicitly at groundY
  placeFloor(
    world,
    { x: startX + 1, y: groundY, z: startZ + 1 }, // Use groundY for floor level
    width - 2,
    depth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );

  // Add a detailed door (door faces -Z, wall runs E-W, orientation 'south')
  placeDetailedDoor(
    world,
    { x: startX + Math.floor(width / 2), y: groundY, z: startZ }, // Position is floor block *under* opening (at groundY)
    'south', // Wall runs E-W, door faces -Z
    BLOCK_TYPES.LOG // Frame material
  );

  // Add detailed windows (2x2 size) on the front wall (fixed Z)
  // Bottom of window opening starts at buildingStartY + 1 = groundY + 1 (since buildingStartY = groundY)
  placeDetailedWindow(
    world,
    { x: startX + 2, y: buildingStartY + 1, z: startZ }, // Bottom-left of opening (Y = groundY + 1)
    2, // Width
    2, // Height
    'x', // Wall runs along X axis
    BLOCK_TYPES.LOG, // Frame material
    BLOCK_TYPES.GLASS // Glass material
  );
  placeDetailedWindow(
    world,
    { x: startX + width - 4, y: buildingStartY + 1, z: startZ }, // Bottom-left of opening (Y = groundY + 1)
    2, // Width
    2, // Height
    'x', // Wall runs along X axis
    BLOCK_TYPES.LOG, // Frame material
    BLOCK_TYPES.GLASS // Glass material
  );

  // Add a simple awning over the entrance
  for (let x = -2; x <= 2; x++) {
    placeBlock(
      world,
      { x: startX + Math.floor(width / 2) + x, y: buildingStartY + 3, z: startZ - 1 }, // Use buildingStartY
      BLOCK_TYPES.WOOD_PLANKS
    );
  }
  
  // Add a shop counter inside
  placeCuboid(
    world,
    { x: startX + 2, y: buildingStartY + 1, z: startZ + depth - 3 }, // Use buildingStartY
    { width: width - 4, height: 1, depth: 1 },
    BLOCK_TYPES.WOOD_PLANKS
  );

  // Add a pitched roof instead of flat
  placePitchedRoof(
    world,
    { x: startX, y: buildingStartY + height, z: startZ }, // Start at top of walls
    width,
    depth,
    BLOCK_TYPES.WOOD_PLANKS, // Roof material
    BLOCK_TYPES.STONE_BRICK, // Eave material
    BLOCK_TYPES.CLAY, // Gable material (match walls)
    1 // Overhang
  );
}
