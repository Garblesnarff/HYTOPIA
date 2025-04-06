/**
 * MutatedPlantEntity
 * Represents a gatherable mutated plant resource in the world.
 * When interacted with, it despawns and adds "mutated_plants" to the player's inventory.
 * 
 * Dependencies:
 * - HYTOPIA SDK Entity, PlayerEntity
 * - InventoryManager
 * - resource-database.ts
 * 
 * Author: Cline (AI Assistant)
 */

import { Entity, PlayerEntity, EntityEvent, Quaternion, RigidBodyType, ColliderShape, BlockType } from 'hytopia';
import { InventoryManager } from '../../player/inventory-manager';
import { getResourceById } from '../../crafting/resources/resource-database';

export class MutatedPlantEntity extends Entity {
  constructor() {
    super({
      name: 'Mutated Plant',
      modelUri: 'models/items/melon.gltf', // Corrected relative model path
      modelScale: 1,
      rigidBodyOptions: {
        type: RigidBodyType.FIXED,
        colliders: [
          {
            shape: ColliderShape.BALL,
            radius: 0.5,
            isSensor: true,
            onCollision: (other: Entity | BlockType, started: boolean) => {
              if (started && other instanceof PlayerEntity) {
                this._gather(other);
              }
            },
          },
        ],
      },
    });
  }

  private _gather(player: PlayerEntity) {
    const playerId = player.player.id;
    const resource = getResourceById('mutated_plants');
    if (!resource) {
      console.error('[MutatedPlantEntity] Resource "mutated_plants" not found.');
      return;
    }

    const added = InventoryManager.instance.addItems(playerId, [
      { itemId: resource.id, quantity: 1 },
    ]);
    if (added) {
      player.world?.chatManager.sendPlayerMessage(player.player, 'Gathered Mutated Plant.', '00FF00');
      this.despawn();
    } else {
      player.world?.chatManager.sendPlayerMessage(player.player, 'Inventory full.', 'FF0000');
    }
  }
}
