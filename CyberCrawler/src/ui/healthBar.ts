/**
 * HealthBar - SceneUI health bar component for entities
 * 
 * Displays a floating health bar above an entity.
 * Can be updated dynamically with current/max health.
 * 
 * Dependencies:
 * - HYTOPIA SDK SceneUI
 * - UI template with ID 'health-bar' registered in client HTML
 * 
 * @author Cline
 */

import { SceneUI, World, Entity } from 'hytopia';

export class HealthBar {
  private sceneUI: SceneUI;
  private entity: Entity;

  constructor(entity: Entity, initialHealth: number, maxHealth: number) {
    this.entity = entity;

    this.sceneUI = new SceneUI({
      templateId: 'health-bar',
      attachedToEntity: entity,
      offset: { x: 0, y: 2, z: 0 },
      state: {
        health: initialHealth,
        maxHealth: maxHealth,
      },
      viewDistance: 20,
    });
  }

  /**
   * Load the health bar into the world.
   * @param world The HYTOPIA world instance
   */
  public load(world: World): void {
    this.sceneUI.load(world);
  }

  /**
   * Unload the health bar from the world.
   */
  public unload(): void {
    this.sceneUI.unload();
  }

  /**
   * Update the health bar display.
   * @param current Current health
   * @param max Max health
   */
  public setHealth(current: number, max: number): void {
    this.sceneUI.setState({
      health: current,
      maxHealth: max,
    });
  }
}

export default HealthBar;
