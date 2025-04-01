/**
 * CyberCrawler - A physics-based rogue-lite dungeon crawler with crafting mechanics
 * Created for HYTOPIA Game Jam 2
 */

import { startServer, Entity, EntityEvent, PlayerEntity, PlayerEvent } from 'hytopia';
import { initPhysics } from './physics/physicsSystem';
import { setupPlayer } from './player/playerController';
import { createTestEnvironment } from './world/testEnvironment';
import { initCombatSystem } from './combat/combatSystem';

/**
 * Main entry point for the CyberCrawler game
 * startServer is the entry point for all HYTOPIA games
 */
startServer(world => {
  console.log('Starting CyberCrawler server...');
  
  // Enable physics debug rendering for development
  world.enablePhysicsDebugRendering();
  
  // Initialize our core systems
  initPhysics(world);
  initCombatSystem(world);
  
  // Create a test environment for initial development
  createTestEnvironment(world);
  
  // Set up player spawning logic
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    console.log(`Player ${player.displayName} joined the world`);
    setupPlayer(world, player);
  });
  
  // Clean up player entities when they leave
  world.on(PlayerEvent.LEFT_WORLD, ({ player }) => {
    console.log(`Player ${player.displayName} left the world`);
    world.entityManager.getAllPlayerEntities(player).forEach(entity => entity.despawn());
  });
  
  console.log('CyberCrawler server started successfully!');
});
