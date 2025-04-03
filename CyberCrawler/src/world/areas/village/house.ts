/**
 * house.ts - Generates a standard village house building.
 * 
 * This file contains the function to construct a brick house with a wooden floor,
 * door, windows, and a pitched roof.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (BLOCK_TYPES, WORLD_HEIGHT)
 * - Project utilities (placeHollowBox, placeFloor, placeDetailedDoor, 
 *   placeDetailedWindow, placePitchedRoof, findGroundHeight)
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
  placeHollowBox,
  placeFloor,
  placeDetailedDoor,
  placeDetailedWindow,
  placePitchedRoof
} from '../../../utils/block-placer';
import { findGroundHeight } from '../../../utils/terrain-utils';

/**
 * Builds a standard village house
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Center position for the building
 */
export function buildVillageHouse(world: World, position: Vector3Like): void {
  // Building dimensions
  const width = 9;
  const depth = 7;
  const height = 5;
  
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
    BLOCK_TYPES.BRICK
  );
  
  // Wooden floor - Place explicitly at groundY
  placeFloor(
    world,
    { x: startX + 1, y: groundY, z: startZ + 1 }, // Use groundY for floor level
    width - 2,
    depth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );

  // Add a detailed door (door faces +Z, wall runs E-W, orientation 'north')
  const doorX = startX + Math.floor(width / 2);
  const doorZ = startZ + depth - 1; // Wall is at max Z, opening is at max Z
  placeDetailedDoor(
    world,
    { x: doorX, y: groundY, z: doorZ }, // Position is floor block *under* opening (at groundY)
    'north', // Wall runs E-W, door faces +Z
    BLOCK_TYPES.LOG // Frame material
  );

  // Add detailed windows (2x2 size) on side walls (fixed X)
  // Bottom of window opening starts at buildingStartY + 1 = groundY + 1
  // West wall window
  placeDetailedWindow(
    world,
    { x: startX, y: buildingStartY + 1, z: startZ + Math.floor(depth / 2) -1 }, // Bottom-left of opening (Y = groundY + 1)
    2, // Width (along Z)
    2, // Height
    'z', // Wall runs along Z axis
    BLOCK_TYPES.LOG, // Frame material
    BLOCK_TYPES.GLASS // Glass material
  );
  // East wall window
  placeDetailedWindow(
    world,
    { x: startX + width - 1, y: buildingStartY + 1, z: startZ + Math.floor(depth / 2) -1 }, // Bottom-left of opening (Y = groundY + 1)
    2, // Width (along Z)
    2, // Height
    'z', // Wall runs along Z axis
    BLOCK_TYPES.LOG, // Frame material
    BLOCK_TYPES.GLASS // Glass material
  );

  // Add pitched roof
  placePitchedRoof(
    world,
    { x: startX, y: buildingStartY + height, z: startZ }, // Start at top of walls
    width,
    depth,
    BLOCK_TYPES.WOOD_PLANKS, // Roof material
    BLOCK_TYPES.STONE_BRICK, // Eave material
    BLOCK_TYPES.BRICK, // Gable material (match walls)
    1 // Overhang
  );
}
