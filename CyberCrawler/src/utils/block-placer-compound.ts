/**
 * Block Placer - Compound - Utility functions for placing more complex compound shapes.
 * 
 * This file provides functions for creating structures composed of multiple basic shapes,
 * like a hollow box.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - ./block-placer-basic.ts (placeFloor, placeXWall, placeZWall)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3Like, World } from 'hytopia';
import { placeFloor, placeXWall, placeZWall } from './block-placer-basic'; // Import dependencies

// ====================================
// Compound Shape Placement
// ====================================

/**
 * Places a hollow box defined by walls, floor, and ceiling.
 * Uses helper functions for placing the individual components (floor, walls).
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - The starting corner position {x, y, z} of the box (usually the minimum corner).
 * @param {number} width - Width of the box along the X-axis.
 * @param {number} height - Height of the box along the Y-axis.
 * @param {number} depth - Depth of the box along the Z-axis.
 * @param {number} blockTypeId - The block type ID to use for the box's structure.
 * @returns {boolean} True if the box was placed successfully, false otherwise.
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
    // Ensure dimensions are valid
    if (width <= 0 || height <= 0 || depth <= 0) {
      console.warn(`Invalid dimensions for hollow box: w=${width}, h=${height}, d=${depth}`);
      return false;
    }

    // Place the floor at the starting Y level
    placeFloor(world, startPos, width, depth, blockTypeId);
    
    // Place the ceiling at the top Y level (startPos.y + height - 1)
    // Only place ceiling if height > 1 to avoid double-placing floor
    if (height > 1) {
      placeFloor(
        world, 
        { x: startPos.x, y: startPos.y + height - 1, z: startPos.z },
        width,
        depth,
        blockTypeId
      );
    }
    
    // Place walls along X-axis (front and back)
    // Only place walls if height > 1 and depth > 1
    if (height > 1 && depth > 1) {
      // Front wall (at startPos.z)
      placeXWall(
        world, 
        { x: startPos.x, y: startPos.y + 1, z: startPos.z }, // Start wall above floor
        width, 
        height - 2, // Wall height excludes floor and ceiling
        blockTypeId
      );
      // Back wall (at startPos.z + depth - 1)
      placeXWall(
        world,
        { x: startPos.x, y: startPos.y + 1, z: startPos.z + depth - 1 },
        width,
        height - 2,
        blockTypeId
      );
    }
    
    // Place walls along Z-axis (left and right)
    // Only place walls if height > 1 and width > 1
    if (height > 1 && width > 1) {
      // Left wall (at startPos.x)
      placeZWall(
        world, 
        { x: startPos.x, y: startPos.y + 1, z: startPos.z + 1 }, // Start wall above floor and inside front/back walls
        depth - 2, // Wall length excludes corners covered by X walls
        height - 2, // Wall height excludes floor and ceiling
        blockTypeId
      );
      // Right wall (at startPos.x + width - 1)
      placeZWall(
        world,
        { x: startPos.x + width - 1, y: startPos.y + 1, z: startPos.z + 1 },
        depth - 2,
        height - 2,
        blockTypeId
      );
    }
    
    return true;
  } catch (error) {
    // Log error if placement fails
    console.error(`Failed to place hollow box at ${JSON.stringify(startPos)}:`, error);
    return false;
  }
}
