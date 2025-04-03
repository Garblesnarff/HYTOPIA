# Player House Area Generation (`/src/world/areas/player-house/`)

## Purpose

This directory contains the modular components responsible for generating the player's starting house and surrounding property area in the CyberCrawler game world. It handles terrain modification (creating a hill), building the house structure, adding interior details, creating a garden, building a fence, and adding a path.

The main entry point is `index.ts`, which orchestrates the calls to the other modules and handles the primary terrain modifications.

## Important Files

-   **`index.ts`**: The main orchestrator for player house area generation. Creates the hill, calls component functions for the house, garden, and fence, and generates the main path leading away from the house. Exports the `buildPlayerHouse` function.
-   **`house-structure.ts`**: Contains the `buildMainHouse` function, responsible for the house's foundation, exterior walls, floor, roof, windows, and door. It also calls the `buildInterior` function.
-   **`interior.ts`**: Contains the `buildInterior` function, which adds internal walls and basic furniture (bed, table, chest) to the house.
-   **`garden.ts`**: Contains the `buildGarden` function, responsible for placing trees and a small flower patch near the house.
-   **`fence.ts`**: Contains the `buildFence` function, which constructs the wooden fence posts, rails, and gate surrounding the property.

## Interaction

The generation process starts with the `buildPlayerHouse` function exported from `index.ts`. This function performs the following steps:
1.  Creates a hill using `createHill` (from `../../terrain.ts`).
2.  Calls `buildMainHouse` (from `house-structure.ts`), which subsequently calls `buildInterior` (from `interior.ts`).
3.  Calls `buildGarden` (from `garden.ts`).
4.  Calls `buildFence` (from `fence.ts`).
5.  Creates a path leading from near the house door towards the property edge using `createPath` (from `../../terrain.ts`).

This modular structure isolates the different parts of the player's property generation, making it easier to modify or extend specific features.
