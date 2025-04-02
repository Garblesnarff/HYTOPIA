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
  placeTree
} from '../../utils/block-placer';
import { createHill, createPath } from '../terrain';

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
  
  createPath(
    world,
    // From the house door
    { 
      x: houseCenter.x, 
      y: WORLD_HEIGHT.BASE + 4, 
      z: startZ + area.depth - 5 
    },
    // To the edge of the property
    { 
      x: houseCenter.x, 
      y: WORLD_HEIGHT.BASE + 1, 
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
  const houseStartY = WORLD_HEIGHT.BASE + 3; // On top of the hill
  
  // Foundation platform
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
  
  // Wooden floor
  placeFloor(
    world,
    { x: houseStartX + 1, y: houseStartY, z: houseStartZ + 1 },
    houseWidth - 2,
    houseDepth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Add a door
  const doorX = centerX;
  const doorZ = houseStartZ + houseDepth;
  placeBlock(world, { x: doorX, y: houseStartY + 1, z: doorZ }, BLOCK_TYPES.AIR);
  placeBlock(world, { x: doorX, y: houseStartY + 2, z: doorZ }, BLOCK_TYPES.AIR);
  
  // Add windows
  // Front windows
  addWindow(world, { x: doorX - 3, y: houseStartY + 2, z: doorZ });
  addWindow(world, { x: doorX + 3, y: houseStartY + 2, z: doorZ });
  
  // Side windows
  addWindow(world, { x: houseStartX, y: houseStartY + 2, z: centerZ });
  addWindow(world, { x: houseStartX + houseWidth, y: houseStartY + 2, z: centerZ });
  
  // Back windows
  addWindow(world, { x: doorX - 3, y: houseStartY + 2, z: houseStartZ });
  addWindow(world, { x: doorX + 3, y: houseStartY + 2, z: houseStartZ });
  
  // Add a roof
  buildRoof(
    world,
    { x: houseStartX - 1, y: houseStartY + houseHeight, z: houseStartZ - 1 },
    houseWidth + 2,
    houseDepth + 2
  );
  
  // Add interior features
  buildInterior(world, { x: houseStartX, y: houseStartY, z: houseStartZ }, houseWidth, houseDepth);
}

/**
 * Adds a window at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Position for the center of the window
 */
function addWindow(world: World, position: Vector3Like): void {
  // Create a 2x2 window centered on the position
  for (let x = -1; x <= 0; x++) {
    for (let y = -1; y <= 0; y++) {
      placeBlock(
        world, 
        { 
          x: position.x + x, 
          y: position.y + y, 
          z: position.z 
        }, 
        BLOCK_TYPES.GLASS
      );
    }
  }
}

/**
 * Builds a simple pitched roof
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting corner position
 * @param {number} width - Width of the roof
 * @param {number} depth - Depth of the roof
 */
function buildRoof(
  world: World,
  startPos: Vector3Like,
  width: number,
  depth: number
): void {
  const roofBlock = BLOCK_TYPES.STONE_BRICK;
  const roofHeight = 4;
  
  // Build the sides of the roof that slope up
  for (let y = 0; y < roofHeight; y++) {
    // Calculate width reduction for this level
    const reduction = y + 1;
    
    // Place the outline of the roof at this level
    for (let x = reduction; x < width - reduction; x++) {
      placeBlock(
        world,
        { x: startPos.x + x, y: startPos.y + y, z: startPos.z },
        roofBlock
      );
      
      placeBlock(
        world,
        { x: startPos.x + x, y: startPos.y + y, z: startPos.z + depth - 1 },
        roofBlock
      );
    }
    
    for (let z = 1; z < depth - 1; z++) {
      placeBlock(
        world,
        { x: startPos.x + reduction, y: startPos.y + y, z: startPos.z + z },
        roofBlock
      );
      
      placeBlock(
        world,
        { x: startPos.x + width - reduction - 1, y: startPos.y + y, z: startPos.z + z },
        roofBlock
      );
    }
    
    // Fill in the top of the roof
    if (y == roofHeight - 1) {
      for (let x = reduction; x < width - reduction; x++) {
        for (let z = reduction; z < depth - reduction; z++) {
          placeBlock(
            world,
            { x: startPos.x + x, y: startPos.y + y, z: startPos.z + z },
            roofBlock
          );
        }
      }
    }
  }
}

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
  const gardenY = WORLD_HEIGHT.BASE + 3; // On the hill
  
  // Place a few trees
  placeTree(
    world,
    { x: gardenStartX + 5, y: gardenY, z: gardenStartZ + 5 },
    5, // Trunk height
    BLOCK_TYPES.LOG,
    BLOCK_TYPES.OAK_LEAVES
  );
  
  placeTree(
    world,
    { x: gardenStartX + 15, y: gardenY, z: gardenStartZ + 8 },
    4, // Trunk height
    BLOCK_TYPES.LOG,
    BLOCK_TYPES.OAK_LEAVES
  );
  
  // Small flower garden
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      // Alternate grass and stone for a checker pattern
      const blockType = (x + z) % 2 === 0
        ? BLOCK_TYPES.GRASS
        : BLOCK_TYPES.STONE;
      
      placeBlock(
        world,
        { x: gardenStartX + 25 + x, y: gardenY, z: gardenStartZ + 5 + z },
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
  
  // Find the appropriate Y level based on terrain
  // For simplicity, we'll use the hill height
  const fenceY = WORLD_HEIGHT.BASE + 3;
  
  // Place fence posts
  const fencePostSpacing = 4;
  
  // North and south fence posts
  for (let x = 0; x < fenceWidth; x += fencePostSpacing) {
    placeBlock(
      world,
      { x: fenceStartX + x, y: fenceY, z: fenceStartZ },
      BLOCK_TYPES.LOG
    );
    
    placeBlock(
      world,
      { x: fenceStartX + x, y: fenceY + 1, z: fenceStartZ },
      BLOCK_TYPES.LOG
    );
    
    placeBlock(
      world,
      { x: fenceStartX + x, y: fenceY, z: fenceStartZ + fenceDepth - 1 },
      BLOCK_TYPES.LOG
    );
    
    placeBlock(
      world,
      { x: fenceStartX + x, y: fenceY + 1, z: fenceStartZ + fenceDepth - 1 },
      BLOCK_TYPES.LOG
    );
  }
  
  // East and west fence posts
  for (let z = fencePostSpacing; z < fenceDepth - fencePostSpacing; z += fencePostSpacing) {
    placeBlock(
      world,
      { x: fenceStartX, y: fenceY, z: fenceStartZ + z },
      BLOCK_TYPES.LOG
    );
    
    placeBlock(
      world,
      { x: fenceStartX, y: fenceY + 1, z: fenceStartZ + z },
      BLOCK_TYPES.LOG
    );
    
    placeBlock(
      world,
      { x: fenceStartX + fenceWidth - 1, y: fenceY, z: fenceStartZ + z },
      BLOCK_TYPES.LOG
    );
    
    placeBlock(
      world,
      { x: fenceStartX + fenceWidth - 1, y: fenceY + 1, z: fenceStartZ + z },
      BLOCK_TYPES.LOG
    );
  }
  
  // Fence rails
  // North and south fence rails
  for (let x = 0; x < fenceWidth - 1; x++) {
    placeBlock(
      world,
      { x: fenceStartX + x, y: fenceY + 1, z: fenceStartZ },
      BLOCK_TYPES.WOOD_PLANKS
    );
    
    placeBlock(
      world,
      { x: fenceStartX + x, y: fenceY + 1, z: fenceStartZ + fenceDepth - 1 },
      BLOCK_TYPES.WOOD_PLANKS
    );
  }
  
  // East and west fence rails
  for (let z = 0; z < fenceDepth - 1; z++) {
    // Skip the gate area
    if (z >= fenceDepth / 2 - 2 && z <= fenceDepth / 2 + 1) continue;
    
    placeBlock(
      world,
      { x: fenceStartX, y: fenceY + 1, z: fenceStartZ + z },
      BLOCK_TYPES.WOOD_PLANKS
    );
    
    placeBlock(
      world,
      { x: fenceStartX + fenceWidth - 1, y: fenceY + 1, z: fenceStartZ + z },
      BLOCK_TYPES.WOOD_PLANKS
    );
  }
  
  // Add a gate at the south side
  const gateX = fenceStartX + fenceWidth / 2;
  const gateZ = fenceStartZ + fenceDepth - 1;
  
  // Create the gateway structure (fence posts on either side)
  placeBlock(
    world,
    { x: gateX - 2, y: fenceY, z: gateZ },
    BLOCK_TYPES.LOG
  );
  
  placeBlock(
    world,
    { x: gateX - 2, y: fenceY + 1, z: gateZ },
    BLOCK_TYPES.LOG
  );
  
  placeBlock(
    world,
    { x: gateX - 2, y: fenceY + 2, z: gateZ },
    BLOCK_TYPES.LOG
  );
  
  placeBlock(
    world,
    { x: gateX + 1, y: fenceY, z: gateZ },
    BLOCK_TYPES.LOG
  );
  
  placeBlock(
    world,
    { x: gateX + 1, y: fenceY + 1, z: gateZ },
    BLOCK_TYPES.LOG
  );
  
  placeBlock(
    world,
    { x: gateX + 1, y: fenceY + 2, z: gateZ },
    BLOCK_TYPES.LOG
  );
  
  // Top beam of the gate
  placeBlock(
    world,
    { x: gateX - 1, y: fenceY + 2, z: gateZ },
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  placeBlock(
    world,
    { x: gateX, y: fenceY + 2, z: gateZ },
    BLOCK_TYPES.WOOD_PLANKS
  );
}
