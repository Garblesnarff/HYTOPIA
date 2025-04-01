# Core Systems

This directory contains core game functionality and utilities used throughout the project.

## Purpose

The files in this directory provide foundational systems that other game components build upon. They include game state management, event handling, utility functions, and core interfaces.

## Key Components

- Game state management
- Event system
- Time and tick management
- Utility functions and helpers
- Type definitions and interfaces

## Files

(Files will be added as they are developed)

## Usage Examples

Core systems are typically imported and used by higher-level game systems, entity controllers, and world generators.

```javascript
// Example usage (to be updated as code is written)
import { EventManager } from '../core/event-manager.js';

const eventManager = new EventManager();
eventManager.subscribe('player:damage', handlePlayerDamage);
```
