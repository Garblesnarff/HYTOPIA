/**
 * Terrain Path - Utilities for creating paths on the terrain.
 * 
 * This file provides functions for generating paths between two points,
 * automatically adjusting to the ground height.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - ../utils/block-placer-basic.ts (placeBlock)
 * - ../utils/terrain-utils.ts (findGroundHeight)
 * - ../constants/block-types (BLOCK_TYPES)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3Like, World } from 'hytopia';
import { placeBlock } from '../utils/block-placer-basic';
import { findGroundHeight } from '../utils/terrain-utils'; // Ensure this utility exists and is correctly imported
import { BLOCK_TYPES } from '../constants/block-types';

// ====================================
// Path Creation Helpers
// ====================================

/**
 * Calculates the normalized direction vector and perpendicular vector for a path.
 * 
 * @param {Vector3Like} startPos - Starting position of the path.
 * @param {Vector3Like} endPos - Ending position of the path.
 * @returns {{ dirX: number, dirZ: number, perpX: number, perpZ: number, length: number } | null} 
 *          An object with direction, perpendicular vectors, and length, or null if length is zero.
 */
function calculatePathVectors(startPos: Vector3Like, endPos: Vector3Like): { dirX: number, dirZ: number, perpX: number, perpZ: number, length: number } | null {
  const dx = endPos.x - startPos.x;
  const dz = endPos.z - startPos.z;
  const length = Math.sqrt(dx * dx + dz * dz);

  // Avoid division by zero if start and end points are the same
  if (length === 0) {
    return null;
  }

  // Normalize direction vector
  const dirX = dx / length;
  const dirZ = dz / length;

  // Calculate perpendicular vector (rotated 90 degrees)
  const perpX = -dirZ;
  const perpZ = dirX;

  return { dirX, dirZ, perpX, perpZ, length };
}

/**
 * Places a segment of the path at a specific step along the main direction.
 * Handles path width and places blocks at the correct ground height.
 * 
 * @param {World} world - The game world instance.
 * @param {number} baseX - Base X coordinate for this path segment center.
 * @param {number} baseZ - Base Z coordinate for this path segment center.
 * @param {number} perpX - X component of the perpendicular vector.
 * @param {number} perpZ - Z component of the perpendicular vector.
 * @param {number} width - The total width of the path.
 * @param {number} blockTypeId - The block type ID to use for the path.
 */
function placePathSegment(
  world: World,
  baseX: number,
  baseZ: number,
  perpX: number,
  perpZ: number,
  width: number,
  blockTypeId: number
): void {
  const halfWidth = Math.floor(width / 2);

  // Place path blocks in a line perpendicular to the path direction
  for (let w = -halfWidth; w < width - halfWidth; w++) { // Adjusted loop for potentially odd widths
    const pathX = Math.round(baseX + perpX * w);
    const pathZ = Math.round(baseZ + perpZ * w);

    try {
      // Find the ground level at this specific path block location
      const groundY = findGroundHeight(world, pathX, pathZ);

      // Check if the space directly above the path location is empty (important!)
      // This prevents paths from destroying parts of structures built over flat ground.
      const spaceAboveId = world.chunkLattice?.getBlockId({ x: pathX, y: groundY + 1, z: pathZ });

      // Only place the path block if the space above is AIR
      if (spaceAboveId === BLOCK_TYPES.AIR) {
        // Place path block AT ground level, replacing the existing block
        placeBlock(world, { x: pathX, y: groundY, z: pathZ }, blockTypeId);
      } else {
         // Optional: Log or handle cases where path placement is blocked
         // console.log(`Path placement blocked at ${pathX}, ${groundY+1}, ${pathZ}`);
      }
    } catch (error) {
        // Catch potential errors from findGroundHeight or getBlockId if chunk isn't loaded
        console.warn(`Error processing path segment at (${pathX}, ${pathZ}):`, error);
    }
  }
}

// ====================================
// Path Creation Main Function
// ====================================

/**
 * Creates a simple path between two points, following the terrain height.
 * The path replaces the ground block. It avoids placing blocks if there's a non-air block directly above.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - Starting position {x, y, z} of the path. Y is ignored.
 * @param {Vector3Like} endPos - Ending position {x, y, z} of the path. Y is ignored.
 * @param {number} [width=2] - Width of the path in blocks. Defaults to 2.
 * @param {number} [blockTypeId=BLOCK_TYPES.STONE] - The block type ID to use for the path. Defaults to STONE.
 * @returns {boolean} True if the path creation process completed, false on error or if start/end are identical.
 */
export function createPath(
  world: World,
  startPos: Vector3Like,
  endPos: Vector3Like,
  width: number = 2,
  blockTypeId: number = BLOCK_TYPES.STONE
): boolean {
  try {
    // Calculate direction, perpendicular vector, and length
    const vectors = calculatePathVectors(startPos, endPos);
    if (!vectors) {
      console.warn("Path start and end positions are the same.");
      return false; // Or true, depending on desired behavior for zero-length path
    }
    const { dirX, dirZ, perpX, perpZ, length } = vectors;

    // Iterate along the path direction vector
    for (let step = 0; step <= Math.ceil(length); step++) { // Use Math.ceil to ensure endpoint is included
      // Calculate the center point for this step
      const currentX = Math.round(startPos.x + dirX * step);
      const currentZ = Math.round(startPos.z + dirZ * step);

      // Place the path segment (handles width and ground height)
      placePathSegment(world, currentX, currentZ, perpX, perpZ, width, blockTypeId);
    }

    return true;
  } catch (error) {
    console.error(`Failed to create path from ${JSON.stringify(startPos)} to ${JSON.stringify(endPos)}:`, error);
    return false;
  }
}
