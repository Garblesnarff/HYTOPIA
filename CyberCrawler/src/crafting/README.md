# Crafting System Documentation

This directory contains all the server-side logic for the crafting system in CyberCrawler.

## Directory Structure

-   **`crafting-manager.ts`**: Singleton manager responsible for orchestrating crafting operations, handling UI events, and managing crafting entities.
-   **`crafting-system.ts`**: Contains the core logic for checking craftability and executing crafting recipes (consuming materials, adding results).
-   **`entities/`**: Contains entity definitions related to crafting.
    -   **`crafting-table.ts`**: Defines the `CraftingTableEntity` that players interact with to open the crafting UI.
-   **`recipes/`**: Contains recipe definitions and data structures.
    -   **`recipe-database.ts`**: Stores and provides access to all available `CraftingRecipe` definitions. Currently hardcoded, planned for JSON loading later.
    -   **`recipe-types.ts`**: Defines the TypeScript interfaces and enums used for recipes, materials, and results (`CraftingRecipe`, `CraftingMaterial`, `CraftingResult`, etc.).

## Overview

The crafting system allows players to create new items from materials found in the world.

1.  **Interaction**: Players interact with a `CraftingTableEntity` placed in the world.
2.  **UI**: Interacting with the table opens a UI (`src/ui/templates/crafting-ui.html` managed by `src/ui/handlers/crafting-ui-handler.ts`).
3.  **Data Flow**: The `CraftingManager` sends recipe and inventory data to the UI upon opening.
4.  **Recipe Selection**: The player selects a recipe in the UI. The UI displays required materials and the player's current count.
5.  **Crafting Request**: The player clicks the "Craft" button, sending a `craft-item` event to the server via `PlayerUIEvent.DATA`.
6.  **Processing**: The `CraftingManager` receives the event and calls `crafting-system.craftItem`.
7.  **Execution**: `craftItem` verifies materials using `InventoryManager`, consumes materials, and adds the resulting item to the player's inventory (managed in `playerStates` via `InventoryManager`).
8.  **Feedback**: The `CraftingManager` sends updated UI data and chat messages back to the player indicating success or failure.

## Integration Points

-   `CraftingManager.instance.initializeCraftingTables()` is called in `src/index.ts` on server start.
-   The `PlayerUIEvent.DATA` listener is set up for each player in `src/index.ts` within `handlePlayerSetup`, routing events to `CraftingManager.instance.handlePlayerUIEvent()`.
-   Player interaction with `CraftingTableEntity` is handled via raycast in `src/player/cyberCrawlerController.ts`, which calls the entity's `interact()` method.
-   The `interact()` method on `CraftingTableEntity` calls `CraftingManager.instance.openPlayerCraftingInterface()`.
-   The `InventoryManager` reads/writes the `inventory` array within the `playerStates` map (defined in `src/player/playerController.ts`).

## Future Improvements

-   Load recipes from external JSON files.
-   Implement crafting time delays.
-   Add workbench requirements for specific recipes.
-   Implement recipe discovery/unlocking mechanics.
-   Add visual feedback for crafting progress in the UI.
-   Integrate item icons.
-   Persistence for inventory/discovered recipes.
