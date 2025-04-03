/**
 * Block Placer - Basic - Utility functions for placing single blocks and simple shapes.
 * 
 * This file provides fundamental block placement operations like placing single blocks,
 * cuboids, floors, and walls along axes.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3Like, World } from 'hytopia';

// ====================================
// Single Block Placement
// ====================================

/**
 * Places a single block at the specified position.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} position - Position coordinates {x, y, z} to place the block.
 * @param {number} blockTypeId - The block type ID to place.
 * @returns {boolean} True if the block was placed successfully, false otherwise.
 */
export function placeBlock(
  world: World,
  position: Vector3Like,
  blockTypeId: number
): boolean {
  try {
    // Attempt to set the block using the chunk lattice
    world.chunkLattice?.setBlock(position, blockTypeId);
    return true;
  } catch (error) {
    // Log error if placement fails
    console.error(`Failed to place block at ${JSON.stringify(position)}:`, error);
    return false;
  }
}

// ====================================
// Simple Shape Placement (Cuboid Based)
// ====================================

/**
 * Places a solid cuboid (3D rectangle) of blocks.
 * Iterates through width, height, and depth to fill the volume.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - The starting corner position {x, y, z} of the cuboid.
 * @param {object} dimensions - The dimensions of the cuboid.
 * @param {number} dimensions.width - Width along the X-axis.
 * @param {number} dimensions.height - Height along the Y-axis.
 * @param {number} dimensions.depth - Depth along the Z-axis.
 * @param {number} blockTypeId - The block type ID to use for filling the cuboid.
 * @returns {boolean} True if the cuboid was placed successfully, false otherwise.
 */
export function placeCuboid(
  world: World,
  startPos: Vector3Like,
  dimensions: { width: number; height: number; depth: number },
  blockTypeId: number
): boolean {
  try {
    // Loop through each dimension
    for (let x = 0; x < dimensions.width; x++) {
      for (let y = 0; y < dimensions.height; y++) {
        for (let z = 0; z < dimensions.depth; z++) {
          // Calculate the absolute position for the current block
          const currentPos = {
            x: startPos.x + x,
            y: startPos.y + y,
            z: startPos.z + z
          };
          // Place the block - reusing placeBlock for consistency (though direct setBlock is used here)
          world.chunkLattice?.setBlock(currentPos, blockTypeId);
        }
      }
    }
    return true;
  } catch (error) {
    // Log error if placement fails
    console.error(`Failed to place cuboid at ${JSON.stringify(startPos)}:`, error);
    return false;
  }
}

/**
 * Places a floor (flat 2D rectangle) of blocks on the XZ plane.
 * This is a convenience function that utilizes placeCuboid with height = 1.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - The starting corner position {x, y, z} of the floor.
 * @param {number} width - Width along the X-axis.
 * @param {number} depth - Depth along the Z-axis.
 * @param {number} blockTypeId - The block type ID to use for the floor.
 * @returns {boolean} Success of the operation, inherited from placeCuboid.
 */
export function placeFloor(
  world: World,
  startPos: Vector3Like,
  width: number,
  depth: number,
  blockTypeId: number
): boolean {
  // Delegate to placeCuboid with a height of 1
  return placeCuboid(world, startPos, { width, height: 1, depth }, blockTypeId);
}

/**
 * Places a wall along the X-axis (constant Z).
 * This is a convenience function that utilizes placeCuboid with depth = 1.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - The starting position {x, y, z} of the wall.
 * @param {number} length - Length of the wall along the X-axis.
 * @param {number} height - Height of the wall along the Y-axis.
 * @param {number} blockTypeId - The block type ID to use for the wall.
 * @returns {boolean} Success of the operation, inherited from placeCuboid.
 */
export function placeXWall(
  world: World,
  startPos: Vector3Like,
  length: number,
  height: number,
  blockTypeId: number
): boolean {
  // Delegate to placeCuboid with a depth of 1
  return placeCuboid(world, startPos, { width: length, height, depth: 1 }, blockTypeId);
}

/**
 * Places a wall along the Z-axis (constant X).
 * This is a convenience function that utilizes placeCuboid with width = 1.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - The starting position {x, y, z} of the wall.
 * @param {number} length - Length of the wall along the Z-axis.
 * @param {number} height - Height of the wall along the Y-axis.
 * @param {number} blockTypeId - The block type ID to use for the wall.
 * @returns {boolean} Success of the operation, inherited from placeCuboid.
 */
export function placeZWall(
  world: World,
  startPos: Vector3Like,
  length: number,
  height: number,
  blockTypeId: number
): boolean {
  // Delegate to placeCuboid with a width of 1
  return placeCuboid(world, startPos, { width: 1, height, depth: length }, blockTypeId);
}
