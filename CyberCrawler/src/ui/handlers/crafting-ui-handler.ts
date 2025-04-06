/**
 * Crafting UI Handler (Client-Side)
 * Manages the crafting interface, handles user interactions,
 * and communicates with the server-side CraftingManager via UI events.
 */

// Declare the hytopia global object provided by the Hytopia client environment
declare const hytopia: any;

// --- Type Definitions (Mirroring Server-Side) ---
// Export these interfaces so they can be imported by the server if needed

export interface ClientCraftingMaterial { // Added export
    id: string;
    name: string;
    quantityRequired: number;
    quantityOwned: number; // Added: How many the player has
    iconReference?: string;
}

export interface ClientCraftingResult { // Added export
    id: string;
    name: string;
    quantity: number;
    description?: string;
    iconReference?: string;
}

export interface ClientCraftingRecipe { // Added export
    id: string;
    name: string;
    description: string;
    materials: ClientCraftingMaterial[];
    result: ClientCraftingResult;
    craftingTime: number;
    category: string; // Keep as string for simplicity on client
}

// Data expected from the server to update the UI
export interface CraftingUIData { // Added export
    recipes: ClientCraftingRecipe[];
    inventory: { [itemId: string]: number }; // Simple map of item ID to quantity
}

// --- DOM Element References ---
let recipeListElement: HTMLUListElement | null = null;
let materialsListElement: HTMLUListElement | null = null;
let selectedRecipeNameElement: HTMLElement | null = null;
let resultNameElement: HTMLElement | null = null;
let resultDescriptionElement: HTMLElement | null = null;
let craftButtonElement: HTMLButtonElement | null = null;
let closeButtonElement: HTMLButtonElement | null = null;
let progressBarElement: HTMLElement | null = null;
let craftingProgressContainer: HTMLElement | null = null;

// --- State Variables ---
let currentRecipes: ClientCraftingRecipe[] = [];
let currentInventory: { [itemId: string]: number } = {};
let selectedRecipeId: string | null = null;
let isCrafting: boolean = false;

// --- Initialization ---

/**
 * Initializes the crafting UI handler, gets element references, and sets up listeners.
 * This should be called when the UI document is ready.
 */
function initializeCraftingUI(): void {
    console.log("[UI LOG] initializeCraftingUI called."); // Log 1
    recipeListElement = document.getElementById('recipe-list') as HTMLUListElement;
    materialsListElement = document.getElementById('materials-list') as HTMLUListElement;
    selectedRecipeNameElement = document.getElementById('selected-recipe-name');
    resultNameElement = document.getElementById('result-name');
    resultDescriptionElement = document.getElementById('result-description');
    craftButtonElement = document.getElementById('craft-button') as HTMLButtonElement;
    closeButtonElement = document.getElementById('close-crafting-ui') as HTMLButtonElement;
    progressBarElement = document.getElementById('progress-bar');
    craftingProgressContainer = document.querySelector('.crafting-progress') as HTMLElement;


    if (!recipeListElement || !materialsListElement || !selectedRecipeNameElement || !resultNameElement || !resultDescriptionElement || !craftButtonElement || !closeButtonElement || !progressBarElement || !craftingProgressContainer) {
        console.error("Crafting UI Error: Could not find all required HTML elements!");
        return;
    }

    setupCraftingUIEventListeners();
    console.log("Crafting UI Handler Initialized.");

    // Example: Request initial data when UI loads (if needed)
    // sendToServer({ type: 'request-crafting-data' });
}

// --- Event Listeners ---

/**
 * Sets up event listeners for UI elements (recipe list, buttons).
 */
function setupCraftingUIEventListeners(): void {
    if (!recipeListElement || !craftButtonElement || !closeButtonElement) return;

    // Recipe selection
    recipeListElement.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const recipeItem = target.closest('.recipe-item') as HTMLLIElement | null;
        if (recipeItem && recipeItem.dataset.recipeId) {
            selectRecipe(recipeItem.dataset.recipeId);
        }
    });

    // Craft button click
    craftButtonElement.addEventListener('click', () => {
        if (selectedRecipeId && !isCrafting) {
            console.log(`Attempting to craft recipe: ${selectedRecipeId}`);
            // Send craft request to server
            sendToServer({ type: 'craft-item', recipeId: selectedRecipeId });
            // Optionally start client-side progress indication immediately
            // displayCraftingProgress(findRecipeById(selectedRecipeId)?.craftingTime ?? 0);
        }
    });

    // Close button click
    closeButtonElement.addEventListener('click', () => {
        console.log("Close button clicked.");
        // Send close request to server (which should then hide the UI)
        sendToServer({ type: 'close-crafting-request' });
        // Optionally hide immediately on client: document.body.style.display = 'none';
    });
}

// --- UI Update Functions ---

/**
 * Updates the entire crafting interface based on data received from the server.
 * @param data The CraftingUIData containing recipes and inventory counts.
 */
function updateCraftingInterface(data: CraftingUIData): void {
    console.log("Updating Crafting Interface with data:", data);
    currentRecipes = data.recipes || [];
    currentInventory = data.inventory || {};

    populateRecipeList();

    // If a recipe was selected, re-select it and update details
    if (selectedRecipeId) {
        const recipe = findRecipeById(selectedRecipeId);
        if (recipe) {
            updateRecipeDetails(recipe);
            updateCraftButtonState(recipe);
        } else {
            // Selected recipe no longer exists? Clear selection.
            clearRecipeDetails();
            selectedRecipeId = null;
        }
    } else {
        clearRecipeDetails();
    }
     // Show the UI body element
     console.log("[UI LOG] Setting body display to block."); // Log 5
    document.body.style.display = 'block';
}

/**
 * Populates the list of available recipes in the UI.
 */
function populateRecipeList(): void {
    if (!recipeListElement) {
        console.error("populateRecipeList: recipeListElement is null!");
        return;
    }
    // Use non-null assertion after check
    recipeListElement!.innerHTML = ''; // Clear existing list
    currentRecipes.forEach(recipe => {
        const li = document.createElement('li');
        li.classList.add('recipe-item');
        li.dataset.recipeId = recipe.id;
        li.textContent = recipe.name;
        if (recipe.id === selectedRecipeId) {
            li.classList.add('selected');
        }
        // Use assertion here too for appendChild
        recipeListElement!.appendChild(li);
    });
}

/**
 * Updates the details panel (materials, result) for the currently selected recipe.
 * @param recipe The selected ClientCraftingRecipe.
 */
function updateRecipeDetails(recipe: ClientCraftingRecipe): void {
    if (!materialsListElement || !selectedRecipeNameElement || !resultNameElement || !resultDescriptionElement) {
         console.error("updateRecipeDetails: One or more detail elements are null!");
         return;
    }
    // Assign to new consts after check
    const matListElement = materialsListElement;
    const nameElement = selectedRecipeNameElement;
    const resNameElement = resultNameElement;
    const resDescElement = resultDescriptionElement;

    nameElement.textContent = recipe.name;
    resNameElement.textContent = `${recipe.result.name} (x${recipe.result.quantity})`;
    resDescElement.textContent = recipe.result.description || 'No description.';

    // Use non-null assertion after check
    materialsListElement!.innerHTML = ''; // Clear previous materials
    recipe.materials.forEach(mat => {
        const owned = currentInventory[mat.id] || 0;
        const li = document.createElement('li');
        li.classList.add('material-item');
        // Indicate if player has enough of this material
        const sufficient = owned >= mat.quantityRequired;
        li.style.color = sufficient ? '#00ff00' : '#ff4444'; // Green if enough, Red if not
        li.innerHTML = `<span>${mat.name}:</span> ${owned} / ${mat.quantityRequired}`;
        // Use assertion here too for appendChild
        materialsListElement!.appendChild(li);
    });
}

/**
 * Clears the recipe details panel when no recipe is selected.
 */
function clearRecipeDetails(): void {
     if (!materialsListElement || !selectedRecipeNameElement || !resultNameElement || !resultDescriptionElement || !craftButtonElement) return;
    selectedRecipeNameElement.textContent = 'Select a Recipe';
    resultNameElement.textContent = '---';
    resultDescriptionElement.textContent = '---';
    materialsListElement.innerHTML = '';
    craftButtonElement.disabled = true;
    craftButtonElement.textContent = 'Craft';
    hideCraftingProgress();
}

/**
 * Updates the enabled/disabled state and text of the craft button based on material availability.
 * @param recipe The selected ClientCraftingRecipe.
 */
function updateCraftButtonState(recipe: ClientCraftingRecipe): void {
    if (!craftButtonElement) return;

    let canCraft = true;
    for (const mat of recipe.materials) {
        if ((currentInventory[mat.id] || 0) < mat.quantityRequired) {
            canCraft = false;
            break;
        }
    }

    craftButtonElement.disabled = !canCraft || isCrafting;
    craftButtonElement.textContent = isCrafting ? 'Crafting...' : 'Craft';
}

// --- Recipe Selection Logic ---

/**
 * Handles the selection of a recipe from the list.
 * @param recipeId The ID of the recipe to select.
 */
function selectRecipe(recipeId: string | null): void {
    if (isCrafting) return; // Don't change selection while crafting

    selectedRecipeId = recipeId;
    console.log(`Selected recipe: ${recipeId}`);

    // Update visual selection in the list
    if (recipeListElement) {
        recipeListElement.querySelectorAll('.recipe-item').forEach(item => {
            const li = item as HTMLLIElement;
            if (li.dataset.recipeId === recipeId) {
                li.classList.add('selected');
            } else {
                li.classList.remove('selected');
            }
        });
    }

    // Update details panel
    if (recipeId) {
        const recipe = findRecipeById(recipeId);
        if (recipe) {
            updateRecipeDetails(recipe);
            updateCraftButtonState(recipe);
            hideCraftingProgress(); // Hide progress bar when selecting a new recipe
        } else {
            console.error(`Selected recipe ID "${recipeId}" not found in current recipes.`);
            clearRecipeDetails();
        }
    } else {
        clearRecipeDetails();
    }
}

// --- Crafting Progress ---

/**
 * Displays and animates the crafting progress bar.
 * @param craftingTime The total time in seconds for the craft.
 */
function displayCraftingProgress(craftingTime: number): void {
    // Add explicit null checks here
    if (!craftButtonElement || !progressBarElement || !craftingProgressContainer) {
        console.error("displayCraftingProgress: One or more progress elements are null!");
        return;
    }

    if (craftingTime <= 0) {
        // Instant craft, don't show progress bar
        hideCraftingProgress();
        return;
    }

    isCrafting = true;
    craftButtonElement.disabled = true;
    craftButtonElement.textContent = 'Crafting...';
    craftingProgressContainer.style.display = 'block';
    progressBarElement.style.width = '0%';
    progressBarElement.style.transition = 'none'; // Reset transition for immediate start

    // Force reflow to apply the reset width before starting transition
    void progressBarElement.offsetWidth;

    progressBarElement.style.transition = `width ${craftingTime}s linear`;
    progressBarElement.style.width = '100%';

    // Use setTimeout to simulate crafting completion
    // In a real scenario, the server would confirm completion
    setTimeout(() => {
        // Add null check for craftButtonElement inside setTimeout callback
        if (craftButtonElement && craftButtonElement.textContent === 'Crafting...') {
             hideCraftingProgress();
             isCrafting = false;
             // Re-enable button only if materials are still sufficient (server should confirm)
             const currentRecipe = selectedRecipeId ? findRecipeById(selectedRecipeId) : null;
             if (currentRecipe) {
                 updateCraftButtonState(currentRecipe);
             } else if (craftButtonElement) { // Add null check before disabling
                 craftButtonElement.disabled = true;
             }
        }
    }, craftingTime * 1000);
}

/**
 * Hides the crafting progress bar.
 */
function hideCraftingProgress(): void {
     // Add explicit null checks here
     if (!progressBarElement || !craftingProgressContainer) {
        console.error("hideCraftingProgress: One or more progress elements are null!");
        return;
     }
     craftingProgressContainer.style.display = 'none';
     progressBarElement.style.width = '0%';
}


// --- Communication with Server ---

/**
 * Sends data/events to the server-side script.
 * This function needs to be adapted based on how HYTOPIA handles UI communication.
 * It might involve emitting custom events or using a provided API function.
 * @param data The data object to send.
 */
function sendToServer(data: object): void {
    // Placeholder: Replace with actual HYTOPIA UI communication method
    console.log("Sending to server:", data);
    // Example using a hypothetical 'engine.emit'
    // if (typeof engine !== 'undefined' && engine.emit) {
    //     engine.emit('ui-event', data);
    // } else {
    //     console.warn("HYTOPIA UI communication method not found.");
    // }

    // For development/testing, you might use browser events or mock functions
    window.parent.postMessage({ type: 'hytopia-ui-event', payload: data }, '*'); // Example using postMessage
}

/**
 * Handles messages received from the server-side script.
 * This function needs to be set up based on HYTOPIA's UI communication mechanism.
 * @param data The data object received from the server via hytopia.onData.
 */
function handleServerMessage(data: any): void {
    console.log("[UI LOG] handleServerMessage called with data:", data); // Log 3

    // Data should be the object sent by player.ui.sendData directly
    // const data = event.data?.payload || event.data; // No longer need this parsing

    if (!data || typeof data !== 'object') {
        console.warn("Received invalid data structure from server.");
        return;
    }

    if (data?.type === 'update-crafting-ui') {
        // Assuming payload structure is still used for this specific type
        updateCraftingInterface(data.payload as CraftingUIData);
    } else if (data?.type === 'crafting-started') {
        // Server confirms crafting started, potentially with actual time
        const recipe = findRecipeById(data.recipeId);
        displayCraftingProgress(recipe?.craftingTime ?? 0);
    } else if (data?.type === 'crafting-complete') {
        // Server confirms completion - update inventory (usually via full update)
        console.log(`Server confirmed crafting complete for ${data.recipeId}`);
        // Requesting a full UI update is often the simplest way to sync state
        // sendToServer({ type: 'request-crafting-data' });
        // Or, if the server included updated inventory:
        // updateCraftingInterface({ recipes: currentRecipes, inventory: data.inventory });
        hideCraftingProgress(); // Ensure progress bar is hidden
        isCrafting = false;
        const currentRecipe = selectedRecipeId ? findRecipeById(selectedRecipeId) : null;
             if (currentRecipe) {
                 updateCraftButtonState(currentRecipe);
             }
    } else if (data?.type === 'crafting-failed') {
        // Server indicates failure (e.g., insufficient materials discovered server-side)
        console.error(`Server reported crafting failed: ${data.reason}`);
        alert(`Crafting Failed: ${data.reason}`); // Simple feedback
        hideCraftingProgress();
        isCrafting = false;
        const currentRecipe = selectedRecipeId ? findRecipeById(selectedRecipeId) : null;
             if (currentRecipe) {
                 updateCraftButtonState(currentRecipe);
             }
    } else if (data?.type === 'show-crafting-ui') {
        console.log("[UI LOG] Received 'show-crafting-ui' message."); // Log 4
        // Server explicitly tells the UI to show itself and provides data
        updateCraftingInterface(data.payload as CraftingUIData);
        // Note: updateCraftingInterface now handles setting display to block
        // document.body.style.display = 'block';
        // Reset selection when opening
        selectRecipe(null);
    } else if (data?.type === 'hide-crafting-ui') {
        // Server tells the UI to hide
        document.body.style.display = 'none';
        selectedRecipeId = null; // Clear selection on close
        isCrafting = false; // Cancel any client-side crafting state
    }
}

// --- Utility Functions ---

/**
 * Finds a recipe object from the local cache by its ID.
 * @param recipeId The ID of the recipe to find.
 * @returns The ClientCraftingRecipe object or undefined if not found.
 */
function findRecipeById(recipeId: string): ClientCraftingRecipe | undefined {
    return currentRecipes.find(r => r.id === recipeId);
}

// --- Global Setup ---
// Assuming HYTOPIA provides a way to run code when the UI is loaded
// and a way to listen for messages.

// Example: Using DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeCraftingUI);

// Use hytopia.onData to listen for messages from the server
if (typeof hytopia !== 'undefined' && hytopia.onData) {
    console.log("[UI LOG] hytopia object found. Registering hytopia.onData listener."); // Log 2a
    hytopia.onData(handleServerMessage);
    console.log("[UI LOG] hytopia.onData listener registered."); // Log 2b
} else {
    console.error("[UI LOG] hytopia object or hytopia.onData not available. UI cannot receive server messages.");
    // Fallback for testing outside Hytopia environment?
    window.addEventListener('message', (event) => {
         if (event.data?.type?.startsWith('hytopia-')) {
             handleServerMessage(event.data.payload); // Assuming payload structure for testing
         }
    });
    console.warn("Using window.message listener as fallback.");
}

// Expose functions needed by the HYTOPIA environment if necessary
// (e.g., window.hytopiaUI.showCrafting = updateCraftingInterface;)

console.log("Crafting UI Handler script loaded.");

// Add empty export to make this file a module
// Removed duplicate empty export
