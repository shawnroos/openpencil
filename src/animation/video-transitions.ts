/**
 * Apply video clip In/Out transitions to Fabric objects during playback.
 *
 * Video transitions interpolate standard animatable properties (opacity, blur, scale)
 * on the Fabric object during the transition time windows. This is the same mechanism
 * as animation effects, but applied to VideoClipData.inTransition/outTransition.
 */

import type { Canvas, FabricObject } from 'fabric'
import type { AnimationIndex } from '@/animation/animation-index'
import type { VideoClipData, KeyframeV2 } from '@/types/animation'
import { getEffect } from '@/animation/effect-registry'
import { findFabricObject, applyAnimatedFrame } from '@/animation/canvas-bridge'
// Keyframe interpolation done inline (interpolateKeyframesAtT below)

/**
 * Apply video transitions for the current frame.
 * Called from the playback controller's onFrame callback, after animation
 * interpolation but before video frame sync.
 */
export function applyVideoTransitions(
  canvas: Canvas,
  timeMs: number,
  index: AnimationIndex,
): void {
  for (const [nodeId, clips] of index.clipsByNode) {
    for (const clip of clips) {
      if (clip.kind !== 'video') continue
      const vClip = clip as VideoClipData
      if (!vClip.inTransition && !vClip.outTransition) continue

      const obj = findFabricObject(canvas, nodeId)
      if (!obj) continue

      const clipLocal = timeMs - vClip.startTime
      if (clipLocal < 0 || clipLocal > vClip.duration) continue

      const inDur = vClip.inTransition?.duration ?? 0
      const outDur = vClip.outTransition?.duration ?? 0
      const outStart = vClip.duration - outDur

      // In-transition: interpolate from effect start → end
      if (vClip.inTransition && clipLocal < inDur && inDur > 0) {
        const t = clipLocal / inDur
        applyTransitionAtT(obj, vClip.inTransition.effectId, t, vClip.inTransition.params)
      }

      // Out-transition: interpolate from effect start → end
      if (vClip.outTransition && clipLocal >= outStart && outDur > 0) {
        const t = (clipLocal - outStart) / outDur
        applyTransitionAtT(obj, vClip.outTransition.effectId, t, vClip.outTransition.params)
      }
    }
  }
}

function applyTransitionAtT(
  obj: FabricObject,
  effectId: string,
  t: number,
  params?: Record<string, unknown>,
): void {
  const effect = getEffect(effectId)
  if (!effect) return

  const kfs = effect.generate({
    duration: 1000, // doesn't matter — we use offset-based interpolation
    params: params ?? {},
    currentState: {},
  })

  // Interpolate between keyframes at normalized time t
  const values = interpolateKeyframesAtT(kfs, Math.max(0, Math.min(1, t)))
  if (values) {
    applyAnimatedFrame(obj, values)
  }
}

/**
 * Simple linear interpolation between keyframes at normalized time t (0-1).
 */
function interpolateKeyframesAtT(
  kfs: KeyframeV2[],
  t: number,
): Record<string, number> | null {
  if (kfs.length === 0) return null
  if (kfs.length === 1) return kfs[0].properties as Record<string, number>

  // Find the two keyframes surrounding t
  const sorted = [...kfs].sort((a, b) => a.offset - b.offset)

  // Before first keyframe
  if (t <= sorted[0].offset) return sorted[0].properties as Record<string, number>
  // After last keyframe
  if (t >= sorted[sorted.length - 1].offset) return sorted[sorted.length - 1].properties as Record<string, number>

  // Find surrounding pair
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    if (t >= a.offset && t <= b.offset) {
      const segT = (t - a.offset) / (b.offset - a.offset)
      const result: Record<string, number> = {}
      const allProps = new Set([...Object.keys(a.properties), ...Object.keys(b.properties)])
      for (const prop of allProps) {
        const va = (a.properties[prop] as number) ?? 0
        const vb = (b.properties[prop] as number) ?? 0
        result[prop] = va + (vb - va) * segT
      }
      return result
    }
  }

  return null
}
