/**
 * buildings.ts - Orchestrates the placement of various village buildings.
 * 
 * This file contains the main function responsible for calculating the positions
 * for village buildings around the central plaza and calling the specific
 * generation functions for each building type (shop, house, tower).
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT)
 * - Village building modules (buildSmallShop, buildVillageHouse, buildTallBuilding)
 *   - See: ./shop.ts
 *   - See: ./house.ts
 *   - See: ./tower.ts
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Imports
// ====================================

// Hytopia SDK
import { Vector3Like, World } from 'hytopia';

// Project Constants
import { WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT } from '../../../constants/world-config';

// Village Building Modules
import { buildSmallShop } from './shop';
import { buildVillageHouse } from './house';
import { buildTallBuilding } from './tower';

// ====================================
// Public Functions
// ====================================

/**
 * Builds various buildings in a circular pattern around the village plaza.
 * Alternates between shop, house, and tower types.
 * 
 * @param {World} world - The game world
 */
export function buildVillageBuildings(world: World): void {
  const area = WORLD_AREAS.VILLAGE_CENTER;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Center of the plaza
  const centerX = startX + area.width / 2;
  const centerZ = startZ + area.depth / 2;
  
  // Build several houses in a circular pattern around the plaza
  const buildingDistance = 35; // Distance from village center
  const numBuildings = 6;
  
  for (let i = 0; i < numBuildings; i++) {
    // Calculate position around the circle
    const angle = (i / numBuildings) * Math.PI * 2;
    const posX = centerX + Math.cos(angle) * buildingDistance;
    const posZ = centerZ + Math.sin(angle) * buildingDistance;
    
    // Alternate between different building types
    // Note: We pass WORLD_HEIGHT.BASE as the Y position, the individual
    // building functions will calculate the actual ground height.
    if (i % 3 === 0) {
      buildSmallShop(world, { x: posX, y: WORLD_HEIGHT.BASE, z: posZ });
    } else if (i % 3 === 1) {
      buildVillageHouse(world, { x: posX, y: WORLD_HEIGHT.BASE, z: posZ });
    } else {
      buildTallBuilding(world, { x: posX, y: WORLD_HEIGHT.BASE, z: posZ });
    }
  }
}
