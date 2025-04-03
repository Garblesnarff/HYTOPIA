/**
 * tower.ts - Generates a tall tower building for the village.
 * 
 * This file contains the function to construct a multi-story stone brick tower
 * with wooden floors, a door, windows on each level, and a flat parapet roof.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (BLOCK_TYPES, WORLD_HEIGHT)
 * - Project utilities (placeHollowBox, placeFloor, placeDetailedDoor, 
 *   placeDetailedWindow, findGroundHeight)
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
  placeDetailedWindow
} from '../../../utils/block-placer';
import { findGroundHeight } from '../../../utils/terrain-utils';

/**
 * Builds a taller building (like a tower or important structure)
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Center position for the building
 */
export function buildTallBuilding(world: World, position: Vector3Like): void {
  // Building dimensions
  const width = 7;
  const depth = 7;
  const height = 12;
  
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
    BLOCK_TYPES.STONE_BRICK
  );
  
  // Add floors every 4 blocks - Keep relative to buildingStartY
  for (let floorLevel = 4; floorLevel < height; floorLevel += 4) {
    placeFloor(
      world,
      { x: startX + 1, y: buildingStartY + floorLevel, z: startZ + 1 }, // Y is relative to wall base
      width - 2,
      depth - 2,
      BLOCK_TYPES.WOOD_PLANKS
    );
  }

  // Add a detailed door (door faces -Z, wall runs E-W, orientation 'south')
  placeDetailedDoor(
    world,
    { x: startX + Math.floor(width / 2), y: groundY, z: startZ }, // Position is floor block *under* opening (at groundY)
    'south', // Wall runs E-W, door faces -Z
    BLOCK_TYPES.LOG // Frame material
  );

  // Add detailed windows on each level
  for (let floorLevel = 1; floorLevel < height; floorLevel += 4) {
    // Bottom of window opening starts at buildingStartY + floorLevel = groundY + floorLevel
    const windowBottomY = buildingStartY + floorLevel; 
    // Windows on all four sides (2x2 size)
    // West wall (-X side)
    placeDetailedWindow(
      world,
      { x: startX, y: windowBottomY, z: startZ + Math.floor(depth / 2) - 1 }, // Bottom-left of opening
      2, // Width (along Z)
      2, // Height
      'z', // Wall runs along Z axis
      BLOCK_TYPES.LOG, // Frame material
      BLOCK_TYPES.GLASS // Glass material
    );
    // East wall (+X side)
    placeDetailedWindow(
      world,
      { x: startX + width - 1, y: windowBottomY, z: startZ + Math.floor(depth / 2) - 1 }, // Bottom-left of opening
      2, // Width (along Z)
      2, // Height
      'z', // Wall runs along Z axis
      BLOCK_TYPES.LOG, // Frame material
      BLOCK_TYPES.GLASS // Glass material
    );
    // North wall (-Z side) -> Should be front wall, fixed Z = startZ
    placeDetailedWindow(
      world,
      { x: startX + Math.floor(width / 2) - 1, y: windowBottomY, z: startZ }, // Bottom-left of opening
      2, // Width (along X)
      2, // Height
      'x', // Wall runs along X axis
      BLOCK_TYPES.LOG, // Frame material
      BLOCK_TYPES.GLASS // Glass material
    );
    // South wall (+Z side) -> Should be back wall, fixed Z = startZ + depth - 1
    placeDetailedWindow(
      world,
      { x: startX + Math.floor(width / 2) - 1, y: windowBottomY, z: startZ + depth - 1 }, // Bottom-left of opening
      2, // Width (along X)
      2, // Height
      'x', // Wall runs along X axis
      BLOCK_TYPES.LOG, // Frame material
      BLOCK_TYPES.GLASS // Glass material
    );
  }

  // Add a flat roof (parapet style)
  placeFloor(
    world,
    { x: startX - 1, y: buildingStartY + height, z: startZ - 1 }, // Start 1 block out
    width + 2, // Extend 1 block out
    depth + 2, // Extend 1 block out
    BLOCK_TYPES.STONE_BRICK // Material for parapet base
  );
  // Add inner floor part of roof
  placeFloor(
    world,
    { x: startX, y: buildingStartY + height, z: startZ },
    width,
    depth,
    BLOCK_TYPES.STONE_BRICK // Material for inner roof
  );
  // Add parapet wall on top of the extended roof base
  placeHollowBox(
    world,
    { x: startX - 1, y: buildingStartY + height + 1, z: startZ - 1 },
    width + 2,
    1, // Height of parapet wall
    depth + 2,
    BLOCK_TYPES.STONE_BRICK // Material for parapet wall
  );
}
