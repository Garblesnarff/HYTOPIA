/**
 * BasicEnemyEntity - A simple enemy entity for CyberCrawler
 * 
 * Represents a basic enemy with health, damage, and simple AI.
 * Handles taking damage, death, and health bar updates.
 * 
 * Dependencies:
 * - HYTOPIA SDK Entity class
 * - Enemy constants from ../constants/enemy-config
 * - Health bar UI component (to be integrated)
 * 
 * @author Cline
 */

import { Entity, EntityEvent, World, ColliderShape } from 'hytopia';
import {
  BASIC_ENEMY_HEALTH,
  BASIC_ENEMY_DAMAGE,
  BASIC_ENEMY_SPEED,
} from '../../constants/enemy-config';
import { HealthBar } from '../../ui/healthBar';

export class BasicEnemyEntity extends Entity {
  public health: number;
  public maxHealth: number;
  public damage: number;
  public speed: number;
  public lastAttackTime: number = 0;
  public isGrounded: boolean = false; // Track grounded state

  private healthBar: HealthBar | null = null;

  constructor(options: Record<string, any> = {}) {
    super({
      modelUri: 'models/npcs/spider.gltf',
      modelScale: 1,
      modelLoopedAnimations: ['idle'],
      name: 'BasicEnemy',
      rigidBodyOptions: {
        enabledRotations: { x: false, y: true, z: false },
        linearDamping: 0.1,
        angularDamping: 0.1,
        colliders: [
          {
            shape: ColliderShape.BALL, // Use BALL for reliable ground contact
            radius: 0.5,
            collisionGroups: {
              belongsTo: [4], // CollisionGroup.ENTITY
              collidesWith: [8, 1, 4, 2], // PLAYER, BLOCK, ENTITY, ENTITY_SENSOR
            },
          },
        ],
      },
      ...options,
    });

    this.health = BASIC_ENEMY_HEALTH;
    this.maxHealth = BASIC_ENEMY_HEALTH;
    this.damage = BASIC_ENEMY_DAMAGE;
    this.speed = BASIC_ENEMY_SPEED;

    // Add a ground sensor collider to track grounded state
    this.createAndAddChildCollider({
      shape: ColliderShape.CYLINDER,
      radius: 0.3,
      halfHeight: 0.08, // Small sensor
      isSensor: true,
      relativePosition: { x: 0, y: -0.5, z: 0 }, // Just below the ball
      tag: 'groundSensor',
      onCollision: (other: any, started: any) => {
        this.isGrounded = started;
      },
    });

    this.on(EntityEvent.SPAWN, () => {
      if (this.world) {
        this.healthBar = new HealthBar(this, this.health, this.maxHealth);
        this.healthBar.load(this.world);
      }
      this.updateHealthBar();
    });
  }

            
  /**
   * Apply damage to this enemy.
   * @param amount Amount of damage to apply
   */
  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();

    if (this.health <= 0) {
      this.die();
    } else {
      // Optional: flash red or play hit animation
      try {
        this.setTintColor?.({ r: 255, g: 0, b: 0 });
        setTimeout(() => {
          this.setTintColor?.({ r: 255, g: 255, b: 255 });
        }, 200);
      } catch {}
    }
  }

  /**
   * Check if this enemy is dead.
   * @returns true if health <= 0
   */
  public isDead(): boolean {
    return this.health <= 0;
  }

  /**
   * Handle enemy death.
   */
  public die(): void {
    // Play death animation or effects
    try {
      this.startModelOneshotAnimations(['death']);
    } catch {}

    // Hide health bar
    if (this.healthBar) {
      try {
        this.healthBar.unload();
      } catch {}
    }

    // Despawn after short delay
    setTimeout(() => {
      if (this.isSpawned) {
        this.despawn();
      }
    }, 1000);
  }

  /**
   * Update the health bar UI to reflect current health.
   */
  public updateHealthBar(): void {
    if (this.healthBar) {
      try {
        this.healthBar.setHealth(this.health, this.maxHealth);
      } catch {}
    }
  }
}

export default BasicEnemyEntity;
