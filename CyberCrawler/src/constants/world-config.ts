/**
 * World Config - Configuration settings for the CyberCrawler world
 * 
 * This file defines the size, scale, and other settings for the game world.
 * 
 * @author CyberCrawler Team
 */

// ====================================
// World dimensions
// ====================================

/**
 * World size in blocks
 */
export const WORLD_SIZE = {
  WIDTH: 500,   // 500 blocks (east-west)
  DEPTH: 500    // 500 blocks (north-south)
};

/**
 * Height limits for the world
 */
export const WORLD_HEIGHT = {
  MIN: -10,      // Minimum height (below base terrain)
  MAX: 100,     // Maximum build height
  BASE: 0       // Base terrain level
};

/**
 * Starting position for world generation
 */
export const WORLD_ORIGIN = {
  X: -250,      // Center the world around 0,0
  Y: WORLD_HEIGHT.BASE,
  Z: -250
};

// ====================================
// Area definitions
// ====================================

/**
 * Areas of the world, defined as rectangular regions
 */
export const WORLD_AREAS = {
  VILLAGE_CENTER: {
    name: "Village Center",
    startX: -50,
    startZ: -50,
    width: 100,
    depth: 100
  },
  
  PLAYER_HOUSE: {
    name: "Player House",
    startX: 100,
    startZ: -80,
    width: 50,
    depth: 50
  },
  
  MARKET_DISTRICT: {
    name: "Market District",
    startX: -120,
    startZ: 50,
    width: 80,
    depth: 60
  },
  
  TECH_DISTRICT: {
    name: "Tech District",
    startX: 40,
    startZ: 70,
    width: 70,
    depth: 70
  },
  
  WILDERNESS: {
    name: "Wilderness",
    startX: 150,
    startZ: 150,
    width: 100,
    depth: 100
  },
  
  DUNGEON_ENTRANCE: {
    name: "Dungeon Entrance",
    startX: -150,
    startZ: 150,
    width: 40,
    depth: 40
  }
};

// ====================================
// Terrain configuration
// ====================================

/**
 * Base terrain configuration
 */
export const TERRAIN_CONFIG = {
  HILL_HEIGHT: 5,      // Maximum height of hills above base terrain
  WATER_LEVEL: -2,     // Water appears below this height (relative to BASE)
  BEACH_LEVEL: -1      // Sand/beaches appear at this height (relative to BASE)
};

// ====================================
// Game mechanics
// ====================================

/**
 * Player-related constants
 */
export const PLAYER_CONFIG = {
  SPAWN_POSITION: {
    X: WORLD_AREAS.PLAYER_HOUSE.startX + 25,
    Y: WORLD_HEIGHT.BASE + 1,
    Z: WORLD_AREAS.PLAYER_HOUSE.startZ + 25
  }
};
