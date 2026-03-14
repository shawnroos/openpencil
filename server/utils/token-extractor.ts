/**
 * Extract design tokens from HTML/CSS of a website.
 * Uses native fetch + HTML parsing — no Playwright needed for V1.
 */

import type { VibeKit } from '../../src/types/vibekit'
import type { VariableDefinition } from '../../src/types/variables'
import { VIBE_KIT_SCHEMA } from '../../src/vibekit/schema'
import { nanoid } from 'nanoid'

interface ExtractedTokens {
  colors: Record<string, string>
  fonts: string[]
  spacing: number[]
  radii: number[]
}

/** Extract CSS custom properties and computed styles from HTML string. */
export function extractTokensFromHTML(html: string): ExtractedTokens {
  const colors: Record<string, string> = {}
  const fonts: string[] = []
  const spacing: number[] = []
  const radii: number[] = []

  // Extract CSS custom properties (--primary, --accent, etc.)
  const customPropRegex = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/g
  let match
  while ((match = customPropRegex.exec(html)) !== null) {
    const name = match[1].toLowerCase()
    const value = match[2]
    if (name.includes('primary') || name.includes('brand')) colors.primary = value
    else if (name.includes('secondary')) colors.secondary = value
    else if (name.includes('accent')) colors.accent = value
    else if (name.includes('background') || name.includes('bg')) colors.bg = value
    else if (name.includes('surface') || name.includes('card')) colors.surface = value
    else if (name.includes('text') || name.includes('foreground')) colors.text = value
    else if (name.includes('muted')) colors.textMuted = value
  }

  // Extract inline color values from common selectors
  const colorRegex = /(?:color|background-color|background)\s*:\s*(#[0-9a-fA-F]{3,8})/g
  while ((match = colorRegex.exec(html)) !== null) {
    if (!colors.text && match[0].startsWith('color')) colors.text = match[1]
    if (!colors.bg && match[0].includes('background')) colors.bg = match[1]
  }

  // Extract font families
  const fontRegex = /font-family\s*:\s*([^;}"]+)/g
  while ((match = fontRegex.exec(html)) !== null) {
    const font = match[1].trim().replace(/['",]/g, '').split(',')[0].trim()
    if (font && !fonts.includes(font) && font !== 'inherit' && font !== 'sans-serif' && font !== 'serif') {
      fonts.push(font)
    }
  }

  // Extract spacing values (padding/margin)
  const spacingRegex = /(?:padding|margin|gap)\s*:\s*(\d+)px/g
  while ((match = spacingRegex.exec(html)) !== null) {
    const val = parseInt(match[1], 10)
    if (val > 0 && val < 200 && !spacing.includes(val)) spacing.push(val)
  }

  // Extract border-radius
  const radiusRegex = /border-radius\s*:\s*(\d+)px/g
  while ((match = radiusRegex.exec(html)) !== null) {
    const val = parseInt(match[1], 10)
    if (val > 0 && val < 100 && !radii.includes(val)) radii.push(val)
  }

  return { colors, fonts, spacing: spacing.sort((a, b) => a - b), radii: radii.sort((a, b) => a - b) }
}

/** Map extracted tokens to a VibeKit matching the canonical schema. */
export function mapTokensToVibeKit(tokens: ExtractedTokens, sourceUrl: string): VibeKit {
  const variables: Record<string, VariableDefinition> = {}

  // Start with schema defaults
  for (const [name, entry] of Object.entries(VIBE_KIT_SCHEMA)) {
    variables[name] = { type: entry.type, value: entry.fallback }
  }

  // Override with extracted values
  if (tokens.colors.primary) variables['$color-primary'] = { type: 'color', value: tokens.colors.primary }
  if (tokens.colors.secondary) variables['$color-secondary'] = { type: 'color', value: tokens.colors.secondary }
  if (tokens.colors.accent) variables['$color-accent'] = { type: 'color', value: tokens.colors.accent }
  if (tokens.colors.bg) variables['$color-bg'] = { type: 'color', value: tokens.colors.bg }
  if (tokens.colors.surface) variables['$color-surface'] = { type: 'color', value: tokens.colors.surface }
  if (tokens.colors.text) variables['$color-text'] = { type: 'color', value: tokens.colors.text }
  if (tokens.colors.textMuted) variables['$color-text-muted'] = { type: 'color', value: tokens.colors.textMuted }

  if (tokens.fonts.length > 0) {
    variables['$font-heading'] = { type: 'string', value: tokens.fonts[0] }
    variables['$font-body'] = { type: 'string', value: tokens.fonts[tokens.fonts.length > 1 ? 1 : 0] }
  }

  // Map spacing scale
  if (tokens.spacing.length >= 3) {
    variables['$space-sm'] = { type: 'number', value: tokens.spacing[0] }
    variables['$space-md'] = { type: 'number', value: tokens.spacing[Math.floor(tokens.spacing.length / 2)] }
    variables['$space-lg'] = { type: 'number', value: tokens.spacing[tokens.spacing.length - 1] }
  }

  // Map radii
  if (tokens.radii.length > 0) {
    variables['$radius-sm'] = { type: 'number', value: tokens.radii[0] }
    if (tokens.radii.length > 1) variables['$radius-md'] = { type: 'number', value: tokens.radii[Math.floor(tokens.radii.length / 2)] }
    if (tokens.radii.length > 2) variables['$radius-lg'] = { type: 'number', value: tokens.radii[tokens.radii.length - 1] }
  }

  return {
    id: nanoid(),
    name: new URL(sourceUrl).hostname.replace('www.', ''),
    version: '1.0.0',
    sourceUrl,
    variables,
    assets: {},
    metadata: {
      createdAt: new Date().toISOString(),
      extractedFrom: sourceUrl,
      generatedBy: 'extraction',
    },
  }
}
