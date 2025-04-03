/**
 * Terrain Features - Utilities for creating natural terrain features.
 * 
 * This file provides functions for generating hills, valleys, and water bodies
 * within the game world.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - ../utils/block-placer-basic.ts (placeBlock)
 * - ../constants/block-types (BLOCK_TYPES)
 * - ../constants/world-config (WORLD_HEIGHT, TERRAIN_CONFIG)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3Like, World } from 'hytopia';
import { placeBlock } from '../utils/block-placer-basic';
import { BLOCK_TYPES } from '../constants/block-types';
import { WORLD_HEIGHT, TERRAIN_CONFIG } from '../constants/world-config';

// ====================================
// Terrain Feature Helpers
// ====================================

/**
 * Calculates the height adjustment for a hill or depth for a valley at a given point.
 * Uses a simple parabolic falloff based on distance from the center.
 * 
 * @param {number} currentDistSq - Squared distance from the feature center.
 * @param {number} maxRadiusSq - Squared maximum radius of the feature.
 * @param {number} maxMagnitude - Maximum height (for hills) or depth (for valleys).
 * @returns {number} The calculated height or depth adjustment at this point.
 */
function calculateMagnitudeAtPoint(
  currentDistSq: number,
  maxRadiusSq: number,
  maxMagnitude: number
): number {
  // Avoid division by zero or sqrt of negative
  if (maxRadiusSq <= 0 || currentDistSq < 0) return 0;
  // Calculate distance factor (1 at center, 0 at edge)
  const distFactor = 1 - Math.sqrt(currentDistSq / maxRadiusSq);
  // Apply factor to max magnitude, ensuring it's non-negative
  return Math.max(0, Math.floor(maxMagnitude * distFactor));
}

/**
 * Places vertical columns of blocks for a hill feature.
 * 
 * @param {World} world - The game world instance.
 * @param {number} worldX - World X coordinate.
 * @param {number} worldZ - World Z coordinate.
 * @param {number} startY - Base Y level to start building the hill from.
 * @param {number} hillHeight - The height of the hill at this specific X, Z coordinate.
 */
function buildHillColumn(
  world: World,
  worldX: number,
  worldZ: number,
  startY: number,
  hillHeight: number
): void {
  // Place blocks from base up to the calculated height
  for (let yOffset = 0; yOffset <= hillHeight; yOffset++) {
    const currentY = startY + yOffset;
    // Top layer is grass, layers below are dirt
    const blockType = yOffset === hillHeight ? BLOCK_TYPES.GRASS : BLOCK_TYPES.DIRT;
    placeBlock(world, { x: worldX, y: currentY, z: worldZ }, blockType);
  }
}

/**
 * Clears blocks and places bottom material for a valley feature.
 * 
 * @param {World} world - The game world instance.
 * @param {number} worldX - World X coordinate.
 * @param {number} worldZ - World Z coordinate.
 * @param {number} startY - Base Y level where the original ground was.
 * @param {number} valleyDepth - The depth of the valley at this specific X, Z coordinate.
 */
function carveValleyColumn(
  world: World,
  worldX: number,
  worldZ: number,
  startY: number,
  valleyDepth: number
): void {
  // Clear blocks down to the valley bottom
  for (let y = startY; y > startY - valleyDepth; y--) {
    // Default to air, but use water if below water level
    const blockType = y <= TERRAIN_CONFIG.WATER_LEVEL ? BLOCK_TYPES.WATER : BLOCK_TYPES.AIR;
    placeBlock(world, { x: worldX, y, z: worldZ }, blockType);
  }

  // Place the bottom block of the valley
  const bottomY = startY - valleyDepth;
  // Use sand for shallow areas, gravel for deeper ones
  const bottomBlockType = valleyDepth <= 2 ? BLOCK_TYPES.SAND : BLOCK_TYPES.GRAVEL;
  placeBlock(world, { x: worldX, y: bottomY, z: worldZ }, bottomBlockType);
}

// ====================================
// Terrain Feature Main Functions
// ====================================

/**
 * Creates a hill centered at the specified position using a parabolic shape.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} centerPos - Center position {x, y, z} of the hill base. Y is ignored, uses WORLD_HEIGHT.BASE.
 * @param {number} radius - Radius of the hill base.
 * @param {number} height - Maximum height of the hill at its center.
 * @returns {boolean} True if the hill creation process completed, false on error.
 */
export function createHill(
  world: World,
  centerPos: Vector3Like,
  radius: number,
  height: number
): boolean {
  try {
    const radiusSq = radius * radius;
    const startY = WORLD_HEIGHT.BASE; // Hills build up from the base terrain level

    // Iterate over a square area covering the hill's radius
    for (let xOffset = -radius; xOffset <= radius; xOffset++) {
      for (let zOffset = -radius; zOffset <= radius; zOffset++) {
        const distSq = xOffset * xOffset + zOffset * zOffset;

        // Skip points outside the circular base
        if (distSq > radiusSq) continue;

        // Calculate the hill's height at this specific point
        const hillHeight = calculateMagnitudeAtPoint(distSq, radiusSq, height);
        
        // Build the vertical column of blocks for the hill
        const worldX = centerPos.x + xOffset;
        const worldZ = centerPos.z + zOffset;
        buildHillColumn(world, worldX, worldZ, startY, hillHeight);
      }
    }
    return true;
  } catch (error) {
    console.error(`Failed to create hill at ${JSON.stringify(centerPos)}:`, error);
    return false;
  }
}

/**
 * Creates a valley or depression centered at the specified position.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} centerPos - Center position {x, y, z} of the valley. Y is ignored, uses WORLD_HEIGHT.BASE.
 * @param {number} radius - Radius of the valley opening.
 * @param {number} depth - Maximum depth of the valley at its center.
 * @returns {boolean} True if the valley creation process completed, false on error.
 */
export function createValley(
  world: World,
  centerPos: Vector3Like,
  radius: number,
  depth: number
): boolean {
  try {
    const radiusSq = radius * radius;
    const startY = WORLD_HEIGHT.BASE; // Valleys carve down from the base terrain level

    // Iterate over a square area covering the valley's radius
    for (let xOffset = -radius; xOffset <= radius; xOffset++) {
      for (let zOffset = -radius; zOffset <= radius; zOffset++) {
        const distSq = xOffset * xOffset + zOffset * zOffset;

        // Skip points outside the circular opening
        if (distSq > radiusSq) continue;

        // Calculate the valley's depth at this specific point
        const valleyDepth = calculateMagnitudeAtPoint(distSq, radiusSq, depth);

        // Carve out the vertical column for the valley
        const worldX = centerPos.x + xOffset;
        const worldZ = centerPos.z + zOffset;
        carveValleyColumn(world, worldX, worldZ, startY, valleyDepth);
      }
    }
    return true;
  } catch (error) {
    console.error(`Failed to create valley at ${JSON.stringify(centerPos)}:`, error);
    return false;
  }
}

/**
 * Creates a water body (lake, pond) by carving a valley and filling it with water.
 * Also adds a small sand beach around the edge.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} centerPos - Center position {x, y, z} of the water body. Y is ignored.
 * @param {number} radius - Radius of the water body.
 * @param {number} depth - Maximum depth of the water body.
 * @returns {boolean} True if the water body creation process completed, false on error.
 */
export function createWaterBody(
  world: World,
  centerPos: Vector3Like,
  radius: number,
  depth: number
): boolean {
  try {
    const radiusSq = radius * radius;
    const beachWidth = 2; // How many blocks wide the beach is
    const innerRadiusSq = Math.pow(Math.max(0, radius - beachWidth), 2);

    // First, carve out the basic shape using createValley
    const valleySuccess = createValley(world, centerPos, radius, depth);
    if (!valleySuccess) {
      console.warn(`Failed to create underlying valley for water body at ${JSON.stringify(centerPos)}`);
      // Continue anyway, might partially work
    }

    // Iterate again to fill with water and place beach
    for (let xOffset = -radius; xOffset <= radius; xOffset++) {
      for (let zOffset = -radius; zOffset <= radius; zOffset++) {
        const distSq = xOffset * xOffset + zOffset * zOffset;

        // Skip points outside the radius
        if (distSq > radiusSq) continue;

        const worldX = centerPos.x + xOffset;
        const worldZ = centerPos.z + zOffset;

        // Calculate depth at this point again
        const waterDepth = calculateMagnitudeAtPoint(distSq, radiusSq, depth);
        const bottomY = WORLD_HEIGHT.BASE - waterDepth;

        // Fill with water blocks up to the configured water level
        for (let y = bottomY + 1; y <= TERRAIN_CONFIG.WATER_LEVEL; y++) {
           // Check if block is already water (from createValley) to avoid redundant calls
           const existingBlockId = world.chunkLattice?.getBlockId({ x: worldX, y, z: worldZ });
           if (existingBlockId !== BLOCK_TYPES.WATER) {
               placeBlock(world, { x: worldX, y, z: worldZ }, BLOCK_TYPES.WATER);
           }
        }

        // Create the sand beach around the edge
        // Place sand if the point is within the outer radius but outside the inner radius
        if (distSq > innerRadiusSq && distSq <= radiusSq) {
          // Place sand at the base terrain level, replacing grass/dirt
          placeBlock(world, { x: worldX, y: WORLD_HEIGHT.BASE, z: worldZ }, BLOCK_TYPES.SAND);
          // Also ensure the block below the sand is dirt or sand, not gravel from deep valley carving
           placeBlock(world, { x: worldX, y: WORLD_HEIGHT.BASE - 1, z: worldZ }, BLOCK_TYPES.DIRT);
        }
      }
    }
    return true;
  } catch (error) {
    console.error(`Failed to create water body at ${JSON.stringify(centerPos)}:`, error);
    return false;
  }
}
