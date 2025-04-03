/**
 * Block Placer - Structures - Utility functions for placing common structures like trees.
 * 
 * This file provides functions for generating simple environmental structures.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - ./block-placer-basic.ts (placeBlock)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3Like, World } from 'hytopia';
import { placeBlock } from './block-placer-basic'; // Import dependency

// ====================================
// Structure Placement Helpers
// ====================================

/**
 * Places the leaves for a tree structure.
 * Creates a roughly spherical shape centered above the trunk.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} leafCenterPos - The center position {x, y, z} for the leaf cluster.
 * @param {number} leavesBlockId - The block type ID for the leaves.
 */
function placeTreeLeaves(
  world: World,
  leafCenterPos: Vector3Like,
  leavesBlockId: number
): void {
  // Define leaf cluster shape (e.g., 2 layers, radius 2 then 1)
  const leafLayers = [
    { yOffset: 0, radius: 2 }, // Bottom layer
    { yOffset: 1, radius: 2 },
    { yOffset: 2, radius: 1 }, // Top layer
    { yOffset: 3, radius: 1 },
  ];

  for (const layer of leafLayers) {
    const currentY = leafCenterPos.y + layer.yOffset;
    const radius = layer.radius;

    // Place leaves in a square area, skipping corners for roundness
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        // Simple check to make it slightly more rounded (skip far corners)
        if (x * x + z * z > radius * radius + 1) continue; 

        placeBlock(
          world,
          { x: leafCenterPos.x + x, y: currentY, z: leafCenterPos.z + z },
          leavesBlockId
        );
      }
    }
  }
}

// ====================================
// Structure Placement Main Functions
// ====================================

/**
 * Places a simple tree structure at the specified position.
 * Consists of a vertical trunk and a cluster of leaves on top.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} basePos - The base position {x, y, z} on the ground where the tree trunk starts.
 * @param {number} [trunkHeight=4] - The height of the tree trunk. Defaults to 4.
 * @param {number} trunkBlockId - The block type ID for the trunk.
 * @param {number} leavesBlockId - The block type ID for the leaves.
 * @returns {boolean} True if the tree was placed successfully, false otherwise.
 */
export function placeTree(
  world: World,
  basePos: Vector3Like,
  trunkHeight: number = 4,
  trunkBlockId: number,
  leavesBlockId: number
): boolean {
  try {
    // Place trunk (vertical column)
    for (let y = 0; y < trunkHeight; y++) {
      placeBlock(
        world,
        { x: basePos.x, y: basePos.y + y, z: basePos.z },
        trunkBlockId
      );
    }
    
    // Calculate center position for leaves (slightly below the top of the trunk)
    const leafCenterY = basePos.y + trunkHeight - 2;
    const leafCenterPos = { x: basePos.x, y: leafCenterY, z: basePos.z };

    // Place leaves using the helper function
    placeTreeLeaves(world, leafCenterPos, leavesBlockId);
    
    return true;
  } catch (error) {
    // Log error if placement fails
    console.error(`Failed to place tree at ${JSON.stringify(basePos)}:`, error);
    return false;
  }
}
