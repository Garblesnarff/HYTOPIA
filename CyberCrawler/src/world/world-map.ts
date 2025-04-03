/**
 * World Map - Main world map definition and initialization (Refactored)
 * 
 * This file orchestrates the creation of the CyberCrawler world map by calling
 * functions from various specialized modules for initialization, terrain generation,
 * area building, and path connection.
 * 
 * Dependencies:
 * - Hytopia SDK (World)
 * - ./world-init (registerBlockTypes)
 * - ./base-terrain-generator (generateBaseTerrain)
 * - ./terrain-features (createHill, createWaterBody)
 * - ./area-terrain-generator (createAreaTerrain)
 * - ./path-connector (connectAreasWithPaths)
 * - ./world-utils (isInAnyDefinedArea)
 * - ../constants/world-config (WORLD_SIZE, WORLD_HEIGHT, WORLD_ORIGIN, WORLD_AREAS)
 * - ./areas/player-house (buildPlayerHouse)
 * - ./areas/village (buildVillage)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { World, Vector3Like } from 'hytopia';

// World Setup Modules
import { registerBlockTypes } from './world-init'; // See: ./world-init.ts
import { generateBaseTerrain } from './base-terrain-generator'; // See: ./base-terrain-generator.ts

// Terrain Generation Modules
import { createHill, createWaterBody } from './terrain-features'; // See: ./terrain-features.ts
import { createAreaTerrain } from './area-terrain-generator'; // See: ./area-terrain-generator.ts

// Path Generation Module
import { connectAreasWithPaths } from './path-connector'; // See: ./path-connector.ts

// Utility Module
import { isInAnyDefinedArea } from './world-utils'; // See: ./world-utils.ts

// Constants
import { WORLD_SIZE, WORLD_HEIGHT, WORLD_ORIGIN, WORLD_AREAS } from '../constants/world-config';

// Specific Area Builders
import { buildPlayerHouse } from './areas/player-house'; // See: ./areas/player-house.ts
import { buildVillage } from './areas/village'; // See: ./areas/village.ts

// ====================================
// World Generation Orchestration
// ====================================

/**
 * Adds terrain features to the world, including area-specific and random features.
 * This function is called by generateWorldMap.
 * 
 * @param {World} world - The Hytopia world instance.
 */
function generateTerrainFeatures(world: World): void {
  console.log('Adding terrain features...');
  
  try {
    // Add terrain features specifically to the wilderness area
    const wildernessArea = WORLD_AREAS.WILDERNESS;
    if (wildernessArea) {
      console.log('Generating features in Wilderness area...');
      createAreaTerrain(
        world,
        { 
          x: WORLD_ORIGIN.X + wildernessArea.startX, 
          y: WORLD_HEIGHT.BASE, // Y is base level for area definition
          z: WORLD_ORIGIN.Z + wildernessArea.startZ 
        },
        wildernessArea.width,
        wildernessArea.depth,
        { // Feature configuration for this area
          hills: 8,
          valleys: 3,
          waterBodies: 2
        }
      );
    } else {
      console.warn("Wilderness area not defined in WORLD_AREAS. Skipping wilderness features.");
    }
    
    // Add a specific large water body near the tech district (if defined)
    const techArea = WORLD_AREAS.TECH_DISTRICT;
    if (techArea) {
       console.log('Generating specific water body near Tech District...');
       createWaterBody(
         world,
         { // Position relative to Tech District
           x: WORLD_ORIGIN.X + techArea.startX - 20,
           y: WORLD_HEIGHT.BASE, // Y is base level
           z: WORLD_ORIGIN.Z + techArea.startZ + techArea.depth + 20
         },
         25, // Radius
         5   // Depth
       );
    } else {
       console.warn("Tech District area not defined in WORLD_AREAS. Skipping nearby water body.");
    }
    
    // Add some random hills scattered throughout the world, avoiding defined areas
    const randomHillCount = 15;
    console.log(`Generating ${randomHillCount} random hills outside defined areas...`);
    let placedRandomHills = 0;
    for (let i = 0; i < randomHillCount; i++) {
      // Generate random coordinates within the entire world bounds
      const randomX = WORLD_ORIGIN.X + Math.floor(Math.random() * WORLD_SIZE.WIDTH);
      const randomZ = WORLD_ORIGIN.Z + Math.floor(Math.random() * WORLD_SIZE.DEPTH);
      const randomPos: Vector3Like = { x: randomX, y: WORLD_HEIGHT.BASE, z: randomZ };
      
      // Check if the random position falls within any predefined area
      if (!isInAnyDefinedArea(randomPos)) {
        // Define random parameters for the hill
        const hillRadius = 5 + Math.floor(Math.random() * 15); // 5-19 radius
        const hillHeight = 2 + Math.floor(Math.random() * 4); // 2-5 height
        
        // Create the hill
        createHill(world, randomPos, hillRadius, hillHeight);
        placedRandomHills++;
      }
    }
     console.log(`Placed ${placedRandomHills} random hills.`);

  } catch (error) {
      console.error("Error occurred during terrain feature generation:", error);
  } finally {
      console.log('Terrain features generation process complete.');
  }
}


/**
 * Generates the complete world map by orchestrating various generation steps.
 * 
 * @param {World} world - The Hytopia world instance.
 */
export function generateWorldMap(world: World): void {
  console.log('Starting world generation...');
  
  // 1. Register all necessary block types
  registerBlockTypes(world); // See: ./world-init.ts
  
  // 2. Create the base flat terrain
  generateBaseTerrain(world); // See: ./base-terrain-generator.ts
  
  // 3. Add terrain features (hills, valleys, water)
  generateTerrainFeatures(world); // Defined above, uses ./terrain-features.ts, ./area-terrain-generator.ts
  
  // 4. Build specific, predefined areas/structures
  console.log('Building specific areas...');
  try {
      buildVillage(world); // See: ./areas/village.ts
      buildPlayerHouse(world); // See: ./areas/player-house.ts
      // TODO: Implement and call other area builders (e.g., buildTechDistrict, buildDungeonEntrance)
      console.log('Specific area building complete.');
  } catch (error) {
      console.error("Error building specific areas:", error);
  }
  
  // 5. Connect key areas with paths
  connectAreasWithPaths(world); // See: ./path-connector.ts
  
  console.log('World generation complete!');
}

// Note: The helper functions areaToWorldPos, isPositionInArea, isInAnyDefinedArea 
// have been moved to world-utils.ts and are imported where needed (e.g., isInAnyDefinedArea above).
// See: ./world-utils.ts
