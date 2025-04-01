/**
 * Player Controller for CyberCrawler
 * Handles player movement, physics interactions, and abilities
 */

import { World, Player, PlayerEntity, EntityEvent, Vector3 } from 'hytopia';
import { applyImpulse } from '../physics/physicsSystem';

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

// Map to store player states
const playerStates = new Map<string, PlayerState>();

/**
 * Sets up a player when they join the game
 * @param world The HYTOPIA world instance
 * @param player The player that joined
 */
export function setupPlayer(world: World, player: Player): void {
  // Create player entity
  const playerEntity = new PlayerEntity({
    player,
    // Using a cyberpunk-styled model for the player
    modelUri: 'models/characters/cyber_warrior.gltf',
    modelScale: 1.0,
    modelLoopedAnimations: ['idle'],
    mass: 70, // kg
    // Add collider slightly smaller than the model for better movement
    collider: {
      type: 'capsule',
      radius: 0.4,
      height: 1.8,
      offset: { x: 0, y: 0.9, z: 0 },
    },
    friction: PLAYER_CONSTANTS.GROUND_FRICTION,
    // Use a physics-based character controller
    controllerType: 'physics',
    controllerConfig: {
      walkSpeed: PLAYER_CONSTANTS.MOVEMENT_SPEED,
      sprintSpeed: PLAYER_CONSTANTS.MOVEMENT_SPEED * 1.5,
      jumpHeight: PLAYER_CONSTANTS.JUMP_FORCE,
      airControl: PLAYER_CONSTANTS.AIR_CONTROL,
    },
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
  
  // Setup player input handling
  playerEntity.onPlayerInput(({ input, entity }) => {
    // Handle dash ability on right-click
    if (input.mouseRight && canPlayerDash(player.id)) {
      performDash(entity);
      const state = playerStates.get(player.id);
      if (state) {
        state.lastDashTime = Date.now();
      }
    }
  });

  // Spawn the player at the designated spawn point
  playerEntity.spawn(world, { x: 0, y: 5, z: 0 });
  
  console.log(`Player ${player.displayName} set up with entity ID: ${playerEntity.id}`);
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
 * Checks if player can use dash ability based on cooldown
 */
function canPlayerDash(playerId: string): boolean {
  const state = playerStates.get(playerId);
  if (!state) return false;
  
  const currentTime = Date.now();
  return currentTime - state.lastDashTime >= PLAYER_CONSTANTS.DASH_COOLDOWN;
}

/**
 * Performs a dash in the direction the player is facing
 */
function performDash(entity: PlayerEntity): void {
  const direction = entity.directionFromRotation;
  
  // Apply a strong impulse in the facing direction
  applyImpulse(entity, direction, PLAYER_CONSTANTS.DASH_FORCE * entity.mass);
  
  console.log(`Player ${entity.player.displayName} performed dash`);
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
