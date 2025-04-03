# Village Area Generation (`/src/world/areas/village/`)

## Purpose

This directory contains the modular components responsible for generating the central village area in the CyberCrawler game world. It separates the logic for creating the plaza, different building types, paths, and decorations into distinct files for better organization and maintainability.

The main entry point is `index.ts`, which orchestrates the calls to the other modules to build the complete village structure.

## Important Files

-   **`index.ts`**: The main orchestrator for village generation. Imports and calls functions from other modules in this directory to build the plaza, buildings, paths, and decorations in sequence.
-   **`plaza.ts`**: Handles the creation of the central village plaza, including the circular floor and the central fountain feature.
-   **`buildings.ts`**: Manages the placement logic for various buildings around the plaza. It calculates positions and calls specific building generation functions.
-   **`shop.ts`**: Contains the function `buildSmallShop` to generate a small, clay-walled shop building.
-   **`house.ts`**: Contains the function `buildVillageHouse` to generate a standard brick house.
-   **`tower.ts`**: Contains the function `buildTallBuilding` to generate a multi-story stone brick tower.
-   **`paths.ts`**: Responsible for generating the paths that radiate outwards from the central plaza.
-   **`decorations.ts`**: Adds decorative elements like trees and benches to the village area, ensuring they are placed appropriately outside the main plaza.

## Interaction

The generation process starts with the `buildVillage` function exported from `index.ts`. This function calls, in order:
1.  `buildPlaza` (from `plaza.ts`)
2.  `buildVillageBuildings` (from `buildings.ts`), which in turn calls `buildSmallShop`, `buildVillageHouse`, and `buildTallBuilding` based on its internal logic.
3.  `buildVillagePaths` (from `paths.ts`)
4.  `addVillageDecorations` (from `decorations.ts`)

This modular approach allows for easier modification or addition of village components without altering the main orchestration logic significantly.
