/**
 * Crafting Manager (Server-Side)
 * Singleton class to manage crafting operations, UI interactions, and entities.
 */

import { Player, World, PlayerUIEvent, Vector3 } from 'hytopia';
import { CraftingTableEntity } from './entities/crafting-table';
import { getAllRecipes, getRecipeById } from './recipes/recipe-database';
import { craftItem } from './crafting-system';
import { InventoryManager, InventoryItem } from '../player/inventory-manager';
import { playerStates } from '../player/playerController'; // To access inventory state
import { ClientCraftingRecipe, ClientCraftingMaterial, ClientCraftingResult, CraftingUIData } from '../ui/handlers/crafting-ui-handler'; // Import client-side types for data structure

// Moved CRAFTING_TABLE_LOCATIONS definition inside initializeCraftingTables

export class CraftingManager {
    // --- Singleton Pattern ---
    private static _instance: CraftingManager;
    public static get instance(): CraftingManager {
        if (!CraftingManager._instance) {
            CraftingManager._instance = new CraftingManager();
        }
        return CraftingManager._instance;
    }
    private constructor() {
        console.log("CraftingManager initialized.");
    }

    private activeCraftingPlayers = new Set<string>(); // Track players currently using a crafting UI

    /**
     * Spawns CraftingTableEntity instances at predefined locations in the world.
     * @param world The world instance.
     */
    public initializeCraftingTables(world: World): void {
        try { // Wrap the entire function body
            // Define locations here to ensure Vector3 is ready
            const CRAFTING_TABLE_LOCATIONS: Vector3[] = [
                 // new Vector3(5, 5, 5), // Using test coordinates
                 new Vector3(130, 3, 23), // Reverted to original desired location (Y=3)
                // Add more locations if desired: new Vector3(x, y, z),
            ];
            console.log("[CraftingManager] Initializing crafting tables at locations:", CRAFTING_TABLE_LOCATIONS); // Log 1

            CRAFTING_TABLE_LOCATIONS.forEach((pos, index) => {
                // Removed inner try...catch, relying on the outer one now
                console.log(`[CraftingManager Loop ${index}] Attempting to create CraftingTableEntity for pos:`, pos); // Log 2
                const table = new CraftingTableEntity({ name: `CraftingTable_${index}` });
                console.log(`[CraftingManager Loop ${index}] CraftingTableEntity created successfully (ID: ${table.id})`); // Log 3

                console.log(`[CraftingManager Loop ${index}] Attempting to spawn entity ID ${table.id} at`, pos); // Log 4
                table.spawn(world, pos); // Use fixed Y for now
                console.log(`[CraftingManager Loop ${index}] Entity spawn called successfully for ID ${table.id}.`); // Log 5
            });
            console.log(`[CraftingManager] Finished initializeCraftingTables loop successfully.`); // Log 6
        } catch (error) {
             console.error(`[CraftingManager] CRITICAL ERROR in initializeCraftingTables:`, error); // Log any error in the whole function
        }
    }

    /**
     * Registers necessary event listeners, particularly for UI events.
     * This should be called during server initialization *after* player setup potentially.
     * @param world The world instance.
     */
    public registerCraftingEvents(world: World): void {
        // Note: Player-specific UI events are often registered when the player joins/UI loads.
        // This function could handle global events if needed, but the primary UI
        // event handling will be set up in playerController.ts or index.ts where player.ui is accessible.
        console.log("CraftingManager event registration placeholder.");
    }

    /**
     * Handles UI events received from a specific player's crafting interface.
     * @param player The player who sent the UI event.
     * @param eventData The data received from the UI event.
     */
    public handlePlayerUIEvent(player: Player, eventData: any): void {
        console.log(`CraftingManager received UI event from ${player.id}:`, eventData);
        const data = eventData.payload || eventData; // Adapt based on actual event structure

        if (!data || !data.type) {
            console.warn(`Received UI event from ${player.id} with no type.`);
            return;
        }

        switch (data.type) {
            case 'craft-item':
                if (data.recipeId) {
                    this.processCraftingRequest(player, data.recipeId);
                } else {
                    console.warn(`Received 'craft-item' event from ${player.id} without recipeId.`);
                }
                break;
            case 'close-crafting-request':
                console.log(`[SERVER] Received close-crafting-request from ${player.id}`);
                this.closePlayerCraftingInterface(player);
                break;
            case 'request-crafting-data': // Optional: If UI needs to explicitly request data
                this.openPlayerCraftingInterface(player); // Re-send data on request
                break;
            default:
                // console.log(`Ignoring unknown UI event type: ${data.type}`);
                break; // Ignore other event types
        }
    }

    /**
     * Processes a request from a player to craft a specific item.
     * @param player The player making the request.
     * @param recipeId The ID of the recipe to craft.
     */
    public processCraftingRequest(player: Player, recipeId: string): void {
        console.log(`Processing crafting request for recipe ${recipeId} from player ${player.id}`);

        // Check if player is actually supposed to be crafting (e.g., UI open)
        if (!this.activeCraftingPlayers.has(player.id)) {
            console.warn(`Player ${player.id} sent craft request but crafting UI is not registered as active.`);
            // Optionally ignore or send an error back
            // return;
        }

        const success = craftItem(player.id, recipeId);

        if (success) {
            console.log(`Crafting successful for ${player.id}, recipe ${recipeId}.`);
            // Send positive feedback and updated UI data
            player.world?.chatManager.sendPlayerMessage(player, `Successfully crafted item!`, '#00FF00');
            // Send updated UI data after successful craft
            this.sendUIData(player);
             // Optionally send specific confirmation event
            // player.ui?.send({ type: 'crafting-complete', recipeId: recipeId });

        } else {
            console.log(`Crafting failed for ${player.id}, recipe ${recipeId}.`);
            // Send negative feedback (craftItem function already logs details)
            player.world?.chatManager.sendPlayerMessage(player, `Crafting failed.`, '#FF0000');
             // Optionally send specific failure event
            // player.ui?.send({ type: 'crafting-failed', recipeId: recipeId, reason: 'Insufficient materials or error.' });
            // Re-send UI data to ensure client reflects accurate inventory state
             this.sendUIData(player);
        }
    }

    /**
     * Opens the crafting interface for a player, sending necessary data.
     * Called by CraftingTableEntity.interact()
     * @param player The player opening the interface.
     */
    public openPlayerCraftingInterface(player: Player): void {
        console.log(`Opening crafting interface for player ${player.id}`);
        this.activeCraftingPlayers.add(player.id);
        player.ui.lockPointer(false);
        this.sendUIData(player); // Send initial data
    }

    /**
     * Closes the crafting interface for a player.
     * Called when the player requests to close the UI.
     * @param player The player closing the interface.
     */
    public closePlayerCraftingInterface(player: Player): void {
        console.log(`Closing crafting interface for player ${player.id}`);
        if (this.activeCraftingPlayers.has(player.id)) {
            this.activeCraftingPlayers.delete(player.id);
            player.ui.lockPointer(true);
            player.ui.sendData({ type: 'hide-crafting-ui' });
        } else {
             console.warn(`Attempted to close crafting UI for player ${player.id}, but they weren't registered as active.`);
        }
    }

    /**
     * Prepares and sends the necessary data (recipes, inventory) to the player's UI.
     * @param player The player to send data to.
     */
    private sendUIData(player: Player): void {
        if (!player.ui) {
            console.error(`Cannot send UI data to player ${player.id}: player.ui is not available.`);
            return;
        }

        const recipes = getAllRecipes();
        const playerState = playerStates.get(player.id);
        const inventory = playerState?.inventory || [];

        // Convert server inventory to simple map for client
        const clientInventoryMap: { [itemId: string]: number } = {};
        inventory.forEach(item => {
            clientInventoryMap[item.itemId] = (clientInventoryMap[item.itemId] || 0) + item.quantity;
        });

        // Convert server recipes to client format, including owned materials count
        const clientRecipes: ClientCraftingRecipe[] = recipes.map(recipe => ({
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            category: recipe.category,
            craftingTime: recipe.craftingTime,
            result: { // Map result fields
                id: recipe.result.id,
                name: recipe.result.name,
                quantity: recipe.result.quantity,
                description: recipe.result.effectDescription || recipe.result.description,
                iconReference: recipe.result.iconReference,
            },
            materials: recipe.materials.map(mat => ({ // Map materials and add owned count
                id: mat.id,
                name: mat.name,
                quantityRequired: mat.quantity,
                quantityOwned: clientInventoryMap[mat.id] || 0, // Get owned count from map
                iconReference: mat.iconReference,
            })),
        }));

        const uiData: CraftingUIData = {
            recipes: clientRecipes,
            inventory: clientInventoryMap,
        };

        // Send the data package to the client UI handler using sendData
        player.ui.sendData({ type: 'show-crafting-ui', payload: uiData });
        console.log(`Sent crafting UI data to player ${player.id}`);
    }
}
