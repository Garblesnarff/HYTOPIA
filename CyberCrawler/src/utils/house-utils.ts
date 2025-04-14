/**
 * house-utils.ts - Utility functions for player house location and related logic
 *
 * Provides a centralized way to calculate the world position of the player house door or center.
 * Used by both world generation and AI systems to ensure consistency.
 *
 * Dependencies:
 * - WORLD_ORIGIN, WORLD_AREAS from ../../constants/world-config
 * - BLOCK_TYPES, BLOCK_CATEGORIES from ../constants/block-types
 * - BlockHealthManager from ../world/block-health-manager
 *
 * @author Cline
 */

// HYTOPIA SDK types
import { World, Vector3Like } from 'hytopia';

import { WORLD_ORIGIN, WORLD_AREAS } from '../constants/world-config';
// Terrain utilities
import { findGroundHeight } from './terrain-utils';

// Block type constants and categories
import { BLOCK_TYPES, BLOCK_CATEGORIES } from '../constants/block-types';
import { BlockHealthManager } from '../world/block-health-manager';

/**
 * Returns the world position of the player house door.
 *
 * The calculation matches the logic in /src/world/areas/player-house/house-structure.ts.
 * The Y value is set to the actual ground/floor height at the house door using findGroundHeight(world, x, z) + 1.
 *
 * @param {World} world - The game world instance
 * @returns {{ x: number, y: number, z: number }} The door position
 *
 * Example usage:
 *   const doorPos = getPlayerHouseDoorPosition(world);
 *   // Use doorPos.x, doorPos.y, doorPos.z for AI targeting
 */
export function getPlayerHouseDoorPosition(world: World): { x: number, y: number, z: number } {
  const area = WORLD_AREAS.PLAYER_HOUSE;
  const houseWidth = 14;
  const houseDepth = 12;

  // Calculate center position for the house
  const centerX = WORLD_ORIGIN.X + area.startX + area.width / 2;
  const centerZ = WORLD_ORIGIN.Z + area.startZ + area.depth / 2;

  // Calculate house corner
  const houseStartZ = centerZ - houseDepth / 2;

  // Door is centered on X, at the front wall (max Z)
  const doorX = centerX;
  const doorZ = houseStartZ + houseDepth - 1;

  // Y is set to the actual ground/floor height at the door
  const doorY = findGroundHeight(world, doorX, doorZ) + 1;

  return { x: doorX, y: doorY, z: doorZ };
}

/**
 * Finds the nearest destructible block to a given position.
 *
 * Searches within a cubic radius for a block that:
 * - Is registered with BlockHealthManager (i.e., has health and is not indestructible)
 * - Is not AIR
 *
 * @param {World} world - The game world instance
 * @param {Vector3Like} position - The center position to search from (e.g., enemy position)
 * @param {number} [radius=2] - The search radius (in blocks)
 * @returns {Vector3Like | null} The coordinate of the closest destructible block, or null if none found
 *
 * Example usage:
 *   const targetBlock = findNearestDestructibleBlock(world, enemy.position, 2);
 */
/**
 * Finds the nearest destructible block to a given position, optionally filtering by allowed block types.
 *
 * @param {World} world - The game world instance
 * @param {Vector3Like} position - The center position to search from (e.g., enemy position)
 * @param {number} [radius=2] - The search radius (in blocks)
 * @param {Set<number>} [allowedBlockTypes] - Optional set of allowed block type IDs
 * @returns {Vector3Like | null} The coordinate of the closest destructible block, or null if none found
 */
/**
 * Finds the nearest destructible block to a given position, with optional filters.
 *
 * @param {World} world - The game world instance
 * @param {Vector3Like} position - The center position to search from (e.g., enemy position)
 * @param {number} [radius=2] - The search radius (in blocks)
 * @param {Set<number>} [allowedBlockTypes] - Optional set of allowed block type IDs
 * @param {Set<number>} [excludeBlockTypes] - Optional set of block type IDs to exclude
 * @param {number} [minY] - Optional minimum Y value (inclusive)
 * @returns {Vector3Like | null} The coordinate of the closest destructible block, or null if none found
 */
/**
 * Finds the nearest destructible block to a given position, with optional filters.
 *
 * @param {World} world - The game world instance
 * @param {Vector3Like} position - The center position to search from (e.g., enemy position)
 * @param {number} [radius=2] - The search radius (in blocks)
 * @param {Set<number>} [allowedBlockTypes] - Optional set of allowed block type IDs
 * @param {Set<number>} [excludeBlockTypes] - Optional set of block type IDs to exclude
 * @param {number} [houseFloorY] - Optional Y-level of the house floor (for precise floor exclusion)
 * @returns {Vector3Like | null} The coordinate of the closest destructible block, or null if none found
 */
/**
 * Finds the nearest destructible block to a given position, with optional filters.
 *
 * @param {World} world - The game world instance
 * @param {Vector3Like} position - The center position to search from (e.g., enemy position)
 * @param {number} [radius=2] - The search radius (in blocks)
 * @param {Set<number>} [allowedBlockTypes] - Optional set of allowed block type IDs
 * @param {Set<number>} [excludeBlockTypes] - Optional set of block type IDs to exclude
 * @param {number} [houseFloorY] - Optional Y-level of the house floor (for precise floor exclusion)
 * @param {number} [floorLayerCount=3] - Number of floor layers to exclude (default 3)
 * @returns {Vector3Like | null} The coordinate of the closest destructible block, or null if none found
 */
export function findNearestDestructibleBlock(
  world: World,
  position: Vector3Like,
  radius: number = 2,
  allowedBlockTypes?: Set<number>,
  excludeBlockTypes?: Set<number>,
  houseFloorY?: number,
  floorLayerCount: number = 3
): Vector3Like | null {
  let closest: { coord: Vector3Like; distSq: number } | null = null;

  // Precompute excluded Y-levels for floor blocks
  const excludedFloorYs: Set<number> = new Set();
  if (houseFloorY !== undefined) {
    for (let i = 0; i < floorLayerCount; i++) {
      excludedFloorYs.add(houseFloorY + i);
    }
  }

  // Search in a cube of (2*radius+1)^3 blocks around position
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const x = Math.floor(position.x + dx);
        const y = Math.floor(position.y + dy);
        const z = Math.floor(position.z + dz);
        const coord = { x, y, z };

        // Skip blocks at y: 0 (foundation/floor level)
        if (y === 0) continue;

        // Skip AIR blocks
        const blockType = world.chunkLattice?.getBlockType(coord);
        if (!blockType || blockType.id === BLOCK_TYPES.AIR) continue;

        // Only allow certain block types if filter is provided
        if (allowedBlockTypes && !allowedBlockTypes.has(blockType.id)) continue;

        // Exclude certain block types if provided
        if (excludeBlockTypes && excludeBlockTypes.has(blockType.id)) continue;

        // Exclude WOOD_PLANKS or LOG at exactly the house floor Y-level
        if (
          houseFloorY !== undefined &&
          y === houseFloorY &&
          (blockType.id === BLOCK_TYPES.WOOD_PLANKS || blockType.id === BLOCK_TYPES.LOG)
        ) {
          continue;
        }

        // Check if the block is registered and thus destructible
        if (!BlockHealthManager.instance.isBlockRegistered(coord)) continue;

        // Compute squared distance for efficiency
        const distSq = dx * dx + dy * dy + dz * dz;
        if (!closest || distSq < closest.distSq) {
          closest = { coord, distSq };
        }
      }
    }
  }

  return closest ? closest.coord : null;
}
