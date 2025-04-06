/**
 * ScrapMetalEntity
 * Represents a gatherable scrap metal resource in the world.
 * When interacted with, it despawns and adds "scrap_metal" to the player's inventory.
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

export class ScrapMetalEntity extends Entity {
  constructor() {
    super({
      name: 'Scrap Metal',
      modelUri: 'models/items/iron-ingot.gltf',
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
    const resource = getResourceById('scrap_metal');
    if (!resource) {
      console.error('[ScrapMetalEntity] Resource "scrap_metal" not found.');
      return;
    }

    const added = InventoryManager.instance.addItems(playerId, [
      { itemId: resource.id, quantity: 1 },
    ]);
    if (added) {
      player.world?.chatManager.sendPlayerMessage(player.player, 'Gathered Scrap Metal.', '00FF00');
      this.despawn();
    } else {
      player.world?.chatManager.sendPlayerMessage(player.player, 'Inventory full.', 'FF0000');
    }
  }
}
