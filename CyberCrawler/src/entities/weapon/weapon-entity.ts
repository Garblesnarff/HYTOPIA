import {
  Audio,
  Entity,
  Quaternion,
  Vector3Like,
  World,
  QuaternionLike,
  RaycastHit
} from 'hytopia';

import { COMBAT_CONFIG } from '../../constants/combat-config';

/**
 * CyberBladeEntity - A melee weapon that deals damage in close range
 * 
 * This weapon uses the player's "simple_interact" animation as a melee attack
 * motion since there are no specific melee attack animations in the player model.
 */
export class CyberBladeEntity extends Entity {
  private readonly _damage: number = COMBAT_CONFIG.CYBER_BLADE_DAMAGE;
  private readonly _range: number = COMBAT_CONFIG.CYBER_BLADE_RANGE;
  private readonly _attackRate: number = COMBAT_CONFIG.CYBER_BLADE_ATTACK_RATE;
  private readonly _attackSound: Audio;
  private readonly _hitSound: Audio;
  
  private _isAttacking: boolean = false;
  private _lastAttackTime: number = 0;
  
  constructor() {
    super({
      name: 'Cyber Blade',
      modelUri: 'models/items/sword.gltf', // Using a basic sword model
      modelScale: 0.8,
      // Set parent and relative position in the equip method
    });
    
    // Setup sound effects
    this._attackSound = new Audio({
      attachedToEntity: this,
      uri: 'audio/sfx/sword-swing.mp3',
      volume: 0.5,
      referenceDistance: 5,
    });
    
    this._hitSound = new Audio({
      attachedToEntity: this,
      uri: 'audio/sfx/hit.mp3',
      volume: 0.7,
      referenceDistance: 5,
    });
  }
  
  /**
   * Equip the weapon to a player entity
   * @param parentEntity The player entity to equip the weapon to
   */
  public equip(parentEntity: Entity): void {
    if (!this.isSpawned || !this.world) return;
    
    // Set parent and position relative to player's hand
    this.setParent(parentEntity, 'hand_right_anchor');
    this.setPosition({ x: 0, y: 0.1, z: 0 });
    this.setRotation(Quaternion.fromEuler(-90, 0, 90));
    
    // Set player's animations to hold the weapon
    if (parentEntity.hasOwnProperty('playerController')) {
      const playerController = (parentEntity as any).playerController;
      if (playerController) {
        playerController.idleLoopedAnimations = ['idle_upper', 'idle_lower'];
      }
    }
  }
  
  /**
   * Unequip the weapon from its parent
   */
  public unequip(): void {
    this.setParent(undefined);
    
    // Reset player's animations
    const previousParent = this.parent;
    if (previousParent && previousParent.hasOwnProperty('playerController')) {
      const playerController = (previousParent as any).playerController;
      if (playerController) {
        playerController.idleLoopedAnimations = ['idle_upper', 'idle_lower'];
      }
    }
  }
  
  /**
   * Perform a melee attack
   * @returns boolean Whether the attack was performed
   */
  public attack(): boolean {
    if (!this.parent || !this.world || this._isAttacking) return false;
    
    const now = performance.now();
    if (now - this._lastAttackTime < 1000 / this._attackRate) return false;
    
    this._lastAttackTime = now;
    this._isAttacking = true;
    
    // Play attack animation on parent entity (player)
    this.parent.startModelOneshotAnimations(['simple_interact']);
    
    // Play attack sound
    this._attackSound.play(this.world);
    
    // Perform raycast to detect hits
    const hit = this._performAttackRaycast();
    if (hit) {
      this._processHit(hit);

      // Spawn hit particle effect
      if (this.world) {
        // Spawn a temporary hit effect entity at the hit point
        const effect = new Entity({
          name: 'HitEffect',
          blockTextureUri: 'blocks/coal-ore.png',
          blockHalfExtents: { x: 0.3, y: 0.3, z: 0.3 },
        });

        // Offset effect slightly forward from hit point
        const offset = 0.2;
        const dir = (() => {
          if (this.parent && (this.parent as any).player?.camera?.facingDirection) {
            return (this.parent as any).player.camera.facingDirection;
          }
          return { x: 0, y: 0, z: 1 };
        })();

        const spawnPos = {
          x: hit.hitPoint.x + dir.x * offset,
          y: hit.hitPoint.y + dir.y * offset + 1.5, // raise 1.5 blocks higher
          z: hit.hitPoint.z + dir.z * offset,
        };

        for (let i = 0; i < 2; i++) {
          const effect = new Entity({
            name: 'HitEffect',
            blockTextureUri: 'blocks/coal-ore.png',
            blockHalfExtents: { x: 0.3, y: 0.3, z: 0.3 },
          });

          effect.spawn(this.world, spawnPos);

          // Spin effect for visibility
          effect.setAngularVelocity?.({ x: 0, y: 5, z: 0 });

          setTimeout(() => {
            effect.despawn();
          }, 600); // Despawn after 0.6 seconds
        }
      }
    }
    
    // Reset attack state after animation
    setTimeout(() => {
      this._isAttacking = false;
    }, 500); // Animation duration approximation
    
    return true;
  }
  
  /**
   * Perform a raycast to detect hits
   * @returns The raycast hit result or undefined if no hit
   */
  private _performAttackRaycast(): RaycastHit | undefined {
    if (!this.parent || !this.world) return undefined;
    
    // Use parent's position and direction
    const parent = this.parent;
    const origin = parent.position;
    
    // Determine attack direction - use camera direction if parent has camera
    let direction: Vector3Like = { x: 0, y: 0, z: 1 }; // Default forward direction
    
    if (parent.hasOwnProperty('player') && (parent as any).player.camera) {
      direction = (parent as any).player.camera.facingDirection;
    } else {
      // Use parent's forward direction as fallback
      const forwardVector = (Quaternion as any).forward(parent.rotation);
      direction = forwardVector;
    }
    
    // Perform the raycast
    const result = this.world.simulation.raycast(
      origin,
      direction,
      this._range,
      {
        filterExcludeRigidBody: parent.rawRigidBody,
      }
    );
    return result === null ? undefined : result;
  }
  
  /**
   * Process a hit from the attack raycast
   * @param hit The raycast hit result
   */
  private _processHit(hit: RaycastHit): void {
    const hitEntity = hit.hitEntity;
    if (!hitEntity) return;
    
    if (typeof (hitEntity as any).takeDamage === 'function') {
      (hitEntity as any).takeDamage(this._damage);
      
      // Play hit sound
      this._hitSound.play(this.world!);
      
      // Optional: spawn hit effect particles here
    }
  }
}

export default CyberBladeEntity;
