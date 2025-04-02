/**
 * Custom Player Entity Controller for CyberCrawler
 * Extends the default PlayerEntityController to add custom abilities like dash.
 */

// Import necessary types
import { PlayerEntityController, PlayerInput, PlayerEntity, PlayerCameraOrientation, Vector3, RaycastHit } from 'hytopia'; // Use RaycastHit
import { canPlayerDash, performDash, playerStates } from './playerController';
import { applyDamage } from '../combat/combatSystem';

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

    // Handle melee attack on left-click (using abbreviated key 'ml')
    if (input.ml) {
      this.performMeleeAttack(entity);
      // Consume the input
      input.ml = false;
    }

    // Handle interaction on 'E' key press (using abbreviated key 'e')
    if (input.e) {
      this.performInteractionCheck(entity, cameraOrientation);
      // Consume the input
      input.e = false;
    }
  }

  /**
   * Placeholder for performing a melee attack.
   * Performs a basic melee attack using a sphere cast.
   * @param entity The player entity performing the attack.
   */
  performMeleeAttack(entity: PlayerEntity): void {
    if (!entity || !entity.player) return;

    // Get world reference from entity
    const world = entity.world;
    if (!world) {
      console.error("Missing world reference in melee attack");
      return;
    }

    const attackRange = 1.5; // Range of the melee attack
    const attackRadius = 0.8; // Radius of the sphere cast
    const attackDamage = 15; // Base damage for a fist attack

    // Calculate the center of the sphere cast in front of the player
    const forwardVector = entity.directionFromRotation;
    const currentPosition = entity.position; // Use entity.position as confirmed by rules examples
    if (!currentPosition) {
      console.error(`Player ${entity.player?.id || 'Unknown'} has no position! Cannot perform attack.`); // Added safe access for player.id
      return;
    }
    // Use Vector3 constructor if available, otherwise keep object literal and hope for type compatibility
    // Assuming Vector3 constructor exists: new Vector3(x, y, z)
    const castCenter = new Vector3(
      currentPosition.x + forwardVector.x * attackRange,
      currentPosition.y + forwardVector.y * attackRange + 0.5, // Slightly offset upwards
      currentPosition.z + forwardVector.z * attackRange
    );

    // Perform the sphere cast using the (assumed global) world object
    const hits = world.spherecast(castCenter, attackRadius);

    console.log(`Player ${entity.player.id} performed melee attack! Casting sphere at ${JSON.stringify(castCenter)}`);

    // Check hits
    for (const hit of hits) {
      // Ignore self-hits
      if (hit.entity.id === entity.id) continue;

      // Check if the hit entity is a valid target (not self, not another player)
      // TODO: Replace this with a proper tag check ('enemy') once tag system is clarified/fixed
      if (hit.entity.id !== entity.id && !(hit.entity instanceof PlayerEntity)) {
        console.log(`Melee hit potential target: ${hit.entity.id}`);
        // Apply damage (using the imported function)
        // Note: We're applying flat damage here, not momentum-based, for simplicity.
        // The combatSystem's collision handler deals with momentum damage.
        applyDamage(hit.entity, attackDamage);

        // Optional: Apply a small impulse for visual feedback
        // hit.entity.applyImpulse({ x: forwardVector.x * 50, y: 20, z: forwardVector.z * 50 });

        // Attack only hits one enemy for now
        break;
      }
    }
  }

  /**
   * Performs a raycast check for player interaction with blocks.
   * @param entity The player entity performing the check.
   * @param cameraOrientation The player's camera orientation.
   */
  performInteractionCheck(entity: PlayerEntity, cameraOrientation: PlayerCameraOrientation): void {
    // Log when interaction key is pressed
    console.log(`Player ${entity.player?.id || 'Unknown'} attempting interaction...`);
    
    // Get world reference from entity to avoid global declaration
    const world = entity.world;
    if (!entity || !entity.player || !world) {
      console.error("Missing entity, player, or world reference");
      return;
    }

    // Send feedback to player about interaction attempt
    world.chatManager.sendPlayerMessage(entity.player, 'Attempting interaction...', '#FFFF00');


    const interactionDistance = 5.0; // Max distance player can interact from
    const scrapMetalBlockId = 100;
    const airBlockId = 0;

    // Perform raycast using world.simulation.raycast
    // Use entity position as origin (like example) and camera direction
    const rayOrigin = entity.position; // Use entity position as origin
    const rayDirection = entity.player?.camera?.facingDirection; // Get camera direction

    if (!rayOrigin || !rayDirection) { // Check both origin and direction
      console.error(`Player ${entity.player?.id || 'Unknown'} camera data unavailable for raycast.`);
      return;
    }

    console.log(`Performing raycast from ${JSON.stringify(rayOrigin)} in direction ${JSON.stringify(rayDirection)}`);

    const raycastResult = world.simulation?.raycast(
      rayOrigin,
      rayDirection,
      interactionDistance,
      { // Exclude the player itself from the raycast
        filterExcludeRigidBody: entity.rawRigidBody,
      }
    );
    
    console.log('Raycast result:', raycastResult);

    // Check if the raycast hit a block
    if (raycastResult?.hitBlock) {
      const hitBlockInfo = raycastResult.hitBlock; // Contains coordinate and potentially type ID
      const blockCoordinate = hitBlockInfo.globalCoordinate; // Use globalCoordinate
      const blockTypeId = world.chunkLattice?.getBlockType(blockCoordinate); // Get type ID separately

      console.log(`Interaction check hit block at ${JSON.stringify(blockCoordinate)} with type ID: ${blockTypeId}`);

      // Check if it's the Scrap Metal Pile block
      if (blockTypeId === scrapMetalBlockId) {
        console.log(`Player ${entity.player.id} gathered Scrap Metal!`);

        // Remove the block (replace with air)
        world.chunkLattice?.setBlock(blockCoordinate, airBlockId);

        // Send feedback to player
        world.chatManager.sendPlayerMessage(entity.player, 'You gathered Scrap Metal!', '#00FF00');

        // TODO: Add scrap metal to player inventory
      } else {
        // Provide information about the block that was hit
        world.chatManager.sendPlayerMessage(entity.player, `You interacted with block type: ${blockTypeId}`, '#FFFFFF');
        console.log(`Block type ${blockTypeId} interacted with but not collected (not scrap metal)`);
      }
    } else {
      world.chatManager.sendPlayerMessage(entity.player, 'No block detected in front of you', '#FF0000');
      console.log('No block hit by raycast');
    }
  }
}
