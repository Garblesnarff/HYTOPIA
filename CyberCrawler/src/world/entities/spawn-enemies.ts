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

import { World, SimpleEntityController, EntityEvent } from 'hytopia'; // Re-add SimpleEntityController, EntityEvent imports
import BasicEnemyEntity from '../../entities/enemies/basicEnemy';
import { EnemyController } from '../../entities/enemies/enemyController';

/**
 * Spawn a single enemy at a specific position.
 * @param world The HYTOPIA world instance
 * @param position The spawn position { x, y, z }
 */
export function spawnEnemyAt(world: World, position: { x: number; y: number; z: number }): void {
  const enemy = new BasicEnemyEntity();
  // Attach SimpleEntityController as the main controller for movement
  const movementController = new SimpleEntityController();
  enemy.setController(movementController);
  // Create and store the AI controller instance separately
  const aiController = new EnemyController();
  (enemy as any).aiController = aiController; // Store reference for the tick handler

  enemy.spawn(world, position);

  // Attach the AI tick logic to the enemy's tick event
  enemy.on(EntityEvent.TICK, ({ tickDeltaMs }) => {
    // Ensure the AI controller and its tick method exist before calling
    if ((enemy as any).aiController?.tick) {
      (enemy as any).aiController.tick(enemy, tickDeltaMs);
    }
  });
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
      console.log(`[Spawn Attempt ${attempts}] Trying random pos: ${JSON.stringify({x: pos.x, z: pos.z})}`); // Log initial X, Z

      // Skip city center (fountain) area
      const distToCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
      if (distToCenter < 5) {
        console.log(`[Spawn Attempt ${attempts}] Skipped spawn: too close to center (dist: ${distToCenter.toFixed(2)})`);
        continue;
      }

      // Raycast down to find ground height
      console.log(`[Spawn Attempt ${attempts}] Raycasting down from Y=50...`);
      const hit = world.simulation.raycast(
        { x: pos.x, y: pos.y, z: pos.z },
        { x: 0, y: -1, z: 0 },
        100
      );

      if (!hit?.hitPoint) {
        console.log(`[Spawn Attempt ${attempts}] Skipped spawn: no ground hit by raycast.`);
        continue;
      }
      console.log(`[Spawn Attempt ${attempts}] Raycast hit ground at Y=${hit.hitPoint.y.toFixed(2)}`);

      const buffer = 0.1; // Small buffer to prevent clipping into ground
      pos.y = hit.hitPoint.y + buffer; // Spawn slightly above ground

      // Check block type at hit point
      const groundCoord = {
        x: Math.floor(hit.hitPoint.x),
        y: Math.floor(hit.hitPoint.y),
        z: Math.floor(hit.hitPoint.z),
      };
      const blockType = world.chunkLattice.getBlockType(groundCoord);
      console.log(`[Spawn Attempt ${attempts}] Ground block type at ${JSON.stringify(groundCoord)}: ${blockType?.id ?? 'None'}`);

      if (!blockType || blockType.id === 0) { // Check for AIR block ID
        console.log(`[Spawn Attempt ${attempts}] Skipped spawn: invalid ground block type (Air or None).`);
        continue;
      }

      // Optionally skip water, fountain, or other block types here
      // Example: if (blockType.id === BLOCK_TYPES.WATER) continue;

      console.log(`[Spawn Attempt ${attempts}] Spawning enemy at: ${JSON.stringify(pos)}`);
      spawnEnemyAt(world, pos);
      spawned = true;
    } // End of while loop

    if (!spawned) {
      console.warn('[Spawn Fallback] No valid spawn found after 10 attempts, forcing spawn at fallback point.');

      // --- Modified Fallback Coordinates ---
      // Move fallback further away from center, e.g., around (70, 70)
      const fallbackX = 70 + (Math.random() - 0.5) * 10;
      const fallbackZ = 70 + (Math.random() - 0.5) * 10;
      // --- End Modification ---
      let fallbackY = 3; // Default Y
      console.log(`[Spawn Fallback] Fallback coords: X=${fallbackX.toFixed(2)}, Z=${fallbackZ.toFixed(2)}`);

      // Raycast down from fallback X,Z to find ground
      const fallbackHit = world.simulation.raycast(
        { x: fallbackX, y: 50, z: fallbackZ },
        { x: 0, y: -1, z: 0 },
        100
      );

      if (fallbackHit?.hitPoint) {
        const buffer = 0.1; // Small buffer to prevent clipping into ground
        fallbackY = fallbackHit.hitPoint.y + buffer; // Spawn slightly above ground
        console.log(`[Spawn Fallback] Raycast hit ground at Y=${fallbackY.toFixed(2)}`);
      } else {
        console.warn('[Spawn Fallback] Fallback spawn also failed to find ground, using default Y=3');
      }

      const finalFallbackPos = { // Define the final position object
        x: fallbackX,
        y: fallbackY,
        z: fallbackZ,
      };
      console.log(`[Spawn Fallback] Spawning enemy at: ${JSON.stringify(finalFallbackPos)}`); // Log fallback spawn position
      spawnEnemyAt(world, finalFallbackPos); // Call spawn with the final position
    }
  } // End of for loop
} // End of spawnEnemiesInArea function

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
