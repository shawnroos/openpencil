import { lazy, Suspense, useState, useCallback, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import TopBar from './top-bar'
import Toolbar from './toolbar'
import BooleanToolbar from './boolean-toolbar'
import StatusBar from './status-bar'
import LayerPanel from '@/components/panels/layer-panel'
import RightPanel from '@/components/panels/right-panel'
// AI chat is now embedded in the Vibe tab — no floating panel
import VariablesPanel from '@/components/panels/variables-panel'
import ComponentBrowserPanel from '@/components/panels/component-browser-panel'
import ExportDialog from '@/components/shared/export-dialog'
import SaveDialog from '@/components/shared/save-dialog'
import AgentSettingsDialog from '@/components/shared/agent-settings-dialog'
import FigmaImportDialog from '@/components/shared/figma-import-dialog'
import UpdateReadyBanner from './update-ready-banner'
// AI store no longer needed here — chat is in the Vibe tab
import { useCanvasStore } from '@/stores/canvas-store'
import { useDocumentStore } from '@/stores/document-store'
import { useAgentSettingsStore } from '@/stores/agent-settings-store'
import { useUIKitStore } from '@/stores/uikit-store'
import { useThemePresetStore } from '@/stores/theme-preset-store'
import TimelinePanel from '@/components/animation/timeline-panel'
import TimelineTransport from '@/components/animation/timeline-transport'
import { useTimelineStore } from '@/stores/timeline-store'
import { useElectronMenu } from '@/hooks/use-electron-menu'
import { useFigmaPaste } from '@/hooks/use-figma-paste'
import { useMcpSync } from '@/hooks/use-mcp-sync'
import { initAppStorage } from '@/utils/app-storage'

const FabricCanvas = lazy(() => import('@/canvas/fabric-canvas'))

export default function EditorLayout() {
  const layerPanelOpen = useCanvasStore((s) => s.layerPanelOpen)
  const variablesPanelOpen = useCanvasStore((s) => s.variablesPanelOpen)
  const figmaImportOpen = useCanvasStore((s) => s.figmaImportDialogOpen)
  const closeFigmaImport = useCallback(() => {
    useCanvasStore.getState().setFigmaImportDialogOpen(false)
  }, [])
  const timelineExpanded = useTimelineStore((s) => s.timelineExpanded)
  const browserOpen = useUIKitStore((s) => s.browserOpen)
  const saveDialogOpen = useDocumentStore((s) => s.saveDialogOpen)
  const closeSaveDialog = useCallback(() => {
    useDocumentStore.getState().setSaveDialogOpen(false)
  }, [])
  const [exportOpen, setExportOpen] = useState(false)

  const closeExport = useCallback(() => {
    setExportOpen(false)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd+J: switch to Vibe tab
      if (isMod && e.key === 'j') {
        e.preventDefault()
        useCanvasStore.getState().setRightPanelTab('vibe')
        return
      }

      // Cmd+Shift+C: switch right panel to code tab
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        useCanvasStore.getState().setRightPanelTab('code')
        return
      }

      // Cmd+Shift+E: open export
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setExportOpen((prev) => !prev)
        return
      }

      // Cmd+Shift+V: toggle variables panel
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        useCanvasStore.getState().toggleVariablesPanel()
        return
      }

      // Cmd+Shift+K: toggle UIKit browser
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useUIKitStore.getState().toggleBrowser()
        return
      }

      // Cmd+Shift+A: toggle timeline expand/collapse
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        useTimelineStore.getState().toggleTimeline()
        return
      }

      // Cmd+Shift+F: open Figma import
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        useCanvasStore.getState().setFigmaImportDialogOpen(true)
        return
      }

      // Cmd+,: open agent settings
      if (isMod && e.key === ',') {
        e.preventDefault()
        useAgentSettingsStore.getState().setDialogOpen(true)
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Handle Electron native menu actions
  useElectronMenu()

  // Handle Figma clipboard paste
  useFigmaPaste()

  // MCP ↔ canvas real-time sync
  useMcpSync()

  // Hydrate persisted settings (init appStorage first for Electron IPC cache)
  useEffect(() => {
    initAppStorage().then(() => {
      useAgentSettingsStore.getState().hydrate()
      useUIKitStore.getState().hydrate()
      useCanvasStore.getState().hydrate()
      useThemePresetStore.getState().hydrate()
    })
  }, [])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen flex flex-col bg-background">
        <UpdateReadyBanner />
        <TopBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {layerPanelOpen && <LayerPanel />}
            <div className="flex-1 flex flex-col min-w-0 relative">
              <Suspense
                fallback={
                  <div className="flex-1 flex items-center justify-center bg-muted text-muted-foreground text-sm">
                    Loading canvas...
                  </div>
                }
              >
                <FabricCanvas />
              </Suspense>
              <Toolbar />
              <BooleanToolbar />

              {/* Floating variables panel — anchored to the right of the toolbar */}
              {variablesPanelOpen && <VariablesPanel />}

              {/* Floating UIKit browser panel */}
              {browserOpen && <ComponentBrowserPanel />}

              {/* Bottom bar: zoom controls */}
              <div className="absolute bottom-2 right-2 z-10 pointer-events-auto">
                <StatusBar />
              </div>
            </div>
            <RightPanel />
          </div>
          {timelineExpanded ? <TimelinePanel /> : <TimelineTransport />}
        </div>
        <ExportDialog open={exportOpen} onClose={closeExport} />
        <SaveDialog open={saveDialogOpen} onClose={closeSaveDialog} />
        <AgentSettingsDialog />
        <FigmaImportDialog open={figmaImportOpen} onClose={closeFigmaImport} />
      </div>
    </TooltipProvider>
  )
}
