/**
 * Inventory UI Handler
 * Defines data structures and helpers for the inventory UI.
 * 
 * Author: Cline (AI Assistant)
 */

export interface InventoryItemData {
  id: string;
  name: string;
  quantity: number;
  iconReference?: string;
}

/**
 * Prepares inventory data payload for the UI.
 * Converts internal inventory state to UI-friendly format.
 * 
 * @param inventoryMap Map of itemId -> { name, quantity, iconReference }
 * @returns Array of InventoryItemData
 */
export function prepareInventoryUIData(
  inventoryMap: Map<string, { name: string; quantity: number; iconReference?: string }>
): InventoryItemData[] {
  const items: InventoryItemData[] = [];
  for (const [id, data] of inventoryMap.entries()) {
    items.push({
      id,
      name: data.name,
      quantity: data.quantity,
      iconReference: data.iconReference,
    });
  }
  return items;
}
