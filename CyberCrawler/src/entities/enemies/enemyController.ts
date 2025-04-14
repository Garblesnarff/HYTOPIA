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
import { getPlayerHouseDoorPosition, findNearestDestructibleBlock } from '../../utils/house-utils'; // Updated import
import { BlockHealthManager } from '../../world/block-health-manager';
import { BLOCK_TYPES, BLOCK_CATEGORIES } from '../../constants/block-types';
import { WORLD_AREAS, WORLD_ORIGIN } from '../../constants/world-config';
import { findGroundHeight } from '../../utils/terrain-utils';

enum EnemyState {
  CHASE = 'CHASE',
  ATTACK_BLOCK = 'ATTACK_BLOCK', // New: attack any block in path
  ATTACK_HOUSE = 'ATTACK_HOUSE',
}

export class EnemyController extends BaseEntityController {
  private state: EnemyState = EnemyState.CHASE;
  private targetBlockPos: Vector3Like | null = null;
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

    // 1. Always check for a destructible house block adjacent to the enemy
    const allowedBlockTypes = new Set(BLOCK_CATEGORIES.BUILDING);
    const excludeBlockTypes = new Set([BLOCK_TYPES.STONE_BRICK, BLOCK_TYPES.WOOD_PLANKS]);
    // Compute houseStartY as in buildMainHouse
    const area = WORLD_AREAS.PLAYER_HOUSE;
    const origin = WORLD_ORIGIN;
    const houseWidth = 14;
    const houseDepth = 12;
    const centerX = origin.X + area.startX + area.width / 2;
    const centerZ = origin.Z + area.startZ + area.depth / 2;
    const houseStartX = centerX - houseWidth / 2;
    const houseStartZ = centerZ - houseDepth / 2;
    // Use the same ground height logic as buildMainHouse
    const houseStartY = findGroundHeight(world, houseStartX, houseStartZ);

    const blockInPath = findNearestDestructibleBlock(
      world,
      entity.position,
      1,
      allowedBlockTypes,
      excludeBlockTypes,
      houseStartY // Exclude WOOD_PLANKS/LOG at floor Y
    );
    if (blockInPath) {
      this.targetBlockPos = blockInPath;
      if (this.state !== EnemyState.ATTACK_BLOCK) {
        this.state = EnemyState.ATTACK_BLOCK;
      }
    } else if (this.state === EnemyState.ATTACK_BLOCK) {
      // No block to attack, return to CHASE
      this.state = EnemyState.CHASE;
      this.targetBlockPos = null;
    }

    switch (this.state) {
      case EnemyState.ATTACK_BLOCK:
        this.handleAttackBlockState(entity);
        break;
      case EnemyState.CHASE:
        this.handleChaseState(entity, housePos);
        break;
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
    // DEBUG: Log distance check for entering attack state
    // console.log(`[EnemyController ${entity.id}] CHASE: distToHouse=${distToHouse.toFixed(2)}, attackRange=${BASIC_ENEMY_ATTACK_RANGE}`);
    if (distToHouse <= BASIC_ENEMY_ATTACK_RANGE) {
      console.log(`[EnemyController ${entity.id}] State change: CHASE -> ATTACK_HOUSE`);
      this.state = EnemyState.ATTACK_HOUSE;
      this.targetBlockPos = null;
      this.stopMovement(entity);
      return;
    }

    // Always call chaseHouse if not in ATTACK_HOUSE range
    this.chaseHouse(entity, housePosVec);
  }

  /**
   * Handles attacking any block adjacent to the enemy.
   * If a block is found, face and attack it until destroyed.
   * If no block is found, returns to CHASE state.
   */
  private handleAttackBlockState(entity: BasicEnemyEntity): void {
    if (!this.targetBlockPos) {
      this.state = EnemyState.CHASE;
      return;
    }

    // Face the block
    const controller = entity.controller as SimpleEntityController;
    if (controller?.face) {
      controller.face(Vector3.fromVector3Like(this.targetBlockPos), entity.speed * 4);
    }

    // Check if the block is still there and destructible
    const blockType = entity.world?.chunkLattice.getBlockType(this.targetBlockPos);
    if (!blockType || blockType.id === BLOCK_TYPES.AIR || !BlockHealthManager.instance.isBlockRegistered(this.targetBlockPos)) {
      this.state = EnemyState.CHASE;
      this.targetBlockPos = null;
      return;
    }

    // Attack cooldown
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
    // DEBUG: Log distance check for leaving attack state
    // console.log(`[EnemyController ${entity.id}] ATTACK_HOUSE: distToHouse=${distToHouse.toFixed(2)}, attackRange+1.0=${(BASIC_ENEMY_ATTACK_RANGE + 1.0).toFixed(2)}`); // Adjusted buffer
    if (distToHouse > BASIC_ENEMY_ATTACK_RANGE + 1.0) { // Increased buffer from 0.5 to 1.0
      console.log(`[EnemyController ${entity.id}] State change: ATTACK_HOUSE -> CHASE (too far)`);
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

  /**
   * Attacks the nearest destructible house block within range.
   * Plays attack animation and damages the block if found.
   * If no block is found, reverts to CHASE state.
   *
   * @param entity The enemy entity
   * @param housePosVec The position of the house door (for facing)
   */
  private attackHouse(entity: BasicEnemyEntity, housePosVec: Vector3): void {
    const now = Date.now();
    if (now - entity.lastAttackTime < BASIC_ENEMY_ATTACK_COOLDOWN_MS) {
      // DEBUG: Log cooldown skip
      // console.log(`[EnemyController ${entity.id}] Attack skipped due to cooldown.`);
      return;
    }

    // Find the nearest destructible block within a radius (e.g., 2)
    const targetBlock = findNearestDestructibleBlock(entity.world!, entity.position, 2); // Updated function call

    // DEBUG: Log block search result
    if (targetBlock) {
      // console.log(`[EnemyController ${entity.id}] Targeting block at (${targetBlock.x},${targetBlock.y},${targetBlock.z})`);
    } else {
      console.log(`[EnemyController ${entity.id}] No destructible block found nearby.`);
    }

    if (!targetBlock) {
      // No block to attack, revert to CHASE state
      console.log(`[EnemyController ${entity.id}] State change: ATTACK_HOUSE -> CHASE (no target block)`);
      this.state = EnemyState.CHASE;
      return;
    }

    entity.lastAttackTime = now;

    try {
      entity.startModelOneshotAnimations(['attack']);
    } catch {}

    // Damage the block
    const destroyed = BlockHealthManager.instance.damageBlock(targetBlock, BASIC_ENEMY_DAMAGE);
    // DEBUG: Log damage application
    console.log(`[EnemyController ${entity.id}] Applied ${BASIC_ENEMY_DAMAGE} damage to block at (${targetBlock.x},${targetBlock.y},${targetBlock.z}). Destroyed: ${destroyed}`);
  }
}

export default EnemyController;
