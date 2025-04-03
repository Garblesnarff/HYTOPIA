/**
 * Area Terrain Generator - Populates defined areas with terrain features.
 * 
 * This file provides a function to randomly place features like hills, valleys,
 * and water bodies within a specified rectangular area of the world.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - ./terrain-features.ts (createHill, createValley, createWaterBody)
 * - ../constants/world-config (WORLD_HEIGHT, TERRAIN_CONFIG) - TERRAIN_CONFIG needed indirectly by features
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3Like, World } from 'hytopia';
import { createHill, createValley, createWaterBody } from './terrain-features';
import { WORLD_HEIGHT, TERRAIN_CONFIG } from '../constants/world-config'; // Import necessary constants

// ====================================
// Area Terrain Generation
// ====================================

/**
 * Configuration options for terrain features to be generated in an area.
 */
interface AreaFeatureConfig {
  hills?: number;
  valleys?: number;
  waterBodies?: number;
  // Future features can be added here (e.g., forests, caves)
}

/**
 * Creates terrain features (hills, valleys, water bodies) randomly within a specified area.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} areaStart - The starting corner {x, y, z} of the area. Y is ignored, uses WORLD_HEIGHT.BASE.
 * @param {number} areaWidth - Width of the area along the X-axis.
 * @param {number} areaDepth - Depth of the area along the Z-axis.
 * @param {AreaFeatureConfig} [features={}] - An object specifying the number of each feature type to create. Defaults to zero for all.
 */
export function createAreaTerrain(
  world: World,
  areaStart: Vector3Like, // Note: areaStart.y is effectively ignored, features use WORLD_HEIGHT.BASE
  areaWidth: number,
  areaDepth: number,
  features: AreaFeatureConfig = {}
): void {
  // Destructure feature counts with default values of 0
  const { hills = 0, valleys = 0, waterBodies = 0 } = features;

  // Helper function to get a random position within the specified area bounds
  const getRandomPosInArea = (): Vector3Like => {
    const randomX = areaStart.x + Math.floor(Math.random() * areaWidth);
    const randomZ = areaStart.z + Math.floor(Math.random() * areaDepth);
    // Features generally operate relative to the base world height
    return { x: randomX, y: WORLD_HEIGHT.BASE, z: randomZ };
  };

  // Create Hills
  for (let i = 0; i < hills; i++) {
    try {
      // Define random parameters for each hill
      const radius = 5 + Math.floor(Math.random() * 10); // Random radius between 5 and 14
      const height = 3 + Math.floor(Math.random() * (TERRAIN_CONFIG.HILL_HEIGHT - 2)); // Random height between 3 and max configured height
      createHill(world, getRandomPosInArea(), radius, height);
    } catch (error) {
        console.warn(`Error creating hill ${i + 1}/${hills} in area starting at ${JSON.stringify(areaStart)}:`, error);
    }
  }

  // Create Valleys
  for (let i = 0; i < valleys; i++) {
     try {
        // Define random parameters for each valley
        const radius = 4 + Math.floor(Math.random() * 8); // Random radius between 4 and 11
        const depth = 2 + Math.floor(Math.random() * 4); // Random depth between 2 and 5
        createValley(world, getRandomPosInArea(), radius, depth);
     } catch (error) {
        console.warn(`Error creating valley ${i + 1}/${valleys} in area starting at ${JSON.stringify(areaStart)}:`, error);
     }
  }

  // Create Water Bodies
  for (let i = 0; i < waterBodies; i++) {
    try {
        // Define random parameters for each water body
        const radius = 6 + Math.floor(Math.random() * 10); // Random radius between 6 and 15
        const depth = 3 + Math.floor(Math.random() * 4); // Random depth between 3 and 6
        createWaterBody(world, getRandomPosInArea(), radius, depth);
    } catch (error) {
        console.warn(`Error creating water body ${i + 1}/${waterBodies} in area starting at ${JSON.stringify(areaStart)}:`, error);
    }
  }
  
  console.log(`Generated terrain features in area: ${hills} hills, ${valleys} valleys, ${waterBodies} water bodies.`);
}
