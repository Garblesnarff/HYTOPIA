/**
 * Player Controller for CyberCrawler
 * Handles player movement, physics interactions, and abilities
 */

import { World, Player, PlayerEntity, EntityEvent, Vector3, PlayerInput, PlayerEvent, ColliderShape, WorldLoopEvent, PlayerCameraMode } from 'hytopia'; // Added PlayerCameraMode
import { applyImpulse } from '../physics/physicsSystem';
import { CyberCrawlerController } from './cyberCrawlerController';
import { PLAYER_CONFIG } from '../constants/world-config'; // Import player config for spawn point
import { findGroundHeight } from '../utils/terrain-utils'; // Import ground finding utility
import { InventoryItem } from './inventory-manager'; // Import InventoryItem

// Player movement constants
const PLAYER_CONSTANTS = {
  MOVEMENT_SPEED: 5.0,
  JUMP_FORCE: 8.0,
  DASH_FORCE: 15.0,
  DASH_COOLDOWN: 2000, // milliseconds
  MAX_HEALTH: 100,
  GROUND_FRICTION: 0.3,
  AIR_CONTROL: 0.7,
};

/**
 * Player state tracked per connected player.
 */
interface PlayerState {
  health: number;
  lastDashTime: number;
  cyberEnhancements: string[];
  inventory: InventoryItem[]; // Use the specific InventoryItem type
  lastAttackTime: number; // Timestamp of last melee attack
  isAttacking: boolean;   // Whether player is currently attacking (for animation state)
}

// Map to store player states - Exported for use in custom controller
export const playerStates = new Map<string, PlayerState>();

/**
 * Sets up a player when they join the game
 * @param world The HYTOPIA world instance
 * @param player The player that joined
 */
export function setupPlayer(world: World, player: Player): void {
  // Re-enable the custom controller
  const controller = new CyberCrawlerController();

  // Create player entity
  const playerEntity = new PlayerEntity({
    player,
    controller, // Re-enable assignment of the custom controller instance
    // Using original player model and scale for testing
    modelUri: 'models/players/player.gltf',
    modelScale: 0.5,
    modelLoopedAnimations: ['idle'],
    // Removed custom rigidBodyOptions to use defaults, like original setup
    // rigidBodyOptions: {
    //   colliders: [
    //     {
    //       shape: ColliderShape.CAPSULE,
    //       radius: 0.4,
    //       halfHeight: 1.0,
    //       friction: PLAYER_CONSTANTS.GROUND_FRICTION,
    //     }
    //   ],
    // },
    // Removed controllerConfig as it's likely handled by the custom controller or default physics
    // controllerConfig: {
    //   walkSpeed: PLAYER_CONSTANTS.MOVEMENT_SPEED,
    //   sprintSpeed: PLAYER_CONSTANTS.MOVEMENT_SPEED * 1.5,
    //   jumpHeight: PLAYER_CONSTANTS.JUMP_FORCE,
    //   airControl: PLAYER_CONSTANTS.AIR_CONTROL,
    // },
  });

  // Initialize player state
  const playerState: PlayerState = {
    health: PLAYER_CONSTANTS.MAX_HEALTH,
    lastDashTime: 0,
    cyberEnhancements: [],
    inventory: [], // Initialize as empty array
    lastAttackTime: 0,
    isAttacking: false,
  };
  playerStates.set(player.id, playerState);

  // Setup collision handling
  playerEntity.on(EntityEvent.ENTITY_COLLISION, handlePlayerCollision);

  // Removed incorrect player.on(PlayerEvent.INPUT, ...) handler.
  // Input handling will be done via the custom CyberCrawlerController.

  // Load the player UI
  console.log(`Loading UI for player ${player.id}...`);
  console.log("=== setupPlayer() CALLED, loading UI ===");
  player.ui.load('ui/index.html');
  console.log(`[setupPlayer] Called player.ui.load('ui/index.html') for player ${player.id}`);

  // --- Start: Explicit Camera Setup for Diagnostics ---
  console.log("Setting camera to THIRD_PERSON for diagnostics...");
  player.camera.setMode(PlayerCameraMode.THIRD_PERSON);
  player.camera.setOffset({ x: 0, y: 0, z: -1 }); // Standard behind-and-above offset
  // --- End: Explicit Camera Setup ---

  // Determine the actual spawn position based on config
  const configSpawn = PLAYER_CONFIG.SPAWN_POSITION;
  const spawnPosition = { x: configSpawn.X, y: configSpawn.Y, z: configSpawn.Z };


  // Spawn the player entity at the calculated position
  playerEntity.spawn(world, spawnPosition);

  console.log(`Player ${player.id} spawned at configured position:`, spawnPosition); // Updated log message

  // Send helpful debug message to player
  // NOTE: These messages seem to be missing from the /whereami command handler below.
  // Adding them back here for consistency, assuming they were intended.
  // If not, these lines can be removed later.
  world.chatManager.sendPlayerMessage(player, 'CyberCrawler: Test blocks placed right beneath you!', '00FF00');
  world.chatManager.sendPlayerMessage(player, 'Look down and under you to find the blocks we placed!', '00FF00');
  world.chatManager.sendPlayerMessage(player, 'Type /help for debug commands', '00FF00');

  // Register commands for the player (Moved from index.ts potentially?)
  registerPlayerCommands(world, player);
}


/**
 * Registers standard commands for a given player.
 * NOTE: This function seems to be missing from the provided file content,
 * but the error trace indicates calls originate here. Assuming it exists.
 * If it doesn't, these changes won't apply.
 */
 function registerPlayerCommands(world: World, player: Player): void {
    world.chatManager.registerCommand('/whoareyou', (cmdPlayer) => {
      if (cmdPlayer.id === player.id) {
        world.chatManager.sendPlayerMessage(player, 'I am CyberCrawler, a rogue-lite dungeon crawler game!', '00FFFF'); // Removed #
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
            '00FFFF' // Removed #
          );
        } else {
           world.chatManager.sendPlayerMessage(player, 'Could not find your entity position.', 'FF0000'); // Removed #
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
            '00FFFF' // Removed #
          );
        } else {
           world.chatManager.sendPlayerMessage(player, 'Could not find your entity position to place block.', 'FF0000'); // Removed #
        }
      }
    });
  }

/**
 * Handles player collision with objects and enemies
 */
function handlePlayerCollision({ entity, otherEntity, impactVelocity, started }: any): void {
  // Only process collision start events
  if (!started) return;
  
  console.log(`Player collision with ${otherEntity.id} at velocity: ${impactVelocity}`);
  
  // Handle specific collision logic here
  // For example: damage calculation based on momentum
}

/**
 * Checks if player can use dash ability based on cooldown - Exported
 */
export function canPlayerDash(playerId: string): boolean {
  const state = playerStates.get(playerId);
  if (!state) return false;
  
  const currentTime = Date.now();
  return currentTime - state.lastDashTime >= PLAYER_CONSTANTS.DASH_COOLDOWN;
}

/**
 * Performs a dash in the direction the player is facing - Exported
 */
export function performDash(entity: PlayerEntity): void {
  // Use camera facing direction instead of entity rotation for third-person dash
  const direction = entity.player?.camera?.facingDirection;

  if (!direction) {
    console.error(`Player ${entity.player?.id || 'Unknown'} cannot dash: Camera direction unavailable.`);
    return;
  }
  
  // Apply a strong impulse in the facing direction
  applyImpulse(entity, direction, PLAYER_CONSTANTS.DASH_FORCE * entity.mass); // Try using entity.mass again
  
  console.log(`Player ${entity.player.id} performed dash`); // Changed back to entity.player.id
}

/**
 * Gets the player state for a specific player
 */
export function getPlayerState(playerId: string): PlayerState | undefined {
  return playerStates.get(playerId);
}

/**
 * Updates a player's health
 */
export function updatePlayerHealth(playerId: string, healthChange: number): number {
  const state = playerStates.get(playerId);
  if (!state) return 0;
  
  state.health = Math.max(0, Math.min(PLAYER_CONSTANTS.MAX_HEALTH, state.health + healthChange));
  return state.health;
}
