/**
 * CyberCrawler - A physics-based rogue-lite dungeon crawler with crafting mechanics
 * Created for HYTOPIA Game Jam 2
 */

// Combined imports
import { startServer, Entity, EntityEvent, PlayerEntity, PlayerEvent, World, Player, BlockTypeRegistry, Vector3, WorldEvent, WorldLoopEvent, PlayerUIEvent } from 'hytopia'; // Added WorldLoopEvent, PlayerUIEvent
import { initPhysics } from './physics/physicsSystem';
import { setupPlayer } from './player/playerController';
// import { createTestEnvironment } from './world/testEnvironment'; // Removed - using map.json instead
import { initCombatSystem } from './combat/combatSystem';
import worldMap from '../assets/map.json'; // Import the map file
import { generateSimpleDungeon } from './world/dungeonGenerator'; // Import dungeon generator
import { CraftingManager } from './crafting/crafting-manager'; // Import CraftingManager
// Imports for spawn check no longer needed
// import { findGroundHeight } from './utils/terrain-utils';
// import { WORLD_HEIGHT } from './constants/world-config';

/**
 * Main entry point for the CyberCrawler game
 * startServer is the entry point for all HYTOPIA games
 */
startServer((world: World) => { // Add type annotation for world
  console.log('Starting CyberCrawler server...');

  // Removed isWorldInitialized and pendingPlayers - using polling instead

  // SUPER IMPORTANT: Always enable debug rendering
  world.simulation.enableDebugRendering(true);
  console.log("Debug rendering ENABLED");
  
  // Initialize our core systems
  try {
      console.log("[Index] Initializing Physics...");
      initPhysics(world);
      console.log("[Index] Physics Initialized.");
  } catch (error) {
      console.error("[Index] ERROR during initPhysics:", error);
  }

  try {
      console.log("[Index] Initializing Combat System...");
      initCombatSystem(world);
      console.log("[Index] Combat System Initialized.");
  } catch (error) {
      console.error("[Index] ERROR during initCombatSystem:", error);
  }

  try {
      console.log("[Index] Initializing Crafting Manager...");
      CraftingManager.instance.initializeCraftingTables(world); // Initialize Crafting Tables
      console.log("[Index] Crafting Manager Initialized.");
  } catch (error) {
      console.error("[Index] ERROR during CraftingManager init:", error);
  }

  // Register custom block types BEFORE trying to use them
  registerCustomBlockTypes(world.blockTypeRegistry);

  // Load the map from the JSON file
  world.loadMap(worldMap);

  // CRITICAL: Always enable debug rendering
  world.simulation.enableDebugRendering(true);
  
  // Add test blocks right at spawn position for visibility testing
  console.log("Placing test blocks at origin...");
  world.chunkLattice?.setBlock({ x: 0, y: 0, z: 0 }, 20); // Stone brick at exact origin
  world.chunkLattice?.setBlock({ x: 1, y: 0, z: 0 }, 20); // Stone brick adjacent
  world.chunkLattice?.setBlock({ x: 0, y: 0, z: 1 }, 20); // Stone brick adjacent
  world.chunkLattice?.setBlock({ x: 0, y: 1, z: 0 }, 100); // Scrap at exact origin but 1 block up
  
  // Generate dungeon room right at spawn
  console.log("Generating dungeon room at spawn position...");
  generateSimpleDungeon(world, new Vector3(2, 0, 2), 10, 4, 10); // Smaller, very close to spawn

  // --- Player Setup and Command Registration ---

  /**
   * Registers standard commands for a given player.
   * @param world The world instance.
   * @param player The player to register commands for.
   */
  function registerPlayerCommands(world: World, player: Player): void {
    world.chatManager.registerCommand('/whoareyou', (cmdPlayer) => {
      if (cmdPlayer.id === player.id) {
        world.chatManager.sendPlayerMessage(player, 'I am CyberCrawler, a rogue-lite dungeon crawler game!', '#00FFFF');
      }
    });

    world.chatManager.registerCommand('/whereami', (cmdPlayer) => {
      if (cmdPlayer.id === player.id) {
        const entity = world.entityManager.getPlayerEntitiesByPlayer(player)[0];
        if (entity && entity.position) {
          const pos = entity.position;
          world.chatManager.sendPlayerMessage(
            player,
            `You are at position X:${Math.floor(pos.x)} Y:${Math.floor(pos.y)} Z:${Math.floor(pos.z)}`,
            '#00FFFF'
          );
        } else {
           world.chatManager.sendPlayerMessage(player, 'Could not find your entity position.', 'FF0000');
        }
      }
    });

    world.chatManager.registerCommand('/showblocks', (cmdPlayer) => {
      if (cmdPlayer.id === player.id) {
        const entity = world.entityManager.getPlayerEntitiesByPlayer(player)[0];
        if (entity && entity.position) {
          const pos = entity.position;
          world.chunkLattice?.setBlock(
            { x: Math.floor(pos.x), y: Math.floor(pos.y)-1, z: Math.floor(pos.z) },
            20 // Assuming 20 is Stone Brick based on previous context
          );
          world.chatManager.sendPlayerMessage(
            player,
            `Placed a test block at your feet (${Math.floor(pos.x)},${Math.floor(pos.y)-1},${Math.floor(pos.z)})`,
            '#00FFFF'
          );
        } else {
           world.chatManager.sendPlayerMessage(player, 'Could not find your entity position to place block.', 'FF0000');
        }
      }
    });
  }

  /**
   * Handles the full setup for a player, including entity creation and command registration.
   * @param world The world instance.
   * @param player The player to set up.
   */
  function handlePlayerSetup(world: World, player: Player): void {
    console.log(`Setting up player ${player.id}...`);
    setupPlayer(world, player); // Spawns the entity, loads UI via player.ui.load() inside setupPlayer
    registerPlayerCommands(world, player); // Registers commands

    // Setup listener for UI events from this player
    if (player.ui) {
        player.ui.on(PlayerUIEvent.DATA, ({ data }) => {
            // Route UI events to the CraftingManager
            CraftingManager.instance.handlePlayerUIEvent(player, data);
        });
        console.log(`Registered UI event listener for player ${player.id}`);
    } else {
        console.error(`Failed to register UI event listener for player ${player.id}: player.ui is not available.`);
    }
  }

  // --- Event Listeners ---

  // Handle players joining the world - Use polling to wait for chunkLattice
  world.on(PlayerEvent.JOINED_WORLD, ({ player }: { player: Player }) => {
    console.log(`Player ${player.id} joined the world. Starting check for chunkLattice...`);

    const checkInterval = 100; // ms
    let checkAttempts = 0;
    const maxCheckAttempts = 100; // ~10 seconds total wait time

    function checkAndSetupPlayer() {
      checkAttempts++;
      if (world.chunkLattice) {
        console.log(`chunkLattice found for player ${player.id} after ${checkAttempts} attempts. Proceeding with setup.`);
        handlePlayerSetup(world, player);
      } else if (checkAttempts < maxCheckAttempts) {
        console.log(`chunkLattice not found for player ${player.id} (Attempt ${checkAttempts}/${maxCheckAttempts}). Retrying in ${checkInterval}ms...`);
        setTimeout(checkAndSetupPlayer, checkInterval);
      } else {
        console.error(`Failed to find chunkLattice for player ${player.id} after ${maxCheckAttempts} attempts. Player setup aborted.`);
        // Optionally send a message to the player
        world.chatManager.sendPlayerMessage(player, "Error: World data failed to load. Cannot spawn character.", "#FF0000");
      }
    }

    // Start the check
    checkAndSetupPlayer();
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

/**
 * Registers custom block types for the game.
 * @param registry The world's block type registry.
 */
function registerCustomBlockTypes(registry: BlockTypeRegistry): void {
  console.log("Registering custom block types...");

  // Scrap Metal Pile (ID 100)
  registry.registerGenericBlockType({
    id: 100,
    name: 'Scrap Metal Pile',
    textureUri: 'blocks/gravel.png', // Using gravel texture as placeholder
    // TODO: Add interaction logic later (e.g., onInteract or via raycast check)
  });

  console.log("Custom block types registered.");
}
