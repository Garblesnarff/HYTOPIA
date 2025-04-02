/**
 * Village - Central village area with buildings and plaza
 * 
 * This file contains functions to build the central village area
 * in the CyberCrawler game.
 * 
 * @author CyberCrawler Team
 */

import { Vector3, Vector3Like, World } from 'hytopia';

// Constants
import { BLOCK_TYPES } from '../../constants/block-types';
import { WORLD_AREAS, WORLD_ORIGIN, WORLD_HEIGHT } from '../../constants/world-config';

// Utilities
import { 
  placeBlock, 
  placeCuboid, 
  placeFloor, 
  placeHollowBox, 
  placeXWall, 
  placeZWall,
  placeTree
} from '../../utils/block-placer';
import { createPath } from '../terrain';
import { findGroundHeight } from '../../utils/terrain-utils';

// ====================================
// Main generation function
// ====================================

/**
 * Builds the village center area
 * 
 * @param {World} world - The game world
 */
export function buildVillage(world: World): void {
  console.log('Building village center area...');
  
  // Get the area dimensions
  const area = WORLD_AREAS.VILLAGE_CENTER;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
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

// ====================================
// Helper functions
// ====================================

/**
 * Builds the main village plaza
 * 
 * @param {World} world - The game world
 */
function buildPlaza(world: World): void {
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

/**
 * Builds various buildings around the village plaza
 * 
 * @param {World} world - The game world
 */
function buildVillageBuildings(world: World): void {
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
    if (i % 3 === 0) {
      buildSmallShop(world, { x: posX, y: WORLD_HEIGHT.BASE, z: posZ });
    } else if (i % 3 === 1) {
      buildVillageHouse(world, { x: posX, y: WORLD_HEIGHT.BASE, z: posZ });
    } else {
      buildTallBuilding(world, { x: posX, y: WORLD_HEIGHT.BASE, z: posZ });
    }
  }
}

/**
 * Builds a small shop building
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Center position for the building
 */
function buildSmallShop(world: World, position: Vector3Like): void {
  // Building dimensions
  const width = 8;
  const depth = 10;
  const height = 4;
  
  // Calculate starting corner
  const startX = position.x - Math.floor(width / 2);
  const startZ = position.z - Math.floor(depth / 2);
  const groundY = findGroundHeight(world, startX, startZ); // Check one corner
  const buildingStartY = groundY + 1; // Place building starting 1 block above ground

  // Build the main structure
  placeHollowBox(
    world,
    { x: startX, y: buildingStartY, z: startZ }, // Use buildingStartY
    width,
    height,
    depth,
    BLOCK_TYPES.CLAY
  );
  
  // Wooden floor
  placeFloor(
    world,
    { x: startX + 1, y: buildingStartY, z: startZ + 1 }, // Use buildingStartY
    width - 2,
    depth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Add a door
  placeBlock(
    world,
    { x: startX + Math.floor(width / 2), y: buildingStartY + 1, z: startZ }, // Use buildingStartY
    BLOCK_TYPES.AIR
  );

  placeBlock(
    world,
    { x: startX + Math.floor(width / 2), y: buildingStartY + 2, z: startZ }, // Use buildingStartY
    BLOCK_TYPES.AIR
  );
  
  // Add windows
  for (let x = 2; x < width - 2; x += 2) {
    addWindow(world, { x: startX + x, y: buildingStartY + 2, z: startZ }); // Use buildingStartY
  }

  // Add a simple awning over the entrance
  for (let x = -2; x <= 2; x++) {
    placeBlock(
      world,
      { x: startX + Math.floor(width / 2) + x, y: buildingStartY + 3, z: startZ - 1 }, // Use buildingStartY
      BLOCK_TYPES.WOOD_PLANKS
    );
  }
  
  // Add a shop counter inside
  placeCuboid(
    world,
    { x: startX + 2, y: buildingStartY + 1, z: startZ + depth - 3 }, // Use buildingStartY
    { width: width - 4, height: 1, depth: 1 },
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Add a flat roof
  placeFloor(
    world,
    { x: startX, y: buildingStartY + height, z: startZ }, // Use buildingStartY
    width,
    depth,
    BLOCK_TYPES.STONE_BRICK
  );
}

/**
 * Builds a standard village house
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Center position for the building
 */
function buildVillageHouse(world: World, position: Vector3Like): void {
  // Building dimensions
  const width = 9;
  const depth = 7;
  const height = 5;
  
  // Calculate starting corner
  const startX = position.x - Math.floor(width / 2);
  const startZ = position.z - Math.floor(depth / 2);
  const groundY = findGroundHeight(world, startX, startZ); // Check one corner
  const buildingStartY = groundY + 1; // Place building starting 1 block above ground

  // Build the main structure
  placeHollowBox(
    world,
    { x: startX, y: buildingStartY, z: startZ }, // Use buildingStartY
    width,
    height,
    depth,
    BLOCK_TYPES.BRICK
  );
  
  // Wooden floor
  placeFloor(
    world,
    { x: startX + 1, y: buildingStartY, z: startZ + 1 }, // Use buildingStartY
    width - 2,
    depth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Add a door
  const doorX = startX + Math.floor(width / 2);
  const doorZ = startZ + depth; // Door on the side facing away from plaza

  placeBlock(world, { x: doorX, y: buildingStartY + 1, z: doorZ }, BLOCK_TYPES.AIR); // Use buildingStartY
  placeBlock(world, { x: doorX, y: buildingStartY + 2, z: doorZ }, BLOCK_TYPES.AIR); // Use buildingStartY

  // Add windows
  addWindow(world, { x: startX, y: buildingStartY + 2, z: startZ + Math.floor(depth / 2) }); // Use buildingStartY
  addWindow(world, { x: startX + width, y: buildingStartY + 2, z: startZ + Math.floor(depth / 2) }); // Use buildingStartY

  // Add sloped roof
  for (let y = 0; y < 3; y++) {
    for (let x = y; x < width - y; x++) {
      placeBlock(
        world,
        { x: startX + x, y: buildingStartY + height + y, z: startZ + Math.floor(depth / 2) }, // Use buildingStartY
        BLOCK_TYPES.WOOD_PLANKS
      );
    }
  }
}

/**
 * Builds a taller building (like a tower or important structure)
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Center position for the building
 */
function buildTallBuilding(world: World, position: Vector3Like): void {
  // Building dimensions
  const width = 7;
  const depth = 7;
  const height = 12;
  
  // Calculate starting corner
  const startX = position.x - Math.floor(width / 2);
  const startZ = position.z - Math.floor(depth / 2);
  const groundY = findGroundHeight(world, startX, startZ); // Check one corner
  const buildingStartY = groundY + 1; // Place building starting 1 block above ground

  // Build the main structure
  placeHollowBox(
    world,
    { x: startX, y: buildingStartY, z: startZ }, // Use buildingStartY
    width,
    height,
    depth,
    BLOCK_TYPES.STONE_BRICK
  );
  
  // Add floors every 4 blocks
  for (let floorLevel = 4; floorLevel < height; floorLevel += 4) {
    placeFloor(
      world,
      { x: startX + 1, y: buildingStartY + floorLevel, z: startZ + 1 }, // Use buildingStartY
      width - 2,
      depth - 2,
      BLOCK_TYPES.WOOD_PLANKS
    );
  }
  
  // Add a door
  placeBlock(
    world,
    { x: startX + Math.floor(width / 2), y: buildingStartY + 1, z: startZ }, // Use buildingStartY
    BLOCK_TYPES.AIR
  );
  placeBlock(
    world,
    { x: startX + Math.floor(width / 2), y: buildingStartY + 2, z: startZ }, // Use buildingStartY
    BLOCK_TYPES.AIR
  );
  
  // Add windows on each level
  for (let floorLevel = 2; floorLevel < height; floorLevel += 4) {
    // Windows on all four sides
    addWindow(world, { x: startX, y: buildingStartY + floorLevel, z: startZ + Math.floor(depth / 2) }); // Use buildingStartY
    addWindow(world, { x: startX + width, y: buildingStartY + floorLevel, z: startZ + Math.floor(depth / 2) }); // Use buildingStartY
    addWindow(world, { x: startX + Math.floor(width / 2), y: buildingStartY + floorLevel, z: startZ }); // Use buildingStartY
    addWindow(world, { x: startX + Math.floor(width / 2), y: buildingStartY + floorLevel, z: startZ + depth }); // Use buildingStartY
  }

  // Add a spire on top
  for (let y = 0; y < 4; y++) {
    placeBlock(
      world,
      { x: startX + Math.floor(width / 2), y: buildingStartY + height + y, z: startZ + Math.floor(depth / 2) }, // Use buildingStartY
      BLOCK_TYPES.LOG
    );
  }
}

/**
 * Adds a window at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Position for the window
 */
function addWindow(world: World, position: Vector3Like): void {
  // Create a 2x2 window
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      placeBlock(
        world, 
        { 
          x: position.x, 
          y: position.y + y, 
          z: position.z 
        }, 
        BLOCK_TYPES.GLASS
      );
    }
  }
}

/**
 * Builds paths connecting different parts of the village
 * 
 * @param {World} world - The game world
 */
function buildVillagePaths(world: World): void {
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

/**
 * Adds decorative elements to the village
 * 
 * @param {World} world - The game world
 */
function addVillageDecorations(world: World): void {
  const area = WORLD_AREAS.VILLAGE_CENTER;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Add trees and other decorations around the plaza
  const numDecorations = 15;
  
  for (let i = 0; i < numDecorations; i++) {
    // Random position within the area
    const posX = startX + Math.floor(Math.random() * area.width);
    const posZ = startZ + Math.floor(Math.random() * area.depth);
    const groundY = findGroundHeight(world, posX, posZ);

    // Skip if too close to the plaza center
    const centerX = startX + area.width / 2;
    const centerZ = startZ + area.depth / 2;
    const distFromCenter = Math.sqrt(Math.pow(posX - centerX, 2) + Math.pow(posZ - centerZ, 2));
    
    if (distFromCenter < 25) continue;
    
    // Place either a tree or a bench
    if (Math.random() < 0.7) {
      // Tree
      placeTree(
        world,
        { x: posX, y: groundY + 1, z: posZ }, // Use groundY + 1
        4, // Trunk height
        BLOCK_TYPES.LOG,
        BLOCK_TYPES.OAK_LEAVES
      );
    } else {
      // Bench
      buildBench(world, { x: posX, y: groundY, z: posZ }); // Use groundY
    }
  }
}

/**
 * Builds a simple bench decoration
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Position for the bench
 */
function buildBench(world: World, position: Vector3Like): void {
  // Bench dimensions
  const width = 3;
  
  // Bench seat
  placeCuboid(
    world,
    { x: position.x, y: position.y + 1, z: position.z },
    { width, height: 1, depth: 1 },
    BLOCK_TYPES.WOOD_PLANKS
  );
  
  // Bench legs
  placeBlock(world, { x: position.x, y: position.y, z: position.z }, BLOCK_TYPES.LOG);
  placeBlock(world, { x: position.x + width - 1, y: position.y, z: position.z }, BLOCK_TYPES.LOG);
}
