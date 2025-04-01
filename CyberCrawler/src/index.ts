/**
 * CyberCrawler - A physics-based rogue-lite dungeon crawler with crafting mechanics
 * Created for HYTOPIA Game Jam 2
 */

import { startServer, Entity, EntityEvent, PlayerEntity, PlayerEvent, World, Player } from 'hytopia'; // Added World and Player here
import { initPhysics } from './physics/physicsSystem';
import { setupPlayer } from './player/playerController';
// import { createTestEnvironment } from './world/testEnvironment'; // Removed - using map.json instead
import { initCombatSystem } from './combat/combatSystem';
import worldMap from '../assets/map.json'; // Import the map file

/**
 * Main entry point for the CyberCrawler game
 * startServer is the entry point for all HYTOPIA games
 */
startServer((world: World) => { // Add type annotation for world
  console.log('Starting CyberCrawler server...');
  
  // Enable physics debug rendering for development
  world.simulation.enableDebugRendering(true); // Corrected based on docs
  
  // Initialize our core systems
  initPhysics(world);
  initCombatSystem(world);

  // Load the map from the JSON file
  world.loadMap(worldMap);
  
  // Set up player spawning logic
  world.on(PlayerEvent.JOINED_WORLD, ({ player }: { player: Player }) => { // Add type annotation for player
    console.log(`Player ${player.id} joined the world`); // Changed to player.id
    setupPlayer(world, player);
  });
  
  // Clean up player entities when they leave
  world.on(PlayerEvent.LEFT_WORLD, ({ player }: { player: Player }) => { // Add type annotation for player
    console.log(`Player ${player.id} left the world`); // Changed to player.id
    // Get all player entities and filter for the one belonging to the leaving player
    world.entityManager.getAllPlayerEntities() 
      .filter((entity: PlayerEntity) => entity.player?.id === player.id) 
      .forEach((entity: PlayerEntity) => entity.despawn());
  });
  
  console.log('CyberCrawler server started successfully!');
});
