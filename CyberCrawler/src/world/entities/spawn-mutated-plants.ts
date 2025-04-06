/**
 * Spawns multiple MutatedPlantEntity instances in the world.
 * For testing and initial placement of gatherable mutated plants.
 * 
 * Dependencies:
 * - MutatedPlantEntity
 * - HYTOPIA World
 * 
 * Author: Cline (AI Assistant)
 */

import { World, Vector3 } from 'hytopia';
import { MutatedPlantEntity } from './mutated-plant';

/**
 * Spawns mutated plants at predefined positions.
 * Call this during world initialization or testing.
 * 
 * @param world The game world instance
 */
export function spawnMutatedPlants(world: World): void {
  const positions: Vector3[] = [
    new Vector3(160, 2, 31),
    new Vector3(140, 2, 31),
    new Vector3(150, 2, 40),
    new Vector3(150, 2, 20),
    new Vector3(155, 2, 35),
  ];

  positions.forEach((pos, index) => {
    const plant = new MutatedPlantEntity();
    plant.spawn(world, pos);
    console.log(`[Spawner] Spawned Mutated Plant #${index + 1} at ${pos.x}, ${pos.y}, ${pos.z}`);
  });
}
