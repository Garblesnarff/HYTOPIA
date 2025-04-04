/**
 * Types definitions for the Crafting System
 */

/**
 * Represents a basic item structure used in inventory and results.
 * This should ideally mirror or be compatible with a global item definition.
 */
export interface BaseItem {
  id: string; // Unique identifier for the item type (e.g., 'stim_pack', 'metal_scraps')
  name: string; // Display name (e.g., "Stim Pack", "Metal Scraps")
  description?: string; // Optional flavor text or details
  iconReference?: string; // Path or ID for the item's icon
  // Add other common item properties if needed (e.g., stackable, maxStackSize)
}

/**
 * Represents a material required for a crafting recipe.
 */
export interface CraftingMaterial extends BaseItem {
  quantity: number; // Amount required for the recipe
  rarity: Rarity; // How common the material is
}

/**
 * Represents the output of a crafting recipe.
 */
export interface CraftingResult extends BaseItem {
  quantity: number; // Amount produced by the recipe
  // Stats relevant to the game (examples)
  damage?: number;
  duration?: number; // seconds
  healingAmount?: number;
  effectDescription?: string; // e.g., "+20% movement speed for 30 seconds"
}

/**
 * Represents a complete crafting recipe.
 */
export interface CraftingRecipe {
  id: string; // Unique identifier for the recipe (e.g., 'craft_stim_pack')
  name: string; // Display name (e.g., "Craft Stim Pack")
  description: string; // Description of the recipe or the item it creates
  materials: CraftingMaterial[]; // Array of required materials
  result: CraftingResult; // The item produced
  craftingTime: number; // Time in seconds required to craft
  difficulty: Difficulty; // Difficulty level of the recipe
  category: RecipeCategory; // Category the recipe belongs to
  // Optional: Add fields like requiredWorkbenchId, unlockedByDefault, etc. later
}

/**
 * Defines the rarity levels for materials.
 */
export enum Rarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Epic = 'Epic', // Added for potential future use
}

/**
 * Defines the difficulty levels for recipes.
 */
export enum Difficulty {
  Trivial = 'Trivial', // Added for very simple recipes
  Easy = 'Easy',
  Moderate = 'Moderate',
  Complex = 'Complex',
  Master = 'Master', // Added for potential future use
}

/**
 * Defines the categories for crafting recipes.
 */
export enum RecipeCategory {
  Consumables = 'Consumables',
  Weapons = 'Weapons',
  Ammo = 'Ammo', // Added separate category
  Armor = 'Armor', // Added category
  Utility = 'Utility',
  Tech = 'Tech', // Merged into Utility or keep separate? Let's keep for now.
  Materials = 'Materials', // For refining raw materials
  Misc = 'Miscellaneous',
}
