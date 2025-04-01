/**
 * Physics System for CyberCrawler
 * Handles momentum-based damage calculations and physics interactions
 */

import { World, Entity, Vector3 } from 'hytopia';

// Physics constants - can be tweaked for game feel
export const PHYSICS_CONSTANTS = {
  GRAVITY: 9.8,
  MOMENTUM_DAMAGE_MULTIPLIER: 0.05,
  MIN_IMPACT_VELOCITY: 5.0,
  MAX_IMPACT_FORCE: 100.0,
};

/**
 * Initializes the physics system for the game
 * @param world The HYTOPIA world instance
 */
export function initPhysics(world: World): void {
  console.log('Initializing physics system...');
  
  // Set world gravity
  world.setGravity(0, -PHYSICS_CONSTANTS.GRAVITY, 0);
  
  console.log('Physics system initialized');
}

/**
 * Calculates damage based on impact momentum
 * Takes into account relative velocity and mass
 * @param impactVelocity The velocity at impact
 * @param entityMass The mass of the entity
 * @returns The calculated damage amount
 */
export function calculateMomentumDamage(impactVelocity: number, entityMass: number): number {
  // Only apply damage if impact exceeds minimum threshold
  if (impactVelocity < PHYSICS_CONSTANTS.MIN_IMPACT_VELOCITY) {
    return 0;
  }
  
  // Calculate damage based on momentum (mass * velocity)
  const momentum = entityMass * impactVelocity;
  const damage = momentum * PHYSICS_CONSTANTS.MOMENTUM_DAMAGE_MULTIPLIER;
  
  // Cap damage to prevent extreme values
  return Math.min(damage, PHYSICS_CONSTANTS.MAX_IMPACT_FORCE);
}

/**
 * Applies an impulse force to an entity
 * @param entity The entity to apply force to
 * @param direction The direction vector of the force
 * @param magnitude The magnitude of the force
 */
export function applyImpulse(entity: Entity, direction: Vector3, magnitude: number): void {
  // Normalize direction if it's not already
  const normalizedDir = normalizeVector(direction);
  
  // Apply the impulse
  entity.applyImpulse({
    x: normalizedDir.x * magnitude,
    y: normalizedDir.y * magnitude,
    z: normalizedDir.z * magnitude,
  });
}

/**
 * Normalizes a vector to have magnitude of 1
 * @param vector The vector to normalize
 * @returns The normalized vector
 */
function normalizeVector(vector: Vector3): Vector3 {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  
  // Prevent division by zero
  if (magnitude === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
    z: vector.z / magnitude,
  };
}
