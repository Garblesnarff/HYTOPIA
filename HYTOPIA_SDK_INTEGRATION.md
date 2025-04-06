# HYTOPIA SDK Integration Details

This document provides specific implementation details for integrating our game with the HYTOPIA SDK, focusing on the key systems required for our physics-based combat and multiplayer gameplay.

## Core HYTOPIA Systems Overview

The HYTOPIA SDK provides several key systems that our game will leverage:

1. **Entity System**: The foundation for all game objects with physics capabilities
2. **Physics Engine**: Handles rigid bodies, collisions, and physical interactions
3. **Multiplayer Framework**: Manages player connections and synchronization
4. **Block and Chunk System**: Enables creation of voxel-based environments
5. **Event System**: Provides communication between game components

## Entity System Implementation - IMPLEMENTED

### Entity Creation Patterns - IMPLEMENTED

HYTOPIA's entity system is central to our game. Here's how we've structured our entities:

```javascript
// Player entity example
const createPlayerEntity = (world, spawnPosition, options = {}) => {
  const playerEntity = new PlayerEntity({
    // Model configuration
    modelUri: options.modelUri || 'models/characters/default.gltf',
    modelScale: options.modelScale || 1.0,
    modelLoopedAnimations: ['idle'],
    
    // Physics configuration - critical for our momentum-based combat
    rigidBodyOptions: {
      mass: options.mass || 75,
      colliders: [
        // Main character collider
        {
          shape: ColliderShape.CAPSULE,
          height: 1.8,
          radius: 0.4,
          // Specific collision groups for player entities
          collisionGroups: CollisionGroups.PLAYER
        },
        // Weapon hitbox collider (for combat)
        {
          shape: ColliderShape.SPHERE,
          radius: 0.5,
          offset: { x: 0.5, y: 0, z: 0 },
          isSensor: true,  // Important: Sensors detect but don't physically collide
          tag: 'weapon-hitbox',
          // Custom collision callback for hit detection
          onCollision: (other, started, manifold) => {
            if (started && other instanceof EnemyEntity) {
              // Combat hit detection logic here
            }
          }
        }
      ]
    }
  });
  
  // Register entity event handlers
  playerEntity.on(EntityEvent.ENTITY_COLLISION, handlePlayerCollision);
  
  // Spawn entity in world
  playerEntity.spawn(world, spawnPosition);
  
  return playerEntity;
};
```

**IMPLEMENTATION DETAILS**: We've successfully implemented a similar pattern in our playerController.ts file. The player entity is created with appropriate model configuration and physics properties. We've extended the PlayerEntityController with our own CyberCrawlerController class to add custom abilities like dash. Entity creation follows the HYTOPIA patterns for defining colliders and event handlers.

### Entity Management Strategy - PARTIALLY IMPLEMENTED

For our MMO approach with potentially many entities, we'll implement:

1. **Entity Pooling**: Reuse entity objects instead of creating/destroying them
2. **Spatial Partitioning**: Only process entities near players
3. **LOD System**: Simplify physics for distant entities

**IMPLEMENTATION STATUS**: Basic entity management is implemented in the world-map.ts file for spawning and controlling resource entities, but the advanced pooling, partitioning, and LOD systems have not been fully implemented yet.

## Physics System Implementation - PARTIALLY IMPLEMENTED

HYTOPIA's physics system is critical for our momentum-based combat mechanics. Here's how we'll implement specific physics behaviors:

### Momentum-Based Combat - PARTIALLY IMPLEMENTED

Our combat system will use physics forces, impulses, and collision detection:

```javascript
// Example melee attack function
function performMeleeAttack(attacker, weapon) {
  // Get attack direction and velocity
  const direction = attacker.directionFromRotation;
  const attackVelocity = attacker.rigidBody.linearVelocity.magnitude();
  
  // Calculate damage based on momentum
  const baseDamage = weapon.baseDamage;
  const momentumMultiplier = Math.min(2.0, 1.0 + (attackVelocity / 10.0));
  const finalDamage = baseDamage * momentumMultiplier;
  
  // Apply weapon impulse
  weapon.rigidBody.applyImpulse({
    x: direction.x * weapon.impulsePower,
    y: direction.y * weapon.impulsePower,
    z: direction.z * weapon.impulsePower
  });
  
  // Weapon collision is handled via the onCollision callback in entity creation
  
  return finalDamage;
}
```

**IMPLEMENTATION DETAILS**: We've implemented a similar structure in our CyberCrawlerController class, specifically in the performMeleeAttack function. The function uses raycast for hit detection and includes placeholder logic for damage calculation. The dash ability also uses physics forces through the applyImpulse function. However, the full momentum-based combat system with weapons is not yet fully implemented.

### Custom Collision Groups - PARTIALLY IMPLEMENTED

We'll define specific collision groups to control interaction between different entity types:

```javascript
// Example collision groups setup
const CustomCollisionGroups = {
  PLAYER: new CollisionGroups()
    .add(DefaultCollisionGroups.CHARACTER)
    .remove(DefaultCollisionGroups.ENEMY),
    
  ENEMY: new CollisionGroups()
    .add(DefaultCollisionGroups.CHARACTER)
    .add(DefaultCollisionGroups.ENEMY),
    
  RESOURCE: new CollisionGroups()
    .add(DefaultCollisionGroups.BLOCK)
    .remove(DefaultCollisionGroups.CHARACTER),
    
  WEAPON: new CollisionGroups()
    .add(DefaultCollisionGroups.BLOCK)
    .add(DefaultCollisionGroups.CHARACTER)
    .add(DefaultCollisionGroups.ENEMY)
};
```

**IMPLEMENTATION STATUS**: Basic collision detection is implemented for resource entities (MutatedPlantEntity and ScrapMetalEntity) using onCollision callbacks, but custom collision groups for advanced interactions have not been fully defined yet.

### Physics Optimization - NOT IMPLEMENTED

For handling larger player counts, we'll implement:

1. **Zoned Physics**: Only run full physics in player-occupied areas
2. **Physics LOD**: Simplify collision shapes for distant entities
3. **Sleep States**: Deactivate physics for inactive entities

**IMPLEMENTATION STATUS**: These optimizations have not been implemented yet.

## Multiplayer Implementation - MINIMALLY IMPLEMENTED

### Server-Authoritative Model - MINIMALLY IMPLEMENTED

HYTOPIA uses a server-authoritative model, which we'll leverage for secure gameplay:

```javascript
// Server-side combat validation example
function validateAttack(player, target, damage) {
  // Check if attack is possible (distance, line of sight, etc.)
  if (!canAttack(player, target)) {
    return false;
  }
  
  // Verify damage calculation
  const expectedDamage = calculateExpectedDamage(player, target);
  if (Math.abs(damage - expectedDamage) > DAMAGE_TOLERANCE) {
    // Potential cheating, reject attack
    return false;
  }
  
  // Apply validated damage
  applyDamage(target, expectedDamage);
  return true;
}
```

**IMPLEMENTATION STATUS**: Basic server-authoritative model is used for player connections and world state, but advanced validation for combat and interactions has not been implemented yet.

### Client Prediction and Reconciliation - NOT IMPLEMENTED

To ensure smooth gameplay despite network latency:

```javascript
// Client-side prediction example
class ClientPrediction {
  constructor(player) {
    this.player = player;
    this.pendingInputs = [];
    this.lastProcessedInput = 0;
  }
  
  // Process local input immediately
  processInput(input) {
    // Apply input locally
    this.applyInput(input);
    
    // Store for reconciliation
    this.pendingInputs.push(input);
    
    // Send to server
    this.sendToServer(input);
  }
  
  // Handle server update
  handleServerUpdate(serverState, lastProcessedInput) {
    // Update official state
    this.player.position = serverState.position;
    this.player.rotation = serverState.rotation;
    
    // Remove processed inputs
    this.pendingInputs = this.pendingInputs.filter(
      input => input.sequence > lastProcessedInput
    );
    
    // Reapply pending inputs
    this.pendingInputs.forEach(input => this.applyInput(input));
  }
  
  // Apply a single input
  applyInput(input) {
    // Movement logic
    // ...
  }
}
```

**IMPLEMENTATION STATUS**: This system has not been implemented yet.

### Player Synchronization - MINIMALLY IMPLEMENTED

For our MMO approach with many players:

1. **Interest Management**: Only sync entities relevant to each player
2. **Delta Compression**: Only send state changes, not full state
3. **Priority System**: Prioritize nearby player updates

**IMPLEMENTATION DETAILS**: Basic player synchronization is implemented in the main index.ts file, allowing players to join, leave, and see each other in the world. However, advanced synchronization features like interest management and delta compression have not been implemented yet.

## Procedural Dungeon Generation - PARTIALLY IMPLEMENTED

We'll implement a modular dungeon generation system using HYTOPIA's world and chunk systems:

### Room-Based Generator - PARTIALLY IMPLEMENTED

```javascript
// Example room-based dungeon generator
class DungeonGenerator {
  constructor(options = {}) {
    this.roomCount = options.roomCount || 20;
    this.minRoomSize = options.minRoomSize || 5;
    this.maxRoomSize = options.maxRoomSize || 15;
    this.corridorWidth = options.corridorWidth || 3;
    this.rooms = [];
    this.corridors = [];
  }
  
  generate(world) {
    // Generate rooms with random sizes
    this.generateRooms();
    
    // Connect rooms with corridors
    this.connectRooms();
    
    // Place rooms and corridors in world
    this.buildInWorld(world);
    
    return {
      rooms: this.rooms,
      corridors: this.corridors
    };
  }
  
  generateRooms() {
    for (let i = 0; i < this.roomCount; i++) {
      // Random room parameters
      const width = Math.floor(Math.random() * 
        (this.maxRoomSize - this.minRoomSize + 1)) + this.minRoomSize;
      const height = Math.floor(Math.random() * 
        (this.maxRoomSize - this.minRoomSize + 1)) + this.minRoomSize;
      
      // Random position (with collision checks)
      let position;
      let attempts = 0;
      let validPosition = false;
      
      while (!validPosition && attempts < 50) {
        position = {
          x: Math.floor(Math.random() * 100) - 50,
          y: 0,
          z: Math.floor(Math.random() * 100) - 50
        };
        
        validPosition = this.checkRoomPosition(position, width, height);
        attempts++;
      }
      
      if (validPosition) {
        this.rooms.push({
          position,
          width,
          height,
          connections: []
        });
      }
    }
  }
  
  // Additional methods for room connection, etc.
}
```

**IMPLEMENTATION DETAILS**: The world-map.ts file implements a similar structure for world generation, including terrain features, area definition, and path connections. However, the full procedural dungeon generation with room-based algorithms has not been fully implemented yet. The current implementation focuses on surface world generation rather than interior dungeon spaces.

### Entity Placement in Procedural Dungeons - PARTIALLY IMPLEMENTED

```javascript
// Example entity placement in dungeons
function populateDungeon(world, dungeon, entityManager) {
  // Place enemies based on room size and dungeon depth
  dungeon.rooms.forEach(room => {
    const roomArea = room.width * room.height;
    const enemyCount = Math.floor(roomArea / 25) + 
      Math.floor(dungeon.depth / 2);
    
    // Place enemies
    for (let i = 0; i < enemyCount; i++) {
      const position = getRandomPositionInRoom(room);
      const enemyType = selectEnemyTypeForDepth(dungeon.depth);
      
      entityManager.createEntity('enemy', {
        type: enemyType,
        position
      });
    }
    
    // Place resources
    const resourceCount = Math.floor(roomArea / 40);
    for (let i = 0; i < resourceCount; i++) {
      const position = getRandomPositionInRoom(room);
      const resourceType = selectResourceTypeForDepth(dungeon.depth);
      
      entityManager.createEntity('resource', {
        type: resourceType,
        position
      });
    }
  });
}
```

**IMPLEMENTATION DETAILS**: Resource placement is implemented in the spawn-mutated-plants.ts and spawn-scrap-metal.ts files, which place resources at predefined positions in the world. However, the dynamic entity placement based on procedural generation has not been fully implemented yet.

## Animation and Visual Feedback - PARTIALLY IMPLEMENTED

HYTOPIA provides animation support for model entities, which we'll use for player and enemy animations:

```javascript
// Example animation controller
class AnimationController {
  constructor(entity) {
    this.entity = entity;
    this.currentState = 'idle';
    this.transitionTime = 0;
    
    // Define states and transitions
    this.states = {
      idle: { looped: true, transitions: ['walk', 'attack', 'hit'] },
      walk: { looped: true, transitions: ['idle', 'run', 'attack'] },
      run: { looped: true, transitions: ['walk', 'idle', 'attack'] },
      attack: { looped: false, transitions: ['idle', 'hit'], duration: 0.8 },
      hit: { looped: false, transitions: ['idle'], duration: 0.5 }
    };
  }
  
  // Change animation state
  setState(newState) {
    if (this.states[this.currentState].transitions.includes(newState)) {
      // Stop current animations that aren't the new state
      this.entity.stopModelAnimations(
        Array.from(this.entity.modelLoopedAnimations)
          .filter(v => v !== newState)
      );
      
      // Play the new animation
      if (this.states[newState].looped) {
        this.entity.startModelLoopedAnimations([newState]);
      } else {
        this.entity.playModelAnimation(newState);
        
        // Auto-transition back to idle after duration
        this.transitionTime = Date.now() + 
          (this.states[newState].duration * 1000);
      }
      
      this.currentState = newState;
    }
  }
  
  // Update animation state
  update() {
    // Check for auto-transitions
    if (!this.states[this.currentState].looped && 
        Date.now() > this.transitionTime) {
      this.setState('idle');
    }
  }
}
```

**IMPLEMENTATION STATUS**: Basic animations for the player entity are implemented, but a full animation controller with state transitions has not been implemented yet.

## Performance Optimization Strategies - NOT IMPLEMENTED

### Entity Culling System - NOT IMPLEMENTED

```javascript
// Example entity culling system
class EntityCullingSystem {
  constructor(world) {
    this.world = world;
    this.viewDistance = 100;
    this.updateInterval = 1000; // ms
    this.lastUpdate = 0;
  }
  
  update(timestamp) {
    // Only update at specified interval
    if (timestamp - this.lastUpdate < this.updateInterval) {
      return;
    }
    
    this.lastUpdate = timestamp;
    
    // Get all player positions
    const playerPositions = Array.from(this.world.playerManager.players.values())
      .map(player => player.position);
    
    // Process all entities
    this.world.entityManager.entities.forEach(entity => {
      // Skip players
      if (entity instanceof PlayerEntity) {
        return;
      }
      
      // Check if entity is near any player
      const isNearPlayer = playerPositions.some(playerPos => 
        this.isPositionInRange(entity.position, playerPos, this.viewDistance)
      );
      
      // Enable/disable entity processing
      if (isNearPlayer && !entity.active) {
        this.activateEntity(entity);
      } else if (!isNearPlayer && entity.active) {
        this.deactivateEntity(entity);
      }
    });
  }
  
  // Additional helper methods
}
```

**IMPLEMENTATION STATUS**: This system has not been implemented yet.

### Network Optimization - NOT IMPLEMENTED

```javascript
// Example network prioritization system
class NetworkPrioritizer {
  constructor(world) {
    this.world = world;
    this.updateFrequencies = {
      CRITICAL: 1,      // Every frame
      HIGH: 3,          // Every 3 frames
      MEDIUM: 10,       // Every 10 frames
      LOW: 30           // Every 30 frames
    };
  }
  
  getUpdatePriority(entity, player) {
    // Calculate distance to player
    const distance = this.calculateDistance(entity.position, player.position);
    
    // Determine priority based on distance and entity type
    if (entity instanceof PlayerEntity) {
      return distance < 10 ? 'CRITICAL' : 'HIGH';
    } else if (entity instanceof EnemyEntity) {
      if (distance < 20) return 'HIGH';
      else if (distance < 50) return 'MEDIUM';
      else return 'LOW';
    } else {
      return 'LOW';
    }
  }
  
  shouldUpdateEntity(entity, player, frameCount) {
    const priority = this.getUpdatePriority(entity, player);
    return frameCount % this.updateFrequencies[priority] === 0;
  }
}
```

**IMPLEMENTATION STATUS**: This system has not been implemented yet.

## Event System Usage - PARTIALLY IMPLEMENTED

HYTOPIA's event system will be used for communication between game components:

```javascript
// Example event-based combat system
class CombatSystem {
  constructor(world) {
    this.world = world;
    
    // Subscribe to relevant events
    world.on('player:attack', this.handlePlayerAttack.bind(this));
    world.on('entity:damaged', this.handleEntityDamaged.bind(this));
    world.on('entity:death', this.handleEntityDeath.bind(this));
  }
  
  handlePlayerAttack(data) {
    const { player, target, weapon } = data;
    
    // Calculate damage
    const damage = this.calculateDamage(player, target, weapon);
    
    // Apply damage
    this.applyDamage(target, damage);
    
    // Emit damage event
    this.world.emit('entity:damaged', {
      entity: target,
      damage,
      source: player
    });
  }
  
  // Additional event handlers
}
```

**IMPLEMENTATION DETAILS**: Basic event handlers are implemented in the main index.ts file for player joining/leaving and in the player controllers for handling collisions. The crafting system uses events for communication between the UI and server. However, a complete event-based combat system has not been fully implemented yet.

## Conclusion

This integration plan provides specific implementation details for utilizing the HYTOPIA SDK's capabilities in our game. By focusing on the strengths of the platform's physics, entity, and multiplayer systems, we can create a compelling physics-based combat experience in a voxel MMO environment.

**CURRENT STATUS SUMMARY**:
- Core HYTOPIA SDK integration is complete
- Entity system is well-implemented with custom entity classes for resources and crafting
- Physics system is partially implemented with player movement and dash
- World generation uses the HYTOPIA chunk and block systems for a 500x500 map
- Crafting system leverages the entity and UI systems effectively
- Multiplayer support is minimally implemented with basic player synchronization
- Event system is used for core functionality like player joining and resource collection
- Advanced features like procedural dungeon generation, combat physics, and network optimization are still in development

The foundation for a compelling game is in place, with key systems leveraging HYTOPIA's capabilities. The next development phases will build upon this foundation to implement the remaining features and optimize performance.
