# Design Decisions

This document contains our answers to the questions posed in QUESTIONS_AND_INFO_NEEDED.md, representing our design decisions for CyberCrawler.

## Game Design Decisions

### 1. Visual Style Specifics

- **Cyberpunk Aesthetic**: We'll aim for a balanced approach - a high-tech world with visible decay. The environment should showcase advanced technology that has been repurposed, damaged, or jury-rigged. This creates a perfect setting for our resource gathering and crafting mechanics.

- **Color Palette**: 
  - Primary: Deep blues and dark purples for the base environment
  - Secondary: Gray metallic tones for infrastructure
  - Accent: Vibrant neon pinks, teals, and oranges for lighting, interfaces, and energy sources
  - Contrast: Rust, corrosion, and organic growths to show decay

- **Perspective**: Third-person perspective, allowing players to see their character and surrounding environment clearly. This works well with the voxel-based style and makes combat more engaging as players can see enemies approaching from all directions.

### 2. Gameplay Balance

- **Difficulty Level**: Medium-high difficulty with a learning curve. Players should expect to fail their first few runs, but the game should become more manageable as they:
  1. Learn enemy patterns and dungeon layouts
  2. Unlock permanent upgrades
  3. Develop effective strategies

- **Play Session Length**: 20-30 minutes for a typical run. This allows players to complete a run during a short gaming session but is long enough to create meaningful progression.

- **Progression Speed**:
  - Run Progression: Players should find new equipment or resources every 2-3 rooms
  - Meta Progression: Meaningful permanent upgrades should be achievable every 2-3 runs
  - Knowledge Progression: Players should discover new mechanics or strategies regularly

### 3. Procedural Generation Details

- **Dungeon Size and Complexity**:
  - 5-7 distinct biomes/zones with different themes
  - 15-20 rooms per level for larger play spaces
  - 7-10 levels of depth
  - Multiple concurrent paths to accommodate larger groups
  - Dynamic scaling based on player count (more players = more enemies, resources)
  - Increasing complexity and danger as players descend

- **Visual Variety Between Levels**:
  - Level 1-2: Security Zone (clean, functional, automated security)
  - Level 3-4: Research Labs (experimental tech, containment breaches)
  - Level 5-6: Maintenance Areas (industrial, utility-focused)
  - Level 7-8: Overgrown Areas (nature reclaiming technology)
  - Level 9-10: Core Systems (high-tech, energy-focused, most dangerous)
  - Special zones that can appear on any level

- **Special Room Types**:
  - Boss Arenas: Massive spaces for large-scale encounters
  - Challenge Rooms: High-risk, high-reward optional areas
  - Resource Caches: Areas rich with specific resource types
  - Safe Zones: Areas where enemies cannot spawn
  - Trading Posts: Rare rooms with NPC vendors
  - Puzzle Rooms: Environmental challenges with rewards
  - Split Path Sections: Areas requiring player coordination across separate paths
  - Assembly Halls: Large gathering spaces for player coordination
  - Defense Points: Areas where players must hold position against waves of enemies

### 4. Combat System

- **Combat Focus**: Balanced approach with viable options for both melee and ranged combat. Different enemy types will encourage switching between styles.

- **Weapon Variety**:
  - Melee: Vibro-blades, power fists, shock batons, plasma cutters
  - Ranged: Energy pistols, scrap launchers, railguns, beam rifles
  - Area Effect: EMP grenades, nano clouds, proximity mines
  - Special: Deployable turrets, combat drones, hacking tools

- **Combat Mechanics**:
  - Dodge/dash system for mobility
  - Shield/health management
  - Ammo/energy conservation for ranged weapons
  - Special abilities with cooldowns from cybernetic enhancements
  - Environmental interactions (explosive containers, hackable turrets)

### 5. Crafting Complexity

- **Crafting Depth**: Medium complexity - easy to understand but with meaningful choices.
  - Resource requirements clearly communicated
  - Upgradeable items with multiple tiers
  - Specialization paths for different playstyles

- **Craftable Items**: ~25-30 total items across categories:
  - Weapons (8-10)
  - Armor/Shields (4-6)
  - Cybernetic Enhancements (6-8)
  - Consumables (4-6)
  - Tools and Utility Items (3-4)

- **Resource Tiers**:
  - Common (75% of resources): Basic scrap, common components
  - Uncommon (20% of resources): Specialized tech, energy cells
  - Rare (4% of resources): Advanced alloys, experimental tech
  - Unique (1% of resources): One-of-a-kind materials from bosses

### 6. Multiplayer Implementation

- **Player Count**: 
  - Village Hub: Up to 50+ concurrent players in the community space
  - Dungeon Expeditions: Up to 16 players per dungeon instance
  - Guild/Clan System: Support for larger organized groups

- **Community Building**:
  - Shared village construction with player-contributed resources
  - Specialized roles (builders, crafters, explorers, defenders)
  - Community goals and achievements
  - Public crafting stations that can be upgraded by group effort

- **Cooperative vs. Competitive Balance**:
  - Primary Focus (70%): Cooperative gameplay (community building, resource sharing)
  - Secondary Focus (20%): Guild/team competition (fastest dungeon clear, most resources)
  - Tertiary Option (10%): Designated PvP zones or opt-in PvP mode

- **Player Communication**:
  - Context-sensitive ping system (mark enemies, resources, points of interest)
  - Quick chat with predefined messages
  - Zone-based text chat (proximity, team, global)
  - Emote system for non-verbal communication
  - Community bulletin board for asynchronous communication

## Technical Decisions

### 1. HYTOPIA SDK Specifics

- We'll use the latest version available during the game jam
- We'll leverage HYTOPIA's massively multiplayer capabilities to support our community-based design
- We'll implement optimization strategies for handling larger player counts:
  - Dynamic level-of-detail system based on player proximity
  - Zoned physics simulation with priority on player-interactive areas
  - Entity instance pooling and recycling
  - Distributed processing of AI behaviors
- Performance considerations:
  - View distance scaling based on player count
  - Priority rendering for important gameplay elements
  - Simplified physics for distant or non-critical entities
  - Optimized network synchronization for large player groups

### 2. Asset Requirements

- **3D Models**: GLTF/GLB format as supported by HYTOPIA
- **Textures**: 
  - Primary textures: 256x256 pixels for most objects
  - Detail textures: 128x128 pixels for smaller elements
  - UI textures: 512x512 pixels for clarity
  - All textures will use PNG format for transparency support

- **Audio**:
  - MP3 format for music (smaller file size)
  - WAV format for sound effects (better quality)
  - Maximum of 10 concurrent audio sources playing

### 3. Development Environment

- **IDE/Editor**: VSCode with JavaScript/TypeScript extensions
- **Version Control**: Git with regular commits and descriptive messages
- **Testing Process**: 
  - Regular playtesting sessions
  - Manual feature testing
  - Simulated stress testing for multiplayer

### 4. Deployment Process

- We'll follow the specific requirements provided by the HYTOPIA Game Jam
- Documentation will include:
  - Installation/launch instructions
  - Gameplay guide
  - Controls reference
  - Known issues list
- We'll conduct thorough testing prior to submission
- We'll create a gameplay demonstration video

## Conclusion

These decisions provide a clear direction for our development efforts while still allowing flexibility as we implement and test features. We can revisit and adjust these decisions as needed based on technical constraints or gameplay feedback during development.
