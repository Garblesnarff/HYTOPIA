/**
 * house-utils.ts - Utility functions for player house location and related logic
 *
 * Provides a centralized way to calculate the world position of the player house door or center.
 * Used by both world generation and AI systems to ensure consistency.
 *
 * Dependencies:
 * - WORLD_ORIGIN, WORLD_AREAS from ../../constants/world-config
 *
 * @author Cline
 */

// HYTOPIA SDK types
import { World } from 'hytopia';

import { WORLD_ORIGIN, WORLD_AREAS } from '../constants/world-config';
// Terrain utilities
import { findGroundHeight } from './terrain-utils';

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
