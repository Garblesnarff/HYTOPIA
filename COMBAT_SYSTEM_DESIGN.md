# Combat System Design

## Core Philosophy

The CyberCrawler combat system will leverage HYTOPIA's physics engine, entity management, and multiplayer capabilities to create engaging, tactical combat that scales well with multiple players. We'll focus on:

1. **Physics-Based Interactions**: Using HYTOPIA's collision system for realistic and satisfying combat
2. **Environmental Manipulation**: Allowing players to modify the terrain during combat
3. **Role Specialization**: Enabling players to adopt complementary combat styles
4. **Scalable Encounters**: Designing combat that becomes more interesting (not just harder) with more players

## Physics-Based Combat Mechanics

### 1. Momentum and Impact System

The core of our combat will use HYTOPIA's physics engine to create a momentum-based attack system:

- Attacks gain power based on movement speed and direction
- Powerful hits can knock enemies back or into environmental hazards
- Players can redirect enemy momentum or create chain reactions of collisions
- Physics-based staggering system where enemies lose balance after sufficient impact

```javascript
// Example implementation for momentum-based damage calculation
function calculateDamage(attacker, defender, weapon) {
  const baseWeaponDamage = weapon.baseDamage;
  const momentum = attacker.velocity.magnitude();
  const impactAngle = calculateImpactAngle(attacker, defender);
  
  // More damage for faster movement and direct hits
  const momentumMultiplier = Math.min(2.0, 1.0 + (momentum / 10.0));
  const angleMultiplier = Math.max(0.5, (1.0 - Math.abs(impactAngle) / Math.PI));
  
  return baseWeaponDamage * momentumMultiplier * angleMultiplier;
}
```

### 2. Environmental Interaction

HYTOPIA's voxel/block system allows for dynamic environmental combat:

- Destructible cover and walls that collapse under sufficient damage
- Ability to create temporary barriers or bridges during combat
- Environmental hazards that can be triggered (exploding containers, electrical shorts)
- Terrain that affects movement (sticky floors, bounce pads, speed lanes)

### 3. Physics-Based Projectiles

For ranged combat, we'll implement physically simulated projectiles:

- Projectiles affected by gravity and momentum
- Ricocheting shots that can bounce off surfaces
- Penetrating projectiles that can hit multiple enemies
- Area-effect weapons like grenades with physics-driven explosion effects

## Multiplayer Combat Scaling

### 1. Positional Role System

Rather than traditional class-based roles, we'll implement a dynamic position-based role system:

- **Front Line**: Players in close proximity to enemies gain defensive bonuses
- **Flanking**: Players attacking from angles where enemies aren't focused gain damage bonuses
- **Rear Support**: Players positioned behind allies gain bonuses to support abilities and ranged attacks
- **Elevation**: Players at higher elevations gain bonuses to ranged damage and visibility

This system encourages natural formation of tactics without forcing specific class choices.

### 2. Combo System

We'll implement a physics-based combo system that rewards group coordination:

- **Chain Impacts**: Enemies hit in quick succession take increasing damage
- **Volleying**: Enemies knocked between players gain a vulnerability state
- **Element Mixing**: Different weapon types create combinatory effects when used together
- **Formation Attacks**: Players attacking from multiple angles simultaneously trigger special effects

### 3. Scaling Encounter Design

To handle varying player counts effectively:

- Enemy density adjusts based on player count (not just health/damage scaling)
- Encounter spaces expand or contract based on player count
- Specialized enemies that counter large groups (area damage dealers, dividers)
- Boss mechanics that become more complex with more players (not just larger health pools)

## Weapon Systems

### 1. Melee Weapons

Melee weapons will focus on physics interactions:

- **Impact Weapons** (Hammers, Maces): High knockback, area damage, slower
- **Cutting Weapons** (Swords, Axes): Balanced damage/speed, can slice through multiple enemies
- **Precision Weapons** (Daggers, Spears): Fast attacks, critical hit bonuses
- **Special Weapons** (Whips, Chains): Unique physics interactions, pulling/swinging mechanics

### 2. Ranged Weapons

Ranged weapons focus on interesting projectile behaviors:

- **Ballistic Weapons**: Affected by gravity, high damage, require leading targets
- **Energy Weapons**: Instant hit, lower damage, overheating mechanics
- **Explosive Weapons**: Area damage, environmental destruction
- **Special Ranged**: Bouncing projectiles, homing capabilities, enemy marking

### 3. Tactical Equipment

Equipment with primarily utility function:

- **Movement Enhancers**: Grappling hooks, jump jets, dash modules
- **Field Generators**: Create temporary barriers, bridges, or effect zones
- **Drones/Turrets**: Deployable combat allies with basic AI
- **Hackable Tech**: Interface with environmental systems or enemy tech

## Combat Progression

### 1. Cybernetic Enhancement System

Players will gain combat abilities through cybernetic enhancements:

- **Neural Implants**: Time dilation, threat prediction, auto-targeting
- **Exoskeletal Augments**: Strength boosts, damage resistance, charge attacks
- **Mobility Systems**: Air dashes, wall running, enhanced jumping
- **Weapon Integration**: Direct neural interface bonuses to specific weapon types

### 2. Group Synergy System

As players work together more, they unlock synergy abilities:

- Combat history tracked between specific players
- Joint abilities that require coordination to execute
- Passive bonuses when fighting alongside familiar allies
- Special combo attacks that scale with player count

## Technical Implementation Details

### 1. Using HYTOPIA Physics Efficiently

```javascript
// Example collision setup for a melee weapon
const meleeWeapon = new Entity({
  modelUri: 'models/weapons/plasma_blade.gltf',
  rigidBodyOptions: {
    type: RigidBodyType.DYNAMIC,
    mass: 5,
    colliders: [
      {
        // Main weapon collider
        shape: ColliderShape.CAPSULE,
        halfHeight: 1.5,
        radius: 0.2,
        // Using collision callbacks for hit detection
        onCollision: (other, started, manifold) => {
          if (started && other instanceof EnemyEntity) {
            const hitVelocity = meleeWeapon.rigidBody.linearVelocity.magnitude();
            const damage = baseDamage * (1 + (hitVelocity * damageVelocityScale));
            const knockback = baseKnockback * hitVelocity;
            
            // Apply damage and physics impact
            other.takeDamage(damage);
            other.applyImpulse(meleeWeapon.rigidBody.linearVelocity.normalized().scale(knockback));
          }
        }
      }
    ]
  }
});
```

### 2. Scaling Performance for Large Battles

To maintain performance with many players and enemies:

- Dynamic physics LOD system (simplified physics for distant battles)
- Batched collision processing for groups of similar entities
- Priority-based processing for player-interactive elements
- Optimized network synchronization for physics state

### 3. Network Considerations

For reliable multiplayer combat:

- Server-authoritative hit detection and damage calculation
- Client-side prediction for responsive feel
- Optimized network packets for physics state
- Interpolation for smooth movement of distant players

## Unique HYTOPIA-Specific Features

### 1. Voxel Terrain Modification in Combat

Players can:
- Dig impromptu cover during firefights
- Create pitfalls for enemies to fall into
- Build temporary barricades
- Collapse structures onto enemies

### 2. Physics Trap Construction

Using the physics system, players can construct elaborate traps:
- Falling block traps
- Swinging pendulum hazards
- Chain reaction explosives
- Rube Goldberg-style combat setups

### 3. Massive Multi-Player Coordinated Attacks

Special attack types that scale with participant count:
- Phalanx formations that boost defense when players align
- Focus fire bonuses when multiple players target the same enemy
- Crowd control amplification when attacking from surrounding positions
- Boss-specific mechanics that require coordinated positioning

## Conclusion

This combat system leverages HYTOPIA's key strengths: physics simulation, voxel-based environments, and multiplayer scalability. By focusing on dynamic, physics-driven interactions rather than static ability rotations, we create a system that remains interesting across many play sessions and adapts naturally to different player counts.

The emphasis on positional tactics and environmental manipulation will create memorable, emergent gameplay moments that players will want to share, perfect for a community-focused game jam entry.
