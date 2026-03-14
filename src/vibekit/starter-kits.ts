/**
 * Built-in starter Vibe Kits — pure data, no logic.
 */

import type { VibeKit } from '@/types/vibekit'
import { VIBE_KIT_SCHEMA } from './schema'

function makeKit(id: string, name: string, overrides: Record<string, string | number>): VibeKit {
  const variables: Record<string, { type: string; value: string | number | boolean }> = {}
  for (const [key, entry] of Object.entries(VIBE_KIT_SCHEMA)) {
    variables[key] = { type: entry.type, value: overrides[key] ?? entry.fallback }
  }
  return {
    id, name, version: '1.0.0',
    variables: variables as VibeKit['variables'],
    assets: {},
    metadata: { createdAt: '2026-01-01T00:00:00Z', generatedBy: 'manual' },
  }
}

export const STARTER_KITS: VibeKit[] = [
  makeKit('minimal', 'Minimal', {
    '$font-heading': 'Inter, sans-serif',
    '$font-body': 'Inter, sans-serif',
    '$color-primary': '#000000',
    '$color-secondary': '#404040',
    '$color-accent': '#0066ff',
    '$color-bg': '#ffffff',
    '$color-surface': '#f5f5f5',
    '$color-text': '#111111',
    '$color-text-muted': '#888888',
  }),
  makeKit('bold', 'Bold', {
    '$font-heading': 'Space Grotesk, sans-serif',
    '$font-body': 'Inter, sans-serif',
    '$color-primary': '#ff3366',
    '$color-secondary': '#6633ff',
    '$color-accent': '#ffcc00',
    '$color-bg': '#0a0a0a',
    '$color-surface': '#1a1a1a',
    '$color-text': '#ffffff',
    '$color-text-muted': '#999999',
  }),
  makeKit('corporate', 'Corporate', {
    '$font-heading': 'DM Sans, sans-serif',
    '$font-body': 'DM Sans, sans-serif',
    '$color-primary': '#1e40af',
    '$color-secondary': '#3b82f6',
    '$color-accent': '#f59e0b',
    '$color-bg': '#ffffff',
    '$color-surface': '#f8fafc',
    '$color-text': '#0f172a',
    '$color-text-muted': '#64748b',
  }),
  makeKit('creative', 'Creative', {
    '$font-heading': 'Playfair Display, serif',
    '$font-body': 'Source Sans Pro, sans-serif',
    '$font-editorial': 'Playfair Display, serif',
    '$color-primary': '#8b5cf6',
    '$color-secondary': '#ec4899',
    '$color-accent': '#14b8a6',
    '$color-bg': '#faf5ff',
    '$color-surface': '#f0e7ff',
    '$color-text': '#1e1b2e',
    '$color-text-muted': '#6b6380',
  }),
  makeKit('warm', 'Warm', {
    '$font-heading': 'Merriweather, serif',
    '$font-body': 'Open Sans, sans-serif',
    '$color-primary': '#b45309',
    '$color-secondary': '#92400e',
    '$color-accent': '#dc2626',
    '$color-bg': '#fffbeb',
    '$color-surface': '#fef3c7',
    '$color-text': '#451a03',
    '$color-text-muted': '#78350f',
  }),
  makeKit('tech', 'Tech', {
    '$font-heading': 'JetBrains Mono, monospace',
    '$font-body': 'Inter, sans-serif',
    '$color-primary': '#22c55e',
    '$color-secondary': '#06b6d4',
    '$color-accent': '#a855f7',
    '$color-bg': '#09090b',
    '$color-surface': '#18181b',
    '$color-text': '#e4e4e7',
    '$color-text-muted': '#71717a',
  }),
]
