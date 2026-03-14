/**
 * Track header sidebar for the timeline editor.
 * Shows node type icon + name for each track row, synchronized with timeline vertical scroll.
 */

import {
  Square,
  Circle,
  Type,
  Minus,
  Frame,
  FolderOpen,
  Hexagon,
  Spline,
  ImageIcon,
  Film,
  Smile,
  Link,
  ChevronDown,
} from 'lucide-react'
import type { PenNode } from '@/types/pen'
import { useDocumentStore } from '@/stores/document-store'
import { useCanvasStore } from '@/stores/canvas-store'
import { rowDepthMap, isGroupCollapsed, toggleGroupCollapse } from '@/animation/timeline-adapter'

const TYPE_ICONS: Record<string, typeof Square> = {
  rectangle: Square,
  ellipse: Circle,
  text: Type,
  line: Minus,
  frame: Frame,
  group: FolderOpen,
  polygon: Hexagon,
  path: Spline,
  image: ImageIcon,
  video: Film,
  icon_font: Smile,
  ref: Link,
}

interface TrackHeadersProps {
  /** Row IDs in display order (from TimelineRow[]) */
  rowIds: string[]
  /** Row height in px (must match library's rowHeight) */
  rowHeight: number
  /** Scroll top from library's onScroll callback */
  scrollTop: number
}

export default function TrackHeaders({ rowIds, rowHeight, scrollTop }: TrackHeadersProps) {
  return (
    <div
      style={{
        width: 120,
        borderRight: '1px solid var(--border)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Spacer for the ruler area */}
      <div style={{ height: 32, borderBottom: '1px solid var(--border)' }} />

      {/* Scrollable track names — synced via scrollTop */}
      <div
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ transform: `translateY(-${scrollTop}px)` }}>
          {rowIds.map((rowId) => (
            <TrackHeaderRow key={rowId} nodeId={rowId} height={rowHeight} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Individual track header row
// ---------------------------------------------------------------------------

function TrackHeaderRow({ nodeId: rowId, height }: { nodeId: string; height: number }) {
  const nodeId = rowId.replace(/^v2::/, '')
  const node = useDocumentStore((s) => s.getNodeById(nodeId)) as PenNode | undefined
  const isSelected = useCanvasStore((s) => s.selection.selectedIds.includes(nodeId))

  const Icon = TYPE_ICONS[node?.type ?? ''] ?? Square
  const name = node?.name ?? nodeId
  const depth = rowDepthMap.get(rowId) ?? 0
  const hasChildren = node && 'children' in node && (node.children as PenNode[] | undefined)?.length
  const isCollapsed = hasChildren ? isGroupCollapsed(nodeId) : false
  const isHidden = node && 'visible' in node && node.visible === false
  const isLocked = node && 'locked' in node && (node as { locked?: boolean }).locked === true

  const handleClick = () => {
    useCanvasStore.getState().setSelection([nodeId], nodeId)
  }

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleGroupCollapse(nodeId)
    // Force timeline rebuild by triggering a re-render
    // The parent component should re-call buildTimelineRowsFromNodes
  }

  return (
    <div
      onClick={handleClick}
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        paddingLeft: 6 + depth * 12,
        paddingRight: 6,
        cursor: 'pointer',
        borderBottom: '1px solid oklch(0.556 0 0 / 0.06)',
        opacity: isHidden ? 0.3 : isSelected ? 1 : 0.6,
      }}
    >
      {/* Collapse toggle for groups/frames */}
      {hasChildren ? (
        <button
          type="button"
          onClick={handleToggleCollapse}
          style={{
            width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: 'none', background: 'none', padding: 0, cursor: 'pointer',
            color: 'var(--muted-foreground)', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)',
            transition: 'transform 0.15s',
          }}
        >
          <ChevronDown size={9} />
        </button>
      ) : (
        <span style={{ width: 12, flexShrink: 0 }} />
      )}
      <Icon size={11} style={{ flexShrink: 0, color: 'var(--muted-foreground)' }} />
      <span
        style={{
          fontSize: 11,
          color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)',
          fontWeight: isSelected ? 500 : 400,
          fontStyle: isLocked ? 'italic' : 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {name}
      </span>
    </div>
  )
}
