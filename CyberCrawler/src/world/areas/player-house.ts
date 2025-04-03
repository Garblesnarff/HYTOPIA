/**
 * Player House - Player's house and surrounding property
 * 
 * This file contains functions to build the player's house and surrounding
 * property area in the CyberCrawler game.
 * 
 * @author CyberCrawler Team
 */

import { Vector3, Vector3Like, World } from 'hytopia';

// Constants
import { BLOCK_TYPES } from '../../constants/block-types';
import { WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT } from '../../constants/world-config';

// Utilities
import {
  placeBlock,
  placeCuboid,
  placeFloor,
  placeHollowBox,
  placeXWall,
  placeZWall,
  placeTree,
  placeDetailedDoor,    // Added import
  placeDetailedWindow,  // Added import
  placePitchedRoof      // Added import
} from '../../utils/block-placer';
import { createHill, createPath } from '../terrain';
import { findGroundHeight } from '../../utils/terrain-utils';

// ====================================
// Main generation function
// ====================================

/**
 * Builds the player's house and surrounding property
 * 
 * @param {World} world - The game world
 */
export function buildPlayerHouse(world: World): void {
  console.log('Building player house area...');
  
  // Get the area dimensions
  const area = WORLD_AREAS.PLAYER_HOUSE;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Create a small hill for the house to sit on
  createHill(
    world,
    { 
      x: startX + area.width / 2, 
      y: WORLD_HEIGHT.BASE, 
      z: startZ + area.depth / 2 
    },
    30, // Radius
    3   // Height
  );
  
  // Build the main house structure
  buildMainHouse(world);
  
  // Add a garden
  buildGarden(world);
  
  // Add a fence around the property
  buildFence(world);
  
  // Add a path from the house to the edge of the property
  const houseCenter = {
    x: startX + area.width / 2,
    y: WORLD_HEIGHT.BASE + 4, // Above the hill
    z: startZ + area.depth / 2
  };
  
  // Find ground height for path start/end dynamically
  const pathStartY = findGroundHeight(world, houseCenter.x, startZ + area.depth - 5) + 1;
  const pathEndY = findGroundHeight(world, houseCenter.x, startZ + area.depth + 10) + 1;

  createPath(
    world,
    // From near the house door
    { 
      x: houseCenter.x, 
      y: pathStartY, 
      z: startZ + area.depth - 5 
    },
    // To the edge of the property
    { 
      x: houseCenter.x, 
      y: pathEndY, 
      z: startZ + area.depth + 10 
    },
    3, // Width
    BLOCK_TYPES.STONE_BRICK
  );
  
  console.log('Player house area complete!');
}

// ====================================
// Helper functions
// ====================================

/**
 * Builds the main house structure
 * 
 * @param {World} world - The game world
 */
function buildMainHouse(world: World): void {
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
  // Find the actual ground height at the house's center/corner
  const groundY = findGroundHeight(world, houseStartX, houseStartZ); // Check one corner
  const houseStartY = groundY + 0; // Reverted: Place walls starting 1 block above ground
  console.log(`Placing player house foundation at Y=${houseStartY} (Ground was Y=${groundY})`);

  // Foundation platform - Will now be placed at groundY (houseStartY - 1)
  placeCuboid(
    world,
    { 
      x: houseStartX - 2, 
      y: houseStartY - 1, 
      z: houseStartZ - 2 
    },
    { 
      width: houseWidth + 4, 
      height: 1, 
      depth: houseDepth + 4 
    },
    BLOCK_TYPES.STONE_BRICK
  );
  
  // Main house structure - walls and floor
  placeHollowBox(
    world,
    { x: houseStartX, y: houseStartY, z: houseStartZ },
    houseWidth,
    houseHeight,
    houseDepth,
    BLOCK_TYPES.BRICK
  );
  
  // Wooden floor - Place explicitly at groundY
  placeFloor(
    world,
    { x: houseStartX + 1, y: groundY, z: houseStartZ + 1 }, // Use groundY for floor level
    houseWidth - 2,
    houseDepth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );

  // Add a detailed door (door faces +Z, wall runs E-W, orientation 'north')
  const doorX = centerX;
  const doorZ = houseStartZ + houseDepth - 1; // Wall is at max Z, opening is at max Z
  placeDetailedDoor(
    world,
    { x: doorX, y: groundY, z: doorZ }, // Position is floor block *under* opening (at groundY)
    'north', // Wall runs E-W, door faces +Z
    BLOCK_TYPES.LOG // Frame material
  );

  // Add detailed windows (2x2 size)
  // Bottom of window opening starts at houseStartY + 1 = groundY + 2
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
  
  // Add interior features
  buildInterior(world, { x: houseStartX, y: houseStartY, z: houseStartZ }, houseWidth, houseDepth);
}

// Removed old addWindow function

// Removed old buildRoof function

/**
 * Builds interior features for the house
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} houseStart - Starting corner of the house
 * @param {number} width - Width of the house
 * @param {number} depth - Depth of the house
 */
function buildInterior(
  world: World,
  houseStart: Vector3Like,
  width: number,
  depth: number
): void {
  // Interior walls
  // Add a wall dividing the house roughly in half
  placeXWall(
    world,
    { x: houseStart.x + 1, y: houseStart.y + 1, z: houseStart.z + depth / 2 },
    width - 2,
    3,
    BLOCK_TYPES.BRICK
  );
  
  // Add a doorway in the wall
  placeBlock(
    world,
    { x: houseStart.x + width / 2, y: houseStart.y + 1, z: houseStart.z + depth / 2 },
    BLOCK_TYPES.AIR
  );
  placeBlock(
    world,
    { x: houseStart.x + width / 2, y: houseStart.y + 2, z: houseStart.z + depth / 2 },
    BLOCK_TYPES.AIR
  );
  
  // Add some basic furniture
  // Bed
  placeCuboid(
    world,
    { x: houseStart.x + 2, y: houseStart.y + 1, z: houseStart.z + 2 },
    { width: 3, height: 1, depth: 2 },
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Table
  placeCuboid(
    world,
    { x: houseStart.x + width - 5, y: houseStart.y + 1, z: houseStart.z + 2 },
    { width: 2, height: 1, depth: 2 },
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Storage chest
  placeCuboid(
    world,
    { x: houseStart.x + 2, y: houseStart.y + 1, z: houseStart.z + depth - 4 },
    { width: 2, height: 1, depth: 2 },
    BLOCK_TYPES.LOG
  );
}

/**
 * Builds a garden area near the house
 * 
 * @param {World} world - The game world
 */
function buildGarden(world: World): void {
  const area = WORLD_AREAS.PLAYER_HOUSE;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Garden position
  const gardenStartX = startX + 10;
  const gardenStartZ = startZ + 10;
  // const gardenY = WORLD_HEIGHT.BASE + 3; // On the hill - REMOVED, calculate dynamically

  // Place a few trees
  // Tree 1
  const tree1X = gardenStartX + 5;
  const tree1Z = gardenStartZ + 5;
  const tree1GroundY = findGroundHeight(world, tree1X, tree1Z);
  const tree1GroundBlockId = world.chunkLattice.getBlockId({ x: tree1X, y: tree1GroundY, z: tree1Z });
  const tree1SpaceAboveId = world.chunkLattice.getBlockId({ x: tree1X, y: tree1GroundY + 1, z: tree1Z });

  if ((tree1GroundBlockId === BLOCK_TYPES.GRASS || tree1GroundBlockId === BLOCK_TYPES.DIRT) && tree1SpaceAboveId === BLOCK_TYPES.AIR) {
    placeTree(
      world,
      { x: tree1X, y: tree1GroundY + 1, z: tree1Z }, // Start tree one block above ground
      5, // Trunk height
      BLOCK_TYPES.LOG,
      BLOCK_TYPES.OAK_LEAVES
    );
  }

  // Tree 2
  const tree2X = gardenStartX + 15;
  const tree2Z = gardenStartZ + 8;
  const tree2GroundY = findGroundHeight(world, tree2X, tree2Z);
  const tree2GroundBlockId = world.chunkLattice.getBlockId({ x: tree2X, y: tree2GroundY, z: tree2Z });
  const tree2SpaceAboveId = world.chunkLattice.getBlockId({ x: tree2X, y: tree2GroundY + 1, z: tree2Z });

  if ((tree2GroundBlockId === BLOCK_TYPES.GRASS || tree2GroundBlockId === BLOCK_TYPES.DIRT) && tree2SpaceAboveId === BLOCK_TYPES.AIR) {
    placeTree(
      world,
      { x: tree2X, y: tree2GroundY + 1, z: tree2Z }, // Start tree one block above ground
      4, // Trunk height
      BLOCK_TYPES.LOG,
      BLOCK_TYPES.OAK_LEAVES
    );
  }
  
  // Small flower garden
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      const checkX = gardenStartX + 25 + x;
      const checkZ = gardenStartZ + 5 + z;
      const checkGroundY = findGroundHeight(world, checkX, checkZ);

      // Alternate grass and stone for a checker pattern
      const blockType = (x + z) % 2 === 0
        ? BLOCK_TYPES.GRASS
        : BLOCK_TYPES.STONE;

      placeBlock(
        world,
        { x: checkX, y: checkGroundY, z: checkZ }, // Use checkGroundY instead of gardenY
        blockType
      );
    }
  }
}

/**
 * Builds a fence around the property
 * 
 * @param {World} world - The game world
 */
function buildFence(world: World): void {
  const area = WORLD_AREAS.PLAYER_HOUSE;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Fence dimensions (slightly larger than the property)
  const fenceStartX = startX - 5;
  const fenceStartZ = startZ - 5;
  const fenceWidth = area.width + 10;
  const fenceDepth = area.depth + 10;
  
  // Find the appropriate Y level based on terrain - REMOVED, calculate dynamically
  // const fenceY = WORLD_HEIGHT.BASE + 3;

  // Place fence posts
  const fencePostSpacing = 4;
  
  // North and south fence posts
  for (let x = 0; x < fenceWidth; x += fencePostSpacing) {
    const postX = fenceStartX + x;

    // North Post
    const postZ_N = fenceStartZ;
    const postGroundY_N = findGroundHeight(world, postX, postZ_N);
    placeBlock(world, { x: postX, y: postGroundY_N + 1, z: postZ_N }, BLOCK_TYPES.LOG);
    placeBlock(world, { x: postX, y: postGroundY_N + 2, z: postZ_N }, BLOCK_TYPES.LOG);

    // South Post
    const postZ_S = fenceStartZ + fenceDepth - 1;
    const postGroundY_S = findGroundHeight(world, postX, postZ_S);
    placeBlock(world, { x: postX, y: postGroundY_S + 1, z: postZ_S }, BLOCK_TYPES.LOG);
    placeBlock(world, { x: postX, y: postGroundY_S + 2, z: postZ_S }, BLOCK_TYPES.LOG);
  }

  // East and west fence posts
  for (let z = fencePostSpacing; z < fenceDepth - fencePostSpacing; z += fencePostSpacing) {
    const postZ = fenceStartZ + z;

    // West Post
    const postX_W = fenceStartX;
    const postGroundY_W = findGroundHeight(world, postX_W, postZ);
    placeBlock(world, { x: postX_W, y: postGroundY_W + 1, z: postZ }, BLOCK_TYPES.LOG);
    placeBlock(world, { x: postX_W, y: postGroundY_W + 2, z: postZ }, BLOCK_TYPES.LOG);

    // East Post
    const postX_E = fenceStartX + fenceWidth - 1;
    const postGroundY_E = findGroundHeight(world, postX_E, postZ);
    placeBlock(world, { x: postX_E, y: postGroundY_E + 1, z: postZ }, BLOCK_TYPES.LOG);
    placeBlock(world, { x: postX_E, y: postGroundY_E + 2, z: postZ }, BLOCK_TYPES.LOG);
  }

  // Fence rails
  // North and south fence rails
  for (let x = 0; x < fenceWidth - 1; x++) {
    const railX = fenceStartX + x;

    // North Rail
    const railZ_N = fenceStartZ;
    const railGroundY_N = findGroundHeight(world, railX, railZ_N);
    placeBlock(world, { x: railX, y: railGroundY_N + 2, z: railZ_N }, BLOCK_TYPES.WOOD_PLANKS);

    // South Rail
    const railZ_S = fenceStartZ + fenceDepth - 1;
    const railGroundY_S = findGroundHeight(world, railX, railZ_S);
    placeBlock(world, { x: railX, y: railGroundY_S + 2, z: railZ_S }, BLOCK_TYPES.WOOD_PLANKS);
  }

  // East and west fence rails
  for (let z = 0; z < fenceDepth - 1; z++) {
    const railZ = fenceStartZ + z;

    // Skip the gate area
    if (z >= fenceDepth / 2 - 2 && z <= fenceDepth / 2 + 1) continue;

    // West Rail
    const railX_W = fenceStartX;
    const railGroundY_W = findGroundHeight(world, railX_W, railZ);
    placeBlock(world, { x: railX_W, y: railGroundY_W + 2, z: railZ }, BLOCK_TYPES.WOOD_PLANKS);

    // East Rail
    const railX_E = fenceStartX + fenceWidth - 1;
    const railGroundY_E = findGroundHeight(world, railX_E, railZ);
    placeBlock(world, { x: railX_E, y: railGroundY_E + 2, z: railZ }, BLOCK_TYPES.WOOD_PLANKS);
  }

  // Add a gate at the south side
  const gateCenterX = fenceStartX + fenceWidth / 2; // Renamed from gateX for clarity
  const gateZ = fenceStartZ + fenceDepth - 1;

  // Create the gateway structure (fence posts on either side)
  // Left Gate Post
  const leftPostX = gateCenterX - 2;
  const leftPostGroundY = findGroundHeight(world, leftPostX, gateZ);
  placeBlock(world, { x: leftPostX, y: leftPostGroundY + 1, z: gateZ }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: leftPostX, y: leftPostGroundY + 2, z: gateZ }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: leftPostX, y: leftPostGroundY + 3, z: gateZ }, BLOCK_TYPES.LOG);

  // Right Gate Post
  const rightPostX = gateCenterX + 1;
  const rightPostGroundY = findGroundHeight(world, rightPostX, gateZ);
  placeBlock(world, { x: rightPostX, y: rightPostGroundY + 1, z: gateZ }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: rightPostX, y: rightPostGroundY + 2, z: gateZ }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: rightPostX, y: rightPostGroundY + 3, z: gateZ }, BLOCK_TYPES.LOG);

  // Top beam of the gate (use the higher of the two post grounds + 3)
  const gateTopY = Math.max(leftPostGroundY, rightPostGroundY) + 3;
  placeBlock(world, { x: gateCenterX - 1, y: gateTopY, z: gateZ }, BLOCK_TYPES.WOOD_PLANKS);
  placeBlock(world, { x: gateCenterX, y: gateTopY, z: gateZ }, BLOCK_TYPES.WOOD_PLANKS);
}
