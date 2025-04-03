/**
 * plaza.ts - Generates the central plaza area for the village.
 * 
 * This file includes functions to create the main circular plaza floor
 * and a central feature (currently a fountain).
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (BLOCK_TYPES, WORLD_AREAS, WORLD_ORIGIN)
 * - Project utilities (placeBlock, findGroundHeight)
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Imports
// ====================================

// Hytopia SDK
import { Vector3Like, World } from 'hytopia';

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
 * Builds the main village plaza, including floor and central feature.
 * 
 * @param {World} world - The game world
 */
export function buildPlaza(world: World): void {
  const area = WORLD_AREAS.VILLAGE_CENTER;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Center of the plaza
  const centerX = startX + area.width / 2;
  const centerZ = startZ + area.depth / 2;
  
  // Build a circular plaza in the center
  const plazaRadius = 20;
  
  // Create the plaza floor (stone bricks)
  for (let x = -plazaRadius; x <= plazaRadius; x++) {
    for (let z = -plazaRadius; z <= plazaRadius; z++) {
      // Calculate distance from center (circular shape)
      const distSq = x*x + z*z;
      
      // Skip if outside the radius
      if (distSq > plazaRadius*plazaRadius) continue;
      
      const worldX = centerX + x;
      const worldZ = centerZ + z;
      const groundY = findGroundHeight(world, worldX, worldZ);

      // Place stone brick floor ON the found ground
      placeBlock(
        world,
        { x: worldX, y: groundY, z: worldZ }, // Use groundY instead of WORLD_HEIGHT.BASE
        BLOCK_TYPES.STONE_BRICK
      );
    }
  }

  // Add a central feature (fountain or statue)
  const centerGroundY = findGroundHeight(world, centerX, centerZ);
  buildCentralFeature(world, { x: centerX, y: centerGroundY + 1, z: centerZ }); // Start feature 1 block above ground
}

/**
 * Builds a central feature (fountain) in the village plaza
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} centerPos - Center position for the feature
 */
function buildCentralFeature(world: World, centerPos: Vector3Like): void {
  // Create a simple fountain
  const fountainRadius = 5;
  
  // Build the outer rim of the fountain
  for (let x = -fountainRadius; x <= fountainRadius; x++) {
    for (let z = -fountainRadius; z <= fountainRadius; z++) {
      // Calculate distance from center
      const distSq = x*x + z*z;
      
      // Outer rim
      if (distSq <= fountainRadius*fountainRadius && distSq >= (fountainRadius - 1)*(fountainRadius - 1)) {
        placeBlock(
          world,
          { x: centerPos.x + x, y: centerPos.y, z: centerPos.z + z },
          BLOCK_TYPES.STONE_BRICK
        );
      }
      // Inner water
      else if (distSq < (fountainRadius - 1)*(fountainRadius - 1)) {
        placeBlock(
          world,
          { x: centerPos.x + x, y: centerPos.y, z: centerPos.z + z },
          BLOCK_TYPES.WATER
        );
      }
    }
  }
  
  // Add a central pillar
  for (let y = 0; y < 4; y++) {
    placeBlock(
      world,
      { x: centerPos.x, y: centerPos.y + y, z: centerPos.z },
      BLOCK_TYPES.STONE_BRICK
    );
  }
  
  // Add water spouts
  placeBlock(world, { x: centerPos.x + 1, y: centerPos.y + 2, z: centerPos.z }, BLOCK_TYPES.WATER);
  placeBlock(world, { x: centerPos.x - 1, y: centerPos.y + 2, z: centerPos.z }, BLOCK_TYPES.WATER);
  placeBlock(world, { x: centerPos.x, y: centerPos.y + 2, z: centerPos.z + 1 }, BLOCK_TYPES.WATER);
  placeBlock(world, { x: centerPos.x, y: centerPos.y + 2, z: centerPos.z - 1 }, BLOCK_TYPES.WATER);
}
