/**
 * fence.ts - Generates a fence around the player's property.
 * 
 * This file contains the function to build a wooden fence with posts and rails,
 * including a gate structure, around the designated player house area.
 * It dynamically adjusts fence height based on terrain.
 * 
 * Dependencies:
 * - Hytopia SDK (World)
 * - Project constants (BLOCK_TYPES, WORLD_AREAS, WORLD_ORIGIN)
 * - Project utilities (placeBlock, findGroundHeight)
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Imports
// ====================================

// Hytopia SDK
import { World } from 'hytopia';

// Project Constants
import { BLOCK_TYPES } from '../../../constants/block-types';
import { WORLD_AREAS, WORLD_ORIGIN } from '../../../constants/world-config';

// Project Utilities
import { placeBlock } from '../../../utils/block-placer';
import { findGroundHeight } from '../../../utils/terrain-utils';

// ====================================
// Public Functions
// ====================================

/**
 * Builds a fence with posts, rails, and a gate around the property.
 * Adjusts placement height dynamically based on ground level.
 * 
 * @param {World} world - The game world
 */
export function buildFence(world: World): void {
  const area = WORLD_AREAS.PLAYER_HOUSE;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Fence dimensions (slightly larger than the property)
  const fenceStartX = startX - 5;
  const fenceStartZ = startZ - 5;
  const fenceWidth = area.width + 10;
  const fenceDepth = area.depth + 10;
  
  // Place fence posts, adjusting Y based on ground height
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

  // Fence rails, adjusting Y based on ground height
  // North and south fence rails
  for (let x = 0; x < fenceWidth - 1; x++) {
    const railX = fenceStartX + x;

    // North Rail
    const railZ_N = fenceStartZ;
    const railGroundY_N = findGroundHeight(world, railX, railZ_N);
    // Place rail only if it's not overlapping a post location (crude check)
    if (x % fencePostSpacing !== 0) {
      placeBlock(world, { x: railX, y: railGroundY_N + 1, z: railZ_N }, BLOCK_TYPES.WOOD_PLANKS); 
    }

    // South Rail
    const railZ_S = fenceStartZ + fenceDepth - 1;
    const railGroundY_S = findGroundHeight(world, railX, railZ_S);
     // Place rail only if it's not overlapping a post location (crude check)
     // Also skip the gate area
    if (x % fencePostSpacing !== 0 && (railX < fenceStartX + fenceWidth / 2 - 2 || railX > fenceStartX + fenceWidth / 2)) {
      placeBlock(world, { x: railX, y: railGroundY_S + 1, z: railZ_S }, BLOCK_TYPES.WOOD_PLANKS);
    }
  }

  // East and west fence rails
  for (let z = 0; z < fenceDepth - 1; z++) {
    const railZ = fenceStartZ + z;

    // West Rail
    const railX_W = fenceStartX;
    const railGroundY_W = findGroundHeight(world, railX_W, railZ);
    // Place rail only if it's not overlapping a post location (crude check)
    if (z % fencePostSpacing !== 0) {
      placeBlock(world, { x: railX_W, y: railGroundY_W + 1, z: railZ }, BLOCK_TYPES.WOOD_PLANKS);
    }

    // East Rail
    const railX_E = fenceStartX + fenceWidth - 1;
    const railGroundY_E = findGroundHeight(world, railX_E, railZ);
    // Place rail only if it's not overlapping a post location (crude check)
    if (z % fencePostSpacing !== 0) {
      placeBlock(world, { x: railX_E, y: railGroundY_E + 1, z: railZ }, BLOCK_TYPES.WOOD_PLANKS);
    }
  }

  // Add a gate structure at the south side
  const gateCenterX = fenceStartX + fenceWidth / 2; 
  const gateZ = fenceStartZ + fenceDepth - 1;

  // Create the gateway structure (fence posts on either side)
  // Left Gate Post
  const leftPostX = gateCenterX - 2;
  const leftPostGroundY = findGroundHeight(world, leftPostX, gateZ);
  placeBlock(world, { x: leftPostX, y: leftPostGroundY + 1, z: gateZ }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: leftPostX, y: leftPostGroundY + 2, z: gateZ }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: leftPostX, y: leftPostGroundY + 3, z: gateZ }, BLOCK_TYPES.LOG);

  // Right Gate Post
  const rightPostX = gateCenterX + 1; // Adjusted from +1 to +2 for a 3-wide gap
  const rightPostGroundY = findGroundHeight(world, rightPostX, gateZ);
  placeBlock(world, { x: rightPostX, y: rightPostGroundY + 1, z: gateZ }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: rightPostX, y: rightPostGroundY + 2, z: gateZ }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: rightPostX, y: rightPostGroundY + 3, z: gateZ }, BLOCK_TYPES.LOG);

  // Top beam of the gate (use the higher of the two post grounds + 3)
  const gateTopY = Math.max(leftPostGroundY, rightPostGroundY) + 3;
  placeBlock(world, { x: gateCenterX - 1, y: gateTopY, z: gateZ }, BLOCK_TYPES.WOOD_PLANKS);
  placeBlock(world, { x: gateCenterX, y: gateTopY, z: gateZ }, BLOCK_TYPES.WOOD_PLANKS);
  placeBlock(world, { x: gateCenterX + 1, y: gateTopY, z: gateZ }, BLOCK_TYPES.WOOD_PLANKS); // Added middle beam block
}
