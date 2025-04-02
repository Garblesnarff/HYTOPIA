# Areas

This directory contains the definitions and implementations of specific areas within the CyberCrawler world.

## Purpose
The areas module defines distinct regions of the game world, each with their own layout, buildings, and characteristics. These are hand-crafted, designed areas rather than procedurally generated.

## Files
- `village.ts` - Central village area with buildings and plaza
- `player-house.ts` - Player's house and surrounding property
- `market-district.ts` - Commercial district with shops and vendors
- `tech-district.ts` - Technology-focused area with advanced structures
- `wilderness.ts` - Outskirts and wilderness areas surrounding civilization

## Implementation Notes
Each area file contains functions to build the specific structures, decorations, and terrain features for that area. These are called by the main world-map module to construct the complete game world.
