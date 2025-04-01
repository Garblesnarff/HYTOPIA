/**
 * CyberCrawler - A sci-fi rogue-lite dungeon crawler for HYTOPIA Game Jam 2
 * Main entry point for the game server
 */

import { startServer } from 'hytopia';
import worldMap from './assets/map.json';

// This is just a placeholder that will be expanded as we develop the game
startServer(world => {
  console.log('CyberCrawler server starting...');
  
  // Enable debug rendering during development
  world.simulation.enableDebugRendering(true);
  
  // TODO: Initialize game systems
  // TODO: Setup player spawn area
  // TODO: Configure resource generation
  // TODO: Setup dungeon entrance
  
  console.log('CyberCrawler server running!');
});
