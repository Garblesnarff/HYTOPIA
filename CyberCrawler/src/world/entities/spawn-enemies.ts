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
  // Removed post-spawn adjustment - let gravity handle placement
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
    let attempts = 0;
    let spawned = false;

    while (!spawned && attempts < 10) {
      attempts++;

      const pos = {
        x: Math.random() * (area.max.x - area.min.x) + area.min.x,
        z: Math.random() * (area.max.z - area.min.z) + area.min.z,
        y: 50, // start high above the map
      };

      // Skip city center (fountain) area
      const distToCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
      if (distToCenter < 5) {
        console.log('Skipped spawn: too close to center');
        continue;
      }

      // Raycast down to find ground height
      const hit = world.simulation.raycast(
        { x: pos.x, y: pos.y, z: pos.z },
        { x: 0, y: -1, z: 0 },
        100
      );

      if (!hit?.hitPoint) {
        console.log('Skipped spawn: no ground hit');
        continue;
      }

      const buffer = 0.1; // Small buffer to prevent clipping into ground
      pos.y = hit.hitPoint.y + buffer; // Spawn slightly above ground

      // Check block type at hit point
      const blockType = world.chunkLattice.getBlockType({
        x: Math.floor(hit.hitPoint.x),
        y: Math.floor(hit.hitPoint.y),
        z: Math.floor(hit.hitPoint.z),
      });

      if (!blockType || blockType.id === 0) {
        console.log('Skipped spawn: invalid block type');
        continue;
      }

      // Optionally skip water, fountain, or other block types here

      console.log(`Attempting to spawn enemy at: ${JSON.stringify(pos)}`);
      spawnEnemyAt(world, pos);
      spawned = true;
    }

    if (!spawned) {
      console.log('No valid spawn found after retries, forcing spawn at fallback point');

      const fallbackX = 50 + (Math.random() - 0.5) * 10;
      const fallbackZ = 50 + (Math.random() - 0.5) * 10;
      let fallbackY = 3; // Default Y

      // Raycast down from fallback X,Z to find ground
      const fallbackHit = world.simulation.raycast(
        { x: fallbackX, y: 50, z: fallbackZ },
        { x: 0, y: -1, z: 0 },
        100
      );

      if (fallbackHit?.hitPoint) {
        const buffer = 0.1; // Small buffer to prevent clipping into ground
        fallbackY = fallbackHit.hitPoint.y + buffer; // Spawn slightly above ground
      } else {
        console.log('Fallback spawn also failed to find ground, using default Y');
      }

      spawnEnemyAt(world, {
        x: fallbackX,
        y: fallbackY,
        z: fallbackZ,
      });
    }
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
