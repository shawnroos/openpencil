/**
 * Template picker panel — replaces UIKit component browser with Jeans content templates.
 * Reuses the same floating panel pattern (resize, search, close).
 */

import { useState, useRef, useCallback } from 'react'
import { X, Search, Plus } from 'lucide-react'
import { useUIKitStore } from '@/stores/uikit-store'
import { useDocumentStore } from '@/stores/document-store'
import { CONTENT_TEMPLATES } from '@/vibekit/content-templates'

const MIN_WIDTH = 380
const MIN_HEIGHT = 280
const DEFAULT_WIDTH = 440
const DEFAULT_HEIGHT = 400

export default function ComponentBrowserPanel() {
  const toggleBrowser = useUIKitStore((s) => s.toggleBrowser)
  const [searchQuery, setSearchQuery] = useState('')
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<{
    edge: 'right' | 'bottom' | 'corner'
    startX: number; startY: number; startW: number; startH: number
  } | null>(null)

  const handleResizeStart = useCallback(
    (edge: 'right' | 'bottom' | 'corner', e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      resizeRef.current = {
        edge,
        startX: e.clientX, startY: e.clientY,
        startW: panelWidth, startH: panelHeight,
      }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [panelWidth, panelHeight],
  )

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return
    e.preventDefault()
    const { edge, startX, startY, startW, startH } = resizeRef.current
    const container = panelRef.current?.parentElement
    const maxW = container ? container.clientWidth - 72 : 1400
    const maxH = container ? container.clientHeight - 16 : 900
    if (edge === 'right' || edge === 'corner')
      setPanelWidth(Math.max(MIN_WIDTH, Math.min(maxW, startW + e.clientX - startX)))
    if (edge === 'bottom' || edge === 'corner')
      setPanelHeight(Math.max(MIN_HEIGHT, Math.min(maxH, startH + e.clientY - startY)))
  }, [])

  const handleResizeEnd = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return
    resizeRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  const handleInsertTemplate = useCallback((templateId: string) => {
    const template = CONTENT_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    const node = template.create()
    useDocumentStore.getState().addNode(null, node)
  }, [])

  const filtered = searchQuery.trim()
    ? CONTENT_TEMPLATES.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : CONTENT_TEMPLATES

  return (
    <div
      ref={panelRef}
      className="absolute left-14 top-2 z-20 flex flex-col select-none"
      style={{ width: panelWidth, height: panelHeight }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl" />

      {/* Header */}
      <div className="relative h-10 flex items-center justify-between px-3 border-b border-border shrink-0">
        <span className="text-sm font-medium text-foreground">Templates</span>
        <button
          type="button"
          onClick={toggleBrowser}
          className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="relative px-3 py-1.5 border-b border-border shrink-0">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-7 pl-7 pr-2 text-xs bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Template grid */}
      <div className="relative flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleInsertTemplate(template.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="w-full aspect-[3/4] rounded bg-muted/50 border border-border/50 flex items-center justify-center">
                <Plus size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[11px] font-medium text-foreground text-center leading-tight">
                {template.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Resize handles */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize"
        onPointerDown={(e) => handleResizeStart('right', e)}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize"
        onPointerDown={(e) => handleResizeStart('bottom', e)}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
      />
      <div
        className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize"
        onPointerDown={(e) => handleResizeStart('corner', e)}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
      />
    </div>
  )
}
