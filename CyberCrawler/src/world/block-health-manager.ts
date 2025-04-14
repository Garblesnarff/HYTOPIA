/**
 * Block Health Manager - Tracks health and handles damage for destructible blocks.
 * 
 * This singleton class manages the health state of individual blocks in the world.
 * It allows registering blocks with initial health, applying damage, and checking
 * if a block should be destroyed.
 * 
 * Dependencies:
 * - Hytopia SDK (World, Vector3Like)
 * - Project constants (BLOCK_TYPES, BLOCK_PROPERTIES)
 * 
 * @author Cline
 */

import { World, Vector3Like, Audio } from 'hytopia'; // Import Audio
import { BLOCK_TYPES, BLOCK_PROPERTIES } from '../constants/block-types';

// Key format for the health map
type BlockCoordinateString = `${number},${number},${number}`;

export class BlockHealthManager {
  private static _instance: BlockHealthManager;
  private blockHealth: Map<BlockCoordinateString, number> = new Map();
  private worldInstance: World | null = null;

  private constructor() {} // Private constructor for singleton

  /**
   * Get the singleton instance of the BlockHealthManager.
   */
  public static get instance(): BlockHealthManager {
    if (!BlockHealthManager._instance) {
      BlockHealthManager._instance = new BlockHealthManager();
    }
    return BlockHealthManager._instance;
  }

  /**
   * Initialize the manager with the world instance.
   * Should be called once when the server starts.
   * @param world The Hytopia world instance
   */
  public initialize(world: World): void {
    this.worldInstance = world;
    this.blockHealth.clear(); // Clear health on re-initialization
    console.log('[BlockHealthManager] Initialized.');
  }

  /**
   * Generates the standard key string for a block coordinate.
   * @param coord The block coordinate { x, y, z }
   * @returns The coordinate string key
   */
  private getCoordKey(coord: Vector3Like): BlockCoordinateString {
    return `${Math.floor(coord.x)},${Math.floor(coord.y)},${Math.floor(coord.z)}`;
  }

  /**
   * Registers a block at the given coordinate, setting its initial health
   * based on its type from BLOCK_PROPERTIES. Only registers blocks that
   * have a defined health value and are not indestructible.
   * 
   * @param coord The coordinate of the block to register
   * @param blockTypeId The type ID of the block
   * @param forceRegister If true, registers even if health is undefined (useful for custom health)
   * @param initialHealthOverride Optional specific health value to set
   */
  public registerBlock(
    coord: Vector3Like,
    blockTypeId: number,
    forceRegister: boolean = false,
    initialHealthOverride?: number
  ): void {
    const properties = BLOCK_PROPERTIES[blockTypeId];
    const initialHealth = initialHealthOverride ?? properties?.health;

    // Only register if it has health defined and isn't indestructible, or if forced
    if ((initialHealth !== undefined && !properties?.indestructible) || forceRegister) {
      const key = this.getCoordKey(coord);
      if (!this.blockHealth.has(key)) { // Don't overwrite existing health if re-registering
         this.blockHealth.set(key, initialHealth ?? 1); // Default to 1 health if undefined but forced
      }
    }
  }

  /**
   * Applies damage to a block at the specified coordinate.
   * If the block's health drops to 0 or below, it is destroyed (set to AIR).
   * 
   * @param coord The coordinate of the block to damage
   * @param amount The amount of damage to apply
   * @returns {boolean} True if the block was destroyed, false otherwise
   */
  public damageBlock(coord: Vector3Like, amount: number): boolean {
    if (!this.worldInstance) {
      console.error('[BlockHealthManager] World instance not initialized!');
      return false;
    }

    const key = this.getCoordKey(coord);
    if (!this.blockHealth.has(key)) {
      // Block is not registered or already destroyed
      return false;
    }

    const currentHealth = this.blockHealth.get(key)!;
    const newHealth = currentHealth - amount;

    // console.log(`[BlockHealthManager] Damaging block at ${key}. Health: ${currentHealth} -> ${newHealth}`);

    if (newHealth <= 0) {
      // Destroy the block
      // Destroy the block
      const blockCoordCenter = { x: coord.x + 0.5, y: coord.y + 0.5, z: coord.z + 0.5 };
      this.worldInstance.chunkLattice.setBlock(coord, BLOCK_TYPES.AIR);
      this.blockHealth.delete(key); // Remove from tracking
      console.log(`[BlockHealthManager] Block at ${key} destroyed.`);

      // --- Add Feedback ---
      // TODO: Replace 'block_break_effect' with actual particle effect name if available
      // try { this.worldInstance.createParticleEffect(blockCoordCenter, 'block_break_effect'); } catch (e) { console.warn("Could not create particle effect 'block_break_effect'. Method might be incorrect."); }
      // TODO: Replace 'audio/sfx/block_break.mp3' with actual sound URI if available
      try {
        new Audio({ // Correct constructor usage
          uri: 'audio/sfx/block_break.mp3',
          position: blockCoordCenter,
          volume: 0.8,
        }).play(this.worldInstance); // Correct play method usage
      } catch (e) { console.warn("Could not play sound 'audio/sfx/block_break.mp3'"); }
      // --- End Feedback ---

      return true; // Block was destroyed
    } else {
      // Update health
      this.blockHealth.set(key, newHealth);

      // --- Add Feedback ---
      // TODO: Add damage particle/sound effect? (Optional)
      // Example: Play a softer hit sound or smaller particle effect
      // const blockCoordCenter = { x: coord.x + 0.5, y: coord.y + 0.5, z: coord.z + 0.5 };
      // this.worldInstance.createParticleEffect(blockCoordCenter, 'block_hit_effect');
      // new Audio({ uri: 'audio/sfx/block_hit.mp3', position: blockCoordCenter, volume: 0.5 }).play(this.worldInstance);
      // --- End Feedback ---

      return false; // Block was damaged but not destroyed
    }
  }

  /**
   * Gets the current health of a registered block.
   * @param coord The coordinate of the block
   * @returns The current health, or undefined if not registered/destructible.
   */
  public getBlockHealth(coord: Vector3Like): number | undefined {
    const key = this.getCoordKey(coord);
    return this.blockHealth.get(key);
  }

  /**
   * Checks if a block at the given coordinate is registered and has health.
   * @param coord The coordinate of the block
   * @returns True if the block is registered, false otherwise.
   */
  public isBlockRegistered(coord: Vector3Like): boolean {
    const key = this.getCoordKey(coord);
    return this.blockHealth.has(key);
  }
}
