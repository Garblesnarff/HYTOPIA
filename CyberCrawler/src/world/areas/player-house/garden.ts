/**
 * garden.ts - Generates the garden area for the player's property.
 * 
 * This file contains the function to place trees and a small flower patch
 * within the designated player house area. It includes checks for suitable
 * ground before placing elements.
 * 
 * Dependencies:
 * - Hytopia SDK (World)
 * - Project constants (BLOCK_TYPES, WORLD_AREAS, WORLD_ORIGIN)
 * - Project utilities (placeTree, placeBlock, findGroundHeight)
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Imports
// ====================================

// Hytopia SDK
import { World } from 'hytopia';

// Project Constants
import { BLOCK_TYPES } from '../../../constants/block-types';
import { WORLD_AREAS, WORLD_ORIGIN } from '../../../constants/world-config';

// Project Utilities
import { placeTree, placeBlock } from '../../../utils/block-placer';
import { findGroundHeight } from '../../../utils/terrain-utils';

// ====================================
// Public Functions
// ====================================

/**
 * Builds a garden area near the house, including trees and a flower patch.
 * Dynamically determines placement height based on terrain.
 * 
 * @param {World} world - The game world
 */
export function buildGarden(world: World): void {
  const area = WORLD_AREAS.PLAYER_HOUSE;
  const startX = WORLD_ORIGIN.X + area.startX;
  const startZ = WORLD_ORIGIN.Z + area.startZ;
  
  // Garden position base
  const gardenStartX = startX + 10;
  const gardenStartZ = startZ + 10;

  // Place a few trees, checking ground suitability
  // Tree 1
  const tree1X = gardenStartX + 5;
  const tree1Z = gardenStartZ + 5;
  const tree1GroundY = findGroundHeight(world, tree1X, tree1Z);
  const tree1GroundBlockId = world.chunkLattice.getBlockId({ x: tree1X, y: tree1GroundY, z: tree1Z });
  const tree1SpaceAboveId = world.chunkLattice.getBlockId({ x: tree1X, y: tree1GroundY + 1, z: tree1Z });

  if ((tree1GroundBlockId === BLOCK_TYPES.GRASS || tree1GroundBlockId === BLOCK_TYPES.DIRT) && tree1SpaceAboveId === BLOCK_TYPES.AIR) {
    placeTree(
      world,
      { x: tree1X, y: tree1GroundY + 1, z: tree1Z }, // Start tree one block above ground
      5, // Trunk height
      BLOCK_TYPES.LOG,
      BLOCK_TYPES.OAK_LEAVES
    );
  }

  // Tree 2
  const tree2X = gardenStartX + 15;
  const tree2Z = gardenStartZ + 8;
  const tree2GroundY = findGroundHeight(world, tree2X, tree2Z);
  const tree2GroundBlockId = world.chunkLattice.getBlockId({ x: tree2X, y: tree2GroundY, z: tree2Z });
  const tree2SpaceAboveId = world.chunkLattice.getBlockId({ x: tree2X, y: tree2GroundY + 1, z: tree2Z });

  if ((tree2GroundBlockId === BLOCK_TYPES.GRASS || tree2GroundBlockId === BLOCK_TYPES.DIRT) && tree2SpaceAboveId === BLOCK_TYPES.AIR) {
    placeTree(
      world,
      { x: tree2X, y: tree2GroundY + 1, z: tree2Z }, // Start tree one block above ground
      4, // Trunk height
      BLOCK_TYPES.LOG,
      BLOCK_TYPES.OAK_LEAVES
    );
  }
  
  // Small flower garden (checker pattern)
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      const checkX = gardenStartX + 25 + x;
      const checkZ = gardenStartZ + 5 + z;
      const checkGroundY = findGroundHeight(world, checkX, checkZ);

      // Alternate grass and stone for a checker pattern
      const blockType = (x + z) % 2 === 0
        ? BLOCK_TYPES.GRASS
        : BLOCK_TYPES.STONE;

      placeBlock(
        world,
        { x: checkX, y: checkGroundY, z: checkZ }, // Place on the found ground
        blockType
      );
    }
  }
}
