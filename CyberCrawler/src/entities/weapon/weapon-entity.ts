/**
 * WeaponEntity - A melee weapon entity attached to a player
 * 
 * Handles attack animations, raycast hit detection, and damage application.
 * Designed to be attached as a child entity to the player's hand.
 * 
 * Dependencies:
 * - HYTOPIA SDK Entity, Audio
 * - PlayerEntity
 * 
 * @author Cline
 */

import { Entity, PlayerEntity, Audio, Vector3Like } from 'hytopia';

export class WeaponEntity extends Entity {
  protected _damage: number;
  protected _range: number;
  protected _cooldown: number = 0;
  protected _owner: PlayerEntity | null = null;

  constructor(options: {
    name: string;
    modelUri: string;
    damage: number;
    range: number;
  } & Record<string, any>) {
    super({
      modelScale: 1,
      ...options, // allow parent, parentNodeName, etc.
    });

    this._damage = options.damage;
    this._range = options.range;
  }

  /**
   * Set the player entity who owns this weapon
   * @param owner PlayerEntity
   */
  public setOwner(owner: PlayerEntity): void {
    this._owner = owner;
  }

  /**
   * Perform a melee attack with this weapon
   */
  public attack(): void {
    if (!this._owner || !this._owner.world || this._cooldown > 0) return;

    // Play attack animation on weapon and player
    this.startModelOneshotAnimations(['attack']);
    this._owner.startModelOneshotAnimations(['attack']);

    // Play attack sound
    new Audio({
      attachedToEntity: this,
      uri: 'audio/sfx/hit.mp3',
      loop: false,
      volume: 1,
    }).play(this._owner.world);

    // Perform raycast in camera direction
    const raycastResult = this._owner.world.simulation.raycast(
      this._owner.position,
      this._owner.player.camera.facingDirection,
      this._range,
      { filterExcludeRigidBody: this._owner.rawRigidBody }
    );

    if (raycastResult?.hitEntity) {
      const hitEntity = raycastResult.hitEntity;

      if (typeof (hitEntity as any).takeDamage === 'function') {
        (hitEntity as any).takeDamage(this._damage);

        // Play hit sound
        new Audio({
          position: raycastResult.hitPoint,
          uri: 'audio/sfx/hit.mp3',
          loop: false,
          volume: 1,
        }).play(this._owner.world);

        // Optional: spawn hit effect particles here
      }
    }

    // Set cooldown (ms)
    this._cooldown = 500;
    setTimeout(() => {
      this._cooldown = 0;
    }, 500);
  }
}

export default WeaponEntity;
