/**
 * Recipe Database for the Crafting System
 * Stores and provides access to all available crafting recipes.
 *
 * TODO: Implement loading recipes from an external JSON file instead of hardcoding.
 */

import {
  CraftingRecipe,
  RecipeCategory,
  Difficulty,
  Rarity,
  CraftingMaterial,
  CraftingResult,
  BaseItem,
} from './recipe-types';

// --- Basic Materials Definition ---
// These would ideally be loaded from a central item database
const MATERIALS: { [key: string]: BaseItem & { rarity: Rarity } } = {
  METAL_SCRAPS: { id: 'metal_scraps', name: 'Metal Scraps', description: 'Common bits of discarded metal.', rarity: Rarity.Common, iconReference: 'icons/items/metal_scraps.png' },
  ELECTRONIC_PARTS: { id: 'electronic_parts', name: 'Electronic Parts', description: 'Salvaged electronic components.', rarity: Rarity.Common, iconReference: 'icons/items/electronic_parts.png' },
  CHEMICAL_COMPONENTS: { id: 'chemical_components', name: 'Chemical Components', description: 'Basic chemicals, handle with care.', rarity: Rarity.Common, iconReference: 'icons/items/chemical_components.png' },
  POWER_CELL: { id: 'power_cell', name: 'Power Cell', description: 'A portable energy source.', rarity: Rarity.Uncommon, iconReference: 'icons/items/power_cell.png' },
  ADHESIVE: { id: 'adhesive', name: 'Adhesive', description: 'Strong bonding agent.', rarity: Rarity.Common, iconReference: 'icons/items/adhesive.png' },
  SPRINGS: { id: 'springs', name: 'Springs', description: 'Coiled metal springs.', rarity: Rarity.Common, iconReference: 'icons/items/springs.png' },
  CIRCUIT_BOARD: { id: 'circuit_board', name: 'Circuit Board', description: 'A complex electronic board.', rarity: Rarity.Uncommon, iconReference: 'icons/items/circuit_board.png' },
  MEDICAL_SUPPLIES: { id: 'medical_supplies', name: 'Medical Supplies', description: 'Sterile bandages and basic meds.', rarity: Rarity.Uncommon, iconReference: 'icons/items/medical_supplies.png' },
  RARE_COMPOUND: { id: 'rare_compound', name: 'Rare Compound', description: 'An unstable but potent substance.', rarity: Rarity.Rare, iconReference: 'icons/items/rare_compound.png' },
};

// Helper function to create CraftingMaterial instances
function createMaterial(materialKey: keyof typeof MATERIALS, quantity: number): CraftingMaterial {
  const base = MATERIALS[materialKey];
  return { ...base, quantity };
}

// --- Recipe Definitions ---
// This Map stores all recipes, keyed by their unique ID.
const recipeDatabase = new Map<string, CraftingRecipe>();

/**
 * Initializes the recipe database with hardcoded recipes.
 * This function should be called once when the server starts.
 */
function initializeRecipeDatabase(): void {
  const recipes: CraftingRecipe[] = [
    // Consumables
    {
      id: 'craft_stim_pack',
      name: 'Craft Stim Pack',
      description: 'Assemble a basic medical stim pack for quick healing.',
      category: RecipeCategory.Consumables,
      difficulty: Difficulty.Easy,
      craftingTime: 3, // seconds
      materials: [
        createMaterial('MEDICAL_SUPPLIES', 2),
        createMaterial('CHEMICAL_COMPONENTS', 1),
      ],
      result: {
        id: 'stim_pack',
        name: 'Stim Pack',
        quantity: 1,
        healingAmount: 25, // Heals 25% - actual implementation might differ
        effectDescription: 'Restores 25 health.',
        iconReference: 'icons/items/stim_pack.png',
      },
    },
    {
      id: 'craft_reflex_booster',
      name: 'Craft Reflex Booster',
      description: 'Mix chemicals to create a temporary speed enhancement.',
      category: RecipeCategory.Consumables,
      difficulty: Difficulty.Easy,
      craftingTime: 5,
      materials: [
        createMaterial('CHEMICAL_COMPONENTS', 2),
        createMaterial('ELECTRONIC_PARTS', 1),
      ],
      result: {
        id: 'reflex_booster',
        name: 'Reflex Booster',
        quantity: 1,
        duration: 30,
        effectDescription: '+20% movement speed for 30 seconds.',
        iconReference: 'icons/items/reflex_booster.png',
      },
    },
    {
      id: 'craft_neural_focus',
      name: 'Craft Neural Focus',
      description: 'Synthesize a compound that enhances combat focus.',
      category: RecipeCategory.Consumables,
      difficulty: Difficulty.Moderate,
      craftingTime: 7,
      materials: [
        createMaterial('CHEMICAL_COMPONENTS', 1),
        createMaterial('RARE_COMPOUND', 1),
      ],
      result: {
        id: 'neural_focus',
        name: 'Neural Focus',
        quantity: 1,
        duration: 30,
        effectDescription: '+15% damage for 30 seconds.',
        iconReference: 'icons/items/neural_focus.png',
      },
    },
    // Weapons & Ammo
    {
      id: 'craft_makeshift_blade',
      name: 'Craft Makeshift Blade',
      description: 'Fashion sharp metal scraps into a crude but effective blade.',
      category: RecipeCategory.Weapons,
      difficulty: Difficulty.Easy,
      craftingTime: 8,
      materials: [
        createMaterial('METAL_SCRAPS', 5),
        createMaterial('ADHESIVE', 2),
      ],
      result: {
        id: 'makeshift_blade',
        name: 'Makeshift Blade',
        quantity: 1,
        damage: 15, // Example damage value
        effectDescription: 'A basic melee weapon.',
        iconReference: 'icons/items/makeshift_blade.png',
      },
    },
    {
      id: 'craft_pipe_pistol',
      name: 'Craft Pipe Pistol',
      description: 'Assemble a simple projectile weapon from pipes and springs.',
      category: RecipeCategory.Weapons,
      difficulty: Difficulty.Moderate,
      craftingTime: 12,
      materials: [
        createMaterial('METAL_SCRAPS', 8),
        createMaterial('SPRINGS', 3),
        createMaterial('ADHESIVE', 2),
      ],
      result: {
        id: 'pipe_pistol',
        name: 'Pipe Pistol',
        quantity: 1,
        damage: 10, // Example damage value
        effectDescription: 'A basic ranged weapon. Requires ammo.',
        iconReference: 'icons/items/pipe_pistol.png',
      },
    },
    {
      id: 'craft_emp_grenade',
      name: 'Craft EMP Grenade',
      description: 'Create a grenade that disables electronic systems.',
      category: RecipeCategory.Weapons, // Or Utility? Let's keep Weapons for now
      difficulty: Difficulty.Moderate,
      craftingTime: 10,
      materials: [
        createMaterial('ELECTRONIC_PARTS', 4),
        createMaterial('POWER_CELL', 1),
        createMaterial('CHEMICAL_COMPONENTS', 2),
      ],
      result: {
        id: 'emp_grenade',
        name: 'EMP Grenade',
        quantity: 1,
        effectDescription: 'Area stun vs robotic enemies.',
        iconReference: 'icons/items/emp_grenade.png',
      },
    },
    // Utility & Tools
    {
      id: 'craft_security_bypass',
      name: 'Craft Security Bypass Module',
      description: 'Assemble a device to override simple electronic locks.',
      category: RecipeCategory.Utility,
      difficulty: Difficulty.Moderate,
      craftingTime: 15,
      materials: [
        createMaterial('ELECTRONIC_PARTS', 3),
        createMaterial('CIRCUIT_BOARD', 1),
        createMaterial('POWER_CELL', 1),
      ],
      result: {
        id: 'security_bypass',
        name: 'Security Bypass Module',
        quantity: 1,
        effectDescription: 'Single-use electronic lock opener.',
        iconReference: 'icons/items/security_bypass.png',
      },
    },
    {
      id: 'craft_scanner_upgrade',
      name: 'Craft Scanner Upgrade',
      description: 'Enhance scanning capabilities with salvaged parts.',
      category: RecipeCategory.Utility, // Or Tech?
      difficulty: Difficulty.Complex,
      craftingTime: 20,
      materials: [
        createMaterial('ELECTRONIC_PARTS', 4),
        createMaterial('CIRCUIT_BOARD', 2),
        createMaterial('RARE_COMPOUND', 1), // Added rare component
      ],
      result: {
        id: 'scanner_upgrade',
        name: 'Scanner Upgrade',
        quantity: 1,
        effectDescription: 'Increases scan range and detail.',
        iconReference: 'icons/items/scanner_upgrade.png',
      },
    },
    {
      id: 'craft_portable_shield',
      name: 'Craft Portable Shield',
      description: 'Construct a temporary personal energy shield.',
      category: RecipeCategory.Utility,
      difficulty: Difficulty.Complex,
      craftingTime: 18,
      materials: [
        createMaterial('POWER_CELL', 2),
        createMaterial('ELECTRONIC_PARTS', 3),
        createMaterial('METAL_SCRAPS', 5),
      ],
      result: {
        id: 'portable_shield',
        name: 'Portable Shield',
        quantity: 1,
        duration: 10,
        effectDescription: 'Absorbs damage for 10 seconds.',
        iconReference: 'icons/items/portable_shield.png',
      },
    },
  ];

  // Populate the database
  recipes.forEach(recipe => {
    if (recipeDatabase.has(recipe.id)) {
      console.warn(`Recipe Database Initialization: Duplicate recipe ID "${recipe.id}" detected. Overwriting.`);
    }
    recipeDatabase.set(recipe.id, recipe);
  });

  console.log(`Recipe Database Initialized with ${recipeDatabase.size} recipes.`);
}

// --- Accessor Functions ---

/**
 * Retrieves all recipes currently loaded in the database.
 * @returns An array of all CraftingRecipe objects.
 */
export function getAllRecipes(): CraftingRecipe[] {
  return Array.from(recipeDatabase.values());
}

/**
 * Retrieves a specific recipe by its unique ID.
 * @param id The unique identifier of the recipe.
 * @returns The CraftingRecipe object if found, otherwise undefined.
 */
export function getRecipeById(id: string): CraftingRecipe | undefined {
  return recipeDatabase.get(id);
}

/**
 * Retrieves all recipes belonging to a specific category.
 * @param category The RecipeCategory to filter by.
 * @returns An array of CraftingRecipe objects matching the category.
 */
export function getRecipesByCategory(category: RecipeCategory): CraftingRecipe[] {
  const filteredRecipes: CraftingRecipe[] = [];
  for (const recipe of recipeDatabase.values()) {
    if (recipe.category === category) {
      filteredRecipes.push(recipe);
    }
  }
  return filteredRecipes;
}

// --- Initialization ---
// Call the initialization function immediately when this module is loaded.
// Ensure this module is imported early in the server startup sequence.
try {
    initializeRecipeDatabase();
} catch (error) {
    console.error("CRITICAL ERROR during Recipe Database Initialization:", error);
    // Optionally re-throw or handle differently if needed, but logging is key
}
