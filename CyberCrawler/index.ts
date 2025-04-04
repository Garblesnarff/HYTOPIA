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
} from 'hytopia';

// Import our world generation code
import { generateWorldMap } from './src/world/world-map';
import { PLAYER_CONFIG } from './src/constants/world-config';
import { setupPlayer } from './src/player/playerController'; // Import setupPlayer
import { CraftingManager } from './src/crafting/crafting-manager'; // Import CraftingManager

// We'll keep the map import as a fallback
import worldMap from './assets/map.json';

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

    // Load our game UI for this player (setupPlayer might already do this, check playerController.ts if needed)
    // Assuming setupPlayer doesn't load UI, load it here. If it does, this line can be removed.
    // player.ui.load('ui/index.html'); // Let's assume setupPlayer handles UI loading for now based on previous context.

    // Setup listener for UI events from this player
    // Add a small delay or check to ensure player.ui is ready after setupPlayer potentially loads it
    setTimeout(() => {
        if (player.ui) {
            player.ui.on(PlayerUIEvent.DATA, ({ data }) => {
                // Route UI events to the CraftingManager
                CraftingManager.instance.handlePlayerUIEvent(player, data);
            });
            console.log(`Registered UI event listener for player ${player.id}`);
        } else {
            console.error(`Failed to register UI event listener for player ${player.id}: player.ui is not available after setup.`);
        }
    }, 500); // Small delay to allow UI load potentially initiated by setupPlayer

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
