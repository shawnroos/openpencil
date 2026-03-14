import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import EditorLayout from '@/components/editor/editor-layout'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export const Route = createFileRoute('/editor')({
  component: EditorPage,
  head: () => ({
    meta: [{ title: 'OpenPencil Editor' }],
  }),
})

function EditorPage() {
  useKeyboardShortcuts()

  // Dev-only test harness — dynamic import ensures zero production bundle impact
  useEffect(() => {
    if (!import.meta.env.DEV) return
    Promise.all([
      import('@/animation/video-decoder'),
      import('@/animation/video-registry'),
      import('@/animation/video-file-store'),
      import('@/animation/use-playback-controller'),
    ]).then(([decoder, registry, fileStore, playback]) => {
      ;(window as any).__testHarness = {
        createVideoDecoder: decoder.createVideoDecoder,
        getVideoDecoder: registry.getVideoDecoder,
        registerVideoDecoder: registry.registerVideoDecoder,
        storeVideoFile: fileStore.storeVideoFile,
        getVideoFile: fileStore.getVideoFile,
        playV2: playback.playV2,
        stopV2: playback.stopV2,
        seekToV2: playback.seekToV2,
        isPlayingV2: playback.isPlayingV2,
      }
    })
    return () => { delete (window as any).__testHarness }
  }, [])

  return <EditorLayout />
}
