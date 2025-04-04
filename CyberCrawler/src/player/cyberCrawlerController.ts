/**
 * Custom Player Entity Controller for CyberCrawler
 * Extends the default PlayerEntityController to add custom abilities like dash.
 */

// Import necessary types
import { PlayerEntityController, PlayerInput, PlayerEntity, PlayerCameraOrientation, Vector3, RaycastHit, Player, World } from 'hytopia'; // Added missing imports
import { canPlayerDash, performDash, playerStates } from './playerController';
import { applyDamage } from '../combat/combatSystem';
import { CraftingTableEntity } from '../crafting/entities/crafting-table'; // Import CraftingTableEntity
import { BLOCK_TYPES } from '../constants/block-types'; // Import block type constants

export class CyberCrawlerController extends PlayerEntityController {

  /**
   * Called every tick with the player's current input state.
   * @param entity The player entity being controlled.
   * @param input The player's input state for this tick.
   * @param cameraOrientation The player's camera orientation.
   * @param dt Delta time since the last tick (milliseconds).
   */
  tickWithPlayerInput(entity: PlayerEntity, input: PlayerInput, cameraOrientation: PlayerCameraOrientation, dt: number): void {
    // Ensure default movement logic runs first
    super.tickWithPlayerInput(entity, input, cameraOrientation, dt);

    // Add custom dash logic
    if (!entity || !entity.player) return; // Safety check

    const playerId = entity.player.id;

    // Handle dash ability on right-click (using abbreviated key 'mr')
    if (input.mr && canPlayerDash(playerId)) {
      performDash(entity);
      const state = playerStates.get(playerId);
      if (state) {
        state.lastDashTime = Date.now();
      }
      input.mr = false; // Consume input
    }

    // Handle melee attack on left-click (using abbreviated key 'ml')
    if (input.ml) {
      this.performMeleeAttack(entity);
      input.ml = false; // Consume input
    }

    // Handle interaction on 'E' key press (using abbreviated key 'e')
    if (input.e) {
      this.performInteractionCheck(entity); // Removed cameraOrientation as it wasn't used
      input.e = false; // Consume input
    }
  }

  /**
   * Performs a basic melee attack using a sphere cast.
   * @param entity The player entity performing the attack.
   */
  performMeleeAttack(entity: PlayerEntity): void {
    if (!entity || !entity.player) return;

    const world = entity.world;
    if (!world || !world.simulation) { // Check for simulation object
      console.error("Missing world or world.simulation reference in melee attack");
      return;
    }

    const attackRange = 1.5;
    const attackRadius = 0.8;
    const attackDamage = 15;

    const forwardVector = entity.directionFromRotation;
    const currentPosition = entity.position;
    if (!currentPosition) {
      console.error(`Player ${entity.player?.id || 'Unknown'} has no position! Cannot perform attack.`);
      return;
    }

    const castCenter = new Vector3(
      currentPosition.x + forwardVector.x * attackRange,
      currentPosition.y + forwardVector.y * attackRange + 0.5, // Slightly offset upwards
      currentPosition.z + forwardVector.z * attackRange
    );

    // Perform the sphere cast using world.simulation
    // const hits = world.simulation.spherecast(castCenter, attackRadius) ?? []; // Use nullish coalescing
    // console.warn("Melee attack spherecast is currently disabled due to SDK limitations."); // Add warning

    console.log(`Player ${entity.player.id} performed melee attack attempt near ${JSON.stringify(castCenter)} (spherecast disabled)`);

    // Temporarily disable hit processing as spherecast is unavailable
    /*
    for (const hit of hits) {
      if (hit.entity.id === entity.id) continue; // Ignore self-hits

      // Check if the hit entity is a valid target (not self, not another player)
      if (hit.entity.id !== entity.id && !(hit.entity instanceof PlayerEntity)) {
        console.log(`Melee hit potential target: ${hit.entity.id}`);
        applyDamage(hit.entity, attackDamage);
        // Optional: Apply impulse
        // hit.entity.applyImpulse({ x: forwardVector.x * 50, y: 20, z: forwardVector.z * 50 });
        break; // Hit only one target
      }
    }
    */
  }

  /**
   * Performs a raycast check for player interaction with blocks and entities.
   * @param entity The player entity performing the check.
   */
  performInteractionCheck(entity: PlayerEntity): void { // Removed unused cameraOrientation parameter
    console.log(`Player ${entity.player?.id || 'Unknown'} attempting interaction...`);

    const world = entity.world;
    const player = entity.player;
    if (!entity || !player || !world || !world.simulation) { // Check for simulation
      console.error("Missing entity, player, world, or world.simulation reference for interaction check.");
      return;
    }

    world.chatManager.sendPlayerMessage(player, 'Attempting interaction...', 'FFFF00'); // Removed #

    const interactionDistance = 5.0;
    // Define example block IDs locally for clarity
    const scrapMetalBlockNumericId = 100; // Placeholder ID for Scrap Metal
    const airBlockNumericId = BLOCK_TYPES.AIR; // Use constant for Air

    const rayOrigin = entity.position;
    const rayDirection = player.camera?.facingDirection;

    if (!rayOrigin || !rayDirection) {
      console.error(`Player ${player.id} camera data unavailable for raycast.`);
      return;
    }

    console.log(`Performing interaction raycast from ${JSON.stringify(rayOrigin)} in direction ${JSON.stringify(rayDirection)}`);

    const raycastResult = world.simulation.raycast( // Call on simulation
      rayOrigin,
      rayDirection,
      interactionDistance,
      { filterExcludeRigidBody: entity.rawRigidBody }
    );

    // console.log('Raycast result:', raycastResult); // Avoid logging the entire complex object
    // Log specific details instead:
    if (raycastResult) {
        console.log(`Raycast Hit: ${raycastResult.hitEntity ? `Entity ID ${raycastResult.hitEntity.id}` : raycastResult.hitBlock ? `Block at ${JSON.stringify(raycastResult.hitBlock.globalCoordinate)}` : 'Nothing'}`);
    } else {
        console.log("Raycast Hit: Nothing");
    }


    // --- Check for Entity Hit First ---
    if (raycastResult?.hitEntity) {
      const hitEntity = raycastResult.hitEntity;
      console.log(`Interaction check hit entity: ${hitEntity.id} of type ${hitEntity.constructor.name}`);

      if (hitEntity instanceof CraftingTableEntity) {
        console.log(`Hit a Crafting Table! Triggering interaction.`);
        hitEntity.interact(player);
        return; // Interaction handled
      } else {
        world.chatManager.sendPlayerMessage(player, `You interacted with entity: ${hitEntity.id}`, 'FFFFFF'); // Removed #
        console.log(`Entity type ${hitEntity.constructor.name} interacted with, but no specific action defined.`);
        return; // Interaction handled
      }
    }

    // --- Check for Block Hit if No Entity Was Hit ---
    if (raycastResult?.hitBlock) {
      const hitBlockInfo = raycastResult.hitBlock;
      const blockCoordinate = hitBlockInfo.globalCoordinate;
      // Assume getBlockType returns an object like { id: number, ... } or null
      const blockTypeObject = world.chunkLattice?.getBlockType(blockCoordinate);
      const blockNumericId = blockTypeObject?.id; // Safely access the ID

      console.log(`Interaction check hit block at ${JSON.stringify(blockCoordinate)} with type ID: ${blockNumericId}`);

      // Compare the numeric ID
      if (blockNumericId === scrapMetalBlockNumericId) {
        console.log(`Player ${player.id} gathered Scrap Metal!`);
        world.chunkLattice?.setBlock(blockCoordinate, airBlockNumericId); // Use numeric ID for air
        world.chatManager.sendPlayerMessage(player, 'You gathered Scrap Metal!', '00FF00'); // Removed #
        // TODO: Add scrap metal to inventory: InventoryManager.instance.addItems(player.id, [{ itemId: 'scrap_metal', quantity: 1 }]);
      } else if (blockNumericId !== undefined && blockNumericId !== null) { // Check if it's a valid block ID
        world.chatManager.sendPlayerMessage(player, `You interacted with block type ID: ${blockNumericId}`, 'FFFFFF'); // Removed #
        console.log(`Block type ID ${blockNumericId} interacted with but not collected.`);
      } else {
         world.chatManager.sendPlayerMessage(player, 'Interacted with an unknown block type.', 'FFAAAA'); // Removed #
         console.log(`Interacted with block at ${JSON.stringify(blockCoordinate)}, but type ID is unknown or null.`);
      }
    } else {
      // No entity or block hit
      world.chatManager.sendPlayerMessage(player, 'Nothing to interact with here.', 'FF0000'); // Removed #
      console.log('No entity or block hit by interaction raycast.');
    }
  }
}
