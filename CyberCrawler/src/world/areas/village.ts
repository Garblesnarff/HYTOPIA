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
  placeTree,
  placeDetailedDoor,    // Added import
  placeDetailedWindow,  // Added import
  placePitchedRoof      // Added import
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
  const buildingStartY = groundY; // Place walls starting AT ground level

  // Build the main structure
  placeHollowBox(
    world,
    { x: startX, y: buildingStartY, z: startZ }, // Use buildingStartY
    width,
    height,
    depth,
    BLOCK_TYPES.CLAY
  );
  
  // Wooden floor - Place explicitly at groundY
  placeFloor(
    world,
    { x: startX + 1, y: groundY, z: startZ + 1 }, // Use groundY for floor level
    width - 2,
    depth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );

  // Add a detailed door (door faces -Z, wall runs E-W, orientation 'south')
  placeDetailedDoor(
    world,
    { x: startX + Math.floor(width / 2), y: groundY, z: startZ }, // Position is floor block *under* opening (at groundY)
    'south', // Wall runs E-W, door faces -Z
    BLOCK_TYPES.LOG // Frame material
  );

  // Add detailed windows (2x2 size) on the front wall (fixed Z)
  // Bottom of window opening starts at buildingStartY + 1 = groundY + 2
  placeDetailedWindow(
    world,
    { x: startX + 2, y: buildingStartY + 1, z: startZ }, // Bottom-left of opening (Y = groundY + 2)
    2, // Width
    2, // Height
    'x', // Wall runs along X axis
    BLOCK_TYPES.LOG, // Frame material
    BLOCK_TYPES.GLASS // Glass material
  );
  placeDetailedWindow(
    world,
    { x: startX + width - 4, y: buildingStartY + 1, z: startZ }, // Bottom-left of opening (Y = groundY + 2)
    2, // Width
    2, // Height
    'x', // Wall runs along X axis
    BLOCK_TYPES.LOG, // Frame material
    BLOCK_TYPES.GLASS // Glass material
  );

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

  // Add a pitched roof instead of flat
  placePitchedRoof(
    world,
    { x: startX, y: buildingStartY + height, z: startZ }, // Start at top of walls
    width,
    depth,
    BLOCK_TYPES.WOOD_PLANKS, // Roof material
    BLOCK_TYPES.STONE_BRICK, // Eave material
    BLOCK_TYPES.CLAY, // Gable material (match walls)
    1 // Overhang
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
  const buildingStartY = groundY; // Place walls starting AT ground level

  // Build the main structure
  placeHollowBox(
    world,
    { x: startX, y: buildingStartY, z: startZ }, // Use buildingStartY
    width,
    height,
    depth,
    BLOCK_TYPES.BRICK
  );
  
  // Wooden floor - Place explicitly at groundY
  placeFloor(
    world,
    { x: startX + 1, y: groundY, z: startZ + 1 }, // Use groundY for floor level
    width - 2,
    depth - 2,
    BLOCK_TYPES.WOOD_PLANKS
  );

  // Add a detailed door (door faces +Z, wall runs E-W, orientation 'north')
  const doorX = startX + Math.floor(width / 2);
  const doorZ = startZ + depth - 1; // Wall is at max Z, opening is at max Z
  placeDetailedDoor(
    world,
    { x: doorX, y: groundY, z: doorZ }, // Position is floor block *under* opening (at groundY)
    'north', // Wall runs E-W, door faces +Z
    BLOCK_TYPES.LOG // Frame material
  );

  // Add detailed windows (2x2 size) on side walls (fixed X)
  // Bottom of window opening starts at buildingStartY + 1 = groundY + 2
  // West wall window
  placeDetailedWindow(
    world,
    { x: startX, y: buildingStartY + 1, z: startZ + Math.floor(depth / 2) -1 }, // Bottom-left of opening (Y = groundY + 2)
    2, // Width (along Z)
    2, // Height
    'z', // Wall runs along Z axis
    BLOCK_TYPES.LOG, // Frame material
    BLOCK_TYPES.GLASS // Glass material
  );
  // East wall window
  placeDetailedWindow(
    world,
    { x: startX + width - 1, y: buildingStartY + 1, z: startZ + Math.floor(depth / 2) -1 }, // Bottom-left of opening (Y = groundY + 2)
    2, // Width (along Z)
    2, // Height
    'z', // Wall runs along Z axis
    BLOCK_TYPES.LOG, // Frame material
    BLOCK_TYPES.GLASS // Glass material
  );

  // Add pitched roof
  placePitchedRoof(
    world,
    { x: startX, y: buildingStartY + height, z: startZ }, // Start at top of walls
    width,
    depth,
    BLOCK_TYPES.WOOD_PLANKS, // Roof material
    BLOCK_TYPES.STONE_BRICK, // Eave material
    BLOCK_TYPES.BRICK, // Gable material (match walls)
    1 // Overhang
  );
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
  const buildingStartY = groundY; // Place walls starting AT ground level

  // Build the main structure
  placeHollowBox(
    world,
    { x: startX, y: buildingStartY, z: startZ }, // Use buildingStartY
    width,
    height,
    depth,
    BLOCK_TYPES.STONE_BRICK
  );
  
  // Add floors every 4 blocks - Keep relative to buildingStartY
  for (let floorLevel = 4; floorLevel < height; floorLevel += 4) {
    placeFloor(
      world,
      { x: startX + 1, y: buildingStartY + floorLevel, z: startZ + 1 }, // Y is relative to wall base
      width - 2,
      depth - 2,
      BLOCK_TYPES.WOOD_PLANKS
    );
  }

  // Add a detailed door (door faces -Z, wall runs E-W, orientation 'south')
  placeDetailedDoor(
    world,
    { x: startX + Math.floor(width / 2), y: groundY, z: startZ }, // Position is floor block *under* opening (at groundY)
    'south', // Wall runs E-W, door faces -Z
    BLOCK_TYPES.LOG // Frame material
  );

  // Add detailed windows on each level
  for (let floorLevel = 1; floorLevel < height; floorLevel += 4) {
    // Bottom of window opening starts at buildingStartY + floorLevel = groundY + 1 + floorLevel
    const windowBottomY = buildingStartY + floorLevel;
    // Windows on all four sides (2x2 size)
    // West wall (-X side)
    placeDetailedWindow(
      world,
      { x: startX, y: windowBottomY, z: startZ + Math.floor(depth / 2) - 1 }, // Bottom-left of opening
      2, // Width (along Z)
      2, // Height
      'z', // Wall runs along Z axis
      BLOCK_TYPES.LOG, // Frame material
      BLOCK_TYPES.GLASS // Glass material
    );
    // East wall (+X side)
    placeDetailedWindow(
      world,
      { x: startX + width - 1, y: windowBottomY, z: startZ + Math.floor(depth / 2) - 1 }, // Bottom-left of opening
      2, // Width (along Z)
      2, // Height
      'z', // Wall runs along Z axis
      BLOCK_TYPES.LOG, // Frame material
      BLOCK_TYPES.GLASS // Glass material
    );
    // North wall (-Z side)
    placeDetailedWindow(
      world,
      { x: startX + Math.floor(width / 2) - 1, y: windowBottomY, z: startZ }, // Bottom-left of opening
      2, // Width (along X)
      2, // Height
      'x', // Wall runs along X axis
      BLOCK_TYPES.LOG, // Frame material
      BLOCK_TYPES.GLASS // Glass material
    );
    // South wall (+Z side)
    placeDetailedWindow(
      world,
      { x: startX + Math.floor(width / 2) - 1, y: windowBottomY, z: startZ + depth - 1 }, // Bottom-left of opening
      2, // Width (along X)
      2, // Height
      'x', // Wall runs along X axis
      BLOCK_TYPES.LOG, // Frame material
      BLOCK_TYPES.GLASS // Glass material
    );
  }

  // Add a flat roof (parapet style)
  placeFloor(
    world,
    { x: startX - 1, y: buildingStartY + height, z: startZ - 1 }, // Start 1 block out
    width + 2, // Extend 1 block out
    depth + 2, // Extend 1 block out
    BLOCK_TYPES.STONE_BRICK // Material for parapet base
  );
  // Add inner floor part of roof
  placeFloor(
    world,
    { x: startX, y: buildingStartY + height, z: startZ },
    width,
    depth,
    BLOCK_TYPES.STONE_BRICK // Material for inner roof
  );
  // Add parapet wall on top of the extended roof base
  placeHollowBox(
    world,
    { x: startX - 1, y: buildingStartY + height + 1, z: startZ - 1 },
    width + 2,
    1, // Height of parapet wall
    depth + 2,
    BLOCK_TYPES.STONE_BRICK // Material for parapet wall
  );
}

// Removed the old addWindow function

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
    
    // Check if the ground is suitable for a tree and the space above is clear
    const groundBlockId = world.chunkLattice.getBlockId({ x: posX, y: groundY, z: posZ });
    const spaceAboveId = world.chunkLattice.getBlockId({ x: posX, y: groundY + 1, z: posZ });

    const isSuitableGround = groundBlockId === BLOCK_TYPES.GRASS || groundBlockId === BLOCK_TYPES.DIRT;
    const isSpaceClear = spaceAboveId === BLOCK_TYPES.AIR;

    // Place either a tree or a bench
    if (Math.random() < 0.7 && isSuitableGround && isSpaceClear) {
      // Tree
      placeTree(
        world,
        { x: posX, y: groundY + 1, z: posZ }, // Start tree one block above ground
        4, // Trunk height
        BLOCK_TYPES.LOG,
        BLOCK_TYPES.OAK_LEAVES
      );
    } else if (isSuitableGround) { // Only place bench on suitable ground too
      // Bench
      buildBench(world, { x: posX, y: groundY, z: posZ }); // Place bench on the ground
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
