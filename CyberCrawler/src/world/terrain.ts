/**
 * Terrain - Terrain generation and modification utilities
 * 
 * This file provides functions for creating and modifying the world's terrain,
 * including hills, valleys, rivers, and other geographic features.
 * 
 * @author CyberCrawler Team
 */

import { Vector3, Vector3Like, World } from 'hytopia';
import { BLOCK_TYPES } from '../constants/block-types';
import { WORLD_HEIGHT, TERRAIN_CONFIG, WORLD_AREAS } from '../constants/world-config'; // Added WORLD_AREAS if needed, though not used here
import { placeBlock } from '../utils/block-placer';
import { findGroundHeight } from '../utils/terrain-utils'; // Import findGroundHeight

// ====================================
// Terrain features
// ====================================

/**
 * Creates a hill centered at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} centerPos - Center position of the hill
 * @param {number} radius - Radius of the hill base
 * @param {number} height - Maximum height of the hill
 * @returns {boolean} Success of the operation
 */
export function createHill(
  world: World,
  centerPos: Vector3Like,
  radius: number,
  height: number
): boolean {
  try {
    // Calculate the hill shape using a simple distance function
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        // Calculate distance from center (circular base)
        const distSq = x*x + z*z;
        
        // Skip if outside the radius
        if (distSq > radius*radius) continue;
        
        // Calculate height at this point (higher in the middle, lower at edges)
        // Using a simple parabolic function
        const distFactor = 1 - Math.sqrt(distSq) / radius;
        const hillHeight = Math.floor(height * distFactor);
        
        // Place blocks up to the calculated height
        const worldX = centerPos.x + x;
        const worldZ = centerPos.z + z;
        
        // Start from the base terrain level
        const startY = WORLD_HEIGHT.BASE;
        
        for (let y = 0; y <= hillHeight; y++) {
          // Top layer is grass, rest is dirt
          const blockType = y === hillHeight ? BLOCK_TYPES.GRASS : BLOCK_TYPES.DIRT;
          
          placeBlock(world, { x: worldX, y: startY + y, z: worldZ }, blockType);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to create hill at ${JSON.stringify(centerPos)}:`, error);
    return false;
  }
}

/**
 * Creates a valley/depression centered at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} centerPos - Center position of the valley
 * @param {number} radius - Radius of the valley
 * @param {number} depth - Maximum depth of the valley
 * @returns {boolean} Success of the operation
 */
export function createValley(
  world: World,
  centerPos: Vector3Like,
  radius: number,
  depth: number
): boolean {
  try {
    // Calculate the valley shape using a simple distance function
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        // Calculate distance from center (circular base)
        const distSq = x*x + z*z;
        
        // Skip if outside the radius
        if (distSq > radius*radius) continue;
        
        // Calculate depth at this point (deeper in the middle, shallow at edges)
        // Using a simple parabolic function
        const distFactor = 1 - Math.sqrt(distSq) / radius;
        const valleyDepth = Math.floor(depth * distFactor);
        
        // Clear blocks down to the calculated depth
        const worldX = centerPos.x + x;
        const worldZ = centerPos.z + z;
        
        // Start from the base terrain level
        const startY = WORLD_HEIGHT.BASE;
        
        // Replace blocks with appropriate type based on depth
        for (let y = startY; y > startY - valleyDepth; y--) {
          let blockType = BLOCK_TYPES.AIR;
          
          // If this is below water level, use water blocks
          if (y <= TERRAIN_CONFIG.WATER_LEVEL) {
            blockType = BLOCK_TYPES.WATER;
          }
          
          placeBlock(world, { x: worldX, y, z: worldZ }, blockType);
        }
        
        // Set the bottom of the valley
        const bottomY = startY - valleyDepth;
        
        // Use sand for shallow areas, gravel for deeper
        const bottomBlockType = valleyDepth <= 2 ? BLOCK_TYPES.SAND : BLOCK_TYPES.GRAVEL;
        placeBlock(world, { x: worldX, y: bottomY, z: worldZ }, bottomBlockType);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to create valley at ${JSON.stringify(centerPos)}:`, error);
    return false;
  }
}

/**
 * Creates a water body (lake, pond) centered at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} centerPos - Center position of the water body
 * @param {number} radius - Radius of the water body
 * @param {number} depth - Maximum depth of the water body
 * @returns {boolean} Success of the operation
 */
export function createWaterBody(
  world: World,
  centerPos: Vector3Like,
  radius: number,
  depth: number
): boolean {
  try {
    // Create a valley first
    createValley(world, centerPos, radius, depth);
    
    // Fill it with water
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        // Calculate distance from center (circular shape)
        const distSq = x*x + z*z;
        
        // Skip if outside the radius
        if (distSq > radius*radius) continue;
        
        const worldX = centerPos.x + x;
        const worldZ = centerPos.z + z;
        
        // Calculate depth at this point (deeper in the middle)
        const distFactor = 1 - Math.sqrt(distSq) / radius;
        const waterDepth = Math.floor(depth * distFactor);
        
        // Fill with water up to the water level
        for (let y = WORLD_HEIGHT.BASE - waterDepth; y <= TERRAIN_CONFIG.WATER_LEVEL; y++) {
          placeBlock(world, { x: worldX, y, z: worldZ }, BLOCK_TYPES.WATER);
        }
        
        // Create a small beach around the water body
        if (distSq > Math.pow(radius - 2, 2) && distSq <= radius*radius) {
          placeBlock(
            world, 
            { x: worldX, y: WORLD_HEIGHT.BASE, z: worldZ }, 
            BLOCK_TYPES.SAND
          );
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to create water body at ${JSON.stringify(centerPos)}:`, error);
    return false;
  }
}

/**
 * Creates a simple path between two points
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting position of the path
 * @param {Vector3Like} endPos - Ending position of the path
 * @param {number} width - Width of the path
 * @param {number} blockTypeId - The block type ID to use for the path
 * @returns {boolean} Success of the operation
 */
export function createPath(
  world: World,
  startPos: Vector3Like,
  endPos: Vector3Like,
  width: number = 2,
  blockTypeId: number = BLOCK_TYPES.STONE
): boolean {
  try {
    // Calculate direction vector
    const dx = endPos.x - startPos.x;
    const dz = endPos.z - startPos.z;
    const length = Math.sqrt(dx*dx + dz*dz);
    
    // Normalize direction
    const dirX = dx / length;
    const dirZ = dz / length;
    
    // Calculate perpendicular vector for width
    const perpX = -dirZ;
    const perpZ = dirX;
    
    // Generate path points
    const halfWidth = Math.floor(width / 2);
    
    for (let step = 0; step <= length; step++) {
      const x = Math.round(startPos.x + dirX * step);
      const z = Math.round(startPos.z + dirZ * step);
      
      // Place path blocks in a line perpendicular to the path direction
      for (let w = -halfWidth; w <= halfWidth; w++) {
        const wx = Math.round(x + perpX * w);
        const wz = Math.round(z + perpZ * w);

        // Find the ground level using the new utility function
        const groundY = findGroundHeight(world, wx, wz);
        
        // Check if the space directly above the path location is empty
        const spaceAboveId = world.chunkLattice.getBlockId({ x: wx, y: groundY + 1, z: wz });
        
        // Only place the path block if the space above is AIR (to avoid undercutting buildings)
        if (spaceAboveId === BLOCK_TYPES.AIR) {
          // Place path block AT ground level, replacing the existing block
          placeBlock(world, { x: wx, y: groundY, z: wz }, blockTypeId);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to create path from ${JSON.stringify(startPos)} to ${JSON.stringify(endPos)}:`, error);
    return false;
  }
}

/**
 * Creates terrain features within a specified area of the world
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} areaStart - Starting corner of the area
 * @param {number} areaWidth - Width of the area
 * @param {number} areaDepth - Depth of the area
 * @param {Object} features - Feature configuration
 * @param {number} features.hills - Number of hills to create
 * @param {number} features.valleys - Number of valleys to create
 * @param {number} features.waterBodies - Number of water bodies to create
 */
export function createAreaTerrain(
  world: World,
  areaStart: Vector3Like,
  areaWidth: number,
  areaDepth: number,
  features: {
    hills?: number;
    valleys?: number;
    waterBodies?: number;
  } = {}
): void {
  const { hills = 0, valleys = 0, waterBodies = 0 } = features;
  
  // Helper function to get a random position within the area
  const getRandomPos = () => {
    return {
      x: areaStart.x + Math.floor(Math.random() * areaWidth),
      y: WORLD_HEIGHT.BASE,
      z: areaStart.z + Math.floor(Math.random() * areaDepth)
    };
  };
  
  // Create hills
  for (let i = 0; i < hills; i++) {
    const radius = 5 + Math.floor(Math.random() * 10); // 5-15
    const height = 3 + Math.floor(Math.random() * (TERRAIN_CONFIG.HILL_HEIGHT - 2)); // 3 to HILL_HEIGHT
    createHill(world, getRandomPos(), radius, height);
  }
  
  // Create valleys
  for (let i = 0; i < valleys; i++) {
    const radius = 4 + Math.floor(Math.random() * 8); // 4-12
    const depth = 2 + Math.floor(Math.random() * 4); // 2-6
    createValley(world, getRandomPos(), radius, depth);
  }
  
  // Create water bodies
  for (let i = 0; i < waterBodies; i++) {
    const radius = 6 + Math.floor(Math.random() * 10); // 6-16
    const depth = 3 + Math.floor(Math.random() * 4); // 3-7
    createWaterBody(world, getRandomPos(), radius, depth);
  }
}
