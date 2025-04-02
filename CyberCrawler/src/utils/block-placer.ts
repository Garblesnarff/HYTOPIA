/**
 * Block Placer - Utility functions for placing blocks in the world
 * 
 * This file provides helper functions to simplify common block placement operations
 * like placing cubes, floors, walls, and other structures.
 * 
 * @author CyberCrawler Team
 */

import { Vector3, Vector3Like, World } from 'hytopia';

// ====================================
// Simple block placement
// ====================================

/**
 * Places a single block at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Position to place the block
 * @param {number} blockTypeId - The block type ID to place
 * @returns {boolean} Success of the operation
 */
export function placeBlock(
  world: World,
  position: Vector3Like,
  blockTypeId: number
): boolean {
  try {
    world.chunkLattice?.setBlock(position, blockTypeId);
    return true;
  } catch (error) {
    console.error(`Failed to place block at ${JSON.stringify(position)}:`, error);
    return false;
  }
}

// ====================================
// Compound block placement
// ====================================

/**
 * Places a cuboid (3D rectangle) of blocks
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting corner position
 * @param {Object} dimensions - Dimensions of the cuboid
 * @param {number} dimensions.width - Width (X-axis)
 * @param {number} dimensions.height - Height (Y-axis)
 * @param {number} dimensions.depth - Depth (Z-axis)
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeCuboid(
  world: World,
  startPos: Vector3Like,
  dimensions: { width: number; height: number; depth: number },
  blockTypeId: number
): boolean {
  try {
    for (let x = 0; x < dimensions.width; x++) {
      for (let y = 0; y < dimensions.height; y++) {
        for (let z = 0; z < dimensions.depth; z++) {
          world.chunkLattice?.setBlock({
            x: startPos.x + x,
            y: startPos.y + y,
            z: startPos.z + z
          }, blockTypeId);
        }
      }
    }
    return true;
  } catch (error) {
    console.error(`Failed to place cuboid at ${JSON.stringify(startPos)}:`, error);
    return false;
  }
}

/**
 * Places a floor (2D rectangle) of blocks
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting corner position
 * @param {number} width - Width (X-axis)
 * @param {number} depth - Depth (Z-axis)
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeFloor(
  world: World,
  startPos: Vector3Like,
  width: number,
  depth: number,
  blockTypeId: number
): boolean {
  return placeCuboid(world, startPos, { width, height: 1, depth }, blockTypeId);
}

/**
 * Places a wall along the X-axis
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting position of the wall
 * @param {number} length - Length of the wall
 * @param {number} height - Height of the wall
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeXWall(
  world: World,
  startPos: Vector3Like,
  length: number,
  height: number,
  blockTypeId: number
): boolean {
  return placeCuboid(world, startPos, { width: length, height, depth: 1 }, blockTypeId);
}

/**
 * Places a wall along the Z-axis
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting position of the wall
 * @param {number} length - Length of the wall
 * @param {number} height - Height of the wall
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeZWall(
  world: World,
  startPos: Vector3Like,
  length: number,
  height: number,
  blockTypeId: number
): boolean {
  return placeCuboid(world, startPos, { width: 1, height, depth: length }, blockTypeId);
}

/**
 * Places a hollow box (walls, floor, ceiling)
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting corner position
 * @param {number} width - Width (X-axis)
 * @param {number} height - Height (Y-axis)
 * @param {number} depth - Depth (Z-axis)
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeHollowBox(
  world: World,
  startPos: Vector3Like,
  width: number,
  height: number,
  depth: number,
  blockTypeId: number
): boolean {
  try {
    // Place the floor
    placeFloor(world, startPos, width, depth, blockTypeId);
    
    // Place the ceiling
    placeFloor(
      world, 
      { x: startPos.x, y: startPos.y + height - 1, z: startPos.z },
      width,
      depth,
      blockTypeId
    );
    
    // Place walls along X-axis
    placeXWall(world, startPos, width, height, blockTypeId);
    placeXWall(
      world,
      { x: startPos.x, y: startPos.y, z: startPos.z + depth - 1 },
      width,
      height,
      blockTypeId
    );
    
    // Place walls along Z-axis
    placeZWall(world, startPos, depth, height, blockTypeId);
    placeZWall(
      world,
      { x: startPos.x + width - 1, y: startPos.y, z: startPos.z },
      depth,
      height,
      blockTypeId
    );
    
    return true;
  } catch (error) {
    console.error(`Failed to place hollow box at ${JSON.stringify(startPos)}:`, error);
    return false;
  }
}

// ====================================
// Structure placement
// ====================================

/**
 * Places a simple tree at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Base position for the tree
 * @param {number} trunkHeight - Height of the trunk
 * @param {number} trunkBlockId - Block type for the trunk
 * @param {number} leavesBlockId - Block type for the leaves
 * @returns {boolean} Success of the operation
 */
export function placeTree(
  world: World,
  position: Vector3Like,
  trunkHeight: number = 4,
  trunkBlockId: number,
  leavesBlockId: number
): boolean {
  try {
    // Place trunk
    for (let y = 0; y < trunkHeight; y++) {
      placeBlock(
        world,
        { x: position.x, y: position.y + y, z: position.z },
        trunkBlockId
      );
    }
    
    // Place leaves
    const leafStartY = position.y + trunkHeight - 2;
    for (let y = 0; y < 4; y++) {
      const radius = y < 2 ? 2 : 1;
      
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          // Skip corners for a more rounded shape
          if (x*x + z*z > radius*radius + 1) continue;
          
          placeBlock(
            world,
            { x: position.x + x, y: leafStartY + y, z: position.z + z },
            leavesBlockId
          );
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to place tree at ${JSON.stringify(position)}:`, error);
    return false;
  }
}
