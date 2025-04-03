/**
 * World Initialization - Handles initial setup tasks for the world.
 * 
 * This file contains functions related to the initial configuration of the world,
 * such as registering block types.
 * 
 * Dependencies:
 * - Hytopia SDK (World, BlockType)
 * 
 * @author CyberCrawler Team (Refactored by Cline)
 */

import { World, BlockType } from 'hytopia';

// ====================================
// World Initialization Functions
// ====================================

/**
 * Registers all block types needed for world generation.
 * Iterates through a predefined list of block definitions and registers them
 * with the Hytopia world's block type registry.
 * 
 * @param {World} world - The Hytopia world instance.
 */
export function registerBlockTypes(world: World): void {
  console.log('Registering block types...');
  
  // Block definitions including name, ID, texture URI, and optional properties like isLiquid
  // TODO: Consider moving this definition array to a constants file (e.g., constants/block-definitions.ts)
  // TODO: Resolve potential duplicate ID for log blocks (ID 11 & 12)
  const blockDefinitions = [
    { id: 1, name: "bricks", textureUri: "blocks/bricks.png" },
    { id: 2, name: "clay", textureUri: "blocks/clay.png" },
    { id: 3, name: "diamond-ore", textureUri: "blocks/diamond-ore.png" },
    { id: 4, name: "dirt", textureUri: "blocks/dirt.png" },
    { id: 5, name: "dragons-stone", textureUri: "blocks/dragons-stone.png" },
    { id: 6, name: "glass", textureUri: "blocks/glass.png" },
    { id: 7, name: "grass", textureUri: "blocks/grass" }, // Note: Texture URI might need adjustment if it's a multi-face texture
    { id: 8, name: "gravel", textureUri: "blocks/gravel.png" },
    { id: 9, name: "ice", textureUri: "blocks/ice.png" },
    { id: 10, name: "infected-shadowrock", textureUri: "blocks/infected-shadowrock.png" },
    { id: 11, name: "log-side", textureUri: "blocks/log" }, // Assuming 'log' handles side/top textures
    // { id: 12, name: "log-top", textureUri: "blocks/log" }, // Commented out potential duplicate ID 
    { id: 13, name: "mossy-coblestone", textureUri: "blocks/mossy-coblestone.png" },
    { id: 14, name: "nuit", textureUri: "blocks/nuit.png" },
    { id: 15, name: "oak-leaves", textureUri: "blocks/oak-leaves.png" },
    { id: 16, name: "oak-planks", textureUri: "blocks/oak-planks.png" },
    { id: 17, name: "sand", textureUri: "blocks/sand.png" },
    { id: 18, name: "shadowrock", textureUri: "blocks/shadowrock.png" },
    { id: 19, name: "stone", textureUri: "blocks/stone.png" },
    { id: 20, name: "stone-bricks", textureUri: "blocks/stone-bricks.png" },
    { id: 21, name: "void-sand", textureUri: "blocks/void-sand.png" },
    { id: 22, name: "water-still", textureUri: "blocks/water-still.png", isLiquid: true }
    // Add other necessary block types here
  ];
  
  // Keep track of registered IDs to avoid duplicates if definitions are inconsistent
  const registeredIds = new Set<number>();

  // Register each block type defined above
  for (const blockDef of blockDefinitions) {
    // Skip if ID is already registered
    if (registeredIds.has(blockDef.id)) {
        console.warn(`Skipping registration for duplicate Block ID: ${blockDef.id} (${blockDef.name})`);
        continue;
    }

    try {
      // Use the generic block type registration method
      world.blockTypeRegistry.registerGenericBlockType({
        id: blockDef.id,
        name: blockDef.name,
        textureUri: blockDef.textureUri,
        isLiquid: blockDef.isLiquid || false // Default isLiquid to false if not specified
      });
      registeredIds.add(blockDef.id); // Mark ID as registered
      // console.log(`Registered block type: ${blockDef.name} (ID: ${blockDef.id})`); // Verbose logging
    } catch (error) {
      // Log a warning if registration fails for any reason
      console.warn(`Failed to register block type: ${blockDef.name} (ID: ${blockDef.id})`, error);
    }
  }
  
  console.log(`Block type registration complete. Registered ${registeredIds.size} unique types.`);
}
