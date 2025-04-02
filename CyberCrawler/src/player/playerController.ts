/**
 * Player Controller for CyberCrawler
 * Handles player movement, physics interactions, and abilities
 */

import { World, Player, PlayerEntity, EntityEvent, Vector3, PlayerInput, PlayerEvent, ColliderShape, WorldLoopEvent } from 'hytopia'; // Added PlayerInput, PlayerEvent, ColliderShape, WorldLoopEvent
import { applyImpulse } from '../physics/physicsSystem';
import { CyberCrawlerController } from './cyberCrawlerController'; // Import the custom controller

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

// Track player state
interface PlayerState {
  health: number;
  lastDashTime: number;
  cyberEnhancements: string[];
  inventory: any[];
}

// Map to store player states - Exported for use in custom controller
export const playerStates = new Map<string, PlayerState>();

/**
 * Sets up a player when they join the game
 * @param world The HYTOPIA world instance
 * @param player The player that joined
 */
export function setupPlayer(world: World, player: Player): void {
  // Instantiate the custom controller
  const controller = new CyberCrawlerController();

  // Create player entity
  const playerEntity = new PlayerEntity({
    player,
    controller, // Assign the custom controller instance
    // Using a cyberpunk-styled model for the player
    modelUri: 'models/characters/cyber_warrior.gltf',
    modelScale: 1.0,
    modelLoopedAnimations: ['idle'],
    // Define rigid body options
    rigidBodyOptions: {
      // mass: 70, // Removed - TS Error: Property 'mass' does not exist on type 'RigidBodyOptions'.
      // Define colliders as an array inside rigidBodyOptions
      colliders: [
        {
          shape: ColliderShape.CAPSULE, // Use ColliderShape enum
          radius: 0.4,
          halfHeight: 1.0, // Changed from height: 1.8
          // offset: { x: 0, y: 0.9, z: 0 }, // Removed - TS Error: Property 'offset' does not exist
          friction: PLAYER_CONSTANTS.GROUND_FRICTION, // Moved friction inside the collider definition
        }
      ],
      // friction: PLAYER_CONSTANTS.GROUND_FRICTION, // Removed from here
    },
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
    inventory: [],
  };
  playerStates.set(player.id, playerState);

  // Setup collision handling
  playerEntity.on(EntityEvent.ENTITY_COLLISION, handlePlayerCollision);

  // Removed incorrect player.on(PlayerEvent.INPUT, ...) handler.
  // Input handling will be done via the custom CyberCrawlerController.

  // Spawn the player at the designated spawn point
  const spawnPosition = { x: 0, y: 2, z: 0 }; // Spawn directly above our test blocks at origin
  playerEntity.spawn(world, spawnPosition);
  
  console.log(`Player ${player.id} spawned at position:`, spawnPosition);
  
  // Send helpful debug message to player
  world.chatManager.sendPlayerMessage(player, 'CyberCrawler: Test blocks placed right beneath you!', '#00FF00');
  world.chatManager.sendPlayerMessage(player, 'Look down and under you to find the blocks we placed!', '#00FF00');
  world.chatManager.sendPlayerMessage(player, 'Type /help for debug commands', '#00FF00');
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
  const direction = entity.directionFromRotation;
  
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
