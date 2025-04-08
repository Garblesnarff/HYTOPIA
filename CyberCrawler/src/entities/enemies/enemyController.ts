/**
 * EnemyController - Simple AI controller for basic enemies
 * 
 * Implements a basic state machine: IDLE, CHASE, ATTACK.
 * Handles player detection, chasing, and attacking with cooldown.
 * 
 * Dependencies:
 * - HYTOPIA SDK BaseEntityController, PlayerEntity
 * - Enemy constants from ../../constants/enemy-config
 * - BasicEnemyEntity class
 * 
 * @author Cline
 */

import { BaseEntityController, Entity, EntityEvent, PlayerEntity } from 'hytopia';
import {
  BASIC_ENEMY_DETECTION_RANGE,
  BASIC_ENEMY_ATTACK_RANGE,
  BASIC_ENEMY_ATTACK_COOLDOWN_MS,
} from '../../constants/enemy-config';
import BasicEnemyEntity from './basicEnemy';

enum EnemyState {
  IDLE = 'IDLE',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
}

export class EnemyController extends BaseEntityController {
  private state: EnemyState = EnemyState.IDLE;
  private targetPlayer: PlayerEntity | null = null;

  /**
   * Called every tick for AI updates.
   * @param entity The enemy entity
   * @param deltaTimeMs Time since last tick
   */
  public override tick(entity: Entity, deltaTimeMs: number): void {
    if (!(entity instanceof BasicEnemyEntity) || !entity.world) return;

    const world = entity.world;

    // Find nearest player within detection range
    const players = world.entityManager.getAllPlayerEntities();
    let nearestPlayer: PlayerEntity | null = null;
    let nearestDist = Infinity;

    for (const player of players) {
      const dx = player.position.x - entity.position.x;
      const dy = player.position.y - entity.position.y;
      const dz = player.position.z - entity.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestPlayer = player;
      }
    }

    if (!nearestPlayer || nearestDist > BASIC_ENEMY_DETECTION_RANGE) {
      this.state = EnemyState.IDLE;
      this.targetPlayer = null;
    } else if (nearestDist > BASIC_ENEMY_ATTACK_RANGE) {
      this.state = EnemyState.CHASE;
      this.targetPlayer = nearestPlayer;
    } else {
      this.state = EnemyState.ATTACK;
      this.targetPlayer = nearestPlayer;
    }

    switch (this.state) {
      case EnemyState.IDLE:
        this.idle(entity);
        break;
      case EnemyState.CHASE:
        this.chase(entity, this.targetPlayer!);
        break;
      case EnemyState.ATTACK:
        this.attack(entity, this.targetPlayer!);
        break;
    }
  }

  /**
   * Idle behavior.
   */
  private idle(entity: BasicEnemyEntity): void {
    // Stop movement animations
    try {
      entity.stopModelAnimations(['walk', 'run']);
      entity.startModelLoopedAnimations(['idle']);
    } catch {}
    // TODO: Add wandering or idle animations
  }

  /**
   * Chase the target player.
   */
  private chase(entity: BasicEnemyEntity, player: PlayerEntity): void {
    const controller = entity.controller as any;
    if (controller?.move && controller?.face) {
      controller.move(player.position, entity.speed);
      controller.face(player.position, entity.speed * 2);
    }

    try {
      entity.stopModelAnimations(['idle']);
      entity.startModelLoopedAnimations(['walk']);
    } catch {}
  }

  /**
   * Attack the target player if cooldown expired.
   */
  private attack(entity: BasicEnemyEntity, player: PlayerEntity): void {
    const now = Date.now();
    if (now - entity.lastAttackTime < BASIC_ENEMY_ATTACK_COOLDOWN_MS) {
      return;
    }
    entity.lastAttackTime = now;

    // Deal damage to player
    const { applyDamage } = require('../../combat/combatSystem');
    applyDamage(player, entity.damage);

    // Play attack animation
    try {
      entity.startModelOneshotAnimations(['attack']);
    } catch {}
  }
}

export default EnemyController;
