/**
 * house-structure.ts - Generates the main structure of the player's house.
 * 
 * This file contains the function to build the foundation, walls, floor,
 * roof, windows, and door of the player's house. It also calls the
 * function to build the interior details.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (BLOCK_TYPES, WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT)
 * - Project utilities (placeCuboid, placeHollowBox, placeFloor, placeDetailedDoor, 
 *   placeDetailedWindow, placePitchedRoof, findGroundHeight)
 * - Local modules (buildInterior from ./interior.ts)
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
import { WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT } from '../../../constants/world-config';

// Project Utilities
import {
  placeCuboid,
  placeHollowBox,
  placeFloor,
  placeDetailedDoor,
  placeDetailedWindow,
  placePitchedRoof
} from '../../../utils/block-placer';
import { findGroundHeight } from '../../../utils/terrain-utils';

// Local Modules
import { buildInterior } from './interior'; // See: ./interior.ts

// ====================================
// Public Functions
// ====================================

/**
 * Builds the main house structure including foundation, walls, floor, roof, and exterior features.
 * 
 * @param {World} world - The game world
 */
export function buildMainHouse(world: World): void {
  const area = WORLD_AREAS.PLAYER_HOUSE;
  
  // Calculate center position for the house
  const centerX = WORLD_ORIGIN.X + area.startX + area.width / 2;
  const centerZ = WORLD_ORIGIN.Z + area.startZ + area.depth / 2;
  
  // House dimensions
  const houseWidth = 14;
  const houseDepth = 12;
  const houseHeight = 7;
  
  // Calculate house corner
  const houseStartX = centerX - houseWidth / 2;
  const houseStartZ = centerZ - houseDepth / 2;
  // Find the actual ground height at the house's corner
  const groundY = findGroundHeight(world, houseStartX, houseStartZ); 
  const houseStartY = groundY; // Place house directly at ground level
  console.log(`Placing player house foundation at Y=${houseStartY} (Ground was Y=${groundY})`);

  // Foundation platform - Placed at groundY (now 1 block below house floor)
  placeCuboid(
    world,
    { 
      x: houseStartX - 2, 
      y: houseStartY - 1,  // foundation remains 1 block below new floor
      z: houseStartZ - 2 
    },
    { 
      width: houseWidth + 4, 
      height: 1, 
      depth: houseDepth + 4 
    },
    BLOCK_TYPES.STONE_BRICK
  );
  
  // Main house structure - walls
  placeHollowBox(
    world,
    { x: houseStartX, y: houseStartY, z: houseStartZ },
    houseWidth,
    houseHeight,
    houseDepth,
    BLOCK_TYPES.BRICK
  );
  
  // Wooden floor - Raise floor to new house level
  placeFloor(
    world,
    { x: houseStartX + 1, y: houseStartY, z: houseStartZ + 1 }, // floor at raised level
    houseWidth - 2,
    houseDepth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );

  // Add a detailed door (door faces +Z, wall runs E-W, orientation 'north')
  const doorX = centerX;
  const doorZ = houseStartZ + houseDepth - 1; // Wall is at max Z, opening is at max Z
  placeDetailedDoor(
    world,
    { x: doorX, y: houseStartY, z: doorZ }, // door at raised floor level
    'north', // Wall runs E-W, door faces +Z
    BLOCK_TYPES.LOG // Frame material
  );

  // Add detailed windows (2x2 size)
  // Bottom of window opening starts at houseStartY + 1
  const windowBottomY = houseStartY + 1;
  // Front windows (fixed Z = doorZ, wall runs along X)
  placeDetailedWindow(world, { x: doorX - 4, y: windowBottomY, z: doorZ }, 2, 2, 'x', BLOCK_TYPES.LOG);
  placeDetailedWindow(world, { x: doorX + 2, y: windowBottomY, z: doorZ }, 2, 2, 'x', BLOCK_TYPES.LOG);

  // Side windows (fixed X, wall runs along Z)
  placeDetailedWindow(world, { x: houseStartX, y: windowBottomY, z: centerZ - 1 }, 2, 2, 'z', BLOCK_TYPES.LOG);
  placeDetailedWindow(world, { x: houseStartX + houseWidth - 1, y: windowBottomY, z: centerZ - 1 }, 2, 2, 'z', BLOCK_TYPES.LOG);

  // Back windows (fixed Z = houseStartZ, wall runs along X)
  placeDetailedWindow(world, { x: doorX - 4, y: windowBottomY, z: houseStartZ }, 2, 2, 'x', BLOCK_TYPES.LOG);
  placeDetailedWindow(world, { x: doorX + 2, y: windowBottomY, z: houseStartZ }, 2, 2, 'x', BLOCK_TYPES.LOG);

  // Add a pitched roof
  placePitchedRoof(
    world,
    { x: houseStartX, y: houseStartY + houseHeight, z: houseStartZ }, // Start at top of walls
    houseWidth,
    houseDepth,
    BLOCK_TYPES.WOOD_PLANKS, // Roof material
    BLOCK_TYPES.STONE_BRICK, // Eave material
    BLOCK_TYPES.BRICK, // Gable material (match walls)
    1 // Overhang
  );
  
  // Add interior features by calling the dedicated function
  buildInterior(world, { x: houseStartX, y: houseStartY, z: houseStartZ }, houseWidth, houseDepth);
}
