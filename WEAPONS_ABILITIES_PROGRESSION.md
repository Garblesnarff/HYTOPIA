# Weapons, Abilities, and Progression Systems

This document outlines the weapons, skill trees, and abilities planned for CyberCrawler, focusing on systems that leverage HYTOPIA's physics engine and multiplayer capabilities.

## Weapon Systems - MINIMALLY IMPLEMENTED

### Melee Weapons - NOT IMPLEMENTED

Melee weapons focus on physics-based interactions and distinctive attack patterns.

| Weapon Type | Attack Style | Physics Properties | Special Features |
|-------------|--------------|-------------------|------------------|
| **Impact Weapons** |  |  |  |
| Power Hammer | Overhead smash | High mass, strong downward force | Terrain deformation, AOE shockwave |
| Cybernetic Fists | Rapid punches | Momentum-based damage | Combo system, increasing speed |
| Gravity Mace | Spinning attacks | Increasing centrifugal force | Pull/push gravitational field |
| **Cutting Weapons** |  |  |  |
| Vibro-Blade | Slashing combos | Low mass, high velocity | Can slice through multiple enemies |
| Plasma Cutter | Precision cuts | Heat damage over time | Can cut through certain barriers |
| Nano-Edge Axe | Heavy cleaves | Forward momentum | Armor penetration |
| **Precision Weapons** |  |  |  |
| Neural Spike | Quick stabs | Critical point targeting | Bonus damage to exposed systems |
| Energy Spear | Lunging attacks | Extended reach | Piercing damage through multiple targets |
| Shrapnel Claws | Ripping attacks | Multiple contact points | Causes bleeding/sustained damage |
| **Special Melee** |  |  |  |
| Techno-Whip | Arc attacks | Physics-based targeting | Can grab/pull objects and enemies |
| Grapple Gauntlet | Hook and pull | Chain physics | Swing around terrain, pull enemies |
| Force Shield | Bash and block | Repulsion field | Can reflect projectiles back to sender |

**IMPLEMENTATION STATUS**: The basic structure for melee combat is implemented in the performMeleeAttack function of the CyberCrawlerController class, but it's currently disabled due to SDK limitations with hit detection. No specific weapon types have been implemented yet.

### Ranged Weapons - NOT IMPLEMENTED

Ranged weapons utilize projectile physics and environmental interactions.

| Weapon Type | Fire Pattern | Physics Properties | Special Features |
|-------------|--------------|-------------------|------------------|
| **Ballistic Weapons** |  |  |  |
| Scrap Launcher | Arcing projectiles | Gravity-affected trajectory | Ricochets off surfaces |
| Rail Pistol | High-velocity shots | Penetration through targets | Charged shots for more damage |
| Magnet Rifle | Guided projectiles | Attraction to metal | Can disable robotic enemies |
| **Energy Weapons** |  |  |  |
| Plasma Thrower | Continuous beam | Heat transfer physics | Sets targets/environment on fire |
| Shock Cannon | Energy balls | Electric arc jumping | Chains between nearby enemies |
| Cryo Blaster | Freezing spray | Temperature physics | Slows enemies, makes surfaces slippery |
| **Explosive Weapons** |  |  |  |
| Grenade Launcher | Bouncing explosives | Complex bounce physics | Delayed detonation options |
| Seismic Charger | Ground-based blast | Terrain deformation | Creates cover or removes it |
| Mine Deployer | Proximity devices | Trigger physics | Creates hazard zones |
| **Special Ranged** |  |  |  |
| Gravity Gun | Physics manipulation | Can grab and throw objects | Use environment as ammo |
| Drone Controller | Autonomous unit | Independent physics object | Provides covering fire |
| Hacking Dart | System override | Minimal ballistics | Temporarily controls enemy units |

**IMPLEMENTATION STATUS**: Ranged weapons have not been implemented yet.

### Tactical Equipment - MINIMALLY IMPLEMENTED

Non-weapon equipment that enhances mobility and utility.

| Equipment Type | Function | Physics Integration | Team Benefits |
|----------------|----------|---------------------|--------------|
| **Movement Tech** |  |  |  |
| Jump Jets | Vertical mobility | Thrust physics | Can carry teammates short distances |
| Grapple Hook | Swing/pull mechanics | Rope physics | Can create ziplines for team |
| Wall Magnets | Vertical traversal | Surface adhesion | Can help teammates climb |
| **Field Devices** |  |  |  |
| Barrier Generator | Create cover | Solid physics object | Team can use for protection |
| Bridge Projector | Cross gaps | Platform physics | Creates paths for team |
| Gravity Pad | Altered gravity zone | Physics modifier | Team jumping/movement boost |
| **Deployables** |  |  |  |
| Sentry Turret | Automated defense | Independent physics | Covers team movements |
| Supply Beacon | Resource generation | Spawns physics objects | Team resource sharing |
| Repair Drone | Heal allies/structures | Autonomous movement | Group sustainability |

**IMPLEMENTATION DETAILS**: The dash ability is implemented in the CyberCrawlerController class and functions as a basic movement tech. It applies an impulse in the player's facing direction with a cooldown period. Other tactical equipment has not been implemented yet.

## Skill Trees & Progression Paths - NOT IMPLEMENTED

Instead of traditional class-based systems, we'll use a modular cybernetic enhancement system that allows players to specialize while remaining flexible.

### 1. Neural Framework (Information & Control)

Focuses on information gathering, targeting, and precision.

| Tier | Enhancement | Effect | Synergies |
|------|-------------|--------|-----------|
| 1 | Basic Neural Interface | Highlights interactive objects | All builds |
| 1 | Threat Detection | Brief highlight of enemies preparing to attack | Defense builds |
| 1 | Targeting Assist | Slight aim assist for ranged weapons | Ranged builds |
| 2 | Tactical Scanner | Reveals enemy weak points | Precision builds |
| 2 | Network Intrusion | Hack basic terminals from greater distance | Tech builds |
| 2 | Reflex Booster | Increases melee attack speed | Melee builds |
| 3 | Time Dilation | Brief slow-motion during critical moments | All combat builds |
| 3 | Enemy Analysis | Automatically identifies enemy types and vulnerabilities | Team support |
| 3 | Precision Control | Reduced recoil, tighter spread on ranged weapons | Ranged builds |
| 4 | Multi-target Tracking | Track up to 5 enemies simultaneously | Group combat |
| 4 | Remote Hacking | Hack enemy systems from range | Tech builds |
| 4 | Neural Overload | Chance to stun enemies with critical hits | All combat |
| 5 | Predictive Algorithm | Shows enemy movement paths | Advanced combat |
| 5 | Total Awareness | 360-degree threat detection | Defensive builds |
| 5 | Mind-Machine Link | Control multiple deployables simultaneously | Tech builds |

**IMPLEMENTATION STATUS**: This skill tree has not been implemented yet.

### 2. Exoskeletal Systems (Physical & Protection)

Focuses on strength, durability, and combat power.

| Tier | Enhancement | Effect | Synergies |
|------|-------------|--------|-----------|
| 1 | Reinforced Frame | +10% Health | All builds |
| 1 | Power Assist | +15% Melee damage | Melee builds |
| 1 | Impact Dampeners | Reduce fall damage by 30% | Mobility builds |
| 2 | Kinetic Stabilizers | Reduce enemy knockback effects | Front-line builds |
| 2 | Motorized Joints | +15% movement speed | Scout builds |
| 2 | Momentum Amplifiers | Damage increases with movement speed | Mobile combat |
| 3 | Reactive Plating | Automatically blocks one hit every 30 seconds | Tank builds |
| 3 | Hydraulic Reinforcement | Increased carrying capacity | Resource gatherers |
| 3 | Shock Absorbers | Convert fall damage to AOE attack | Aggressive builds |
| 4 | Kinetic Capacitors | Store energy from movement, release in attacks | Mobile combat |
| 4 | Armored Subsystems | Critical systems protected (no critical hits against you) | Tank builds |
| 4 | Power Distribution | Share shield energy with nearby allies | Team support |
| 5 | Overdrive Protocols | Temporarily double strength when health is low | Berserker builds |
| 5 | Inertial Dampening | Negate all momentum-based damage | Tank specialized |
| 5 | Kinetic Reflection | Return portion of received damage to attacker | Counter builds |

**IMPLEMENTATION STATUS**: This skill tree has not been implemented yet.

### 3. Environmental Systems (Adaptation & Utility)

Focuses on environmental interaction and utility effects.

| Tier | Enhancement | Effect | Synergies |
|------|-------------|--------|-----------|
| 1 | Environmental Sealing | +50% resistance to environmental hazards | Exploration |
| 1 | Resource Scanner | Highlights resource nodes | Gathering builds |
| 1 | Emergency Respirator | Breathe in toxic areas for 30 seconds | Exploration |
| 2 | Terrain Analyzer | Shows structural weakpoints in terrain | Destructive builds |
| 2 | Gravity Compensators | Reduced gravity effects | Mobility builds |
| 2 | Magnetic Grip | Walk on metallic walls for 10 seconds | Exploration |
| 3 | Thermal Regulation | Immunity to temperature effects | Environmental specialist |
| 3 | Shock Anchors | Cannot be knocked back while stationary | Defensive positions |
| 3 | Environmental Fabrication | Create simple structures from raw resources | Base builders |
| 4 | Hazard Conversion | Convert environmental damage into energy | Environmental specialist |
| 4 | Terrain Manipulation | Faster block breaking/placement | Construction builds |
| 4 | Dynamic Adaptation | Automatically adapt to environmental changes | Solo explorers |
| 5 | Environmental Mastery | Turn environmental hazards against enemies | Advanced combat |
| 5 | Molecular Reconstruction | Rapidly repair/construct complex structures | Master builders |
| 5 | Ecosystem Control | Create persistent environmental effects | Territory control |

**IMPLEMENTATION STATUS**: This skill tree has not been implemented yet.

### 4. Weapon Systems (Specialization & Firepower)

Focuses on weapon improvements and combat techniques.

| Tier | Enhancement | Effect | Synergies |
|------|-------------|--------|-----------|
| 1 | Weapon Interface | Faster weapon switching | All combat builds |
| 1 | Energy Efficiency | +20% energy weapon duration | Ranged builds |
| 1 | Impact Calibration | +10% melee weapon damage | Melee builds |
| 2 | Ammunition Fabricator | Slowly generate ammo for equipped weapon | Sustained combat |
| 2 | Charging Systems | Enable charged attacks for all weapons | Precision builds |
| 2 | Stabilization Rig | Reduced recoil/weapon sway | Ranged builds |
| 3 | Weapon Specialization | +25% damage with chosen weapon type | Specialist builds |
| 3 | Modification Bay | Additional weapon mod slot | Customization builds |
| 3 | Rapid Deployment | Deploy tactical equipment 50% faster | Support builds |
| 4 | Integrated Arsenal | Switch weapons without animation delay | Combat specialist |
| 4 | Overcharge Protocols | Temporary weapon damage boost on cooldown | Burst damage |
| 4 | Field Technician | Repair and modify weapons on the fly | Support builds |
| 5 | Weapon Mastery | Unlocks special attack for each weapon type | Combat master |
| 5 | Experimental Systems | 10% chance for extraordinary weapon effects | Chaos builds |
| 5 | Unified Weaponry | All weapons gain benefits from all mods | Jack-of-all-trades |

**IMPLEMENTATION STATUS**: This skill tree has not been implemented yet.

## Special Abilities - PARTIALLY IMPLEMENTED

Special abilities are unlocked through cybernetic enhancement combinations or discovered as rare tech in the dungeon.

### Individual Abilities - MINIMALLY IMPLEMENTED

| Ability Name | Activation | Effect | Cooldown |
|--------------|------------|--------|----------|
| Chrono Shift | Double tap dodge | Brief time slow in area around player | 45 sec |
| Overclock | Hold both weapon triggers | Increased attack/movement speed for 10 seconds | 60 sec |
| Phase Dash - IMPLEMENTED | Dodge while sprinting | Short-range teleport through obstacles | 30 sec |
| Gravity Well | Alt fire when unarmed | Create gravity distortion that pulls enemies/objects | 40 sec |
| EMP Burst | Hold reload when shields depleted | Disable electronics in area | 90 sec |
| Holographic Decoy | Crouch + dodge | Create distracting copy of player | 60 sec |
| Nano Repair | Hold use button on self | Gradually restore health over time | 120 sec |
| Berserker Mode | Activate at <25% health | Massive damage boost but no healing | 180 sec |
| System Purge | Tap dodge 3x rapidly | Clear all status effects and restore energy | 120 sec |
| Overclock Weapons | Hold reload on full ammo | Next magazine deals bonus damage | 90 sec |

**IMPLEMENTATION DETAILS**: The dash ability is fully implemented in the CyberCrawlerController class. It's triggered with right-click (mr input) and applies an impulse in the player's facing direction. It has a cooldown period tracked in the playerState, specifically in the lastDashTime property. Other special abilities have not been implemented yet.

### Team Abilities (Requires Multiple Players) - NOT IMPLEMENTED

| Ability Name | Activation | Effect | Cooldown |
|--------------|------------|--------|----------|
| Resonance Field | Two players use field generators in proximity | Creates damage amplification zone | 120 sec shared |
| Power Transfer | Player with >75% energy faces player with <25% | Balances energy levels with bonus | 60 sec per pair |
| Formation Shield | Three+ players in close proximity | Creates shared damage reduction | Constant while maintained |
| Targeting Network | Two+ players aim at same enemy | Shared critical hit chance increase | Constant while maintained |
| Tactical Boost | Support player uses ability near allies | Temporary cooldown reduction for team | 180 sec |
| Relay Attack | Players attack same target in sequence | Escalating damage bonus | Requires timing |
| Breach and Clear | Player creates opening + allies rush through | Speed boost for rushing allies | Situational |
| Synchronized Strike | Players use special attack simultaneously | Combined effect greater than sum | 300 sec shared |
| Resource Chain | Players pass resources in sequence | Each pass increases resource value | No cooldown |
| Defensive Matrix | Four players at corners of area | Creates large protected zone | Lasts while maintained |

**IMPLEMENTATION STATUS**: Team abilities have not been implemented yet.

## Cybernetic Enhancement System - NOT IMPLEMENTED

Players acquire cybernetic enhancements through:

1. **Crafting**: Using resources gathered in the dungeon
2. **Dungeon Rewards**: Finding rare tech in special rooms
3. **Community Research**: Contributing to village projects

### Enhancement Slots

Players have limited enhancement slots, encouraging specialization while allowing flexibility:

- **Neural Port** (2 slots): Information processing enhancements
- **Skeletal Frame** (2 slots): Physical/defensive enhancements
- **Integumentary System** (2 slots): Environmental/utility enhancements
- **Weapon Interface** (2 slots): Combat/weapon enhancements

### Enhancement Tiers

1. **Basic (Tier 1)**: Common, easy to craft
2. **Advanced (Tier 2)**: Uncommon, require specialized resources
3. **Specialized (Tier 3)**: Rare, require dungeon resources
4. **Prototype (Tier 4)**: Very rare, often from bosses
5. **Experimental (Tier 5)**: Legendary, require community effort

### Customization System

Enhancements can be further customized with:

- **Overclocking**: Increase power at the cost of energy consumption
- **Stability Mods**: Reduce power fluctuations and cooldowns
- **Integration Circuits**: Allow limited cross-system benefits
- **Experimental Firmware**: Add chance-based bonus effects

**IMPLEMENTATION STATUS**: The cybernetic enhancement system has not been implemented yet.

## Progression Implementation - MINIMALLY IMPLEMENTED

### Individual Progression - MINIMALLY IMPLEMENTED

1. **Run-Based Progression**:
   - Weapons and temporary enhancements found during runs
   - Resources gathered to bring back to the village
   - Experience in combat techniques and enemy patterns

2. **Persistent Progression**:
   - Permanent cybernetic enhancements installed between runs
   - Blueprint collection for crafting options
   - Village facility upgrades that benefit all players

**IMPLEMENTATION DETAILS**: The resource gathering and inventory system is implemented, allowing players to collect resources during runs. The crafting system is also implemented, allowing players to create items from gathered resources. However, the permanent progression systems like cybernetic enhancements and village upgrades have not been implemented yet.

### Community Progression - NOT IMPLEMENTED

1. **Village Infrastructure**:
   - Communal crafting stations with shared upgrades
   - Defense systems that improve with community contribution
   - Research facilities that unlock new enhancement options

2. **Knowledge Base**:
   - Shared discovery system for enemy weaknesses
   - Communal mapping of dungeon patterns
   - Tutorial system where experienced players can record tips

3. **Reputation System**:
   - Players gain recognition for contributions (resources, defense, exploration)
   - Specialized roles unlock based on play style and contribution
   - Community challenges with group rewards

**IMPLEMENTATION STATUS**: Community progression systems have not been implemented yet.

## Technical Implementation Notes

The progression systems will leverage HYTOPIA's capabilities:

1. **Physics-Based Interactions**: Weapons and abilities utilize the physics engine
2. **Entity System**: Modular enhancements as attachable entity components
3. **Persistent Data**: Server-side storage for community progression
4. **Dynamic Scaling**: Abilities and effects that scale based on player count

**CURRENT STATUS SUMMARY**:
- Player health system is implemented with a visual health bar
- Dash ability is fully implemented with cooldown tracking
- Basic inventory system for resource storage is implemented
- Crafting system for creating items is implemented
- Combat system structure is in place but currently limited
- Advanced progression systems like cybernetic enhancements are not yet implemented
- Multiplayer ability interactions are not yet implemented

The current implementation provides a solid foundation for core gameplay mechanics, with the dash ability serving as a good example of how special abilities will work in the full game. Future development will focus on implementing the remaining abilities, weapons, and progression systems outlined in this document.
