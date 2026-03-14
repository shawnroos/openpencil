import type { FormatPreset } from '@/types/vibekit'

export const FORMAT_PRESETS: FormatPreset[] = [
  { id: 'linkedin-carousel', name: 'LinkedIn Carousel', platform: 'linkedin', width: 1080, height: 1350, contentType: 'carousel' },
  { id: 'linkedin-video',    name: 'LinkedIn Video',    platform: 'linkedin', width: 1080, height: 1920, contentType: 'video' },
  { id: 'linkedin-post',     name: 'LinkedIn Post',     platform: 'linkedin', width: 1200, height: 1200, contentType: 'post' },
]

export function getDefaultFormat(): FormatPreset {
  return FORMAT_PRESETS[0]
}

export function getFormatById(id: string): FormatPreset | undefined {
  return FORMAT_PRESETS.find((f) => f.id === id)
}
