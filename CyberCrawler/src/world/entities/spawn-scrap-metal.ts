/**
 * Spawns multiple ScrapMetalEntity instances in the world.
 * For initial placement of gatherable scrap metal.
 * 
 * Dependencies:
 * - ScrapMetalEntity
 * - HYTOPIA World
 * 
 * Author: Cline (AI Assistant)
 */

import { World, Vector3 } from 'hytopia';
import { ScrapMetalEntity } from './scrap-metal';

/**
 * Spawns scrap metal at predefined positions.
 * Call this during world initialization.
 * 
 * @param world The game world instance
 */
export function spawnScrapMetal(world: World): void {
  const positions: Vector3[] = [
    new Vector3(145, 3, 35),
    new Vector3(155, 3, 28),
    new Vector3(142, 3, 25),
    new Vector3(158, 3, 33),
    new Vector3(150, 3, 18),
  ];

  positions.forEach((pos, index) => {
    const scrap = new ScrapMetalEntity();
    scrap.spawn(world, pos);
    console.log(`[Spawner] Spawned Scrap Metal #${index + 1} at ${pos.x}, ${pos.y}, ${pos.z}`);
  });
}
