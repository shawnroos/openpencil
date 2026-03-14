/**
 * Canonical Vibe Kit variable schema.
 * This is the CONTRACT between kits and templates.
 * All kits must define these variables. All templates reference them.
 */

import type { VibeCategory } from '@/types/vibekit'

export interface VibeKitSchemaEntry {
  type: 'color' | 'number' | 'boolean' | 'string'
  fallback: string | number | boolean
  category: VibeCategory
  description?: string
}

export const VIBE_KIT_SCHEMA: Record<string, VibeKitSchemaEntry> = {
  // Typography
  '$font-heading':   { type: 'string', fallback: 'Inter, sans-serif', category: 'typography', description: 'Heading font family' },
  '$font-body':      { type: 'string', fallback: 'Inter, sans-serif', category: 'typography', description: 'Body font family' },
  '$font-editorial': { type: 'string', fallback: 'Georgia, serif', category: 'typography', description: 'Editorial/accent font' },

  // Colors
  '$color-primary':   { type: 'color', fallback: '#2563eb', category: 'color', description: 'Primary brand color' },
  '$color-secondary': { type: 'color', fallback: '#7c3aed', category: 'color', description: 'Secondary brand color' },
  '$color-accent':    { type: 'color', fallback: '#f59e0b', category: 'color', description: 'Accent/highlight color' },
  '$color-bg':        { type: 'color', fallback: '#ffffff', category: 'color', description: 'Background color' },
  '$color-surface':   { type: 'color', fallback: '#f8fafc', category: 'color', description: 'Surface/card color' },
  '$color-text':      { type: 'color', fallback: '#0f172a', category: 'color', description: 'Primary text color' },
  '$color-text-muted': { type: 'color', fallback: '#64748b', category: 'color', description: 'Muted/secondary text' },

  // Size tokens
  '$size-heading-xl': { type: 'number', fallback: 48, category: 'size', description: 'XL heading size' },
  '$size-heading-lg': { type: 'number', fallback: 36, category: 'size', description: 'Large heading size' },
  '$size-heading-md': { type: 'number', fallback: 24, category: 'size', description: 'Medium heading size' },
  '$size-body':       { type: 'number', fallback: 16, category: 'size', description: 'Body text size' },
  '$size-caption':    { type: 'number', fallback: 12, category: 'size', description: 'Caption/small text' },

  // Space tokens
  '$space-xs': { type: 'number', fallback: 4,  category: 'space', description: 'Extra small spacing' },
  '$space-sm': { type: 'number', fallback: 8,  category: 'space', description: 'Small spacing' },
  '$space-md': { type: 'number', fallback: 16, category: 'space', description: 'Medium spacing' },
  '$space-lg': { type: 'number', fallback: 32, category: 'space', description: 'Large spacing' },
  '$space-xl': { type: 'number', fallback: 64, category: 'space', description: 'Extra large spacing' },

  // Stroke
  '$stroke-default':    { type: 'number', fallback: 1, category: 'stroke', description: 'Default stroke width' },
  '$stroke-decorative': { type: 'number', fallback: 3, category: 'stroke', description: 'Decorative stroke width' },

  // Corner radius
  '$radius-sm': { type: 'number', fallback: 4,  category: 'size', description: 'Small corner radius' },
  '$radius-md': { type: 'number', fallback: 8,  category: 'size', description: 'Medium corner radius' },
  '$radius-lg': { type: 'number', fallback: 16, category: 'size', description: 'Large corner radius' },

  // Animation presets (string names referencing effect registry)
  '$anim-enter':    { type: 'string', fallback: 'fade-in',  category: 'animation', description: 'Default enter animation' },
  '$anim-exit':     { type: 'string', fallback: 'fade-out', category: 'animation', description: 'Default exit animation' },
  '$anim-emphasis': { type: 'string', fallback: 'pulse',    category: 'animation', description: 'Default emphasis animation' },

  // Transitions
  '$transition-slide': { type: 'string', fallback: 'slide-in', category: 'transition', description: 'Slide transition' },
  '$transition-fade':  { type: 'string', fallback: 'fade-in',  category: 'transition', description: 'Fade transition' },

  // Graphics
  '$icon-set': { type: 'string', fallback: 'lucide', category: 'graphic', description: 'Icon library name' },
}

/** Get all schema entries for a category. */
export function getSchemaByCategory(category: VibeCategory): Record<string, VibeKitSchemaEntry> {
  return Object.fromEntries(
    Object.entries(VIBE_KIT_SCHEMA).filter(([_, entry]) => entry.category === category),
  )
}

/** Get all category names that have entries. */
export function getSchemaCategories(): VibeCategory[] {
  const categories = new Set<VibeCategory>()
  for (const entry of Object.values(VIBE_KIT_SCHEMA)) {
    categories.add(entry.category)
  }
  return [...categories]
}
