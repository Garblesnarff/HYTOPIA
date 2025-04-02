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
} from 'hytopia';

// Import our world generation code
import { generateWorldMap } from './src/world/world-map';
import { PLAYER_CONFIG } from './src/constants/world-config';

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

  /**
   * Handle player joining the game
   */
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    const playerEntity = new PlayerEntity({
      player,
      name: 'Player',
      modelUri: 'models/players/player.gltf',
      modelLoopedAnimations: ['idle'],
      modelScale: 0.5,
    });
    
    // Spawn the player at the designated spawn location
    playerEntity.spawn(world, { 
      x: PLAYER_CONFIG.SPAWN_POSITION.X, 
      y: PLAYER_CONFIG.SPAWN_POSITION.Y, 
      z: PLAYER_CONFIG.SPAWN_POSITION.Z 
    });

    // Load our game UI for this player
    player.ui.load('ui/index.html');

    // Send welcome messages
    world.chatManager.sendPlayerMessage(player, 'Welcome to CyberCrawler!', '00FF00');
    world.chatManager.sendPlayerMessage(player, 'Use WASD to move around.');
    world.chatManager.sendPlayerMessage(player, 'Press space to jump.');
    world.chatManager.sendPlayerMessage(player, 'Hold shift to sprint.');
    world.chatManager.sendPlayerMessage(player, 'Press \\ to enter or exit debug view.');
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
