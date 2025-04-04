/**
 * Crafting System Core Logic
 * Handles the process of checking materials and executing crafting recipes.
 */

import { InventoryManager } from '../player/inventory-manager';
import { getRecipeById } from './recipes/recipe-database';
import { CraftingRecipe } from './recipes/recipe-types';
import { Player } from 'hytopia'; // Import Player if needed for context, though playerId is used primarily

/**
 * Checks if a player has the required materials to craft a specific recipe.
 *
 * @param playerId The ID of the player attempting to craft.
 * @param recipe The CraftingRecipe object to check against.
 * @returns True if the player has sufficient materials, false otherwise.
 */
export function canCraftRecipe(playerId: string, recipe: CraftingRecipe): boolean {
  if (!recipe) {
    console.error(`[CraftingSystem] Attempted to check craftability for a null/undefined recipe for player ${playerId}.`);
    return false;
  }
  // Use the InventoryManager to check if the player has the required materials
  return InventoryManager.instance.hasMaterials(playerId, recipe.materials);
}

/**
 * Attempts to craft an item for a given player based on a recipe ID.
 * It checks for required materials, consumes them, and adds the crafted item to the inventory.
 *
 * @param playerId The ID of the player attempting to craft.
 * @param recipeId The unique identifier of the recipe to craft.
 * @returns True if the item was successfully crafted, false otherwise.
 */
export function craftItem(playerId: string, recipeId: string): boolean {
  console.log(`[CraftingSystem] Player ${playerId} attempting to craft recipe: ${recipeId}`);

  // 1. Get the recipe definition
  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    console.error(`[CraftingSystem] Crafting failed for player ${playerId}: Recipe ID "${recipeId}" not found.`);
    // Optional: Send feedback to player UI
    return false;
  }

  // 2. Check if the player has the required materials
  if (!canCraftRecipe(playerId, recipe)) {
    console.log(`[CraftingSystem] Crafting failed for player ${playerId}: Insufficient materials for recipe "${recipe.name}".`);
    // Optional: Send feedback to player UI (e.g., "Insufficient materials")
    InventoryManager.instance.logInventory(playerId); // Log inventory for debugging
    return false;
  }

  // 3. TODO: Check for workbench requirement (Phase 2/3)
  // if (recipe.requiresWorkbench && !isPlayerNearWorkbench(playerId)) {
  //   console.log(`[CraftingSystem] Crafting failed for player ${playerId}: Workbench required for recipe "${recipe.name}".`);
  //   return false;
  // }

  // 4. TODO: Handle crafting time (Phase 2/3)
  // This might involve starting a timer and completing the craft later.
  // For now, crafting is instantaneous.

  // 5. Consume the materials
  const materialsRemoved = InventoryManager.instance.removeMaterials(playerId, recipe.materials);
  if (!materialsRemoved) {
    // This should theoretically not happen if canCraftRecipe passed, but check anyway.
    console.error(`[CraftingSystem] Crafting failed for player ${playerId}: Failed to remove materials for recipe "${recipe.name}", despite passing check. Inventory inconsistency?`);
    InventoryManager.instance.logInventory(playerId); // Log inventory for debugging
    // Attempt to rollback? Difficult without transactions. Log error is crucial.
    return false;
  }
  console.log(`[CraftingSystem] Consumed materials for recipe "${recipe.name}" from player ${playerId}.`);

  // 6. Add the crafted item(s) to the inventory
  const itemAdded = InventoryManager.instance.addCraftedItem(playerId, recipe.result, recipe.result.quantity);
  if (!itemAdded) {
    console.error(`[CraftingSystem] Crafting failed for player ${playerId}: Failed to add crafted item "${recipe.result.name}" to inventory. Inventory full or error?`);
    // CRITICAL: Try to give materials back if possible? Or flag for admin.
    // This indicates a potentially serious issue.
    return false;
  }
  console.log(`[CraftingSystem] Successfully crafted ${recipe.result.quantity}x "${recipe.result.name}" for player ${playerId}.`);
  InventoryManager.instance.logInventory(playerId); // Log inventory after crafting

  // 7. Optional: Send success feedback to player UI

  return true; // Crafting successful
}

// Placeholder for future workbench check
// function isPlayerNearWorkbench(playerId: string): boolean {
//   // Implementation would involve checking player position against known workbench locations
//   return true; // Assume true for now
// }
