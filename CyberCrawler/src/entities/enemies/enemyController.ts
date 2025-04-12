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
  BASIC_ENEMY_ATTACK_RANGE,
  BASIC_ENEMY_ATTACK_COOLDOWN_MS,
} from '../../constants/enemy-config';
import BasicEnemyEntity from './basicEnemy';
// House targeting utility
import { getPlayerHouseDoorPosition } from '../../utils/house-utils';

enum EnemyState {
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
}

export class EnemyController extends BaseEntityController {
  private state: EnemyState = EnemyState.CHASE;
  /**
   * Enemy AI always targets the player house door position.
   * Enemies will move toward the house at all times, and "attack" when close enough.
   * 
   * @param entity The enemy entity
   * @param deltaTimeMs Time since last tick
   */
  public override tick(entity: Entity, deltaTimeMs: number): void {
    if (!(entity instanceof BasicEnemyEntity) || !entity.world) return;

    const world = entity.world;
    const housePos = getPlayerHouseDoorPosition(world);

    // Calculate distance to house door
    const dx = housePos.x - entity.position.x;
    const dz = housePos.z - entity.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > BASIC_ENEMY_ATTACK_RANGE) {
      this.state = EnemyState.CHASE;
    } else {
      this.state = EnemyState.ATTACK;
    }

    switch (this.state) {
      case EnemyState.CHASE:
        this.chaseHouse(entity, housePos);
        break;
      case EnemyState.ATTACK:
        this.attackHouse(entity, housePos);
        break;
    }
  }

  /**
   * Move toward the player house door.
   * @param entity The enemy entity
   * @param housePos The house door position
   */
  private chaseHouse(entity: BasicEnemyEntity, housePos: { x: number; y: number; z: number }): void {
    const controller = entity.controller as any;
    if (controller?.move && controller?.face) {
      controller.move(housePos, entity.speed);
      controller.face(housePos, entity.speed * 2);
    }
    try {
      entity.stopModelAnimations(['idle']);
      entity.startModelLoopedAnimations(['walk']);
    } catch {}
  }

  /**
   * "Attack" the house when close enough.
   * This could be expanded to damage the house or trigger an event.
   * @param entity The enemy entity
   * @param housePos The house door position
   */
  private attackHouse(entity: BasicEnemyEntity, housePos: { x: number; y: number; z: number }): void {
    const now = Date.now();
    if (now - entity.lastAttackTime < BASIC_ENEMY_ATTACK_COOLDOWN_MS) {
      return;
    }
    entity.lastAttackTime = now;

    // TODO: Implement house damage logic here if desired

    // Play attack animation
    try {
      entity.startModelOneshotAnimations(['attack']);
    } catch {}
  }
}

export default EnemyController;
