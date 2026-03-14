/**
 * Apply a Vibe Kit to the current document.
 * Uses existing document-store CRUD in a single undo batch.
 */

import type { VibeKit } from '@/types/vibekit'
import { useDocumentStore } from '@/stores/document-store'
import { useHistoryStore } from '@/stores/history-store'
import { useVibeKitStore } from '@/stores/vibekit-store'

/**
 * Apply a Vibe Kit — sets all variables and themes in a single undo batch.
 * Canvas re-renders automatically via use-canvas-sync detecting variable changes.
 */
export function applyKit(kit: VibeKit): void {
  const { setVariable } = useDocumentStore.getState()
  const historyStore = useHistoryStore.getState()
  const doc = useDocumentStore.getState().document

  // Single undo entry for the entire kit swap
  historyStore.pushState(doc)

  // Apply themes if the kit defines any
  if (kit.variables) {
    for (const [name, def] of Object.entries(kit.variables)) {
      setVariable(name, def)
    }
  }

  // Set active kit
  useVibeKitStore.getState().setActiveKit(kit.id)
}

/**
 * Apply a kit by ID from the store.
 */
export function applyKitById(kitId: string): void {
  const kit = useVibeKitStore.getState().kits[kitId]
  if (kit) applyKit(kit)
}
