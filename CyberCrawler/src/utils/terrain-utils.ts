import { World, Vector3Like } from 'hytopia';
import { BLOCK_TYPES } from '../constants/block-types';
import { WORLD_HEIGHT } from '../constants/world-config';

/**
 * Finds the Y coordinate of the highest solid block at a given X, Z position.
 * Scans downwards from a maximum potential height.
 * 
 * @param world The Hytopia world instance.
 * @param x The world X coordinate.
 * @param z The world Z coordinate.
 * @param startScanY The Y coordinate to start scanning downwards from. Defaults to slightly above max hill height.
 * @param minScanY The minimum Y coordinate to scan down to. Defaults to below base terrain.
 * @returns The Y coordinate of the highest solid (non-air, non-water) block found, or WORLD_HEIGHT.BASE if none found in range.
 */
export function findGroundHeight(
    world: World,
    x: number,
    z: number,
    startScanY: number = WORLD_HEIGHT.BASE + 15, // Start high enough for hills
    minScanY: number = WORLD_HEIGHT.MIN        // Scan down to world minimum
): number {
    if (!world.chunkLattice) {
        console.warn(`ChunkLattice not available for ground check at ${x}, ${z}`);
        return WORLD_HEIGHT.BASE; // Return default base height if lattice unavailable
    }

    for (let y = startScanY; y >= minScanY; y--) {
        try {
            const blockTypeId = world.chunkLattice.getBlockType({ x, y, z });

            // Check if the block is solid (not null, not Air, and not Water)
            // Cast BLOCK_TYPES to 'any' to bypass strict type comparison if BlockType is a specific type/enum
            if (blockTypeId != null && blockTypeId !== (BLOCK_TYPES.AIR as any) && blockTypeId !== (BLOCK_TYPES.WATER as any)) {
                return y; // Found the ground
            }
        } catch (error) {
            // Likely trying to access an unloaded chunk, treat as no ground found in this scan direction
            // Continue scanning down. If we reach minScanY, default base height will be returned.
        }
    }

    // If no solid block found in the scan range, default to base height
    console.warn(`No ground found at ${x}, ${z} within scan range. Defaulting to Y=${WORLD_HEIGHT.BASE}`);
    return WORLD_HEIGHT.BASE;
}
