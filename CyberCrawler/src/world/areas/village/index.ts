/**
 * index.ts - Main entry point for village area generation.
 * 
 * This file exports the primary `buildVillage` function which orchestrates
 * the construction of the entire village area by calling functions from
 * other modules within this directory.
 * 
 * Dependencies:
 * - Hytopia SDK (World)
 * - Village component modules:
 *   - ./plaza.ts
 *   - ./buildings.ts
 *   - ./paths.ts
 *   - ./decorations.ts
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Imports
// ====================================

// Hytopia SDK
import { World } from 'hytopia';

// Village Component Modules
import { buildPlaza } from './plaza'; // See: ./plaza.ts
import { buildVillageBuildings } from './buildings'; // See: ./buildings.ts
import { buildVillagePaths } from './paths'; // See: ./paths.ts
import { addVillageDecorations } from './decorations'; // See: ./decorations.ts

// ====================================
// Public Functions
// ====================================

/**
 * Builds the complete village center area by calling component functions in sequence.
 * 
 * @param {World} world - The game world
 */
export function buildVillage(world: World): void {
  console.log('Building village center area...');
  
  // Build main plaza
  buildPlaza(world);
  
  // Build buildings around the plaza
  buildVillageBuildings(world);
  
  // Add paths connecting everything
  buildVillagePaths(world);
  
  // Add decorative elements (trees, benches, etc.)
  addVillageDecorations(world);
  
  console.log('Village center area complete!');
}
