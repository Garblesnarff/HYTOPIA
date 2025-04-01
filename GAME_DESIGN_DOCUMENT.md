# CyberCrawler - Game Design Document

## Game Concept

CyberCrawler is a sci-fi rogue-lite dungeon crawler with crafting mechanics built for the HYTOPIA Game Jam 2. Players explore procedurally generated dungeons, gather resources, craft items, and enhance their character with cybernetic upgrades.

## Core Gameplay Loop

1. **Explore** the cyberpunk village hub and interact with characters
2. **Gather** resources from the environment and defeated enemies
3. **Craft** and upgrade equipment, weapons, and cybernetic enhancements
4. **Delve** into the procedurally generated dungeon
5. **Battle** enemies and bosses
6. **Advance** deeper or return to the hub with gathered resources
7. **Improve** your character and base between runs

## Game Systems

### 1. Resource Gathering

Players can collect various types of resources throughout the game world:

| Resource Type | Rarity | Found In | Used For |
|---------------|--------|----------|----------|
| Scrap Metal | Common | Throughout environment, defeated drones | Basic crafting, structures |
| Tech Components | Uncommon | Security systems, defeated robots | Gadgets, weapons |
| Mutated Plants | Uncommon | Overgrown areas | Potions, biological enhancements |
| Energy Cells | Uncommon | Power systems | High-tech items |
| Rare Metals | Rare | Deep dungeon areas | Advanced weapons, armor |
| Ancient Artifacts | Very Rare | Boss rewards, hidden areas | Special abilities |
| Nanobots | Rare | Research facilities | Repairs, cybernetic upgrades |

### 2. Crafting System

The crafting system allows players to create items using gathered resources. Different crafting stations enable different types of items:

#### Crafting Stations

1. **Basic Workbench**
   - First station available
   - Crafts simple tools, weapons, and structural elements
   - Required resources: Mostly scrap metal

2. **Cybernetics Lab**
   - Creates and installs cybernetic enhancements
   - Requires: Tech components, rare metals
   - Allows character customization and ability upgrades

3. **Tech Workshop**
   - Creates electronic gadgets and advanced weapons
   - Requires: Tech components, energy cells
   - Produces ranged weapons and utility items

4. **Chemistry Station**
   - Creates healing items, buffs, and special concoctions
   - Requires: Mutated plants, energy cells
   - Produces consumables that provide temporary effects

### 3. Character Progression

Player progression occurs through several systems:

#### Run-Based Progression
- Weapons and items found during dungeon runs
- Temporary buffs and power-ups
- Resources that can be brought back to the hub

#### Permanent Progression
- Cybernetic enhancements that persist between runs
- Base improvements (upgraded crafting stations)
- New crafting recipes unlocked

#### Skill-Based Progression
- Player knowledge of enemy patterns
- Combat techniques and strategies
- Dungeon layout recognition

### 4. Combat System

Combat is real-time and skill-based, utilizing the HYTOPIA physics system:

#### Weapon Types
- **Melee**: Close-range weapons like vibro-blades and power fists
- **Ranged**: Energy pistols, scrap launchers, tech rifles
- **Area Effect**: EMP grenades, nano clouds
- **Deployable**: Turrets, drones, traps

#### Enemy Types
- **Security Drones**: Basic ranged enemies
- **Corrupted Workers**: Melee attackers
- **Mutants**: Fast and aggressive
- **Heavy Mechs**: Slow, heavily armored
- **Hacker Units**: Disrupt player abilities
- **Swarm Robots**: Weak individually but dangerous in groups
- **Elite Guards**: Mini-boss enemies with special attacks

#### Boss Encounters
- Unique boss battles at certain dungeon depths
- Multiple attack patterns and phases
- Special rewards for defeating bosses

### 5. Dungeon Generation

The dungeon is procedurally generated using multiple algorithms:

#### Dungeon Structure
- **Facility Areas**: Structured rooms and corridors (Room-based generation)
- **Maintenance Tunnels**: Narrow pathways connecting areas (BSP algorithm)
- **Overgrown Sections**: Natural cave-like areas (Cellular automata)
- **Special Rooms**: Hand-designed rooms inserted into the procedural layout

#### Dungeon Features
- **Hacking Terminals**: Unlock doors or reveal secrets
- **Power Nodes**: Activate/deactivate security systems
- **Radiation Zones**: Damage over time unless protected
- **Scrap Piles**: Resource-rich areas
- **Abandoned Labs**: High-risk, high-reward areas
- **Secret Caches**: Hidden rooms with rare loot

#### Difficulty Scaling
- Deeper levels contain stronger enemies
- Resource quality increases with depth
- Environmental hazards become more dangerous

### 6. Multiplayer Interactions

The game supports multiplayer with various interaction types:

#### Cooperative Play
- Team up to explore dungeons
- Share resources and crafting abilities
- Revive fallen teammates

#### Optional PvP
- Combat between players in specific dungeon zones
- Resource stealing
- Competitive boss hunting

#### Shared Base Building
- Multiple players can contribute to village development
- Specialized roles (combat, resource gathering, crafting)

## Art Style

CyberCrawler features a voxel-based cyberpunk aesthetic:

### Visual Elements
- Neon-lit environments against dark backgrounds
- Vertical urban sprawl with multiple levels
- Mix of high-tech and decrepit structures
- Holographic displays and interfaces

### Color Palette
- Primary: Deep blues, purples, and blacks
- Accent: Neon pinks, teals, and oranges
- Metal: Chrome, bronze, and copper tones
- Decay: Rust, grime, and corrosion

## User Interface

### HUD Elements
- Health/Shield indicators
- Resource inventory
- Minimap
- Active equipment/abilities
- Objective markers

### Menus
- Inventory management
- Crafting interface
- Character upgrades
- Map overview
- Settings

## Audio Design

### Sound Categories
- **Ambient**: Background sounds for different environments
- **Interactive**: Feedback for player actions
- **Combat**: Weapon sounds, impacts, enemy alerts
- **UI**: Menu navigation, notifications
- **Music**: Dynamic soundtrack that adapts to gameplay

## Technical Requirements

### HYTOPIA SDK Implementation
- Entity system for all game objects
- Physics-based interactions
- Multiplayer synchronization
- Procedural generation algorithms

## Development Roadmap

### Phase 1: Core Mechanics (Days 1-4)
- Basic player movement and combat
- Simple procedural dungeon generation
- Resource gathering mechanics

### Phase 2: Systems Development (Days 5-8)
- Crafting system implementation
- Character progression
- Enemy AI and variety

### Phase 3: Content Creation (Days 9-11)
- Expanded dungeons and environments
- Additional weapons and items
- Boss encounters

### Phase 4: Multiplayer and Polish (Days 12-14)
- Multiplayer functionality
- UI refinement
- Balance adjustments
- Bug fixing and optimization
