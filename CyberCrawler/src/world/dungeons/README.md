# Dungeons

This directory contains the procedural dungeon generation system for CyberCrawler.

## Purpose
The dungeons module is responsible for creating randomized dungeon layouts that players can explore. Unlike the main world map which is hand-crafted, dungeons are procedurally generated to provide a different experience each time.

## Files
- `dungeon-generator.ts` - Current simple implementation of dungeon generation
- `dungeon-layouts.ts` - (Planned) Will define room templates and connection logic

## Future Implementation
Dungeon generation is a planned future feature that will:
1. Create randomized room layouts
2. Place appropriate enemies and treasures
3. Generate different dungeon themes based on location
4. Scale difficulty based on player progression

## Usage
Dungeons will be accessed through specific entrance points in the main world map.
