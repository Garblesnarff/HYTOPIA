/**
 * Enemy spawning utilities for CyberCrawler
 * 
 * Functions to spawn enemies at positions, in areas, or periodically.
 * 
 * Dependencies:
 * - HYTOPIA SDK World
 * - BasicEnemyEntity and EnemyController
 * 
 * @author Cline
 */

import { World } from 'hytopia';
import BasicEnemyEntity from '../../entities/enemies/basicEnemy';
import { EnemyController } from '../../entities/enemies/enemyController';

/**
 * Spawn a single enemy at a specific position.
 * @param world The HYTOPIA world instance
 * @param position The spawn position { x, y, z }
 */
export function spawnEnemyAt(world: World, position: { x: number; y: number; z: number }): void {
  const enemy = new BasicEnemyEntity();
  enemy.setController(new EnemyController());
  enemy.spawn(world, position);
}

/**
 * Spawn multiple enemies randomly within an area.
 * @param world The HYTOPIA world instance
 * @param area Bounding box with min/max coordinates
 * @param count Number of enemies to spawn
 */
export function spawnEnemiesInArea(
  world: World,
  area: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } },
  count: number
): void {
  for (let i = 0; i < count; i++) {
    const pos = {
      x: Math.random() * (area.max.x - area.min.x) + area.min.x,
      y: Math.random() * (area.max.y - area.min.y) + area.min.y,
      z: Math.random() * (area.max.z - area.min.z) + area.min.z,
    };
    spawnEnemyAt(world, pos);
  }
}

/**
 * Periodically spawn enemies in a given area.
 * @param world The HYTOPIA world instance
 * @param area Bounding box for spawn area
 * @param intervalMs Spawn interval in milliseconds
 * @param maxEnemies Maximum number of enemies allowed at once
 */
export function spawnEnemiesPeriodically(
  world: World,
  area: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } },
  intervalMs: number = 5000,
  maxEnemies: number = 10
): void {
  setInterval(() => {
    const existingEnemies = world.entityManager.getEntitiesByTag('enemy') || [];
    if (existingEnemies.length >= maxEnemies) return;

    spawnEnemiesInArea(world, area, 1);
  }, intervalMs);
}
