/**
 * Inventory Manager for CyberCrawler
 * Handles player inventory operations like adding, removing, and checking items.
 * Interacts with the playerStates map from playerController.
 */

import { playerStates } from './playerController'; // Assuming playerStates is exported
import { CraftingMaterial, BaseItem } from '../crafting/recipes/recipe-types'; // Import necessary types

/**
 * Represents a stack of items in the inventory.
 */
export interface InventoryItem {
  itemId: string; // Unique identifier for the item type
  quantity: number; // Number of items in this stack
  // Potential future additions: metadata, durability, etc.
}

export class InventoryManager {
  // --- Singleton Pattern ---
  private static _instance: InventoryManager;
  public static get instance(): InventoryManager {
    if (!InventoryManager._instance) {
      InventoryManager._instance = new InventoryManager();
    }
    return InventoryManager._instance;
  }
  private constructor() {
    // Private constructor for singleton
    console.log("InventoryManager initialized.");
  }

  /**
   * Retrieves the inventory array for a specific player.
   * @param playerId The ID of the player.
   * @returns The player's inventory array, or undefined if the player state doesn't exist.
   */
  private getInventory(playerId: string): InventoryItem[] | undefined {
    const state = playerStates.get(playerId);
    // Ensure the inventory array exists on the state
    if (state && !state.inventory) {
        state.inventory = [];
    }
    return state?.inventory;
  }

  /**
   * Gets the total quantity of a specific item across all stacks in the inventory.
   * @param playerId The ID of the player.
   * @param itemId The ID of the item to count.
   * @returns The total quantity of the item, or 0 if not found.
   */
  public getItemCount(playerId: string, itemId: string): number {
    const inventory = this.getInventory(playerId);
    if (!inventory) return 0;

    let totalQuantity = 0;
    for (const item of inventory) {
      if (item.itemId === itemId) {
        totalQuantity += item.quantity;
      }
    }
    return totalQuantity;
  }

  /**
   * Checks if the player's inventory contains sufficient quantities of the specified materials.
   * @param playerId The ID of the player.
   * @param materials An array of CraftingMaterial objects representing the required items and quantities.
   * @returns True if the player has enough materials, false otherwise.
   */
  public hasMaterials(playerId: string, materials: CraftingMaterial[]): boolean {
    const inventory = this.getInventory(playerId);
    if (!inventory) return false; // Cannot craft if inventory doesn't exist

    for (const material of materials) {
      if (this.getItemCount(playerId, material.id) < material.quantity) {
        console.log(`Player ${playerId} missing material: ${material.name} (Needs ${material.quantity}, Has ${this.getItemCount(playerId, material.id)})`);
        return false; // Not enough of this material
      }
    }
    return true; // Has enough of all materials
  }

  /**
   * Adds items to the player's inventory. Handles stacking if items already exist.
   * Assumes a simple stacking model for now.
   * @param playerId The ID of the player.
   * @param itemsToAdd An array of InventoryItem objects to add.
   * @returns True if items were added successfully, false otherwise.
   */
  public addItems(playerId: string, itemsToAdd: InventoryItem[]): boolean {
    const inventory = this.getInventory(playerId);
    if (!inventory) return false;

    for (const itemToAdd of itemsToAdd) {
        if (itemToAdd.quantity <= 0) continue; // Skip invalid quantities

        // Find existing stack or add new one (simple model: assumes items are stackable)
        let foundStack = false;
        for (const existingItem of inventory) {
            if (existingItem.itemId === itemToAdd.itemId) {
                existingItem.quantity += itemToAdd.quantity;
                foundStack = true;
                break; // Added to existing stack
            }
        }

        if (!foundStack) {
            // Add as a new stack
            inventory.push({ ...itemToAdd }); // Add a copy
        }
        console.log(`Added ${itemToAdd.quantity}x ${itemToAdd.itemId} to player ${playerId}'s inventory.`);
    }
    // TODO: Add inventory change event emission here?
    return true;
  }

  /**
   * Removes items from the player's inventory.
   * @param playerId The ID of the player.
   * @param itemsToRemove An array of InventoryItem objects specifying items and quantities to remove.
   * @returns True if the items were successfully removed, false if any item couldn't be removed (e.g., insufficient quantity).
   */
  public removeItems(playerId: string, itemsToRemove: InventoryItem[]): boolean {
    const inventory = this.getInventory(playerId);
    if (!inventory) return false;

    // First, check if all items can be removed
    for (const itemToRemove of itemsToRemove) {
        if (this.getItemCount(playerId, itemToRemove.itemId) < itemToRemove.quantity) {
            console.error(`Cannot remove ${itemToRemove.quantity}x ${itemToRemove.itemId} for player ${playerId}: Insufficient quantity.`);
            return false; // Not enough of this item
        }
    }

    // If checks pass, proceed with removal
    for (const itemToRemove of itemsToRemove) {
        let quantityToRemove = itemToRemove.quantity;
        // Iterate backwards to safely remove empty stacks
        for (let i = inventory.length - 1; i >= 0; i--) {
            if (inventory[i].itemId === itemToRemove.itemId) {
                const amountToRemoveFromStack = Math.min(quantityToRemove, inventory[i].quantity);
                inventory[i].quantity -= amountToRemoveFromStack;
                quantityToRemove -= amountToRemoveFromStack;

                if (inventory[i].quantity <= 0) {
                    inventory.splice(i, 1); // Remove empty stack
                }

                if (quantityToRemove <= 0) {
                    break; // Done removing this item type
                }
            }
        }
         console.log(`Removed ${itemToRemove.quantity}x ${itemToRemove.itemId} from player ${playerId}'s inventory.`);
    }

    // TODO: Add inventory change event emission here?
    return true;
  }

  /**
   * Convenience method to add a crafted item (result of a recipe).
   * @param playerId The ID of the player.
   * @param item The BaseItem representing the crafted item.
   * @param quantity The quantity crafted.
   * @returns True if the item was added successfully, false otherwise.
   */
  public addCraftedItem(playerId: string, item: BaseItem, quantity: number): boolean {
    return this.addItems(playerId, [{ itemId: item.id, quantity }]);
  }

  /**
   * Convenience method to remove materials used in crafting.
   * @param playerId The ID of the player.
   * @param materials An array of CraftingMaterial objects to remove.
   * @returns True if materials were removed successfully, false otherwise.
   */
  public removeMaterials(playerId: string, materials: CraftingMaterial[]): boolean {
    const itemsToRemove: InventoryItem[] = materials.map(mat => ({
      itemId: mat.id,
      quantity: mat.quantity,
    }));
    return this.removeItems(playerId, itemsToRemove);
  }

  /**
   * Logs the current inventory for a player (for debugging).
   * @param playerId The ID of the player.
   */
  public logInventory(playerId: string): void {
    const inventory = this.getInventory(playerId);
    if (inventory) {
      console.log(`Inventory for player ${playerId}:`, JSON.stringify(inventory, null, 2));
    } else {
      console.log(`No inventory found for player ${playerId}.`);
    }
  }
}
