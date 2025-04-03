/**
 * decorations.ts - Adds decorative elements like trees and benches to the village.
 * 
 * This file contains functions to randomly place decorations around the village area,
 * avoiding the central plaza. It includes logic for placing trees and benches.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (BLOCK_TYPES, WORLD_AREAS, WORLD_ORIGIN)
 * - Project utilities (placeBlock, placeCuboid, placeTree, findGroundHeight)
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Imports
// ====================================

// Hytopia SDK
import { Vector3Like, World } from 'hytopia';

// Project Constants
import { BLOCK_TYPES } from '../../../constants/block-types';
import { WORLD_AREAS, WORLD_ORIGIN } from '../../../constants/world-config';

// Project Utilities
import { placeBlock, placeCuboid, placeTree } from '../../../utils/block-placer';
import { findGroundHeight } from '../../../utils/terrain-utils';

// ====================================
// Public Functions
// ====================================

/**
 * Adds decorative elements (trees, benches) randomly around the village area.
 * Checks for suitable ground and clear space before placing.
 * 
 * @param {World} world - The game world
 */
export function addVillageDecorations(world: World): void {
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
    
    // Check if the ground is suitable for a tree/bench and the space above is clear
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
