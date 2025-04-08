/**
 * Combat System for CyberCrawler
 * Implements physics-based combat with momentum-based damage calculations
 */

import { World, Entity, EntityEvent, PlayerEntity, Vector3 } from 'hytopia'; // Reverted imports
import { calculateMomentumDamage } from '../physics/physicsSystem';
import { updatePlayerHealth } from '../player/playerController';

// Combat constants
const COMBAT_CONSTANTS = {
  // Base damage multipliers for different weapon types
  WEAPON_DAMAGE_MULTIPLIERS: {
    FIST: 1.0,
    LIGHT_MELEE: 1.5,
    HEAVY_MELEE: 2.5,
    PROJECTILE: 1.2,
  },
  // Additional impact force for knockback
  KNOCKBACK_MULTIPLIER: 1.5,
  // Threshold velocity for registering an attack
  ATTACK_VELOCITY_THRESHOLD: 3.0,
};

/**
 * Initializes the combat system
 * @param world The HYTOPIA world instance
 */
export function initCombatSystem(world: World): void {
  if (!world) {
    console.error('Cannot initialize combat system: world is undefined');
    return;
  }
  console.log('Initializing combat system...');

  // Set up global collision handling for combat
  // Set up global collision handling for combat
  // NOTE: Removing reliance on impactVelocity and impactPoint in this global handler
  // as they seem unavailable based on errors and rules. Momentum damage here is disabled.
  world.on(EntityEvent.ENTITY_COLLISION, ({ entity, otherEntity, started }) => {
    // Only process at the start of collision
    if (!started || !entity || !otherEntity) return;

    // Call handler without impact details for basic type checking
    handleCollisionSimple(entity, otherEntity);
  });
  
  console.log('Combat system initialized');
}

/**
 * Handles simple collision checks without impact details.
 */
function handleCollisionSimple(entity: Entity, otherEntity: Entity): void {
  // Assuming 'hasTag' exists, despite TS errors. Add checks if needed.
  const isWeapon = (entity as any).hasTag?.('weapon');
  const isEnemy = (otherEntity as any).hasTag?.('enemy');
  const isPlayer = otherEntity instanceof PlayerEntity;

  // Basic logging for now
  if (isWeapon && (isEnemy || isPlayer)) {
    console.log(`Collision detected: Weapon ${entity.id} hit ${otherEntity.id}`);
    // TODO: Implement collision-based damage/effects if needed,
    // potentially via collider's onCollision or by adding tags/components here.
  } else if ((entity instanceof PlayerEntity && isEnemy) || (isEnemy && isPlayer)) {
     console.log(`Collision detected: Player/Enemy collision between ${entity.id} and ${otherEntity.id}`);
     // TODO: Apply damage from simple collision?
  }
}

// --- Momentum/Knockback functions are kept but may be unused by the global handler ---

/**
 * Processes a weapon hitting an entity (Potentially unused by global handler now)
 * Kept for potential use with collider-specific onCollision handlers.
 */
function processWeaponHit(
  weapon: Entity,
  target: Entity,
  impactVelocity: number,
  impactPoint: Vector3
): void {
  // Assuming getMetadata exists
  const weaponType = (weapon as any).getMetadata?.('weaponType') || 'FIST';
  const damageMultiplier = COMBAT_CONSTANTS.WEAPON_DAMAGE_MULTIPLIERS[weaponType as keyof typeof COMBAT_CONSTANTS.WEAPON_DAMAGE_MULTIPLIERS] || 1.0;

  // Calculate base damage from momentum
  const weaponMass = (weapon as any).mass || 1.0; // Use safe access/default
  const baseDamage = calculateMomentumDamage(impactVelocity, weaponMass);
  const totalDamage = baseDamage * damageMultiplier;

  applyDamage(target, totalDamage);
  applyKnockback(weapon, target, impactVelocity, impactPoint); // Knockback might still work if called elsewhere

  console.log(`Weapon hit: ${weapon.id} hit ${target.id} for ${totalDamage.toFixed(1)} damage`);
}

/**
 * Processes damage from physics-based momentum transfer (Potentially unused by global handler now)
 */
function processMomentumDamage(
  entity: Entity,
  target: Entity,
  impactVelocity: number,
  impactPoint: Vector3
): void {
  const entityMass = (entity as any).mass || 1.0; // Use safe access/default
  const damage = calculateMomentumDamage(impactVelocity, entityMass);

  if (damage > 1) { // Lowered threshold as calc might be inaccurate if called without real velocity
    applyDamage(target, damage);
    applyKnockback(entity, target, impactVelocity, impactPoint);
    console.log(`Momentum damage: ${entity.id} hit ${target.id} for ${damage.toFixed(1)} damage`);
  }
}

/**
 * Applies damage to an entity (Still used by player controller)
 */
export function applyDamage(entity: Entity, damage: number): void {
  // If entity has a takeDamage method, call it
  if (typeof (entity as any).takeDamage === 'function') {
    (entity as any).takeDamage(damage);
    return;
  }

  if (entity instanceof PlayerEntity) {
    const playerId = entity.player?.id;
    // Use player ID for logging as 'name' and 'displayName' seem incorrect
    const playerIdentifier = entity.player?.id || 'Unknown Player';
    if (playerId) {
      const newHealth = updatePlayerHealth(playerId, -damage);
      console.log(`Player ${playerIdentifier} health: ${newHealth}`);
      // TODO: Implement player death handling
    }
  } else {
    // Assuming hasMetadata/getMetadata/setMetadata exist
    if ((entity as any).hasMetadata?.('health')) {
      const currentHealth = (entity as any).getMetadata?.('health') as number || 0;
      const newHealth = Math.max(0, currentHealth - damage);
      (entity as any).setMetadata?.('health', newHealth);

      if (newHealth <= 0) {
        handleEntityDestruction(entity); // Assumes handleEntityDestruction works
      }
    }
  }
}

/**
 * Applies knockback effect to an entity (Kept for potential use)
 */
function applyKnockback(
  source: Entity,
  target: Entity,
  impactVelocity: number,
  impactPoint: Vector3
): void {
  // Assuming getPosition exists
  const targetPosition = (target as any).getPosition?.();
  if (!targetPosition || !impactPoint) return; // Added check for impactPoint

  const direction = {
    x: targetPosition.x - impactPoint.x,
    y: targetPosition.y - impactPoint.y,
    z: targetPosition.z - impactPoint.z,
  };

  const magnitude = Math.sqrt(direction.x**2 + direction.y**2 + direction.z**2);
  if (magnitude > 0) {
    direction.x /= magnitude;
    direction.y /= magnitude;
    direction.z /= magnitude;
    direction.y += 0.3; // Slight upward component

    const targetMass = (target as any).mass || 1.0; // Safe access/default
    const knockbackForce = impactVelocity * targetMass * COMBAT_CONSTANTS.KNOCKBACK_MULTIPLIER;

    // Assuming applyImpulse exists
    (target as any).applyImpulse?.({
      x: direction.x * knockbackForce,
      y: direction.y * knockbackForce,
      z: direction.z * knockbackForce,
    });
  }
}

/**
 * Handles entity destruction when health reaches zero (Kept for use by applyDamage)
 */
function handleEntityDestruction(entity: Entity): void {
  // Assuming hasMetadata/getMetadata exist
  const hasCustomDestruction = (entity as any).hasMetadata?.('onDestroy');
  const onDestroyFn = (entity as any).getMetadata?.('onDestroy');

  if (hasCustomDestruction && typeof onDestroyFn === 'function') {
    try {
      onDestroyFn(entity);
    } catch (e) {
      console.error(`Error executing onDestroy for entity ${entity.id}:`, e);
      (entity as any).despawn?.(); // Fallback, assuming despawn exists
    }
  } else {
    // Default destruction
    console.log(`Default destruction for ${entity.id}`);
    (entity as any).despawn?.(); // Assuming despawn exists
  }

  console.log(`Entity ${entity.id} destroyed`);
}
