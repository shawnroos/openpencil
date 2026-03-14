import { registerEffect } from '../effect-registry'

function kfId(): string {
  return `kf_${Math.random().toString(36).slice(2, 9)}`
}

// --- video-fade-in ---
registerEffect({
  id: 'video-fade-in',
  name: 'Fade',
  category: 'video',
  properties: ['opacity'],
  parameters: [],
  defaultDuration: 500,
  generate: ({ currentState }) => [
    { id: kfId(), offset: 0, properties: { opacity: 0 }, easing: 'easeOut' },
    { id: kfId(), offset: 1, properties: { opacity: currentState.opacity ?? 1 }, easing: 'linear' },
  ],
})

// --- video-fade-out ---
registerEffect({
  id: 'video-fade-out',
  name: 'Fade',
  category: 'video',
  properties: ['opacity'],
  parameters: [],
  defaultDuration: 500,
  generate: ({ currentState }) => [
    { id: kfId(), offset: 0, properties: { opacity: currentState.opacity ?? 1 }, easing: 'easeOut' },
    { id: kfId(), offset: 1, properties: { opacity: 0 }, easing: 'linear' },
  ],
})

// --- video-blur-in ---
registerEffect({
  id: 'video-blur-in',
  name: 'Blur',
  category: 'video',
  properties: ['blur', 'opacity'],
  parameters: [],
  defaultDuration: 500,
  generate: ({ currentState }) => [
    { id: kfId(), offset: 0, properties: { blur: 20, opacity: 0 }, easing: 'easeOut' },
    { id: kfId(), offset: 1, properties: { blur: 0, opacity: currentState.opacity ?? 1 }, easing: 'linear' },
  ],
})

// --- video-blur-out ---
registerEffect({
  id: 'video-blur-out',
  name: 'Blur',
  category: 'video',
  properties: ['blur', 'opacity'],
  parameters: [],
  defaultDuration: 500,
  generate: ({ currentState }) => [
    { id: kfId(), offset: 0, properties: { blur: 0, opacity: currentState.opacity ?? 1 }, easing: 'easeOut' },
    { id: kfId(), offset: 1, properties: { blur: 20, opacity: 0 }, easing: 'linear' },
  ],
})

// --- video-scale-in ---
registerEffect({
  id: 'video-scale-in',
  name: 'Scale',
  category: 'video',
  properties: ['scaleX', 'scaleY', 'opacity'],
  parameters: [],
  defaultDuration: 500,
  generate: () => [
    { id: kfId(), offset: 0, properties: { scaleX: 0.8, scaleY: 0.8, opacity: 0 }, easing: 'easeOut' },
    { id: kfId(), offset: 1, properties: { scaleX: 1, scaleY: 1, opacity: 1 }, easing: 'linear' },
  ],
})

// --- video-scale-out ---
registerEffect({
  id: 'video-scale-out',
  name: 'Scale',
  category: 'video',
  properties: ['scaleX', 'scaleY', 'opacity'],
  parameters: [],
  defaultDuration: 500,
  generate: () => [
    { id: kfId(), offset: 0, properties: { scaleX: 1, scaleY: 1, opacity: 1 }, easing: 'easeOut' },
    { id: kfId(), offset: 1, properties: { scaleX: 0.8, scaleY: 0.8, opacity: 0 }, easing: 'linear' },
  ],
})
