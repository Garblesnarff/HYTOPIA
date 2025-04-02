/**
 * Procedural Dungeon Generation for CyberCrawler
 */

import { Vector3, BlockType, World } from 'hytopia';

// Placeholder function for generating a simple dungeon
export function generateSimpleDungeon(world: World, startPosition: Vector3, sizeX: number, sizeY: number, sizeZ: number): void {
  console.log(`Generating simple dungeon at ${JSON.stringify(startPosition)} with size ${sizeX}x${sizeY}x${sizeZ}`);

  // Enhanced dungeon generation with room structure
  const floorBlockId = 20; // ID for "stone-bricks" from map.json
  const airBlockId = 0;    // ID for air 
  const scrapBlockId = 100; // For resource gathering

  // Build a basic room with walls and floor
  // First create the floor
  for (let x = 0; x < sizeX; x++) {
    for (let z = 0; z < sizeZ; z++) {
      // Place floor blocks
      const worldX = startPosition.x + x;
      const worldY = startPosition.y;
      const worldZ = startPosition.z + z;

      world.chunkLattice?.setBlock({ x: worldX, y: worldY, z: worldZ }, floorBlockId);
      
      // Log each block placement for debugging
      if (x % 5 === 0 && z % 5 === 0) {
        console.log(`Placed floor block at ${worldX}, ${worldY}, ${worldZ}`);
      }
    }
  }

  // Build walls around the room
  for (let x = 0; x < sizeX; x++) {
    for (let y = 1; y <= 3; y++) { // Wall height of 3 blocks
      // North wall (minimum Z)
      world.chunkLattice?.setBlock({ 
        x: startPosition.x + x, 
        y: startPosition.y + y, 
        z: startPosition.z 
      }, floorBlockId);
      
      // South wall (maximum Z)
      world.chunkLattice?.setBlock({ 
        x: startPosition.x + x, 
        y: startPosition.y + y, 
        z: startPosition.z + sizeZ - 1 
      }, floorBlockId);
    }
  }

  for (let z = 0; z < sizeZ; z++) {
    for (let y = 1; y <= 3; y++) { // Wall height of 3 blocks
      // West wall (minimum X)
      world.chunkLattice?.setBlock({ 
        x: startPosition.x, 
        y: startPosition.y + y, 
        z: startPosition.z + z 
      }, floorBlockId);
      
      // East wall (maximum X)
      world.chunkLattice?.setBlock({ 
        x: startPosition.x + sizeX - 1, 
        y: startPosition.y + y, 
        z: startPosition.z + z 
      }, floorBlockId);
    }
  }

  // Add a doorway on one wall
  const doorX = Math.floor(sizeX / 2);
  for (let y = 1; y <= 2; y++) { // Door height of 2 blocks
    world.chunkLattice?.setBlock({ 
      x: startPosition.x, 
      y: startPosition.y + y, 
      z: startPosition.z + doorX 
    }, airBlockId);
  }

  // Place some scrap metal resources inside the room
  const numResources = Math.floor(sizeX * sizeZ * 0.05); // 5% of floor area
  for (let i = 0; i < numResources; i++) {
    const rx = Math.floor(Math.random() * (sizeX - 2)) + 1; // Keep away from walls
    const rz = Math.floor(Math.random() * (sizeZ - 2)) + 1; // Keep away from walls
    
    world.chunkLattice?.setBlock({ 
      x: startPosition.x + rx, 
      y: startPosition.y + 1, // Place on floor
      z: startPosition.z + rz 
    }, scrapBlockId);
    
    console.log(`Placed scrap resource at ${startPosition.x + rx}, ${startPosition.y + 1}, ${startPosition.z + rz}`);
  }

  console.log("Enhanced dungeon room generated successfully!");
}
