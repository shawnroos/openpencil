import type { VariableDefinition } from '@/types/variables'

/** A complete, swappable visual identity for content creation. */
export interface VibeKit {
  id: string
  name: string
  description?: string
  version: string
  sourceUrl?: string
  variables: Record<string, VariableDefinition>
  assets: Record<string, VibeAsset>
  metadata: {
    createdAt: string
    extractedFrom?: string
    generatedBy?: 'extraction' | 'ai' | 'manual'
  }
}

export interface VibeAsset {
  type: 'texture' | 'lut' | 'sfx'
  url: string
  mimeType: string
  size?: number
}

export type VibeCategory =
  | 'typography' | 'color' | 'texture' | 'lut' | 'sfx'
  | 'animation' | 'transition' | 'stroke' | 'size' | 'space' | 'graphic'

export interface FormatPreset {
  id: string
  name: string
  platform: 'linkedin'
  width: number
  height: number
  contentType: 'carousel' | 'video' | 'post'
}
