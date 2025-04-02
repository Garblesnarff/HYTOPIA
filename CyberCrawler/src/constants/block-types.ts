/**
 * Block Types - Defines constants for block types used in CyberCrawler
 * 
 * This file provides a centralized definition of block type IDs with semantic names
 * to make the code more readable and maintainable.
 * 
 * @author CyberCrawler Team
 */

// ====================================
// Block type constants
// ====================================

/**
 * Mapping of semantic block names to their numeric IDs from the HYTOPIA engine
 */
export const BLOCK_TYPES = {
  // Basic types
  AIR: 0,
  
  // Terrain blocks
  GRASS: 7,
  DIRT: 4,
  STONE: 19,
  SAND: 17,
  GRAVEL: 8,
  
  // Building blocks
  BRICK: 1,
  CLAY: 2,
  STONE_BRICK: 20,
  WOOD_PLANKS: 16,
  LOG: 11,
  GLASS: 6,
  
  // Nature
  OAK_LEAVES: 15,
  
  // Special blocks
  DIAMOND_ORE: 3,
  ICE: 9,
  INFECTED_SHADOW: 10,
  
  // Liquids
  WATER: 22
};

/**
 * Metadata about block types, can be expanded with additional properties as needed
 */
export const BLOCK_PROPERTIES = {
  [BLOCK_TYPES.WATER]: {
    isLiquid: true,
    indestructible: true
  },
  
  [BLOCK_TYPES.DIAMOND_ORE]: {
    resource: true,
    resourceAmount: 3
  }
};

/**
 * Group blocks by their general usage category
 */
export const BLOCK_CATEGORIES = {
  TERRAIN: [
    BLOCK_TYPES.GRASS,
    BLOCK_TYPES.DIRT,
    BLOCK_TYPES.STONE,
    BLOCK_TYPES.SAND,
    BLOCK_TYPES.GRAVEL
  ],
  
  BUILDING: [
    BLOCK_TYPES.BRICK,
    BLOCK_TYPES.CLAY,
    BLOCK_TYPES.STONE_BRICK,
    BLOCK_TYPES.WOOD_PLANKS,
    BLOCK_TYPES.LOG,
    BLOCK_TYPES.GLASS
  ],
  
  DECORATION: [
    BLOCK_TYPES.OAK_LEAVES,
    BLOCK_TYPES.ICE,
    BLOCK_TYPES.INFECTED_SHADOW
  ],
  
  RESOURCE: [
    BLOCK_TYPES.DIAMOND_ORE
  ]
};
