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

import {
  getResourceById,
  ResourceItem,
} from '../resources/resource-database';

/**
 * Helper to create a CraftingMaterial from a resource ID.
 * Throws error if resource not found.
 * @param resourceId string
 * @param quantity number
 * @returns CraftingMaterial
 */
function createMaterialFromResource(resourceId: string, quantity: number): CraftingMaterial {
  const resource = getResourceById(resourceId) as ResourceItem | undefined;
  if (!resource) {
    throw new Error(`Resource with ID "${resourceId}" not found in resource database.`);
  }
  return {
    ...resource,
    quantity,
    rarity: resource.rarity,
  };
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
      id: 'craft_nano_injector',
      name: 'Craft Nano Injector',
      description: 'Inject nanobots for rapid tissue repair.',
      category: RecipeCategory.Consumables,
      difficulty: Difficulty.Easy,
      craftingTime: 3,
      materials: [
        createMaterialFromResource('nanobots', 1),
        createMaterialFromResource('mutated_plants', 1),
      ],
      result: {
        id: 'nano_injector',
        name: 'Nano Injector',
        quantity: 1,
        healingAmount: 25,
        effectDescription: 'Restores 25 health instantly.',
        iconReference: 'icons/items/stim_pack.png',
      },
    },
    {
      id: 'craft_reflex_enhancer',
      name: 'Craft Reflex Enhancer',
      description: 'Enhance neural response speed with nanotech serum.',
      category: RecipeCategory.Consumables,
      difficulty: Difficulty.Easy,
      craftingTime: 5,
      materials: [
        createMaterialFromResource('mutated_plants', 1),
        createMaterialFromResource('energy_cell', 1),
      ],
      result: {
        id: 'reflex_enhancer',
        name: 'Reflex Enhancer',
        quantity: 1,
        duration: 30,
        effectDescription: '+20% movement speed for 30 seconds.',
        iconReference: 'icons/items/reflex_booster.png',
      },
    },
    {
      id: 'craft_combat_stim',
      name: 'Craft Combat Stim',
      description: 'Injectable stim to boost combat performance.',
      category: RecipeCategory.Consumables,
      difficulty: Difficulty.Moderate,
      craftingTime: 7,
      materials: [
        createMaterialFromResource('nanobots', 1),
        createMaterialFromResource('energy_cell', 1),
      ],
      result: {
        id: 'combat_stim',
        name: 'Combat Stim',
        quantity: 1,
        duration: 30,
        effectDescription: '+15% damage for 30 seconds.',
        iconReference: 'icons/items/neural_focus.png',
      },
    },
    // Weapons & Ammo
    {
      id: 'craft_vibro_blade',
      name: 'Craft Vibro Blade',
      description: 'Assemble a vibrating blade for close combat.',
      category: RecipeCategory.Weapons,
      difficulty: Difficulty.Easy,
      craftingTime: 8,
      materials: [
        createMaterialFromResource('scrap_metal', 5),
        createMaterialFromResource('tech_components', 1),
      ],
      result: {
        id: 'vibro_blade',
        name: 'Vibro Blade',
        quantity: 1,
        damage: 15,
        effectDescription: 'A melee weapon with vibrating edge.',
        iconReference: 'icons/items/makeshift_blade.png',
      },
    },
    {
      id: 'craft_energy_pistol',
      name: 'Craft Energy Pistol',
      description: 'Build a basic energy-based sidearm.',
      category: RecipeCategory.Weapons,
      difficulty: Difficulty.Moderate,
      craftingTime: 12,
      materials: [
        createMaterialFromResource('scrap_metal', 5),
        createMaterialFromResource('tech_components', 2),
        createMaterialFromResource('energy_cell', 1),
      ],
      result: {
        id: 'energy_pistol',
        name: 'Energy Pistol',
        quantity: 1,
        damage: 12,
        effectDescription: 'A basic ranged weapon firing energy bolts.',
        iconReference: 'icons/items/pipe_pistol.png',
      },
    },
    {
      id: 'craft_emp_grenade',
      name: 'Craft EMP Grenade',
      description: 'Create a grenade that disables electronic systems.',
      category: RecipeCategory.Weapons,
      difficulty: Difficulty.Moderate,
      craftingTime: 10,
      materials: [
        createMaterialFromResource('tech_components', 3),
        createMaterialFromResource('energy_cell', 1),
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
      id: 'craft_hacking_module',
      name: 'Craft Hacking Module',
      description: 'Device to override electronic security systems.',
      category: RecipeCategory.Utility,
      difficulty: Difficulty.Moderate,
      craftingTime: 15,
      materials: [
        createMaterialFromResource('tech_components', 3),
        createMaterialFromResource('energy_cell', 1),
      ],
      result: {
        id: 'hacking_module',
        name: 'Hacking Module',
        quantity: 1,
        effectDescription: 'Single-use electronic lock bypass.',
        iconReference: 'icons/items/security_bypass.png',
      },
    },
    {
      id: 'craft_sensor_upgrade',
      name: 'Craft Sensor Upgrade',
      description: 'Enhance scanning capabilities with advanced tech.',
      category: RecipeCategory.Utility,
      difficulty: Difficulty.Complex,
      craftingTime: 20,
      materials: [
        createMaterialFromResource('tech_components', 4),
        createMaterialFromResource('rare_metals', 1),
      ],
      result: {
        id: 'sensor_upgrade',
        name: 'Sensor Upgrade',
        quantity: 1,
        effectDescription: 'Increases scan range and detail.',
        iconReference: 'icons/items/scanner_upgrade.png',
      },
    },
    {
      id: 'craft_energy_shield',
      name: 'Craft Energy Shield',
      description: 'Construct a deployable personal energy barrier.',
      category: RecipeCategory.Utility,
      difficulty: Difficulty.Complex,
      craftingTime: 18,
      materials: [
        createMaterialFromResource('energy_cell', 2),
        createMaterialFromResource('tech_components', 3),
        createMaterialFromResource('scrap_metal', 5),
      ],
      result: {
        id: 'energy_shield',
        name: 'Energy Shield',
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
