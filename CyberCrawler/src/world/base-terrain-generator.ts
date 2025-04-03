/**
 * Base Terrain Generator - Creates the foundational layer of the world.
 * 
 * This file provides the function to generate the initial flat ground plane
 * across the entire defined world size.
 * 
 * Dependencies:
 * - Hytopia SDK (World)
 * - ../utils/block-placer-basic.ts (placeBlock)
 * - ../constants/block-types (BLOCK_TYPES)
 * - ../constants/world-config (WORLD_SIZE, WORLD_HEIGHT, WORLD_ORIGIN)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { World } from 'hytopia';
import { placeBlock } from '../utils/block-placer-basic';
import { BLOCK_TYPES } from '../constants/block-types';
import { WORLD_SIZE, WORLD_HEIGHT, WORLD_ORIGIN } from '../constants/world-config';

// ====================================
// Base Terrain Generation
// ====================================

/**
 * Creates the base terrain for the entire world.
 * Generates a flat layer of grass blocks at the base height, with dirt underneath.
 * 
 * @param {World} world - The Hytopia world instance.
 */
export function generateBaseTerrain(world: World): void {
  console.log('Generating base terrain...');
  
  // Iterate over the entire world width and depth based on configured size
  for (let x = 0; x < WORLD_SIZE.WIDTH; x++) {
    for (let z = 0; z < WORLD_SIZE.DEPTH; z++) {
      // Calculate absolute world coordinates based on origin
      const worldX = WORLD_ORIGIN.X + x;
      const worldZ = WORLD_ORIGIN.Z + z;
      
      // Place dirt blocks below the surface level (from min height up to base height)
      // This provides material for digging and foundations.
      for (let y = WORLD_HEIGHT.MIN; y < WORLD_HEIGHT.BASE; y++) {
        try {
            placeBlock(world, { x: worldX, y, z: worldZ }, BLOCK_TYPES.DIRT);
        } catch(error) {
            // Log errors if placing dirt fails (e.g., chunk issues)
            console.warn(`Failed to place base dirt at (${worldX}, ${y}, ${worldZ}):`, error);
        }
      }
      
      // Place the grass block at the surface level (base height)
      try {
        placeBlock(
          world,
          { x: worldX, y: WORLD_HEIGHT.BASE, z: worldZ },
          BLOCK_TYPES.GRASS
        );
      } catch(error) {
         // Log errors if placing grass fails
         console.warn(`Failed to place base grass at (${worldX}, ${WORLD_HEIGHT.BASE}, ${worldZ}):`, error);
      }
    }
     // Optional: Log progress periodically
     // if (x % 10 === 0) { console.log(`Base terrain progress: Column ${x}/${WORLD_SIZE.WIDTH}`); }
  }
  
  console.log('Base terrain generation complete!');
}
