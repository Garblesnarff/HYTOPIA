/**
 * Crafting Table Entity
 * An interactive entity that players can use to access the crafting system.
 */

import { Entity, EntityOptions, Player, World, EntityEvent } from 'hytopia'; // Re-added EntityEvent
// Import CraftingManager later when it's created to handle UI opening/closing
// import { CraftingManager } from '../crafting-manager';

// Define specific options for the crafting table separately
export interface CraftingTableSpecificOptions {
  modelUri?: string;
  modelScale?: number;
}

// Combine specific options with base EntityOptions for the constructor argument
export type CraftingTableOptions = EntityOptions & CraftingTableSpecificOptions;

export class CraftingTableEntity extends Entity {
  constructor(options: CraftingTableOptions) {
    // Define defaults for specific options
    const defaultSpecificOptions: CraftingTableSpecificOptions = {
      // Reverted back to the correct crafting table model path
      modelUri: options.modelUri ?? 'models/structures/crafting-table/source/crafting_table.gltf',
      modelScale: options.modelScale ?? 1.0,
    };

    // Combine base options and specific options for the super call
    // Removed isInteractive and interactionText as they caused errors
    const combinedOptions: EntityOptions = {
      ...options, // Pass through all base options provided
      ...defaultSpecificOptions, // Apply defaults for specific options
    };

    super(combinedOptions);

    // Removed event listener setup as EntityEvent.INTERACT does not seem to exist.
    // Interaction will be triggered by the player controller's raycast check.
    // this.on(EntityEvent.INTERACT, this.handleInteraction);

    console.log(`CraftingTableEntity created with ID: ${this.id}`);
  }

  // Note: handleInteraction is now unused as the event listener is removed.
  // It can be removed or kept for potential future use if the SDK changes.
  // Let's keep it commented out for now.

  /**
   * Handles the interaction event when a player interacts with this entity.
   * (Currently unused as the event listener is removed)
   * @param eventData Data associated with the interaction event.
   */
  // private handleInteraction = (eventData: { player: Player }): void => {
  //   const player = eventData.player;
  //   if (!player) return;
  //
  //   console.log(`Player ${player.id} interacted with Crafting Table ${this.id} via event`);
  //   this.interact(player);
  // };

  /**
   * Called when a player interacts with the crafting table.
   * Opens the crafting interface for the player.
   * @param player The player interacting with the table.
   */
  public interact(player: Player): void {
    console.log(`CraftingTableEntity ${this.id}: interact() called by Player ${player.id}`);
    this.openCraftingInterface(player);
  }

  /**
   * Opens the crafting UI for the specified player.
   * This will eventually call the CraftingManager to handle the UI logic.
   * @param player The player for whom to open the interface.
   */
  public openCraftingInterface(player: Player): void {
    console.log(`CraftingTableEntity ${this.id}: Opening crafting interface for Player ${player.id}`);
    // TODO: Call CraftingManager.instance.openPlayerCraftingInterface(player);
    // For now, just send a chat message as placeholder
    player.world?.chatManager.sendPlayerMessage(player, 'You opened the Crafting Table!', '#00FFFF');
  }

  /**
   * Closes the crafting UI for the specified player.
   * This will eventually call the CraftingManager.
   * @param player The player for whom to close the interface.
   */
  public closeCraftingInterface(player: Player): void {
    console.log(`CraftingTableEntity ${this.id}: Closing crafting interface for Player ${player.id}`);
    // TODO: Call CraftingManager.instance.closePlayerCraftingInterface(player);
  }

  // Override spawn/despawn if needed for specific logic
  public spawn(world: World, position: { x: number; y: number; z: number }): void {
    super.spawn(world, position);
    console.log(`CraftingTableEntity ${this.id} spawned at`, position);
  }

  public despawn(): void {
    console.log(`CraftingTableEntity ${this.id} despawned.`);
    super.despawn();
  }
}
