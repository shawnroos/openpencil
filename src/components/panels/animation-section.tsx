/**
 * Animation section in the property panel — unified design + animation editing.
 * Shows clip timing and in/out effect controls for the selected node.
 */

import { useCallback, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import SectionHeader from '@/components/shared/section-header'
import NumberInput from '@/components/shared/number-input'
import { useCanvasStore } from '@/stores/canvas-store'
import { useDocumentStore } from '@/stores/document-store'
import { getEffectsByCategory, getEffect, buildMergedKeyframes } from '@/animation/effect-registry'
import type { AnimationClipData, TimedEffectConfig } from '@/types/animation'
import type { PenNode } from '@/types/pen'
import { cn } from '@/lib/utils'

const ENTER_EFFECTS = getEffectsByCategory('enter')
const EXIT_EFFECTS = getEffectsByCategory('exit')

interface EffectPickerProps {
  label: string
  effects: typeof ENTER_EFFECTS
  currentEffectId: string | undefined
  onSelect: (effectId: string | null) => void
  duration: number
  onDurationChange: (ms: number) => void
}

function EffectPicker({ label, effects, currentEffectId, onSelect, duration, onDurationChange }: EffectPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(
            'flex-1 h-7 px-2 text-[11px] text-left rounded border border-border bg-background hover:bg-muted transition-colors flex items-center justify-between',
            currentEffectId && 'text-foreground',
            !currentEffectId && 'text-muted-foreground',
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{currentEffectId ? getEffect(currentEffectId)?.name ?? currentEffectId : 'None'}</span>
          <ChevronDown size={10} className={cn('transition-transform', isOpen && 'rotate-180')} />
        </button>
        {currentEffectId && (
          <button
            type="button"
            className="p-1 text-muted-foreground hover:text-destructive"
            onClick={() => onSelect(null)}
            title="Remove effect"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Effect duration (only shown when an effect is selected) */}
      {currentEffectId && (
        <div className="flex items-center gap-1">
          <NumberInput
            value={duration / 1000}
            onChange={(v) => onDurationChange(Math.round(v * 1000))}
            min={0.1}
            max={10}
            step={0.1}
            suffix="s"
            className="flex-1"
          />
        </div>
      )}

      {/* Effect grid popover */}
      {isOpen && (
        <div className="grid grid-cols-2 gap-0.5 p-1 rounded border border-border bg-card">
          <button
            type="button"
            className={cn(
              'px-2 py-1 text-[10px] rounded hover:bg-muted text-left',
              !currentEffectId && 'bg-secondary text-foreground',
            )}
            onClick={() => { onSelect(null); setIsOpen(false) }}
          >
            None
          </button>
          {effects.map((effect) => (
            <button
              key={effect.id}
              type="button"
              className={cn(
                'px-2 py-1 text-[10px] rounded hover:bg-muted text-left',
                currentEffectId === effect.id && 'bg-secondary text-foreground',
              )}
              onClick={() => { onSelect(effect.id); setIsOpen(false) }}
            >
              {effect.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AnimationSection() {
  const activeId = useCanvasStore((s) => s.selection.activeId)
  const getNodeById = useDocumentStore((s) => s.getNodeById)
  const updateNode = useDocumentStore((s) => s.updateNode)

  const node = activeId ? getNodeById(activeId) : null
  if (!node) return null

  const animClip = node.clips?.find((c): c is AnimationClipData => c.kind === 'animation')
  if (!animClip) return null

  const updateClip = useCallback((updates: Partial<AnimationClipData>) => {
    if (!activeId || !node.clips) return
    const updatedClips = node.clips.map((c) =>
      c.id === animClip.id ? { ...c, ...updates } : c,
    )

    // If in/out effects changed, rebuild keyframes
    const merged = updatedClips.find((c) => c.id === animClip.id) as AnimationClipData
    if (merged.inEffect || merged.outEffect) {
      const newKeyframes = buildMergedKeyframes(
        merged.duration,
        merged.inEffect ?? undefined,
        merged.outEffect ?? undefined,
        {}, // currentState — will use defaults
      )
      const withKeyframes = updatedClips.map((c) =>
        c.id === animClip.id ? { ...c, keyframes: newKeyframes } : c,
      )
      updateNode(activeId, { clips: withKeyframes } as Partial<PenNode>)
    } else {
      updateNode(activeId, { clips: updatedClips } as Partial<PenNode>)
    }
  }, [activeId, node.clips, animClip.id, updateNode])

  const handleInEffectChange = useCallback((effectId: string | null) => {
    const inEffect: TimedEffectConfig | undefined = effectId
      ? { effectId, duration: animClip.inEffect?.duration ?? 500 }
      : undefined
    updateClip({ inEffect })
  }, [animClip.inEffect?.duration, updateClip])

  const handleOutEffectChange = useCallback((effectId: string | null) => {
    const outEffect: TimedEffectConfig | undefined = effectId
      ? { effectId, duration: animClip.outEffect?.duration ?? 500 }
      : undefined
    updateClip({ outEffect })
  }, [animClip.outEffect?.duration, updateClip])

  return (
    <div className="px-3 py-2 space-y-2">
      <SectionHeader title="Animation" />

      {/* Clip timing */}
      <div className="grid grid-cols-2 gap-1.5">
        <NumberInput
          value={animClip.startTime / 1000}
          onChange={(v) => updateClip({ startTime: Math.round(v * 1000) })}
          min={0}
          step={0.1}
          label="Start"
          suffix="s"
        />
        <NumberInput
          value={animClip.duration / 1000}
          onChange={(v) => updateClip({ duration: Math.max(100, Math.round(v * 1000)) })}
          min={0.1}
          step={0.1}
          label="Duration"
          suffix="s"
        />
      </div>

      {/* In effect */}
      <EffectPicker
        label="Enter"
        effects={ENTER_EFFECTS}
        currentEffectId={animClip.inEffect?.effectId}
        onSelect={handleInEffectChange}
        duration={animClip.inEffect?.duration ?? 500}
        onDurationChange={(ms) => updateClip({
          inEffect: animClip.inEffect ? { ...animClip.inEffect, duration: ms } : undefined,
        })}
      />

      {/* Out effect */}
      <EffectPicker
        label="Exit"
        effects={EXIT_EFFECTS}
        currentEffectId={animClip.outEffect?.effectId}
        onSelect={handleOutEffectChange}
        duration={animClip.outEffect?.duration ?? 500}
        onDurationChange={(ms) => updateClip({
          outEffect: animClip.outEffect ? { ...animClip.outEffect, duration: ms } : undefined,
        })}
      />
    </div>
  )
}
