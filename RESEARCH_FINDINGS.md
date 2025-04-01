# Research Findings for CyberCrawler

## 1. HYTOPIA SDK Features

### Entity Creation and Management

The HYTOPIA SDK provides a robust entity system that forms the core of game development. Entities are objects in the physical world that can move and interact with physics . The SDK allows full control over all aspects of entities, including:

- **Entity Types**: Block entities (using textures) and model entities (using GLTF/GLB files)
- **Automatic Physics**: The SDK auto-generates appropriate rigid bodies and colliders based on entities
- **Custom Colliders**: You can override default colliders for specialized interactions
- **Animation Support**: Model entities support both looped and one-shot animations from GLTF files 

For our sci-fi rogue-lite dungeon crawler, we can use this system to create:
- Player characters with cybernetic enhancements
- Enemy security drones and mutants
- Resource entities (scrap metal, tech components)
- Craftable items and equipment

### Physics and Collision

The HYTOPIA SDK has a sophisticated physics system that handles:

- **Rigid Bodies**: Represents physical properties of entities
- **Colliders**: Defines the shape for collision detection (box, sphere, cylinder, etc.)
- **Collision Groups**: Controls which entities can collide with each other
- **Collision Callbacks**: Triggers functions when collisions occur 

For gameplay elements like combat and resource gathering, we can use collision detection to create:
- Hit detection for weapons
- Resource collection zones
- Enemy aggro ranges (using sensor colliders)
- Environmental hazards

```javascript
// Example of creating an entity with a custom sensor collider
const enemy = new Entity({
  controller: new SimpleEntityController(),
  modelUri: 'models/enemies/drone.gltf',
  rigidBodyOptions: {
    colliders: [
      // Main collider for the enemy
      Collider.optionsFromModelUri('models/enemies/drone.gltf', 1),
      // Detection range sensor
      {
        shape: ColliderShape.SPHERE,
        radius: 10,
        isSensor: true,
        tag: 'aggro-sensor',
        onCollision: (other, started) => {
          if (started && other instanceof PlayerEntity) {
            // React to player entering detection range
          }
        }
      }
    ]
  }
});
```

### Multiplayer Synchronization

HYTOPIA is built for multiplayer experiences with features such as:

- **Server-Authoritative Architecture**: All game logic runs on the server for anti-cheat protection 
- **Player Management**: The SDK handles player connections and synchronization
- **Input Handling**: Client inputs are sent to the server for validation
- **Networking**: The SDK automatically handles the complexities of network synchronization

This will enable our multiplayer dungeon exploration, co-op boss battles, and optional PvP combat.

## 2. Procedural Dungeon Generation Techniques

There are several well-established algorithms for procedural dungeon generation that we can implement in JavaScript for our HYTOPIA game:

### Room-Based Generation

This common approach places rooms randomly on a grid and then connects them with corridors . The implementation steps:

1. Generate a set number of rooms with random sizes
2. Check for and resolve room overlaps
3. Create a connection graph between rooms
4. Generate corridors between rooms

This would work well for our cyberpunk facility areas with distinct rooms and connecting hallways.

### Cellular Automata

For more organic, cave-like areas, cellular automata can generate natural-looking spaces . The process:

1. Start with a random noise grid (filled/empty cells)
2. Apply rules like "a cell becomes filled if 5+ neighboring cells are filled"
3. Run multiple iterations to smooth out the results

This could be used for mutated or overgrown sections of our dungeon.

### BSP (Binary Space Partitioning)

This method creates more structured dungeons :

1. Start with a rectangular space
2. Recursively divide it into smaller rectangles
3. Place rooms within each sub-rectangle
4. Connect the rooms with corridors

This approach could work well for the more structured, facility-like sections of our dungeon.

### Hybrid Approaches

Research suggests combining multiple generation techniques for more interesting levels . We could use different algorithms for different sections of our dungeon or combine them to create varied environments.

## 3. Cyberpunk Art Style for Voxel Games

For our game's visual identity, we can draw inspiration from various cyberpunk elements that work well in a voxel-based environment:

### Key Visual Elements

- **Neon Lighting**: Bright, contrasting colors against dark backgrounds
- **Urban Density**: Stacked architecture and cluttered environments
- **High-Tech/Low-Life**: Advanced technology alongside urban decay
- **Corporate Branding**: Logos and advertisements throughout environments 

### Color Palette

- Primary palette: Dark blues, purples, and blacks for backgrounds
- Accent colors: Neon pinks, blues, greens, and oranges for lighting and highlights
- Metallic tones: Silver, bronze, and gold for technological elements
- Weathered textures: Rust, grime, and patina for showing age and decay

### Environmental Features

- **Vertical Space**: Multi-level environments with vertical movement
- **Limited Natural Elements**: Sparse vegetation, often mutated or synthetic
- **Weather Effects**: Rain, fog, and atmospheric pollution
- **Holographic Elements**: Displays, interfaces, and projections

## 4. Game Balance and Progression Systems

### Resource Gathering and Crafting

In roguelite games, resource gathering and crafting provide meaningful progression:

- **Resource Scarcity**: Resources should be limited enough to create tension but sufficient to allow progress 
- **Resource Types**: Different tiers of resources (common to rare) create varied gathering goals
- **Crafting Progression**: Recipes should unlock gradually to maintain interest

### Difficulty Curve

The difficulty curve for roguelites typically follows one of two patterns:

1. **Standard Curve**: Difficulty increases as players progress deeper into the dungeon
2. **Inverse Curve**: Initially difficult but becomes easier as players unlock permanent upgrades 

For our game, a balanced approach might work best:
- Core gameplay challenging but fair from the beginning
- Permanent upgrades providing marginal advantages rather than necessary power
- Optional higher difficulty tiers for experienced players

### Progression Systems

Effective roguelite progression systems typically include:

- **Run-Based Progression**: Temporary power-ups found during each run
- **Meta Progression**: Permanent unlocks between runs
- **Knowledge Progression**: Players learning game mechanics and strategies 

Games like Hades and Enter the Gungeon are praised for balance in their progression systems where unlocks provide new options rather than pure power increases .

## 5. User Experience Design

### UI Layout for Roguelite Games

- **Minimalist HUD**: Show only essential information (health, resources, equipment)
- **Contextual Information**: Display additional details only when relevant
- **Clear Feedback**: Provide immediate feedback for player actions (damage numbers, resource collection indicators)

### Player Onboarding

- **Tutorial Area**: Safe starting zone to learn basic mechanics
- **Progressive Complexity**: Introduce mechanics gradually through gameplay
- **Optional Guidance**: Tooltips and hints that don't interrupt flow

### Feedback Systems

- **Visual Feedback**: Effects for hits, misses, critical strikes
- **Audio Cues**: Distinct sounds for different actions and events
- **Haptic Feedback**: Controller vibration for impactful moments (if supported)

## 6. Testing Strategy

### Game Feel Evaluation

- **Playtesting Sessions**: Regular testing with varied player skill levels
- **Recorded Gameplay Analysis**: Review recordings to identify pain points
- **Metrics Collection**: Track player deaths, resource acquisition, and progression speed

### Performance Benchmarking

- **Entity Count Testing**: Determine maximum entities for stable performance
- **Physics Simulation Stress Tests**: Test complex collision scenarios
- **Rendering Optimization**: Monitor and optimize frame rates

### Multiplayer Testing

- **Latency Simulation**: Test with artificial network delays
- **Concurrency Testing**: Verify stability with multiple simultaneous players
- **Edge Case Scenarios**: Test unusual player behaviors and interactions

## Next Steps

1. Set up the HYTOPIA SDK development environment
2. Create a simple prototype with basic movement and collision
3. Implement a procedural dungeon generation algorithm
4. Design core gameplay loops for resource gathering and crafting
5. Develop the visual style and art direction
