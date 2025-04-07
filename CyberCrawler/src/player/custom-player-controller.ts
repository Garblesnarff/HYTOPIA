/**
 * CustomPlayerController
 * Extends PlayerEntityController to add inventory toggle on "V" key press.
 * 
 * Author: Cline (AI Assistant)
 */

import { PlayerEntityController, PlayerInput, PlayerCameraOrientation } from 'hytopia';

export class CustomPlayerController extends PlayerEntityController {
  private _playerId: string;
  private _inventoryOpenPlayers: Set<string>;

  constructor(playerId: string, inventoryOpenPlayers: Set<string>) {
    super();
    this._playerId = playerId;
    this._inventoryOpenPlayers = inventoryOpenPlayers;
  }

  async tickWithPlayerInput(entity: any, input: PlayerInput, cameraOrientation: PlayerCameraOrientation, deltaTimeMs: number) {
    super.tickWithPlayerInput(entity, input, cameraOrientation, deltaTimeMs);

    if (input.v) {
      input.v = false; // consume key press
      const player = entity.player;
      if (!player) return;

      if (this._inventoryOpenPlayers.has(this._playerId)) {
        player.ui.load('ui/index.html');
        this._inventoryOpenPlayers.delete(this._playerId);
      } else {
        player.ui.load('ui/inventory-ui.html');
        this._inventoryOpenPlayers.add(this._playerId);

        // Send inventory data
        try {
          const playerStatesModule = await import('../../player/playerController.js');
          const playerStates = playerStatesModule.playerStates;
          const playerState = playerStates.get(this._playerId);
          const inventory = playerState?.inventory || [];

          const { getResourceById } = await import('../../crafting/resources/resource-database.js');

          const inventoryMap = new Map();
          inventory.forEach((item: any) => {
            const existing = inventoryMap.get(item.itemId);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              const resource = getResourceById(item.itemId);
              inventoryMap.set(item.itemId, {
                name: resource?.name || item.itemId,
                quantity: item.quantity,
                iconReference: resource?.iconReference || '',
              });
            }
          });

          const { prepareInventoryUIData } = await import('../../ui/handlers/inventory-ui-handler.js');
          const uiData = prepareInventoryUIData(inventoryMap);

          player.ui.sendData({ type: 'update-inventory', payload: uiData });
        } catch (error) {
          console.error('Error sending inventory data:', error);
        }
      }
    }
  }
}
