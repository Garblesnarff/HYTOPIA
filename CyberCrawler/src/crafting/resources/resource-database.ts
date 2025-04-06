/**
 * CyberCrawler Resource Database
 * Defines all gatherable resources themed for a sci-fi cyberpunk world.
 * 
 * Dependencies:
 * - recipe-types.ts (BaseItem, Rarity)
 * 
 * Author: Cline (AI Assistant)
 */

import { BaseItem, Rarity } from '../recipes/recipe-types';

// ====================================
// Resource Definitions
// ====================================

/**
 * Represents a gatherable resource in the game world.
 * Extends BaseItem with optional model reference.
 */
export interface ResourceItem extends BaseItem {
  rarity: Rarity;
  modelReference?: string; // Path to 3D model if applicable
  category: ResourceCategory;
}

/**
 * Categories of gatherable resources.
 */
export enum ResourceCategory {
  Scrap = 'Scrap',
  Tech = 'Tech',
  Bio = 'Bio',
  Energy = 'Energy',
  Rare = 'Rare',
  Artifact = 'Artifact',
}

/**
 * Centralized resource definitions for CyberCrawler.
 */
const RESOURCE_DEFINITIONS: { [key: string]: ResourceItem } = {
  SCRAP_METAL: {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    description: 'Discarded metal parts scavenged from ruins and drones.',
    iconReference: 'assets/blocks/iron-ore.png',
    modelReference: undefined,
    rarity: Rarity.Common,
    category: ResourceCategory.Scrap,
  },
  TECH_COMPONENTS: {
    id: 'tech_components',
    name: 'Tech Components',
    description: 'Electronic parts salvaged from security systems and robots.',
    iconReference: 'assets/models/items/iron-ingot.gltf',
    modelReference: 'assets/models/items/iron-ingot.gltf',
    rarity: Rarity.Uncommon,
    category: ResourceCategory.Tech,
  },
  MUTATED_PLANTS: {
    id: 'mutated_plants',
    name: 'Mutated Plants',
    description: 'Bioluminescent flora altered by radiation and nanotech.',
    iconReference: 'assets/models/items/melon.gltf',
    modelReference: 'assets/models/items/melon.gltf',
    rarity: Rarity.Uncommon,
    category: ResourceCategory.Bio,
  },
  ENERGY_CELL: {
    id: 'energy_cell',
    name: 'Energy Cell',
    description: 'Portable power source used in advanced tech.',
    iconReference: 'assets/models/items/gold-ingot.gltf',
    modelReference: 'assets/models/items/gold-ingot.gltf',
    rarity: Rarity.Uncommon,
    category: ResourceCategory.Energy,
  },
  RARE_METALS: {
    id: 'rare_metals',
    name: 'Rare Metals',
    description: 'Valuable alloys found deep within the dungeon.',
    iconReference: 'assets/blocks/diamond-ore.png',
    modelReference: undefined,
    rarity: Rarity.Rare,
    category: ResourceCategory.Rare,
  },
  ANCIENT_ARTIFACT: {
    id: 'ancient_artifact',
    name: 'Ancient Artifact',
    description: 'Mysterious relics from a lost civilization, pulsing with unknown energy.',
    iconReference: 'assets/blocks/emerald-ore.png',
    modelReference: undefined,
    rarity: Rarity.Rare,
    category: ResourceCategory.Artifact,
  },
  NANOBOTS: {
    id: 'nanobots',
    name: 'Nanobots',
    description: 'Microscopic machines capable of repair and enhancement.',
    iconReference: 'assets/models/items/potion-water.gltf',
    modelReference: 'assets/models/items/potion-water.gltf',
    rarity: Rarity.Rare,
    category: ResourceCategory.Tech,
  },
};

/**
 * Retrieve a resource by its ID.
 * @param id Resource ID string
 * @returns ResourceItem or undefined
 */
export function getResourceById(id: string): ResourceItem | undefined {
  return Object.values(RESOURCE_DEFINITIONS).find((res) => res.id === id);
}

/**
 * List all resources.
 * @returns Array of ResourceItems
 */
export function getAllResources(): ResourceItem[] {
  return Object.values(RESOURCE_DEFINITIONS);
}

/**
 * List resources by category.
 * @param category ResourceCategory enum
 * @returns Array of ResourceItems
 */
export function getResourcesByCategory(category: ResourceCategory): ResourceItem[] {
  return Object.values(RESOURCE_DEFINITIONS).filter((res) => res.category === category);
}
