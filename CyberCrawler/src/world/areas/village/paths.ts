/**
 * paths.ts - Generates paths within the village area.
 * 
 * This file contains the function to create paths radiating outwards
 * from the central village plaza.
 * 
 * Dependencies:
 * - Hytopia SDK (World)
 * - Project constants (BLOCK_TYPES, WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT)
 * - Project utilities (createPath from ../../terrain.ts)
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
import { WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT } from '../../../constants/world-config';

// Project Utilities
import { createPath } from '../../terrain'; // See: ../../terrain.ts

// ====================================
// Public Functions
// ====================================

/**
 * Builds paths radiating outwards from the village center.
 * 
 * @param {World} world - The game world
 */
export function buildVillagePaths(world: World): void {
  const area = WORLD_AREAS.VILLAGE_CENTER;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Center of the plaza
  const centerX = startX + area.width / 2;
  const centerZ = startZ + area.depth / 2;
  
  // Create paths radiating out from the center
  const numPaths = 8;
  const pathLength = 40;
  
  for (let i = 0; i < numPaths; i++) {
    // Calculate path endpoints
    const angle = (i / numPaths) * Math.PI * 2;
    const endX = centerX + Math.cos(angle) * pathLength;
    const endZ = centerZ + Math.sin(angle) * pathLength;
    
    // Create the path
    createPath(
      world,
      { x: centerX, y: WORLD_HEIGHT.BASE + 1, z: centerZ },
      { x: endX, y: WORLD_HEIGHT.BASE + 1, z: endZ },
      3, // Width
      BLOCK_TYPES.STONE_BRICK
    );
  }
}
