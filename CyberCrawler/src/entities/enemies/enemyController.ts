/**
 * EnemyController - Simple AI controller for basic enemies
 * 
 * Implements a basic state machine: IDLE, CHASE, ATTACK.
 * Handles player detection, chasing, and attacking with cooldown.
 * 
 * Dependencies:
 * - HYTOPIA SDK BaseEntityController, PlayerEntity, SimpleEntityController
 * - Enemy constants from ../../constants/enemy-config
 * - BasicEnemyEntity class
 * 
 * @author Cline
 */

import { BaseEntityController, Entity, PlayerEntity, Vector3, Vector3Like, SimpleEntityController } from 'hytopia';
import {
  BASIC_ENEMY_ATTACK_RANGE,
  BASIC_ENEMY_ATTACK_COOLDOWN_MS,
  BASIC_ENEMY_DAMAGE,
} from '../../constants/enemy-config';
import BasicEnemyEntity from './basicEnemy';
import { getPlayerHouseDoorPosition } from '../../utils/house-utils';
import { BlockHealthManager } from '../../world/block-health-manager';
import { BLOCK_TYPES } from '../../constants/block-types';

enum EnemyState {
  CHASE = 'CHASE',
  ATTACK_BLOCK = 'ATTACK_BLOCK',
  ATTACK_HOUSE = 'ATTACK_HOUSE',
}

export class EnemyController extends BaseEntityController {
  private state: EnemyState = EnemyState.CHASE;
  private targetBlockPos: Vector3 | null = null;
  private lastBlockAttackTime: number = 0;
  private lastJumpTime: number = 0;
  private readonly BLOCK_ATTACK_COOLDOWN_MS = 1000;
  private readonly JUMP_COOLDOWN_MS = 1000;
  private readonly JUMP_STRENGTH = 8;

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

    switch (this.state) {
      case EnemyState.CHASE:
        this.handleChaseState(entity, housePos);
        break;
      // case EnemyState.ATTACK_BLOCK:
      //   this.handleAttackBlockState(entity);
      //   break;
      case EnemyState.ATTACK_HOUSE:
        this.handleAttackHouseState(entity, housePos);
        break;
    }
  }

  private handleChaseState(entity: BasicEnemyEntity, housePos: Vector3Like): void {
    const housePosVec = Vector3.fromVector3Like(housePos);
    const entityPosVec = Vector3.fromVector3Like(entity.position);

    // Check distance to house for potential ATTACK_HOUSE transition
    const dxH = entityPosVec.x - housePosVec.x;
    const dyH = entityPosVec.y - housePosVec.y;
    const dzH = entityPosVec.z - housePosVec.z;
    const distToHouse = Math.sqrt(dxH*dxH + dyH*dyH + dzH*dzH);
    if (distToHouse <= BASIC_ENEMY_ATTACK_RANGE) {
      this.state = EnemyState.ATTACK_HOUSE;
      this.targetBlockPos = null;
      this.stopMovement(entity);
      return;
    }

    // Always call chaseHouse if not in ATTACK_HOUSE range
    this.chaseHouse(entity, housePosVec);
  }

  private handleAttackBlockState(entity: BasicEnemyEntity): void {
    if (!this.targetBlockPos) {
      this.state = EnemyState.CHASE;
      return;
    }

    const controller = entity.controller as SimpleEntityController;
    if (controller?.face) {
      controller.face(this.targetBlockPos, entity.speed * 4);
    }

    const blockType = entity.world?.chunkLattice.getBlockType(this.targetBlockPos);
    if (!blockType || blockType.id === BLOCK_TYPES.AIR || !BlockHealthManager.instance.isBlockRegistered(this.targetBlockPos)) {
      this.state = EnemyState.CHASE;
      this.targetBlockPos = null;
      return;
    }

    const now = Date.now();
    if (now - this.lastBlockAttackTime >= this.BLOCK_ATTACK_COOLDOWN_MS) {
      this.lastBlockAttackTime = now;
      entity.startModelOneshotAnimations(['attack']);
      const destroyed = BlockHealthManager.instance.damageBlock(this.targetBlockPos, BASIC_ENEMY_DAMAGE);
      if (destroyed) {
        this.state = EnemyState.CHASE;
        this.targetBlockPos = null;
      }
    }
  }

  private handleAttackHouseState(entity: BasicEnemyEntity, housePos: Vector3Like): void {
    const housePosVec = Vector3.fromVector3Like(housePos);
    const entityPosVec = Vector3.fromVector3Like(entity.position);
    const dxH2 = entityPosVec.x - housePosVec.x;
    const dyH2 = entityPosVec.y - housePosVec.y;
    const dzH2 = entityPosVec.z - housePosVec.z;
    const distToHouse = Math.sqrt(dxH2*dxH2 + dyH2*dyH2 + dzH2*dzH2);
    if (distToHouse > BASIC_ENEMY_ATTACK_RANGE + 0.5) {
      this.state = EnemyState.CHASE;
      return;
    }

    const controller = entity.controller as SimpleEntityController;
    if (controller?.face) {
      controller.face(housePosVec, entity.speed * 2);
    }

    this.attackHouse(entity, housePosVec);
  }

  private stopMovement(entity: BasicEnemyEntity): void {
    entity.setLinearVelocity({ x: 0, y: 0, z: 0 });
    try {
      entity.stopModelAnimations(['walk', 'run']);
      entity.startModelLoopedAnimations(['idle']);
    } catch {}
  }

  private chaseHouse(entity: BasicEnemyEntity, housePosVec: Vector3): void {
    const controller = entity.controller as SimpleEntityController;
    if (controller?.move && controller?.face) {
      controller.move(housePosVec, entity.speed, { moveIgnoreAxes: { x: false, y: true, z: false } });
      controller.face(housePosVec, entity.speed * 2);
    }
    try {
      entity.stopModelAnimations(['idle']);
      entity.startModelLoopedAnimations(['walk']);
    } catch {}
  }

  private attackHouse(entity: BasicEnemyEntity, housePosVec: Vector3): void {
    const now = Date.now();
    if (now - entity.lastAttackTime < BASIC_ENEMY_ATTACK_COOLDOWN_MS) {
      return;
    }
    entity.lastAttackTime = now;

    // TODO: Implement actual house damage logic here if desired

    try {
      entity.startModelOneshotAnimations(['attack']);
    } catch {}
  }
}

export default EnemyController;
