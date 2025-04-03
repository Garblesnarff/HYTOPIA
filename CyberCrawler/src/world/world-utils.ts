/**
 * World Utilities - General helper functions related to world coordinates and areas.
 * 
 * This file provides utility functions for coordinate transformations and area checks
 * within the game world.
 * 
 * Dependencies:
 * - Hytopia SDK (Vector3, Vector3Like)
 * - ../constants/world-config (WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3, Vector3Like } from 'hytopia';
import { WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT } from '../constants/world-config';

// ====================================
// World Coordinate and Area Utilities
// ====================================

/**
 * Converts a local position within a defined area to absolute world coordinates.
 * Assumes the local Y coordinate is relative to the world's base height.
 * 
 * @param {string} areaName - The key name of the area in the WORLD_AREAS configuration object.
 * @param {number} localX - X coordinate relative to the area's starting X.
 * @param {number} [localY=0] - Y coordinate relative to WORLD_HEIGHT.BASE. Defaults to 0.
 * @param {number} localZ - Z coordinate relative to the area's starting Z.
 * @returns {Vector3} The calculated absolute world coordinates as a Hytopia Vector3 object.
 * @throws {Error} If the specified areaName does not exist in WORLD_AREAS.
 */
export function areaToWorldPos(
  areaName: string,
  localX: number,
  localY: number = 0, // Default Y offset from base height is 0
  localZ: number
): Vector3 {
  // Retrieve the area definition from the configuration
  const area = WORLD_AREAS[areaName as keyof typeof WORLD_AREAS];
  
  // Validate if the area exists
  if (!area) {
    throw new Error(`Unknown area specified for coordinate conversion: ${areaName}`);
  }
  
  // Calculate absolute world coordinates
  const worldX = WORLD_ORIGIN.X + area.startX + localX;
  const worldY = WORLD_HEIGHT.BASE + localY; // Y is relative to base height
  const worldZ = WORLD_ORIGIN.Z + area.startZ + localZ;
  
  return new Vector3(worldX, worldY, worldZ);
}

/**
 * Checks if a given world position falls within the boundaries of a specific defined area.
 * Compares the position's X and Z coordinates against the area's start and dimensions.
 * 
 * @param {Vector3Like} position - The world position {x, y, z} to check. Y coordinate is ignored.
 * @param {string} areaName - The key name of the area in the WORLD_AREAS configuration object.
 * @returns {boolean} True if the position is within the specified area's XZ boundaries, false otherwise.
 * @throws {Error} If the specified areaName does not exist in WORLD_AREAS.
 */
export function isPositionInArea(
  position: Vector3Like,
  areaName: string
): boolean {
  // Retrieve the area definition
  const area = WORLD_AREAS[areaName as keyof typeof WORLD_AREAS];
  
  // Validate if the area exists
  if (!area) {
    throw new Error(`Unknown area specified for position check: ${areaName}`);
  }
  
  // Calculate position relative to the world origin
  const relativeX = position.x - WORLD_ORIGIN.X;
  const relativeZ = position.z - WORLD_ORIGIN.Z;
  
  // Check if the relative coordinates are within the area's bounds
  const isInX = relativeX >= area.startX && relativeX < area.startX + area.width;
  const isInZ = relativeZ >= area.startZ && relativeZ < area.startZ + area.depth;
  
  return isInX && isInZ;
}

/**
 * Checks if a given world position falls within *any* of the defined areas in WORLD_AREAS.
 * Iterates through all defined areas and uses isPositionInArea for each.
 * 
 * @param {Vector3Like} position - The world position {x, y, z} to check. Y coordinate is ignored.
 * @returns {boolean} True if the position is within at least one defined area, false otherwise.
 */
export function isInAnyDefinedArea(position: Vector3Like): boolean {
  // Iterate through all keys (area names) in the WORLD_AREAS object
  for (const areaKey in WORLD_AREAS) {
    // Use 'hasOwnProperty' for safety, although likely not strictly necessary with typical object literals
    if (Object.prototype.hasOwnProperty.call(WORLD_AREAS, areaKey)) {
      try {
        // Check if the position is in the current area
        if (isPositionInArea(position, areaKey)) {
          return true; // Position found in an area, no need to check further
        }
      } catch (error) {
         // Log error if isPositionInArea throws (e.g., bad area key somehow) but continue checking others
         console.warn(`Error checking area ${areaKey} for position ${JSON.stringify(position)}:`, error);
      }
    }
  }
  
  // Position was not found in any defined area
  return false;
}
