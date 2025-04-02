# World

This directory contains the main world map definition and implementation for CyberCrawler.

## Purpose
The world module is responsible for creating, managing, and interacting with the game world's physical environment. It defines the terrain, structures, and key locations that make up the game world.

## Files
- `world-map.ts` - Main world map definition and loading
- `terrain.ts` - Basic terrain creation and modification

## Subdirectories
- `/areas` - Contains definitions for specific areas of the world map
- `/dungeons` - Contains the procedural dungeon generator (future implementation)

## Usage
The world map is loaded when the game starts and provides the environment where players interact. It contains both the overworld (villages, player house, wilderness) and connects to procedurally generated dungeons.
