/**
 * Combat System for CyberCrawler
 * Implements physics-based combat with momentum-based damage calculations
 */

import { World, Entity, EntityEvent, PlayerEntity, Vector3 } from 'hytopia';
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
  console.log('Initializing combat system...');
  
  // Set up global collision handling for combat
  world.on(EntityEvent.ENTITY_COLLISION, ({ entity, otherEntity, impactVelocity, impactPoint, started }) => {
    // Only process at the start of collision
    if (!started) return;
    
    // Skip if velocity is below attack threshold
    if (impactVelocity < COMBAT_CONSTANTS.ATTACK_VELOCITY_THRESHOLD) return;
    
    handleCombatCollision(entity, otherEntity, impactVelocity, impactPoint);
  });
  
  console.log('Combat system initialized');
}

/**
 * Handles potential combat collision between entities
 */
function handleCombatCollision(
  entity: Entity, 
  otherEntity: Entity, 
  impactVelocity: number,
  impactPoint: Vector3
): void {
  // Determine if this is a weapon hitting an entity
  const isWeapon = entity.hasTag('weapon');
  const isEnemy = otherEntity.hasTag('enemy');
  const isPlayer = otherEntity instanceof PlayerEntity;
  
  // Process weapon hitting enemy
  if (isWeapon && isEnemy) {
    processWeaponHit(entity, otherEntity, impactVelocity, impactPoint);
  }
  // Process weapon hitting player
  else if (isWeapon && isPlayer) {
    processWeaponHit(entity, otherEntity, impactVelocity, impactPoint);
  }
  // Process physics-based collision damage (momentum transfer)
  else if (impactVelocity > COMBAT_CONSTANTS.ATTACK_VELOCITY_THRESHOLD) {
    processMomentumDamage(entity, otherEntity, impactVelocity, impactPoint);
  }
}

/**
 * Processes a weapon hitting an entity
 */
function processWeaponHit(
  weapon: Entity, 
  target: Entity, 
  impactVelocity: number,
  impactPoint: Vector3
): void {
  // Get weapon type to determine damage multiplier
  const weaponType = weapon.getMetadata('weaponType') || 'FIST';
  const damageMultiplier = COMBAT_CONSTANTS.WEAPON_DAMAGE_MULTIPLIERS[weaponType] || 1.0;
  
  // Calculate base damage from momentum
  const baseDamage = calculateMomentumDamage(impactVelocity, weapon.mass);
  
  // Apply weapon-specific multiplier
  const totalDamage = baseDamage * damageMultiplier;
  
  // Apply damage to target
  applyDamage(target, totalDamage);
  
  // Apply knockback effect based on impact
  applyKnockback(weapon, target, impactVelocity, impactPoint);
  
  console.log(`Weapon hit: ${weapon.id} hit ${target.id} for ${totalDamage.toFixed(1)} damage`);
}

/**
 * Processes damage from physics-based momentum transfer
 */
function processMomentumDamage(
  entity: Entity, 
  target: Entity, 
  impactVelocity: number,
  impactPoint: Vector3
): void {
  // Calculate damage based on momentum
  const damage = calculateMomentumDamage(impactVelocity, entity.mass);
  
  // Only apply significant damage
  if (damage > 5) {
    applyDamage(target, damage);
    
    // Apply physics-based knockback
    applyKnockback(entity, target, impactVelocity, impactPoint);
    
    console.log(`Momentum damage: ${entity.id} hit ${target.id} for ${damage.toFixed(1)} damage`);
  }
}

/**
 * Applies damage to an entity
 */
function applyDamage(entity: Entity, damage: number): void {
  // Handle player damage
  if (entity instanceof PlayerEntity) {
    const newHealth = updatePlayerHealth(entity.player.id, -damage);
    console.log(`Player ${entity.player.displayName} health: ${newHealth}`);
    
    // TODO: Implement player death handling
  }
  // Handle enemy/object damage
  else if (entity.hasMetadata('health')) {
    const currentHealth = entity.getMetadata('health') || 0;
    const newHealth = Math.max(0, currentHealth - damage);
    
    entity.setMetadata('health', newHealth);
    
    // Handle entity destruction if health reaches zero
    if (newHealth <= 0) {
      handleEntityDestruction(entity);
    }
  }
}

/**
 * Applies knockback effect to an entity
 */
function applyKnockback(
  source: Entity, 
  target: Entity, 
  impactVelocity: number,
  impactPoint: Vector3
): void {
  // Calculate direction from impact to target center
  const targetPosition = target.getPosition();
  const direction = {
    x: targetPosition.x - impactPoint.x,
    y: targetPosition.y - impactPoint.y,
    z: targetPosition.z - impactPoint.z,
  };
  
  // Normalize direction
  const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
  
  if (magnitude > 0) {
    direction.x /= magnitude;
    direction.y /= magnitude;
    direction.z /= magnitude;
    
    // Add slight upward component for better visual effect
    direction.y += 0.3;
    
    // Apply impulse for knockback
    const knockbackForce = impactVelocity * target.mass * COMBAT_CONSTANTS.KNOCKBACK_MULTIPLIER;
    
    target.applyImpulse({
      x: direction.x * knockbackForce,
      y: direction.y * knockbackForce,
      z: direction.z * knockbackForce,
    });
  }
}

/**
 * Handles entity destruction when health reaches zero
 */
function handleEntityDestruction(entity: Entity): void {
  // Check if entity has special destruction handling
  const hasCustomDestruction = entity.hasMetadata('onDestroy');
  
  if (hasCustomDestruction) {
    // Execute custom destruction logic
    const onDestroyFn = entity.getMetadata('onDestroy');
    if (typeof onDestroyFn === 'function') {
      onDestroyFn(entity);
    }
  } else {
    // Default destruction behavior
    // TODO: Add particle effects, sound, and loot drops
    
    // Despawn the entity
    entity.despawn();
  }
  
  console.log(`Entity ${entity.id} destroyed`);
}
