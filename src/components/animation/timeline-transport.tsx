/**
 * Minimal timeline transport strip (~40px).
 * Shown when timeline is collapsed. Contains play/pause, time, scrub bar, expand toggle.
 */

import { Play, Pause, Square, ChevronUp, Repeat } from 'lucide-react'
import { usePlaybackTime, usePlaybackPlaying, playV2, pauseV2, stopV2, seekToV2 } from '@/animation/use-playback-controller'
import { useTimelineStore } from '@/stores/timeline-store'
import { useCallback, useRef } from 'react'

function formatTime(ms: number): string {
  const totalSec = ms / 1000
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toFixed(2).padStart(5, '0')}`
}

export default function TimelineTransport() {
  const isPlaying = usePlaybackPlaying()
  const currentTime = usePlaybackTime()
  const duration = useTimelineStore((s) => s.getCompositionDuration())
  const toggleTimeline = useTimelineStore((s) => s.toggleTimeline)
  const loopEnabled = useTimelineStore((s) => s.loopEnabled)
  const toggleLoop = useTimelineStore((s) => s.toggleLoop)
  const scrubRef = useRef<HTMLDivElement>(null)

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0

  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = scrubRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    seekToV2(x * duration)
  }, [duration])

  const handleScrubDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return
    handleScrub(e)
  }, [handleScrub])

  return (
    <div className="h-10 bg-card border-t border-border flex items-center gap-2 px-3 shrink-0">
      {/* Play/Pause */}
      <button
        type="button"
        className="p-1 rounded hover:bg-muted text-foreground"
        onClick={() => isPlaying ? pauseV2() : playV2()}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>

      {/* Stop */}
      <button
        type="button"
        className="p-1 rounded hover:bg-muted text-foreground"
        onClick={stopV2}
      >
        <Square size={14} />
      </button>

      {/* Loop */}
      <button
        type="button"
        className={`p-1 rounded hover:bg-muted ${loopEnabled ? 'text-primary' : 'text-muted-foreground'}`}
        onClick={toggleLoop}
      >
        <Repeat size={14} />
      </button>

      {/* Time display */}
      <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Scrub bar */}
      <div
        ref={scrubRef}
        className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer relative"
        onClick={handleScrub}
        onMouseMove={handleScrubDrag}
      >
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full border border-background"
          style={{ left: `calc(${progress * 100}% - 5px)` }}
        />
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        className="p-1 rounded hover:bg-muted text-muted-foreground"
        onClick={toggleTimeline}
        title="Expand timeline (Cmd+Shift+A)"
      >
        <ChevronUp size={14} />
      </button>
    </div>
  )
}
