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
} from 'hytopia';

// Import our world generation code
import { generateWorldMap } from './src/world/world-map';
import { PLAYER_CONFIG } from './src/constants/world-config';
import { setupPlayer } from './src/player/playerController'; // Import setupPlayer
import { CraftingManager } from './src/crafting/crafting-manager'; // Import CraftingManager

// We'll keep the map import as a fallback
import worldMap from './assets/map.json';

/**
 * Map to store player health bar SceneUI instances
 */
const playerHealthBars = new Map();

/**
 * Start the CyberCrawler game server
 */
startServer(world => {
  console.log('Starting CyberCrawler server...');
  
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

  // Initialize Crafting Tables after world generation/loading
  try {
      console.log("[Root Index] Initializing Crafting Manager...");
      CraftingManager.instance.initializeCraftingTables(world);
      console.log("[Root Index] Crafting Manager Initialized.");
  } catch (error) {
      console.error("[Root Index] ERROR during CraftingManager init:", error);
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
   * Play ambient background music
   */
  new Audio({
    uri: 'audio/music/hytopia-main.mp3',
    loop: true,
    volume: 0.1,
  }).play(world);
  
  console.log('CyberCrawler server started successfully!');
});
