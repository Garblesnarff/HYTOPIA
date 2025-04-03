/**
 * Path Connector - Connects different defined areas within the world using paths.
 * 
 * This file provides functions to automatically generate paths between key locations
 * defined in the world configuration.
 * 
 * Dependencies:
 * - Hytopia SDK (World)
 * - ./terrain-path.ts (createPath)
 * - ../constants/block-types (BLOCK_TYPES)
 * - ../constants/world-config (WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { World } from 'hytopia';
import { createPath } from './terrain-path';
import { BLOCK_TYPES } from '../constants/block-types';
import { WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT } from '../constants/world-config';

// ====================================
// Path Connection Logic
// ====================================

/**
 * Connects different predefined areas (like village, player house) with paths.
 * Calculates center points of areas and uses createPath to draw connections.
 * 
 * @param {World} world - The Hytopia world instance.
 */
export function connectAreasWithPaths(world: World): void {
  console.log('Creating connecting paths...');
  
  try {
    // --- Connect Village Center to Player House ---
    const villageArea = WORLD_AREAS.VILLAGE_CENTER;
    const playerHouseArea = WORLD_AREAS.PLAYER_HOUSE;

    // Check if areas exist before attempting to connect
    if (!villageArea || !playerHouseArea) {
        console.warn("Cannot connect Village Center and Player House: One or both areas not defined in WORLD_AREAS.");
    } else {
        // Calculate center points (using integer division for potentially odd dimensions)
        const villageCenterX = WORLD_ORIGIN.X + villageArea.startX + Math.floor(villageArea.width / 2);
        const villageCenterZ = WORLD_ORIGIN.Z + villageArea.startZ + Math.floor(villageArea.depth / 2);
        
        const playerHouseCenterX = WORLD_ORIGIN.X + playerHouseArea.startX + Math.floor(playerHouseArea.width / 2);
        const playerHouseCenterZ = WORLD_ORIGIN.Z + playerHouseArea.startZ + Math.floor(playerHouseArea.depth / 2);
        
        // Define path start and end points (Y level is just above base, createPath handles actual ground height)
        const pathStart = { x: villageCenterX, y: WORLD_HEIGHT.BASE + 1, z: villageCenterZ };
        const pathEnd = { x: playerHouseCenterX, y: WORLD_HEIGHT.BASE + 1, z: playerHouseCenterZ };

        console.log(`Creating path from Village Center (${villageCenterX}, ${villageCenterZ}) to Player House (${playerHouseCenterX}, ${playerHouseCenterZ})`);
        createPath(
            world,
            pathStart,
            pathEnd,
            4, // Path width
            BLOCK_TYPES.STONE_BRICK // Path material
        );
    }

    // --- TODO: Connect other areas ---
    // Example: Connect Village Center to Tech District (if defined)
    /*
    const techArea = WORLD_AREAS.TECH_DISTRICT;
    if (villageArea && techArea) {
        const techCenterX = WORLD_ORIGIN.X + techArea.startX + Math.floor(techArea.width / 2);
        const techCenterZ = WORLD_ORIGIN.Z + techArea.startZ + Math.floor(techArea.depth / 2);
        const pathStart = { x: villageCenterX, y: WORLD_HEIGHT.BASE + 1, z: villageCenterZ };
        const pathEnd = { x: techCenterX, y: WORLD_HEIGHT.BASE + 1, z: techCenterZ };
        console.log(`Creating path from Village Center to Tech District...`);
        createPath(world, pathStart, pathEnd, 5, BLOCK_TYPES.STONE); 
    } else {
        console.warn("Cannot connect Village Center and Tech District: One or both areas not defined.");
    }
    */
    
  } catch (error) {
      console.error("Error occurred during path connection:", error);
  } finally {
      console.log('Connecting paths process complete.');
  }
}
