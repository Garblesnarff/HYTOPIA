/**
 * Block Placer - Utility functions for placing blocks in the world
 * 
 * This file provides helper functions to simplify common block placement operations
 * like placing cubes, floors, walls, and other structures.
 * 
 * @author CyberCrawler Team
 */

import { Vector3, Vector3Like, World } from 'hytopia';
import { BLOCK_TYPES } from '../constants/block-types'; // Corrected import path
// Import Block Health Manager
import { BlockHealthManager } from '../world/block-health-manager';

// ====================================
// Simple block placement
// ====================================

/**
 * Places a single block at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Position to place the block
 * @param {number} blockTypeId - The block type ID to place
 * @returns {boolean} Success of the operation
 */
export function placeBlock(
  world: World,
  position: Vector3Like,
  blockTypeId: number
): boolean {
  try {
    world.chunkLattice?.setBlock(position, blockTypeId);
    // Register the placed block with the health manager if it's not AIR
    if (blockTypeId !== BLOCK_TYPES.AIR) {
      BlockHealthManager.instance.registerBlock(position, blockTypeId);
    }
    return true;
  } catch (error) {
    console.error(`Failed to place block at ${JSON.stringify(position)}:`, error);
    return false;
  }
}

// ====================================
// Detailed Structure Placement
// ====================================

/**
 * Places a door with a frame. Assumes a 1-wide, 2-high opening.
 * Position is the block *on the floor* where the door opening will be.
 * Orientation determines which way the wall runs relative to the position.
 *
 * @param world The game world
 * @param position Position on the floor where the door opening is
 * @param orientation 'north'/'south' (wall runs E-W), 'east'/'west' (wall runs N-S)
 * @param frameBlockId Block ID for the door frame
 * @param doorBlockId Block ID for the door itself (often AIR)
 */
export function placeDetailedDoor(
  world: World,
  position: Vector3Like,
  orientation: 'north' | 'south' | 'east' | 'west',
  frameBlockId: number,
  doorBlockId: number = BLOCK_TYPES.AIR // Default to air
): void {
  const yBase = position.y + 1; // Door starts 1 block above the floor position

  // Define frame positions relative to the floor position
  let framePositions: Vector3Like[] = [];
  const doorPositions: Vector3Like[] = [
      { x: position.x, y: yBase, z: position.z },
      { x: position.x, y: yBase + 1, z: position.z },
  ];

  switch (orientation) {
    case 'north': // Wall is on South side (+Z)
    case 'south': // Wall is on North side (-Z)
      // Frame is vertical along X, horizontal top
      framePositions = [
        { x: position.x - 1, y: yBase, z: position.z },     // Left base
        { x: position.x - 1, y: yBase + 1, z: position.z }, // Left top
        { x: position.x + 1, y: yBase, z: position.z },     // Right base
        { x: position.x + 1, y: yBase + 1, z: position.z }, // Right top
        { x: position.x - 1, y: yBase + 2, z: position.z }, // Top Left
        { x: position.x,     y: yBase + 2, z: position.z }, // Top Middle
        { x: position.x + 1, y: yBase + 2, z: position.z }, // Top Right
      ];
      break;
    case 'east': // Wall is on West side (-X)
    case 'west': // Wall is on East side (+X)
      // Frame is vertical along Z, horizontal top
       framePositions = [
        { x: position.x, y: yBase, z: position.z - 1 },     // Left base
        { x: position.x, y: yBase + 1, z: position.z - 1 }, // Left top
        { x: position.x, y: yBase, z: position.z + 1 },     // Right base
        { x: position.x, y: yBase + 1, z: position.z + 1 }, // Right top
        { x: position.x, y: yBase + 2, z: position.z - 1 }, // Top Left
        { x: position.x, y: yBase + 2, z: position.z },     // Top Middle
        { x: position.x, y: yBase + 2, z: position.z + 1 }, // Top Right
      ];
      break;
  }

  // Place frame
  framePositions.forEach(pos => placeBlock(world, pos, frameBlockId));
  // Place door (air gaps)
  doorPositions.forEach(pos => placeBlock(world, pos, doorBlockId));
}


/**
 * Places a window with a frame.
 * Position is the bottom-left corner of the window opening *within the wall*.
 * Axis determines if the window is on a wall running along X or Z.
 *
 * @param world The game world
 * @param startPos Bottom-left corner position of the window opening
 * @param width Width of the window opening
 * @param height Height of the window opening
 * @param axis 'x' (wall runs along X, window faces +/- Z) or 'z' (wall runs along Z, window faces +/- X)
 * @param frameBlockId Block ID for the window frame
 * @param glassBlockId Block ID for the glass panes
 */
export function placeDetailedWindow(
  world: World,
  startPos: Vector3Like,
  width: number,
  height: number,
  axis: 'x' | 'z',
  frameBlockId: number,
  glassBlockId: number = BLOCK_TYPES.GLASS // Default to glass
): void {
  // Calculate the bounding box for frame + glass
  const frameStartX = startPos.x - 1;
  const frameStartY = startPos.y - 1;
  const frameStartZ = startPos.z - 1;
  // End is inclusive, so add +2 to cover frame on both sides
  const frameEndX = startPos.x + (axis === 'x' ? width : 0) + 1;
  const frameEndY = startPos.y + height + 1;
  const frameEndZ = startPos.z + (axis === 'z' ? width : 0) + 1; // Use width for Z axis length

  if (axis === 'x') {
      // Wall runs along X, window is in the Z plane at startPos.z
      for (let x = frameStartX; x <= frameEndX; x++) {
          for (let y = frameStartY; y <= frameEndY; y++) {
              const isFrame = x === frameStartX || x === frameEndX || y === frameStartY || y === frameEndY;
              placeBlock(
                  world,
                  { x: x, y: y, z: startPos.z }, // Window is at fixed Z
                  isFrame ? frameBlockId : glassBlockId
              );
          }
      }
  } else { // axis === 'z'
      // Wall runs along Z, window is in the X plane at startPos.x
      for (let z = frameStartZ; z <= frameEndZ; z++) {
          for (let y = frameStartY; y <= frameEndY; y++) {
              const isFrame = z === frameStartZ || z === frameEndZ || y === frameStartY || y === frameEndY;
              placeBlock(
                  world,
                  { x: startPos.x, y: y, z: z }, // Window is at fixed X
                  isFrame ? frameBlockId : glassBlockId
              );
          }
      }
  }
}


/**
 * Places a simple pitched (gable) roof.
 * Assumes the ridge runs along the Z-axis (slopes up from +/- X sides).
 * startPos is the corner block *at the top of the walls* where the roof begins.
 *
 * @param world The game world
 * @param startPos Bottom corner position where the roof structure starts (top of walls)
 * @param width Width of the area the roof covers (X-axis)
 * @param depth Depth of the area the roof covers (Z-axis)
 * @param roofMaterialId Block ID for the main roof material
 * @param eaveMaterialId Block ID for the eaves/edges (can be same as roofMaterialId)
 * @param gableMaterialId Block ID for filling the triangular gable ends
 * @param overhang Number of blocks the roof overhangs the walls
 */
export function placePitchedRoof(
  world: World,
  startPos: Vector3Like,
  width: number,
  depth: number,
  roofMaterialId: number,
  eaveMaterialId: number,
  gableMaterialId: number,
  overhang: number = 1 // Default overhang of 1 block
): void {
  const roofBaseY = startPos.y;
  const roofStartX = startPos.x - overhang;
  const roofStartZ = startPos.z - overhang;
  const roofWidth = width + overhang * 2;
  const roofDepth = depth + overhang * 2;
  const halfWidth = Math.ceil(roofWidth / 2); // Determines roof height relative to base

  // Build the sloping sides
  for (let yOffset = 0; yOffset < halfWidth; yOffset++) {
    const currentY = roofBaseY + yOffset;
    const currentXMin = roofStartX + yOffset;
    const currentXMax = roofStartX + roofWidth - 1 - yOffset;

    // Ensure min does not cross max for odd widths
    if (currentXMin > currentXMax) continue;

    for (let z = roofStartZ; z < roofStartZ + roofDepth; z++) {
      // Determine material based on position (eaves or main roof)
      const isEaveZ = z === roofStartZ || z === roofStartZ + roofDepth - 1;
      // Eaves along X are only the bottom-most layer of the overhang
      const isEaveX = yOffset === 0 && (currentXMin < startPos.x || currentXMax >= startPos.x + width);
      const useEaveMaterial = isEaveZ || isEaveX;
      const material = useEaveMaterial ? eaveMaterialId : roofMaterialId;

      // Place left slope block
      placeBlock(world, { x: currentXMin, y: currentY, z: z }, material);

      // Place right slope block (avoid double-placing the ridge)
      if (currentXMin !== currentXMax) {
        placeBlock(world, { x: currentXMax, y: currentY, z: z }, material);
      }
    }
  }

  // Fill the gable ends (triangular part under the roof slope)
  // Gable ends should align with the original wall positions, not the overhang start
  const gableYMax = roofBaseY + halfWidth - 1; // Top Y level of the gable fill
  for(let y = roofBaseY; y <= gableYMax; y++) {
      const yOffset = y - roofBaseY;
      // X range for this level of the gable fill (inside the eaves/slopes)
      // It starts one block in from the slope's edge at this height
      const fillXMin = roofStartX + yOffset + 1;
      const fillXMax = roofStartX + roofWidth - 1 - yOffset - 1;

      // Fill blocks between the slopes at the front and back Z faces of the *original* building footprint
      for (let x = fillXMin; x <= fillXMax; x++) {
          // Only fill if the x is within the original building width
          if (x >= startPos.x && x < startPos.x + width) {
              // Front gable end (min Z of original wall)
              placeBlock(world, { x: x, y: y, z: startPos.z }, gableMaterialId);
              // Back gable end (max Z of original wall)
              placeBlock(world, { x: x, y: y, z: startPos.z + depth - 1 }, gableMaterialId);
          }
      }
  }
}

// ====================================
// Compound block placement
// ====================================

/**
 * Places a cuboid (3D rectangle) of blocks
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting corner position
 * @param {Object} dimensions - Dimensions of the cuboid
 * @param {number} dimensions.width - Width (X-axis)
 * @param {number} dimensions.height - Height (Y-axis)
 * @param {number} dimensions.depth - Depth (Z-axis)
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeCuboid(
  world: World,
  startPos: Vector3Like,
  dimensions: { width: number; height: number; depth: number },
  blockTypeId: number
): boolean {
  try {
    for (let x = 0; x < dimensions.width; x++) {
      for (let y = 0; y < dimensions.height; y++) {
        for (let z = 0; z < dimensions.depth; z++) {
          world.chunkLattice?.setBlock({
            x: startPos.x + x,
            y: startPos.y + y,
            z: startPos.z + z
          }, blockTypeId);
        }
      }
    }
    return true;
  } catch (error) {
    console.error(`Failed to place cuboid at ${JSON.stringify(startPos)}:`, error);
    return false;
  }
}

/**
 * Places a floor (2D rectangle) of blocks
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting corner position
 * @param {number} width - Width (X-axis)
 * @param {number} depth - Depth (Z-axis)
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeFloor(
  world: World,
  startPos: Vector3Like,
  width: number,
  depth: number,
  blockTypeId: number
): boolean {
  return placeCuboid(world, startPos, { width, height: 1, depth }, blockTypeId);
}

/**
 * Places a wall along the X-axis
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting position of the wall
 * @param {number} length - Length of the wall
 * @param {number} height - Height of the wall
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeXWall(
  world: World,
  startPos: Vector3Like,
  length: number,
  height: number,
  blockTypeId: number
): boolean {
  return placeCuboid(world, startPos, { width: length, height, depth: 1 }, blockTypeId);
}

/**
 * Places a wall along the Z-axis
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting position of the wall
 * @param {number} length - Length of the wall
 * @param {number} height - Height of the wall
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeZWall(
  world: World,
  startPos: Vector3Like,
  length: number,
  height: number,
  blockTypeId: number
): boolean {
  return placeCuboid(world, startPos, { width: 1, height, depth: length }, blockTypeId);
}

/**
 * Places a hollow box (walls, floor, ceiling)
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} startPos - Starting corner position
 * @param {number} width - Width (X-axis)
 * @param {number} height - Height (Y-axis)
 * @param {number} depth - Depth (Z-axis)
 * @param {number} blockTypeId - The block type ID to use
 * @returns {boolean} Success of the operation
 */
export function placeHollowBox(
  world: World,
  startPos: Vector3Like,
  width: number,
  height: number,
  depth: number,
  blockTypeId: number
): boolean {
  try {
    // Place the floor
    placeFloor(world, startPos, width, depth, blockTypeId);
    
    // Place the ceiling
    placeFloor(
      world, 
      { x: startPos.x, y: startPos.y + height - 1, z: startPos.z },
      width,
      depth,
      blockTypeId
    );
    
    // Place walls along X-axis
    placeXWall(world, startPos, width, height, blockTypeId);
    placeXWall(
      world,
      { x: startPos.x, y: startPos.y, z: startPos.z + depth - 1 },
      width,
      height,
      blockTypeId
    );
    
    // Place walls along Z-axis
    placeZWall(world, startPos, depth, height, blockTypeId);
    placeZWall(
      world,
      { x: startPos.x + width - 1, y: startPos.y, z: startPos.z },
      depth,
      height,
      blockTypeId
    );
    
    return true;
  } catch (error) {
    console.error(`Failed to place hollow box at ${JSON.stringify(startPos)}:`, error);
    return false;
  }
}

// ====================================
// Structure placement
// ====================================

/**
 * Places a simple tree at the specified position
 * 
 * @param {World} world - The game world
 * @param {Vector3Like} position - Base position for the tree
 * @param {number} trunkHeight - Height of the trunk
 * @param {number} trunkBlockId - Block type for the trunk
 * @param {number} leavesBlockId - Block type for the leaves
 * @returns {boolean} Success of the operation
 */
export function placeTree(
  world: World,
  position: Vector3Like,
  trunkHeight: number = 4,
  trunkBlockId: number,
  leavesBlockId: number
): boolean {
  try {
    // Place trunk
    for (let y = 0; y < trunkHeight; y++) {
      placeBlock(
        world,
        { x: position.x, y: position.y + y, z: position.z },
        trunkBlockId
      );
    }
    
    // Place leaves
    const leafStartY = position.y + trunkHeight - 2;
    for (let y = 0; y < 4; y++) {
      const radius = y < 2 ? 2 : 1;
      
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          // Skip corners for a more rounded shape
          if (x*x + z*z > radius*radius + 1) continue;
          
          placeBlock(
            world,
            { x: position.x + x, y: leafStartY + y, z: position.z + z },
            leavesBlockId
          );
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to place tree at ${JSON.stringify(position)}:`, error);
    return false;
  }
}
