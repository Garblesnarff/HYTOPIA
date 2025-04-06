// This is the combined crafting UI JavaScript logic, moved from inline script

// --- Mobile Controls Logic ---
function initializeMobileControls() {
    if (typeof hytopia === 'undefined') {
        console.warn("hytopia object not available for mobile controls init.");
        return;
    }
    const mobileInteractButton = document.getElementById('mobile-interact-button');
    if (mobileInteractButton) {
        mobileInteractButton.addEventListener('touchstart', e => {
            e.preventDefault();
            mobileInteractButton.classList.add('active');
            hytopia.pressInput('ml', true);
        });
        mobileInteractButton.addEventListener('touchend', e => {
            e.preventDefault();
            mobileInteractButton.classList.remove('active');
            hytopia.pressInput('ml', false);
        });
    }
    const mobileJumpButton = document.getElementById('mobile-jump-button');
    if (mobileJumpButton) {
        mobileJumpButton.addEventListener('touchstart', e => {
            e.preventDefault();
            mobileJumpButton.classList.add('active');
            hytopia.pressInput(' ', true);
        });
        mobileJumpButton.addEventListener('touchend', e => {
            e.preventDefault();
            mobileJumpButton.classList.remove('active');
            hytopia.pressInput(' ', false);
        });
    }
}

// --- Crafting UI Handler Logic ---
let recipeListElement = null;
let materialsListElement = null;
let selectedRecipeNameElement = null;
let resultNameElement = null;
let resultDescriptionElement = null;
let craftButtonElement = null;
let closeButtonElement = null;
let progressBarElement = null;
let craftingProgressContainer = null;
let craftingUIWrapperElement = null;
let currentRecipes = [];
let currentInventory = {};
let selectedRecipeId = null;
let isCrafting = false;

function initializeCraftingUI() {
    console.log("[UI LOG] initializeCraftingUI called.");
    craftingUIWrapperElement = document.getElementById('crafting-ui-wrapper');
    recipeListElement = document.getElementById('recipe-list');
    materialsListElement = document.getElementById('materials-list');
    selectedRecipeNameElement = document.getElementById('selected-recipe-name');
    resultNameElement = document.getElementById('result-name');
    resultDescriptionElement = document.getElementById('result-description');
    craftButtonElement = document.getElementById('craft-button');
    closeButtonElement = document.getElementById('close-crafting-ui');
    progressBarElement = document.getElementById('progress-bar');
    craftingProgressContainer = document.querySelector('.crafting-progress');

    if (!craftingUIWrapperElement || !recipeListElement || !materialsListElement || !selectedRecipeNameElement || !resultNameElement || !resultDescriptionElement || !craftButtonElement || !closeButtonElement || !progressBarElement || !craftingProgressContainer) {
        console.error("Crafting UI Error: Could not find all required HTML elements!");
        return;
    }
    setupCraftingUIEventListeners();
    console.log("Crafting UI Handler Initialized.");
}

function setupCraftingUIEventListeners() {
    if (!recipeListElement || !craftButtonElement || !closeButtonElement) return;
    recipeListElement.addEventListener('click', (event) => {
        const target = event.target;
        const recipeItem = target.closest('.recipe-item');
        if (recipeItem && recipeItem.dataset.recipeId) {
            selectRecipe(recipeItem.dataset.recipeId);
        }
    });
    craftButtonElement.addEventListener('click', () => {
        if (selectedRecipeId && !isCrafting) {
            console.log(`Attempting to craft recipe: ${selectedRecipeId}`);
            sendToServer({ type: 'craft-item', recipeId: selectedRecipeId });
        }
    });
    closeButtonElement.addEventListener('click', () => {
        console.log("Close button clicked.");
        sendToServer({ type: 'close-crafting-request' });
    });
}

function updateCraftingInterface(data) {
    console.log("Updating Crafting Interface with data:", data);
    currentRecipes = data.recipes || [];
    currentInventory = data.inventory || {};
    populateRecipeList();
    if (selectedRecipeId) {
        const recipe = findRecipeById(selectedRecipeId);
        if (recipe) {
            updateRecipeDetails(recipe);
            updateCraftButtonState(recipe);
        } else {
            clearRecipeDetails();
            selectedRecipeId = null;
        }
    } else {
        clearRecipeDetails();
    }
    console.log("[UI LOG] Setting crafting UI wrapper display to block.");
    if (craftingUIWrapperElement) {
         craftingUIWrapperElement.style.display = 'block';
    } else {
         console.error("Cannot show crafting UI: Wrapper element not found.");
    }
}

function populateRecipeList() {
    if (!recipeListElement) {
        console.error("populateRecipeList: recipeListElement is null!");
        return;
    }
    recipeListElement.innerHTML = '';
    currentRecipes.forEach(recipe => {
        const li = document.createElement('li');
        li.classList.add('recipe-item');
        li.dataset.recipeId = recipe.id;
        li.textContent = recipe.name;
        if (recipe.id === selectedRecipeId) {
            li.classList.add('selected');
        }
        recipeListElement.appendChild(li);
    });
}

function updateRecipeDetails(recipe) {
    if (!materialsListElement || !selectedRecipeNameElement || !resultNameElement || !resultDescriptionElement) {
         console.error("updateRecipeDetails: One or more detail elements are null!");
         return;
    }
    selectedRecipeNameElement.textContent = recipe.name;
    resultNameElement.textContent = `${recipe.result.name} (x${recipe.result.quantity})`;
    resultDescriptionElement.textContent = recipe.result.description || 'No description.';
    materialsListElement.innerHTML = '';
    recipe.materials.forEach(mat => {
        const owned = currentInventory[mat.id] || 0;
        const li = document.createElement('li');
        li.classList.add('material-item');
        const sufficient = owned >= mat.quantityRequired;
        li.style.color = sufficient ? '#00ff00' : '#ff4444';
        li.innerHTML = `<span>${mat.name}:</span> ${owned} / ${mat.quantityRequired}`;
        materialsListElement.appendChild(li);
    });
}

function clearRecipeDetails() {
     if (!materialsListElement || !selectedRecipeNameElement || !resultNameElement || !resultDescriptionElement || !craftButtonElement) return;
    selectedRecipeNameElement.textContent = 'Select a Recipe';
    resultNameElement.textContent = '---';
    resultDescriptionElement.textContent = '---';
    materialsListElement.innerHTML = '';
    craftButtonElement.disabled = true;
    craftButtonElement.textContent = 'Craft';
    hideCraftingProgress();
}

function updateCraftButtonState(recipe) {
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

function selectRecipe(recipeId) {
    if (isCrafting) return;
    selectedRecipeId = recipeId;
    console.log(`Selected recipe: ${recipeId}`);
    if (recipeListElement) {
        recipeListElement.querySelectorAll('.recipe-item').forEach(item => {
            const li = item;
            if (li.dataset.recipeId === recipeId) {
                li.classList.add('selected');
            } else {
                li.classList.remove('selected');
            }
        });
    }
    if (recipeId) {
        const recipe = findRecipeById(recipeId);
        if (recipe) {
            updateRecipeDetails(recipe);
            updateCraftButtonState(recipe);
            hideCraftingProgress();
        } else {
            console.error(`Selected recipe ID "${recipeId}" not found in current recipes.`);
            clearRecipeDetails();
        }
    } else {
        clearRecipeDetails();
    }
}

function displayCraftingProgress(craftingTime) {
    if (!craftButtonElement || !progressBarElement || !craftingProgressContainer) {
        console.error("displayCraftingProgress: One or more progress elements are null!");
        return;
    }
    if (craftingTime <= 0) {
        hideCraftingProgress();
        return;
    }
    isCrafting = true;
    craftButtonElement.disabled = true;
    craftButtonElement.textContent = 'Crafting...';
    craftingProgressContainer.style.display = 'block';
    progressBarElement.style.width = '0%';
    progressBarElement.style.transition = 'none';
    void progressBarElement.offsetWidth;
    progressBarElement.style.transition = `width ${craftingTime}s linear`;
    progressBarElement.style.width = '100%';
    setTimeout(() => {
        if (craftButtonElement && craftButtonElement.textContent === 'Crafting...') {
             hideCraftingProgress();
             isCrafting = false;
             const currentRecipe = selectedRecipeId ? findRecipeById(selectedRecipeId) : null;
             if (currentRecipe) {
                 updateCraftButtonState(currentRecipe);
             } else if (craftButtonElement) {
                 craftButtonElement.disabled = true;
             }
        }
    }, craftingTime * 1000);
}

function hideCraftingProgress() {
     if (!progressBarElement || !craftingProgressContainer) {
        console.error("hideCraftingProgress: One or more progress elements are null!");
        return;
     }
     craftingProgressContainer.style.display = 'none';
     progressBarElement.style.width = '0%';
}

function sendToServer(data) {
    console.log("Sending to server:", data);
    if (typeof hytopia !== 'undefined' && hytopia.sendData) {
         hytopia.sendData(data);
    } else {
         console.warn("hytopia.sendData not available. Using postMessage fallback.");
         window.parent.postMessage({ type: 'hytopia-ui-event', payload: data }, '*');
    }
}

function handleServerMessage(data) {
    console.log("[UI LOG] handleServerMessage called with data:", data);
    if (!data || typeof data !== 'object') {
        console.warn("Received invalid data structure from server.");
        return;
    }
    if (data?.type === 'update-crafting-ui') {
        updateCraftingInterface(data.payload);
    } else if (data?.type === 'crafting-started') {
        const recipe = findRecipeById(data.recipeId);
        displayCraftingProgress(recipe?.craftingTime ?? 0);
    } else if (data?.type === 'crafting-complete') {
        console.log(`Server confirmed crafting complete for ${data.recipeId}`);
        hideCraftingProgress();
        isCrafting = false;
        const currentRecipe = selectedRecipeId ? findRecipeById(selectedRecipeId) : null;
             if (currentRecipe) {
                 updateCraftButtonState(currentRecipe);
             }
    } else if (data?.type === 'crafting-failed') {
        console.error(`Server reported crafting failed: ${data.reason}`);
        alert(`Crafting Failed: ${data.reason}`);
        hideCraftingProgress();
        isCrafting = false;
        const currentRecipe = selectedRecipeId ? findRecipeById(selectedRecipeId) : null;
             if (currentRecipe) {
                 updateCraftButtonState(currentRecipe);
             }
    } else if (data?.type === 'show-crafting-ui') {
        console.log("[UI LOG] Received 'show-crafting-ui' message.");
        updateCraftingInterface(data.payload);
        selectRecipe(null);
    } else if (data?.type === 'hide-crafting-ui') {
        console.log("[UI LOG] Received 'hide-crafting-ui' message.");
        if(craftingUIWrapperElement) {
            craftingUIWrapperElement.style.display = 'none';
        }
        selectedRecipeId = null;
        isCrafting = false;
    }
}

function findRecipeById(recipeId) {
    return currentRecipes.find(r => r.id === recipeId);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeCraftingUI();
    initializeMobileControls();
});

if (typeof hytopia !== 'undefined' && hytopia.onData) {
    console.log("[UI LOG] hytopia object found. Registering hytopia.onData listener.");
    hytopia.onData(handleServerMessage);
    console.log("[UI LOG] hytopia.onData listener registered.");
} else {
    console.error("[UI LOG] hytopia object or hytopia.onData not available. UI cannot receive server messages.");
    window.addEventListener('message', (event) => {
         if (event.data?.type?.startsWith('hytopia-')) {
             handleServerMessage(event.data.payload);
         }
    });
    console.warn("Using window.message listener as fallback.");
}

console.log("Combined UI Script loaded.");
