/**
 * Format switching — resize canvas and reflow content.
 * Leverages existing auto-layout engine.
 */

import type { FormatPreset } from '@/types/vibekit'
import type { PenNode } from '@/types/pen'
import { useDocumentStore } from '@/stores/document-store'
import { useHistoryStore } from '@/stores/history-store'
import { forcePageResync } from '@/canvas/canvas-sync-utils'
import { DEFAULT_FRAME_ID } from '@/stores/document-tree-utils'

/**
 * Switch the canvas format — resizes root frame and scales fixed-size children.
 * fill_container children reflow automatically via computeLayoutPositions().
 */
export function switchFormat(newFormat: FormatPreset, oldFormat: FormatPreset): void {
  const { updateNode, getNodeById } = useDocumentStore.getState()
  const doc = useDocumentStore.getState().document

  // Push undo state
  useHistoryStore.getState().pushState(doc)

  // Update root frame dimensions
  const rootFrame = getNodeById(DEFAULT_FRAME_ID)
  if (rootFrame) {
    updateNode(DEFAULT_FRAME_ID, {
      width: newFormat.width,
      height: newFormat.height,
    } as Partial<PenNode>)
  }

  // Scale fixed-size children proportionally
  const scaleX = newFormat.width / oldFormat.width
  const scaleY = newFormat.height / oldFormat.height

  if (rootFrame && 'children' in rootFrame && rootFrame.children) {
    scaleFixedChildren(rootFrame.children as PenNode[], scaleX, scaleY)
  }

  // Trigger re-render — fill_container children reflow automatically
  forcePageResync()
}

function scaleFixedChildren(nodes: PenNode[], scaleX: number, scaleY: number): void {
  const { updateNode } = useDocumentStore.getState()

  for (const node of nodes) {
    const n = node as unknown as Record<string, unknown>
    const updates: Record<string, unknown> = {}
    let hasUpdates = false

    if (typeof n.width === 'number') {
      updates.width = Math.round(n.width * scaleX)
      hasUpdates = true
    }
    if (typeof n.height === 'number') {
      updates.height = Math.round(n.height * scaleY)
      hasUpdates = true
    }
    if (typeof node.x === 'number') {
      updates.x = Math.round(node.x * scaleX)
      hasUpdates = true
    }
    if (typeof node.y === 'number') {
      updates.y = Math.round(node.y * scaleY)
      hasUpdates = true
    }
    if (typeof n.fontSize === 'number') {
      updates.fontSize = Math.round(n.fontSize * Math.min(scaleX, scaleY))
      hasUpdates = true
    }

    if (hasUpdates) {
      updateNode(node.id, updates as Partial<PenNode>)
    }

    if ('children' in node && node.children) {
      scaleFixedChildren(node.children as PenNode[], scaleX, scaleY)
    }
  }
}
