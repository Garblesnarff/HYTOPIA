/**
 * Combat configuration constants for CyberCrawler
 * Defines melee attack parameters and visual feedback durations.
 * 
 * @author Cline
 */

export const MELEE_ATTACK_RANGE = 2.0; // Max distance of melee attack raycast in meters
export const MELEE_ATTACK_RADIUS = 0.8; // Radius for hit detection (not used in raycast, but for future spherecast)
export const MELEE_ATTACK_DAMAGE = 15; // Damage dealt per melee hit
export const MELEE_ATTACK_COOLDOWN_MS = 500; // Cooldown between melee attacks in milliseconds
export const DAMAGE_DISPLAY_DURATION_MS = 300; // Duration to display damage feedback (e.g., tint) in ms
export const HIT_EFFECT_DURATION_MS = 200; // Duration of hit visual effect in ms

export const COMBAT_CONFIG = {
  CYBER_BLADE_DAMAGE: 15,
  CYBER_BLADE_RANGE: 2.0,
  CYBER_BLADE_ATTACK_RATE: 2, // attacks per second
};
