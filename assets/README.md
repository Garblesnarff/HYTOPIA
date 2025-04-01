# Game Assets

This directory contains all game assets including textures, models, audio, and data files.

## Purpose

Game assets are the non-code resources used to create the game world, including visual elements, sound effects, and data definitions.

## Directory Structure

- `textures/` - Image files for block textures, UI elements, etc.
- `models/` - 3D models for entities (will be created)
- `audio/` - Sound effects and music (will be created)
- `data/` - JSON data files for game configuration (will be created)

## Asset Naming Conventions

All assets follow these naming conventions:

1. **Textures**: `category_name_variation.png`
   - Example: `block_metal_rusty.png`

2. **Models**: `category_name_variation.gltf`
   - Example: `enemy_drone_security.gltf`

3. **Audio**: `category_name_variation.mp3`
   - Example: `sfx_weapon_laser.mp3`

4. **Data**: `category_name.json`
   - Example: `recipes_weapons.json`

## Asset Requirements

- **Textures**: PNG format, power-of-two dimensions (256x256, 512x512, etc.)
- **Models**: GLTF format, optimized for real-time rendering
- **Audio**: MP3 format, properly normalized
- **Data**: Valid JSON with consistent structure

## Usage in Code

Assets are typically referenced in code using their path relative to the assets directory:

```javascript
// Example usage
const metalBlockEntity = new Entity({
  blockTextureUri: 'textures/blocks/metal_rusty.png',
  // Other properties...
});
```
