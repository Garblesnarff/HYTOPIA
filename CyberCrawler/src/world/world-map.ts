/**
 * World Map - Main world map definition and initialization
 * 
 * This file orchestrates the creation of the CyberCrawler world map,
 * including terrain, structures, and different areas.
 * 
 * @author CyberCrawler Team
 */

import { Vector3, Vector3Like, World, BlockType } from 'hytopia';

// Constants
import { BLOCK_TYPES } from '../constants/block-types';
import { WORLD_SIZE, WORLD_HEIGHT, WORLD_ORIGIN, WORLD_AREAS, TERRAIN_CONFIG } from '../constants/world-config';

// Utilities
import { placeBlock, placeCuboid, placeFloor } from '../utils/block-placer';
import { createHill, createValley, createWaterBody, createPath, createAreaTerrain } from './terrain';

// Areas
import { buildPlayerHouse } from './areas/player-house';
import { buildVillage } from './areas/village';

// ====================================
// World generation entry point
// ====================================

/**
 * Generates the complete world map
 * 
 * @param {World} world - The Hytopia world instance
 */
export function generateWorldMap(world: World): void {
  console.log('Starting world generation...');
  
  // Register all block types before using them
  registerBlockTypes(world);
  
  // Create the base terrain
  generateBaseTerrain(world);
  
  // Add terrain features
  generateTerrainFeatures(world);
  
  // Build specific areas
  buildVillage(world);
  buildPlayerHouse(world);
  // TODO: Implement and call other area builders
  
  // Connect areas with paths
  connectAreasWithPaths(world);
  
  console.log('World generation complete!');
}

/**
 * Registers all block types needed for world generation
 * 
 * @param {World} world - The Hytopia world instance
 */
function registerBlockTypes(world: World): void {
  console.log('Registering block types...');
  
  // Block definitions with textures
  const blockDefinitions = [
    { id: 1, name: "bricks", textureUri: "blocks/bricks.png" },
    { id: 2, name: "clay", textureUri: "blocks/clay.png" },
    { id: 3, name: "diamond-ore", textureUri: "blocks/diamond-ore.png" },
    { id: 4, name: "dirt", textureUri: "blocks/dirt.png" },
    { id: 5, name: "dragons-stone", textureUri: "blocks/dragons-stone.png" },
    { id: 6, name: "glass", textureUri: "blocks/glass.png" },
    { id: 7, name: "grass", textureUri: "blocks/grass" },
    { id: 8, name: "gravel", textureUri: "blocks/gravel.png" },
    { id: 9, name: "ice", textureUri: "blocks/ice.png" },
    { id: 10, name: "infected-shadowrock", textureUri: "blocks/infected-shadowrock.png" },
    { id: 11, name: "log-side", textureUri: "blocks/log" },
    { id: 12, name: "log-top", textureUri: "blocks/log" },
    { id: 13, name: "mossy-coblestone", textureUri: "blocks/mossy-coblestone.png" },
    { id: 14, name: "nuit", textureUri: "blocks/nuit.png" },
    { id: 15, name: "oak-leaves", textureUri: "blocks/oak-leaves.png" },
    { id: 16, name: "oak-planks", textureUri: "blocks/oak-planks.png" },
    { id: 17, name: "sand", textureUri: "blocks/sand.png" },
    { id: 18, name: "shadowrock", textureUri: "blocks/shadowrock.png" },
    { id: 19, name: "stone", textureUri: "blocks/stone.png" },
    { id: 20, name: "stone-bricks", textureUri: "blocks/stone-bricks.png" },
    { id: 21, name: "void-sand", textureUri: "blocks/void-sand.png" },
    { id: 22, name: "water-still", textureUri: "blocks/water-still.png", isLiquid: true }
  ];
  
  // Register each block type
  for (const blockDef of blockDefinitions) {
    try {
      world.blockTypeRegistry.registerGenericBlockType({
        id: blockDef.id,
        name: blockDef.name,
        textureUri: blockDef.textureUri,
        isLiquid: blockDef.isLiquid || false
      });
      console.log(`Registered block type: ${blockDef.name} (ID: ${blockDef.id})`);
    } catch (error) {
      console.warn(`Failed to register block type: ${blockDef.name}`, error);
    }
  }
  
  console.log('Block type registration complete!');
}

/**
 * Creates the base terrain for the world
 * 
 * @param {World} world - The Hytopia world instance
 */
function generateBaseTerrain(world: World): void {
  console.log('Generating base terrain...');
  
  // Create a flat base layer at y=0
  for (let x = 0; x < WORLD_SIZE.WIDTH; x++) {
    for (let z = 0; z < WORLD_SIZE.DEPTH; z++) {
      const worldX = WORLD_ORIGIN.X + x;
      const worldZ = WORLD_ORIGIN.Z + z;
      
      // Place dirt below the surface (for digging/foundations)
      for (let y = WORLD_HEIGHT.MIN; y < WORLD_HEIGHT.BASE; y++) {
        placeBlock(world, { x: worldX, y, z: worldZ }, BLOCK_TYPES.DIRT);
      }
      
      // Place grass at the surface
      placeBlock(
        world,
        { x: worldX, y: WORLD_HEIGHT.BASE, z: worldZ },
        BLOCK_TYPES.GRASS
      );
    }
  }
  
  console.log('Base terrain generation complete!');
}

/**
 * Adds terrain features to the world
 * 
 * @param {World} world - The Hytopia world instance
 */
function generateTerrainFeatures(world: World): void {
  console.log('Adding terrain features...');
  
  // Add terrain features to the wilderness area
  const wildernessArea = WORLD_AREAS.WILDERNESS;
  createAreaTerrain(
    world,
    { 
      x: WORLD_ORIGIN.X + wildernessArea.startX, 
      y: WORLD_HEIGHT.BASE,
      z: WORLD_ORIGIN.Z + wildernessArea.startZ 
    },
    wildernessArea.width,
    wildernessArea.depth,
    {
      hills: 8,
      valleys: 3,
      waterBodies: 2
    }
  );
  
  // Add a large water body near the tech district
  const techArea = WORLD_AREAS.TECH_DISTRICT;
  createWaterBody(
    world,
    {
      x: WORLD_ORIGIN.X + techArea.startX - 20,
      y: WORLD_HEIGHT.BASE,
      z: WORLD_ORIGIN.Z + techArea.startZ + techArea.depth + 20
    },
    25, // Radius
    5   // Depth
  );
  
  // Add some random hills throughout the world
  for (let i = 0; i < 15; i++) {
    const randomX = WORLD_ORIGIN.X + Math.floor(Math.random() * WORLD_SIZE.WIDTH);
    const randomZ = WORLD_ORIGIN.Z + Math.floor(Math.random() * WORLD_SIZE.DEPTH);
    
    // Skip if inside a defined area (we'll handle those separately)
    if (isInAnyDefinedArea({ x: randomX, y: 0, z: randomZ })) continue;
    
    const hillRadius = 5 + Math.floor(Math.random() * 15); // 5-20 radius
    const hillHeight = 2 + Math.floor(Math.random() * 4); // 2-5 height
    
    createHill(
      world,
      { x: randomX, y: WORLD_HEIGHT.BASE, z: randomZ },
      hillRadius,
      hillHeight
    );
  }
  
  console.log('Terrain features complete!');
}

/**
 * Connects different areas with paths
 * 
 * @param {World} world - The Hytopia world instance
 */
function connectAreasWithPaths(world: World): void {
  console.log('Creating connecting paths...');
  
  // Connect village center to player house
  const villageArea = WORLD_AREAS.VILLAGE_CENTER;
  const playerHouseArea = WORLD_AREAS.PLAYER_HOUSE;
  
  const villageCenterX = WORLD_ORIGIN.X + villageArea.startX + villageArea.width / 2;
  const villageCenterZ = WORLD_ORIGIN.Z + villageArea.startZ + villageArea.depth / 2;
  
  const playerHouseCenterX = WORLD_ORIGIN.X + playerHouseArea.startX + playerHouseArea.width / 2;
  const playerHouseCenterZ = WORLD_ORIGIN.Z + playerHouseArea.startZ + playerHouseArea.depth / 2;
  
  createPath(
    world,
    { x: villageCenterX, y: WORLD_HEIGHT.BASE + 1, z: villageCenterZ },
    { x: playerHouseCenterX, y: WORLD_HEIGHT.BASE + 1, z: playerHouseCenterZ },
    4, // Width
    BLOCK_TYPES.STONE_BRICK
  );
  
  // TODO: Connect other areas with paths
  
  console.log('Connecting paths complete!');
}

// ====================================
// Helper functions
// ====================================

/**
 * Converts a local area position to world coordinates
 * 
 * @param {string} areaName - Name of the area (from WORLD_AREAS)
 * @param {number} localX - X coordinate relative to area start
 * @param {number} localZ - Z coordinate relative to area start
 * @returns {Vector3} World coordinates
 */
export function areaToWorldPos(
  areaName: string,
  localX: number,
  localY: number = 0,
  localZ: number
): Vector3 {
  const area = WORLD_AREAS[areaName as keyof typeof WORLD_AREAS];
  
  if (!area) {
    throw new Error(`Unknown area: ${areaName}`);
  }
  
  return new Vector3(
    WORLD_ORIGIN.X + area.startX + localX,
    WORLD_HEIGHT.BASE + localY,
    WORLD_ORIGIN.Z + area.startZ + localZ
  );
}

/**
 * Checks if a world position is within a defined area
 * 
 * @param {Vector3Like} position - World position to check
 * @param {string} areaName - Name of the area (from WORLD_AREAS)
 * @returns {boolean} True if position is within the area
 */
export function isPositionInArea(
  position: Vector3Like,
  areaName: string
): boolean {
  const area = WORLD_AREAS[areaName as keyof typeof WORLD_AREAS];
  
  if (!area) {
    throw new Error(`Unknown area: ${areaName}`);
  }
  
  const relativeX = position.x - WORLD_ORIGIN.X;
  const relativeZ = position.z - WORLD_ORIGIN.Z;
  
  return (
    relativeX >= area.startX &&
    relativeX < area.startX + area.width &&
    relativeZ >= area.startZ &&
    relativeZ < area.startZ + area.depth
  );
}

/**
 * Checks if a world position is within any defined area
 * 
 * @param {Vector3Like} position - World position to check
 * @returns {boolean} True if position is within any defined area
 */
function isInAnyDefinedArea(position: Vector3Like): boolean {
  for (const areaKey in WORLD_AREAS) {
    if (isPositionInArea(position, areaKey)) {
      return true;
    }
  }
  
  return false;
}
