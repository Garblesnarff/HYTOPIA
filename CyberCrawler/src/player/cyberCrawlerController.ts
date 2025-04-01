/**
 * Custom Player Entity Controller for CyberCrawler
 * Extends the default PlayerEntityController to add custom abilities like dash.
 */

import { PlayerEntityController, PlayerInput, PlayerEntity, PlayerCameraOrientation } from 'hytopia'; // Added PlayerCameraOrientation
import { canPlayerDash, performDash, playerStates } from './playerController'; // Import necessary functions/state

export class CyberCrawlerController extends PlayerEntityController {
  
  /**
   * Called every tick with the player's current input state.
   * @param entity The player entity being controlled.
   * @param input The player's input state for this tick.
   * @param cameraOrientation The player's camera orientation.
   * @param dt Delta time since the last tick (milliseconds).
   */
  tickWithPlayerInput(entity: PlayerEntity, input: PlayerInput, cameraOrientation: PlayerCameraOrientation, dt: number): void { // Corrected signature
    // Ensure default movement logic runs first
    super.tickWithPlayerInput(entity, input, cameraOrientation, dt); // Call super with correct arguments

    // Add custom dash logic
    if (!entity || !entity.player) return; // Safety check using the passed entity

    const playerId = entity.player.id; // Use passed entity

    // Handle dash ability on right-click (using abbreviated key 'mr')
    if (input.mr && canPlayerDash(playerId)) {
      performDash(entity);
      const state = playerStates.get(playerId); // Access shared player state
      if (state) {
        state.lastDashTime = Date.now();
      }
      // Consume the input so it's not processed again until released and re-pressed
      input.mr = false; 
    }
  }
}
