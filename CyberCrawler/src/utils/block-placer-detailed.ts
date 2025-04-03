/**
 * Block Placer - Detailed - Utility functions for placing detailed architectural elements.
 * 
 * This file provides functions for creating more intricate structures like doors with frames,
 * windows with frames, and pitched roofs with eaves and gables.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - ./block-placer-basic.ts (placeBlock)
 * - ../constants/block-types (BLOCK_TYPES)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { Vector3Like, World } from 'hytopia';
import { placeBlock } from './block-placer-basic';
import { BLOCK_TYPES } from '../constants/block-types';

// ====================================
// Detailed Door Placement Helpers
// ====================================

/**
 * Calculates the positions for the frame and the door opening based on orientation.
 * 
 * @param {Vector3Like} floorPos - Position on the floor where the door opening center is.
 * @param {number} yBase - The base Y level for the door structure (usually floorPos.y + 1).
 * @param {'north' | 'south' | 'east' | 'west'} orientation - Direction the door faces or wall runs.
 * @returns {{ framePositions: Vector3Like[], doorPositions: Vector3Like[] }} Object containing arrays of positions.
 */
function getDoorComponentPositions(
  floorPos: Vector3Like,
  yBase: number,
  orientation: 'north' | 'south' | 'east' | 'west'
): { framePositions: Vector3Like[]; doorPositions: Vector3Like[] } {
  let framePositions: Vector3Like[] = [];
  const doorPositions: Vector3Like[] = [
    { x: floorPos.x, y: yBase, z: floorPos.z },     // Bottom part of door opening
    { x: floorPos.x, y: yBase + 1, z: floorPos.z }, // Top part of door opening
  ];

  // Calculate frame positions based on orientation
  switch (orientation) {
    case 'north': // Wall runs E-W on South side (+Z)
    case 'south': // Wall runs E-W on North side (-Z)
      framePositions = [
        // Vertical sides
        { x: floorPos.x - 1, y: yBase, z: floorPos.z }, { x: floorPos.x - 1, y: yBase + 1, z: floorPos.z },
        { x: floorPos.x + 1, y: yBase, z: floorPos.z }, { x: floorPos.x + 1, y: yBase + 1, z: floorPos.z },
        // Top frame
        { x: floorPos.x - 1, y: yBase + 2, z: floorPos.z }, { x: floorPos.x, y: yBase + 2, z: floorPos.z }, { x: floorPos.x + 1, y: yBase + 2, z: floorPos.z },
      ];
      break;
    case 'east': // Wall runs N-S on West side (-X)
    case 'west': // Wall runs N-S on East side (+X)
      framePositions = [
        // Vertical sides
        { x: floorPos.x, y: yBase, z: floorPos.z - 1 }, { x: floorPos.x, y: yBase + 1, z: floorPos.z - 1 },
        { x: floorPos.x, y: yBase, z: floorPos.z + 1 }, { x: floorPos.x, y: yBase + 1, z: floorPos.z + 1 },
        // Top frame
        { x: floorPos.x, y: yBase + 2, z: floorPos.z - 1 }, { x: floorPos.x, y: yBase + 2, z: floorPos.z }, { x: floorPos.x, y: yBase + 2, z: floorPos.z + 1 },
      ];
      break;
  }
  return { framePositions, doorPositions };
}

// ====================================
// Detailed Door Placement Main Function
// ====================================

/**
 * Places a door with a frame (1-wide, 2-high opening).
 * Position is the block *on the floor* where the door opening will be centered.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} position - Position on the floor for the door opening center.
 * @param {'north' | 'south' | 'east' | 'west'} orientation - Orientation of the wall/door.
 * @param {number} frameBlockId - Block ID for the door frame.
 * @param {number} [doorBlockId=BLOCK_TYPES.AIR] - Block ID for the door itself (defaults to AIR).
 */
export function placeDetailedDoor(
  world: World,
  position: Vector3Like,
  orientation: 'north' | 'south' | 'east' | 'west',
  frameBlockId: number,
  doorBlockId: number = BLOCK_TYPES.AIR // Default to air
): void {
  const yBase = position.y + 1; // Door structure starts 1 block above the floor position

  // Get positions for frame and door opening
  const { framePositions, doorPositions } = getDoorComponentPositions(position, yBase, orientation);

  // Place frame blocks
  framePositions.forEach(pos => placeBlock(world, pos, frameBlockId));
  
  // Place door blocks (often AIR to create the opening)
  doorPositions.forEach(pos => placeBlock(world, pos, doorBlockId));
}


// ====================================
// Detailed Window Placement Helpers
// ====================================

/**
 * Fills a plane (XZ or YZ) with frame and glass blocks for a window.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - Bottom-left corner position of the window opening.
 * @param {number} width - Width of the window opening.
 * @param {number} height - Height of the window opening.
 * @param {'x' | 'z'} axis - Axis along which the wall runs.
 * @param {number} frameBlockId - Block ID for the window frame.
 * @param {number} glassBlockId - Block ID for the glass panes.
 */
function fillWindowPlane(
    world: World,
    startPos: Vector3Like,
    width: number,
    height: number,
    axis: 'x' | 'z',
    frameBlockId: number,
    glassBlockId: number
): void {
    // Calculate the bounding box including the frame (1 block wider/taller on each side)
    const frameStartX = startPos.x - 1;
    const frameStartY = startPos.y - 1;
    const frameStartZ = startPos.z - 1;
    const frameEndX = startPos.x + (axis === 'x' ? width : 0) + 1; // Frame extends 1 past opening width if axis is x
    const frameEndY = startPos.y + height + 1; // Frame extends 1 past opening height
    const frameEndZ = startPos.z + (axis === 'z' ? width : 0) + 1; // Frame extends 1 past opening width if axis is z

    if (axis === 'x') {
        // Wall runs along X, window is in the YZ plane at startPos.z
        for (let x = frameStartX; x <= frameEndX; x++) {
            for (let y = frameStartY; y <= frameEndY; y++) {
                // Determine if the current position is part of the frame or the glass
                const isFrame = x === frameStartX || x === frameEndX || y === frameStartY || y === frameEndY;
                placeBlock(
                    world,
                    { x: x, y: y, z: startPos.z }, // Window is at a fixed Z
                    isFrame ? frameBlockId : glassBlockId
                );
            }
        }
    } else { // axis === 'z'
        // Wall runs along Z, window is in the XY plane at startPos.x
        for (let z = frameStartZ; z <= frameEndZ; z++) {
            for (let y = frameStartY; y <= frameEndY; y++) {
                // Determine if the current position is part of the frame or the glass
                const isFrame = z === frameStartZ || z === frameEndZ || y === frameStartY || y === frameEndY;
                placeBlock(
                    world,
                    { x: startPos.x, y: y, z: z }, // Window is at a fixed X
                    isFrame ? frameBlockId : glassBlockId
                );
            }
        }
    }
}


// ====================================
// Detailed Window Placement Main Function
// ====================================

/**
 * Places a window with a frame.
 * Position is the bottom-left corner of the window opening *within the wall*.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - Bottom-left corner position {x, y, z} of the window opening.
 * @param {number} width - Width of the window opening.
 * @param {number} height - Height of the window opening.
 * @param {'x' | 'z'} axis - 'x' (wall runs along X) or 'z' (wall runs along Z).
 * @param {number} frameBlockId - Block ID for the window frame.
 * @param {number} [glassBlockId=BLOCK_TYPES.GLASS] - Block ID for the glass panes (defaults to GLASS).
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
  // Delegate the actual block placement to the helper function
  fillWindowPlane(world, startPos, width, height, axis, frameBlockId, glassBlockId);
}


// ====================================
// Pitched Roof Placement Helpers
// ====================================

/**
 * Determines the correct block material for a roof segment based on its position.
 * Handles differentiation between the main roof material and eave material.
 * 
 * @param {number} x - Current X position.
 * @param {number} z - Current Z position.
 * @param {number} yOffset - Current height offset from the roof base.
 * @param {number} roofStartX - Starting X coordinate of the roof (including overhang).
 * @param {number} roofStartZ - Starting Z coordinate of the roof (including overhang).
 * @param {number} roofWidth - Total width of the roof (including overhang).
 * @param {number} roofDepth - Total depth of the roof (including overhang).
 * @param {Vector3Like} wallStartPos - Starting position of the walls beneath the roof.
 * @param {number} wallWidth - Width of the building walls.
 * @param {number} roofMaterialId - Block ID for the main roof material.
 * @param {number} eaveMaterialId - Block ID for the eaves/edges.
 * @returns {number} The block ID to use for this roof segment.
 */
function getRoofMaterial(
    x: number, z: number, yOffset: number,
    roofStartX: number, roofStartZ: number, roofWidth: number, roofDepth: number,
    wallStartPos: Vector3Like, wallWidth: number,
    roofMaterialId: number, eaveMaterialId: number
): number {
    // Check if the block is on the front or back edge (Z-axis eaves)
    const isEaveZ = z === roofStartZ || z === roofStartZ + roofDepth - 1;
    // Check if the block is on the side edges (X-axis eaves) AND on the lowest layer of the overhang
    const isEaveX = yOffset === 0 && (x < wallStartPos.x || x >= wallStartPos.x + wallWidth);
    
    // Use eave material if it's part of the Z-eaves or the bottom layer of the X-overhang
    return (isEaveZ || isEaveX) ? eaveMaterialId : roofMaterialId;
}

/**
 * Places the sloping sides of the pitched roof.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} wallStartPos - Starting position of the walls beneath the roof.
 * @param {number} wallWidth - Width of the building walls.
 * @param {number} roofBaseY - Base Y level where the roof structure starts.
 * @param {number} roofStartX - Starting X coordinate of the roof (including overhang).
 * @param {number} roofStartZ - Starting Z coordinate of the roof (including overhang).
 * @param {number} roofWidth - Total width of the roof (including overhang).
 * @param {number} roofDepth - Total depth of the roof (including overhang).
 * @param {number} halfRoofWidth - Half the roof width, determines slope height.
 * @param {number} roofMaterialId - Block ID for the main roof material.
 * @param {number} eaveMaterialId - Block ID for the eaves/edges.
 */
function placeRoofSlopes(
    world: World, wallStartPos: Vector3Like, wallWidth: number,
    roofBaseY: number, roofStartX: number, roofStartZ: number, roofWidth: number, roofDepth: number,
    halfRoofWidth: number, roofMaterialId: number, eaveMaterialId: number
): void {
    for (let yOffset = 0; yOffset < halfRoofWidth; yOffset++) {
        const currentY = roofBaseY + yOffset;
        // Calculate the X extent for this layer of the slope
        const currentXMin = roofStartX + yOffset;
        const currentXMax = roofStartX + roofWidth - 1 - yOffset;

        // Ensure min does not cross max (handles odd widths correctly)
        if (currentXMin > currentXMax) continue;

        // Iterate along the depth (Z-axis) for this layer
        for (let z = roofStartZ; z < roofStartZ + roofDepth; z++) {
            // Determine the material based on position (eaves or main roof)
            const material = getRoofMaterial(
                currentXMin, z, yOffset, roofStartX, roofStartZ, roofWidth, roofDepth,
                wallStartPos, wallWidth, roofMaterialId, eaveMaterialId
            );

            // Place left slope block
            placeBlock(world, { x: currentXMin, y: currentY, z: z }, material);

            // Place right slope block, avoiding double-placement at the ridge
            if (currentXMin !== currentXMax) {
                 const materialRight = getRoofMaterial(
                    currentXMax, z, yOffset, roofStartX, roofStartZ, roofWidth, roofDepth,
                    wallStartPos, wallWidth, roofMaterialId, eaveMaterialId
                );
                placeBlock(world, { x: currentXMax, y: currentY, z: z }, materialRight);
            }
        }
    }
}

/**
 * Fills the triangular gable ends under the roof slopes.
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} wallStartPos - Starting position of the walls beneath the roof.
 * @param {number} wallWidth - Width of the building walls.
 * @param {number} wallDepth - Depth of the building walls.
 * @param {number} roofBaseY - Base Y level where the roof structure starts.
 * @param {number} roofStartX - Starting X coordinate of the roof (including overhang).
 * @param {number} roofWidth - Total width of the roof (including overhang).
 * @param {number} halfRoofWidth - Half the roof width, determines gable height.
 * @param {number} gableMaterialId - Block ID for filling the gable ends.
 */
function fillGableEnds(
    world: World, wallStartPos: Vector3Like, wallWidth: number, wallDepth: number,
    roofBaseY: number, roofStartX: number, roofWidth: number, halfRoofWidth: number,
    gableMaterialId: number
): void {
    const gableYMax = roofBaseY + halfRoofWidth - 1; // Top Y level of the gable fill

    for (let y = roofBaseY; y <= gableYMax; y++) {
        const yOffset = y - roofBaseY;
        // X range for this level of the gable fill (inside the slopes)
        const fillXMin = roofStartX + yOffset + 1; // Start 1 block in from the slope edge
        const fillXMax = roofStartX + roofWidth - 1 - yOffset - 1; // End 1 block in from the slope edge

        // Fill blocks between the slopes, but only within the original wall footprint
        for (let x = fillXMin; x <= fillXMax; x++) {
            // Check if X is within the original building width
            if (x >= wallStartPos.x && x < wallStartPos.x + wallWidth) {
                // Place block at the front gable end (minimum Z of the wall)
                placeBlock(world, { x: x, y: y, z: wallStartPos.z }, gableMaterialId);
                // Place block at the back gable end (maximum Z of the wall)
                // Avoid double placement if depth is 1
                if (wallDepth > 1) {
                    placeBlock(world, { x: x, y: y, z: wallStartPos.z + wallDepth - 1 }, gableMaterialId);
                }
            }
        }
    }
}


// ====================================
// Pitched Roof Placement Main Function
// ====================================

/**
 * Places a simple pitched (gable) roof.
 * Assumes the ridge runs along the Z-axis (slopes up from +/- X sides).
 * 
 * @param {World} world - The game world instance.
 * @param {Vector3Like} startPos - Bottom corner position {x, y, z} where the roof structure starts (top of walls).
 * @param {number} width - Width of the area the roof covers (X-axis, wall dimension).
 * @param {number} depth - Depth of the area the roof covers (Z-axis, wall dimension).
 * @param {number} roofMaterialId - Block ID for the main roof material.
 * @param {number} eaveMaterialId - Block ID for the eaves/edges.
 * @param {number} gableMaterialId - Block ID for filling the triangular gable ends.
 * @param {number} [overhang=1] - Number of blocks the roof overhangs the walls. Defaults to 1.
 */
export function placePitchedRoof(
  world: World,
  startPos: Vector3Like, // This is the wall start position
  width: number,    // Wall width
  depth: number,    // Wall depth
  roofMaterialId: number,
  eaveMaterialId: number,
  gableMaterialId: number,
  overhang: number = 1 // Default overhang of 1 block
): void {
  // Calculate roof dimensions including overhang
  const roofBaseY = startPos.y; // Roof starts at the Y level of startPos
  const roofStartX = startPos.x - overhang;
  const roofStartZ = startPos.z - overhang;
  const roofWidth = width + overhang * 2;
  const roofDepth = depth + overhang * 2;
  const halfRoofWidth = Math.ceil(roofWidth / 2); // Determines roof height/slope

  // Place the sloping sides using a helper function
  placeRoofSlopes(
      world, startPos, width, roofBaseY, roofStartX, roofStartZ, roofWidth, roofDepth,
      halfRoofWidth, roofMaterialId, eaveMaterialId
  );

  // Fill the gable ends using a helper function
  fillGableEnds(
      world, startPos, width, depth, roofBaseY, roofStartX, roofWidth, halfRoofWidth,
      gableMaterialId
  );
}
