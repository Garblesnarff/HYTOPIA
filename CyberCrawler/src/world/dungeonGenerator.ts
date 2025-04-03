/**
 * Dungeon Generator - Creates procedural dungeon structures for CyberCrawler.
 * 
 * This file provides functions for generating simple dungeon rooms and potentially
 * more complex layouts in the future.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3)
 * - ../utils/block-placer-basic.ts (placeFloor, placeXWall, placeZWall, placeBlock)
 * - ../constants/block-types.ts (BLOCK_TYPES)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3, World } from 'hytopia';
import { placeFloor, placeXWall, placeZWall, placeBlock } from '../utils/block-placer-basic'; // Use refactored placers
import { BLOCK_TYPES } from '../constants/block-types'; // Use constants

// ====================================
// Dungeon Generation Constants
// ====================================

const DEFAULT_WALL_HEIGHT = 3;
const DEFAULT_DOOR_HEIGHT = 2;
const RESOURCE_DENSITY = 0.05; // Percentage of floor area to have resources

// ====================================
// Internal Helper Functions
// ====================================

/**
 * Generates the floor for a simple rectangular dungeon room.
 * 
 * @param {World} world - The Hytopia world instance.
 * @param {Vector3} floorStartPos - The starting corner {x, y, z} of the floor.
 * @param {number} sizeX - The width of the floor (X-axis).
 * @param {number} sizeZ - The depth of the floor (Z-axis).
 * @param {number} floorBlockId - The block ID to use for the floor.
 */
function _generateDungeonFloor(
  world: World,
  floorStartPos: Vector3,
  sizeX: number,
  sizeZ: number,
  floorBlockId: number
): void {
  console.log(`Generating floor at ${JSON.stringify(floorStartPos)} size ${sizeX}x${sizeZ}`);
  placeFloor(world, floorStartPos, sizeX, sizeZ, floorBlockId);
  // Note: Removed per-block logging for performance. Add back if needed for detailed debugging.
}

/**
 * Generates the walls for a simple rectangular dungeon room.
 * 
 * @param {World} world - The Hytopia world instance.
 * @param {Vector3} wallStartPos - The starting corner {x, y, z} where walls begin (usually same XZ as floor, Y+1).
 * @param {number} sizeX - The width of the room (X-axis).
 * @param {number} sizeZ - The depth of the room (Z-axis).
 * @param {number} wallHeight - The height of the walls.
 * @param {number} wallBlockId - The block ID to use for the walls.
 */
function _generateDungeonWalls(
  world: World,
  wallStartPos: Vector3,
  sizeX: number,
  sizeZ: number,
  wallHeight: number,
  wallBlockId: number
): void {
  console.log(`Generating walls at ${JSON.stringify(wallStartPos)} size ${sizeX}x${sizeZ}, height ${wallHeight}`);
  
  // North wall (minimum Z)
  placeXWall(world, wallStartPos, sizeX, wallHeight, wallBlockId);
  
  // South wall (maximum Z)
  const southWallStart = new Vector3(wallStartPos.x, wallStartPos.y, wallStartPos.z + sizeZ - 1);
  placeXWall(world, southWallStart, sizeX, wallHeight, wallBlockId);

  // West wall (minimum X) - Place between corners already covered by N/S walls
  if (sizeZ > 1) { // Avoid placing if depth is 1
      const westWallStart = new Vector3(wallStartPos.x, wallStartPos.y, wallStartPos.z + 1);
      placeZWall(world, westWallStart, sizeZ - 2, wallHeight, wallBlockId);
  }

  // East wall (maximum X) - Place between corners
  if (sizeZ > 1) { // Avoid placing if depth is 1
      const eastWallStart = new Vector3(wallStartPos.x + sizeX - 1, wallStartPos.y, wallStartPos.z + 1);
      placeZWall(world, eastWallStart, sizeZ - 2, wallHeight, wallBlockId);
  }
}

/**
 * Creates a simple doorway opening in a wall.
 * Assumes the doorway is on the West wall (minimum X) at the center Z.
 * 
 * @param {World} world - The Hytopia world instance.
 * @param {Vector3} wallStartPos - The starting corner {x, y, z} where walls begin.
 * @param {number} sizeZ - The depth of the room (Z-axis), used to center the door.
 * @param {number} doorHeight - The height of the doorway opening.
 */
function _createDungeonDoorway(
  world: World,
  wallStartPos: Vector3,
  sizeZ: number,
  doorHeight: number
): void {
  // Place doorway on the West wall (min X) centered along Z
  const doorZ = Math.floor(sizeZ / 2); // Center Z position for the door
  const doorBasePos = new Vector3(wallStartPos.x, wallStartPos.y, wallStartPos.z + doorZ);
  console.log(`Creating doorway at ${JSON.stringify(doorBasePos)}`);

  for (let yOffset = 0; yOffset < doorHeight; yOffset++) {
    const doorBlockPos = { x: doorBasePos.x, y: doorBasePos.y + yOffset, z: doorBasePos.z };
    placeBlock(world, doorBlockPos, BLOCK_TYPES.AIR); // Replace wall blocks with air
  }
}

/**
 * Places resource blocks randomly within the dungeon room floor area.
 * 
 * @param {World} world - The Hytopia world instance.
 * @param {Vector3} floorStartPos - The starting corner {x, y, z} of the floor.
 * @param {number} sizeX - The width of the floor (X-axis).
 * @param {number} sizeZ - The depth of the floor (Z-axis).
 * @param {number} resourceBlockId - The block ID of the resource to place.
 */
function _placeDungeonResources(
  world: World,
  floorStartPos: Vector3,
  sizeX: number,
  sizeZ: number,
  resourceBlockId: number
): void {
  // Calculate number of resources based on floor area and density
  const floorArea = (sizeX - 2) * (sizeZ - 2); // Inner floor area, excluding walls
  if (floorArea <= 0) return; // No space for resources

  const numResources = Math.floor(floorArea * RESOURCE_DENSITY);
  console.log(`Placing ${numResources} resource blocks...`);

  for (let i = 0; i < numResources; i++) {
    // Generate random position within the inner floor area
    const rX = Math.floor(Math.random() * (sizeX - 2)) + 1; // Random X offset (1 to sizeX-2)
    const rZ = Math.floor(Math.random() * (sizeZ - 2)) + 1; // Random Z offset (1 to sizeZ-2)
    
    const resourcePos = { 
      x: floorStartPos.x + rX, 
      y: floorStartPos.y + 1, // Place directly above the floor block
      z: floorStartPos.z + rZ 
    };

    // Place the resource block
    placeBlock(world, resourcePos, resourceBlockId);
    // console.log(`Placed resource at ${JSON.stringify(resourcePos)}`); // Verbose logging
  }
}

// ====================================
// Main Dungeon Generation Function
// ====================================

/**
 * Generates a simple rectangular dungeon room with walls, a floor, a doorway, and some resources.
 * 
 * @param {World} world - The Hytopia world instance.
 * @param {Vector3} startPosition - The minimum corner {x, y, z} of the dungeon room (floor level).
 * @param {number} sizeX - The width of the room along the X-axis.
 * @param {number} sizeY - The height of the room along the Y-axis (used for clearing space, walls have fixed height).
 * @param {number} sizeZ - The depth of the room along the Z-axis.
 */
export function generateSimpleDungeon(
  world: World, 
  startPosition: Vector3, 
  sizeX: number, 
  sizeY: number, // Note: sizeY is currently unused by generation logic other than console log
  sizeZ: number
): void {
  console.log(`Generating simple dungeon at ${JSON.stringify(startPosition)} with size ${sizeX}x${sizeY}x${sizeZ}`);

  // Define block types to use
  const floorBlockId = BLOCK_TYPES.STONE_BRICK;
  const wallBlockId = BLOCK_TYPES.STONE_BRICK; 
  const resourceBlockId = BLOCK_TYPES.SCRAP_METAL;

  // --- Generate Floor ---
  _generateDungeonFloor(world, startPosition, sizeX, sizeZ, floorBlockId);

  // --- Generate Walls ---
  const wallStartPos = new Vector3(startPosition.x, startPosition.y + 1, startPosition.z);
  _generateDungeonWalls(world, wallStartPos, sizeX, sizeZ, DEFAULT_WALL_HEIGHT, wallBlockId);

  // --- Create Doorway ---
  // Ensure room is deep enough for a centered doorway on the west wall
  if (sizeZ > 2) { 
    _createDungeonDoorway(world, wallStartPos, sizeZ, DEFAULT_DOOR_HEIGHT);
  } else {
      console.warn("Dungeon too narrow to create standard doorway.");
  }

  // --- Place Resources ---
  _placeDungeonResources(world, startPosition, sizeX, sizeZ, resourceBlockId);

  console.log("Simple dungeon room generated successfully!");
}
