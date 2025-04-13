/**
 * CyberCrawler Game Entry Point
 * 
 * This is the main entry point for the CyberCrawler game.
 * It initializes the world, generates the terrain and structures,
 * and sets up event handlers for player interactions.
 * 
 * @author CyberCrawler Team
 */


import {
  startServer,
  Audio,
  PlayerEntity,
  PlayerEvent,
  World, // Added World
  Player, // Added Player
  PlayerUIEvent, // Added PlayerUIEvent
  SceneUI, // Import SceneUI for health bar
  BaseEntityControllerEvent,
  WorldEvent, // Import WorldEvent for tick
} from 'hytopia';

import CyberBladeEntity from './src/entities/weapon/weapon-entity';

// Import our world generation code
import { generateWorldMap } from './src/world/world-map';
import { PLAYER_CONFIG } from './src/constants/world-config';
import { setupPlayer, playerStates } from './src/player/playerController'; // Import setupPlayer and playerStates
import { CraftingManager } from './src/crafting/crafting-manager'; // Import CraftingManager

import { spawnMutatedPlants } from './src/world/entities/spawn-mutated-plants';
import { spawnScrapMetal } from './src/world/entities/spawn-scrap-metal';
import { CustomPlayerController } from './src/player/custom-player-controller';
import { spawnEnemiesInArea } from './src/world/entities/spawn-enemies';
// Import Block Health Manager
import { BlockHealthManager } from './src/world/block-health-manager';

// We'll keep the map import as a fallback
import worldMap from './assets/map.json';

/**
 * Map to store player health bar SceneUI instances
 */
const playerHealthBars = new Map();

// Track which players have inventory open
const inventoryOpenPlayers = new Set<string>();

/**
 * Start the CyberCrawler game server
 */
startServer(world => {
  console.log('Starting CyberCrawler server...');

  // Global debug flag for collider/physics wireframe rendering
  let debugEnabled = false;

  // Enable debug visualization of colliders (wireframes)
  // world.simulation.enableDebugRendering(true);
  
  // Use our programmatic world generation instead of loading from JSON
  try {
    console.log('Generating world map...');
    generateWorldMap(world);
    console.log('World generation complete!');
  } catch (error) {
    console.error('Error generating world map:', error);
    console.log('Falling back to JSON map...');
    world.loadMap(worldMap);
  }

  // Initialize Block Health Manager after world generation/loading
  try {
    BlockHealthManager.instance.initialize(world);
  } catch (error) {
    console.error("[Root Index] ERROR during BlockHealthManager init:", error);
  }

  // Initialize Crafting Tables after world generation/loading
  try {
      console.log("[Root Index] Initializing Crafting Manager...");
      CraftingManager.instance.initializeCraftingTables(world);
      console.log("[Root Index] Crafting Manager Initialized.");
  } catch (error) {
      console.error("[Root Index] ERROR during CraftingManager init:", error);
  }

  // Spawn gatherable mutated plants
  try {
    console.log("[Root Index] Spawning mutated plants...");
    spawnMutatedPlants(world);
    console.log("[Root Index] Mutated plants spawned.");
  } catch (error) {
    console.error("[Root Index] ERROR during mutated plant spawn:", error);
  }

  // Spawn gatherable scrap metal
  try {
    console.log("[Root Index] Spawning scrap metal...");
    spawnScrapMetal(world);
    console.log("[Root Index] Scrap metal spawned.");
  } catch (error) {
    console.error("[Root Index] ERROR during scrap metal spawn:", error);
  }

  // Spawn some test enemies
  try {
    console.log("[Root Index] Spawning test enemies...");
    spawnEnemiesInArea(world, {
      min: { x: 20, y: 0, z: 20 },
      max: { x: 100, y: 0, z: 100 },
    }, 3);
    console.log("[Root Index] Test enemies spawned.");

    // AI logic is now handled by the EnemyController attached to each enemy's TICK event
    // Removed world tick listener for AI
  } catch (error) {
    console.error("[Root Index] ERROR during enemy spawn:", error);
  }

  /**
   * Handle player joining the game
   */
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    console.log(`Setting up player ${player.id} using setupPlayer...`);
    // Use setupPlayer from playerController for consistent setup (includes inventory state)
    setupPlayer(world, player);

    // Load our game UI for this player
    player.ui.load('ui/index.html');

    // Get the player's entity (assumes one main entity per player)
    const playerEntities = world.entityManager.getPlayerEntitiesByPlayer(player);
    const playerEntity = playerEntities[0];

    if (playerEntity) {

      // Create and attach a sword weapon entity
      const sword = new CyberBladeEntity();
      sword.spawn(
        world,
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0, w: 1 }
      );
      sword.equip(playerEntity);

      // Hook up attack input to weapon
      const controller = playerEntity.controller;
      if (controller) {
        controller.on(BaseEntityControllerEvent.TICK_WITH_PLAYER_INPUT, ({ input }) => {
          if (input.ml) {
            sword.attack();
            input.ml = false;
          }
        });
      }

      const playerHealthBar = new SceneUI({
        templateId: 'player-healthbar',
        attachedToEntity: playerEntity,
        offset: { x: 0, y: 2, z: 0 },
        state: {
          health: 100,
          maxHealth: 100
        }
      });
      playerHealthBar.load(world);
      playerHealthBars.set(player.id, playerHealthBar);

      // Attach health bar reference to player entity for easy access
      (playerEntity as any).healthBar = playerHealthBar;

      // Add inventory toggle on "V" key press without replacing controller
      if (controller) {
        controller.on(BaseEntityControllerEvent.TICK_WITH_PLAYER_INPUT, async ({ input }) => {
          // Inventory UI toggle
          if (input.v) {
            input.v = false; // consume key press
            if (inventoryOpenPlayers.has(player.id)) {
              player.ui.load('ui/index.html');
              inventoryOpenPlayers.delete(player.id);
            } else {
              player.ui.load('ui/inventory-ui.html');
              inventoryOpenPlayers.add(player.id);

              // Send inventory data
              try {
                const playerState = playerStates.get(player.id);
                const inventory = playerState?.inventory || [];

                const { getResourceById } = await import('./src/crafting/resources/resource-database.js');

                const inventoryMap = new Map();
                inventory.forEach(item => {
                  const existing = inventoryMap.get(item.itemId);
                  if (existing) {
                    existing.quantity += item.quantity;
                  } else {
                    const resource = getResourceById(item.itemId);
                    inventoryMap.set(item.itemId, {
                      name: resource?.name || item.itemId,
                      quantity: item.quantity,
                      iconReference: resource?.iconReference || '',
                    });
                  }
                });

                const { prepareInventoryUIData } = await import('./src/ui/handlers/inventory-ui-handler.js');
                const uiData = prepareInventoryUIData(inventoryMap);

                player.ui.sendData({ type: 'update-inventory', payload: uiData });
              } catch (error) {
                console.error('Error sending inventory data:', error);
              }
            }
          }

          // Debug wireframe toggle on "C" key press
          if (input.c) {
            debugEnabled = !debugEnabled;
            world.simulation.enableDebugRendering(debugEnabled);
            world.chatManager.sendPlayerMessage(player, debugEnabled ? 'Debug rendering ON' : 'Debug rendering OFF', '00FFFF');
            input.c = false; // Prevent rapid toggling
          }
        });
      }

      // TODO: When the player's health changes, update the Scene UI:
      // playerHealthBar.setState({ health: newHealth });
    } else {
      console.warn(`No entity found for player ${player.id}, cannot attach health bar`);
    }

    // TODO: When the player's health changes, update the Scene UI:
    // playerHealthBar.setState({ health: newHealth });

    // Setup listener for UI events *after* the UI has loaded
    if (player.ui) {
        // Use LOAD event name based on TS suggestion
        player.ui.once(PlayerUIEvent.LOAD, () => {
             console.log(`UI loaded for player ${player.id}. Registering DATA listener.`);
             player.ui.on(PlayerUIEvent.DATA, ({ data }) => {
                 // Route UI events to the CraftingManager
                 CraftingManager.instance.handlePlayerUIEvent(player, data);

                 // Handle inventory close request
                 if (data.type === 'close-inventory-request') {
                   player.ui.load('ui/index.html');
                 }
             });
        });
         // Removed ERROR listener for now as the event name is uncertain
         // player.ui.on(PlayerUIEvent.ERROR, ({ error }) => {
         //     console.error(`UI Error for player ${player.id}:`, error);
         // });
    } else {
        // This case might happen if setupPlayer failed to load UI or player disconnected quickly
        console.error(`Cannot setup UI listeners for player ${player.id}: player.ui is not available.`);
    }


    // Send welcome messages (setupPlayer might also send messages, adjust as needed)
    // world.chatManager.sendPlayerMessage(player, 'Welcome to CyberCrawler!', '#00FF00'); // Use # prefix for color
    // world.chatManager.sendPlayerMessage(player, 'Use WASD to move around.');
    // world.chatManager.sendPlayerMessage(player, 'Press space to jump.');
    // world.chatManager.sendPlayerMessage(player, 'Hold shift to sprint.');
    // world.chatManager.sendPlayerMessage(player, 'Press \\ to enter or exit debug view.');
  });

  /**
   * Handle player leaving the game
   */
  world.on(PlayerEvent.LEFT_WORLD, ({ player }) => {
    world.entityManager.getPlayerEntitiesByPlayer(player).forEach(entity => entity.despawn());
  });

  /**
   * Rocket command - launch player into the air
   */
  world.chatManager.registerCommand('/rocket', player => {
    world.entityManager.getPlayerEntitiesByPlayer(player).forEach(entity => {
      entity.applyImpulse({ x: 0, y: 20, z: 0 });
    });
  });

  /**
   * Inventory command - open inventory UI
   */
  world.chatManager.registerCommand('/inventory', async player => {
    try {
      player.ui.load('ui/inventory-ui.html');

      const playerState = playerStates.get(player.id);
      const inventory = playerState?.inventory || [];

      // Build inventory map: itemId -> { name, quantity, iconReference }
      const inventoryMap = new Map();
      const { getResourceById } = await import('./src/crafting/resources/resource-database.js');

      inventory.forEach(item => {
        const existing = inventoryMap.get(item.itemId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          const resource = getResourceById(item.itemId);
          inventoryMap.set(item.itemId, {
            name: resource?.name || item.itemId,
            quantity: item.quantity,
            iconReference: resource?.iconReference || '',
          });
        }
      });

      // Prepare UI data
      const { prepareInventoryUIData } = await import('./src/ui/handlers/inventory-ui-handler.js');
      const uiData = prepareInventoryUIData(inventoryMap);

      // Send to UI
      player.ui.sendData({ type: 'update-inventory', payload: uiData });
    } catch (error) {
      console.error('Error opening inventory UI:', error);
    }
  });

  /**
   * Play ambient background music
   */
  new Audio({
    uri: 'audio/music/hytopia-main.mp3',
    loop: true,
    volume: 0.1,
  }).play(world);
  
  console.log('CyberCrawler server started successfully!');
});
