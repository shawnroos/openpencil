/**
 * Token extraction API — extract design tokens from a URL.
 * Follows existing server/api/ai/ H3 handler pattern.
 */

import { defineEventHandler, readBody } from 'h3'
import { extractTokensFromHTML, mapTokensToVibeKit } from '../../utils/token-extractor'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url: string }>(event)
  const url = body?.url

  if (!url || typeof url !== 'string') {
    throw createError({ statusCode: 400, message: 'URL is required' })
  }

  try {
    new URL(url) // validate URL
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid URL' })
  }

  try {
    // Fetch the page HTML + CSS
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Jeans-TokenExtractor/1.0' },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      throw createError({ statusCode: 502, message: `Failed to fetch: ${response.status}` })
    }

    const html = await response.text()

    // Also fetch linked CSS stylesheets
    const linkRegex = /<link[^>]+href=["']([^"']+\.css[^"']*?)["'][^>]*>/gi
    let fullContent = html
    let match
    while ((match = linkRegex.exec(html)) !== null) {
      try {
        const cssUrl = new URL(match[1], url).href
        const cssResponse = await fetch(cssUrl, { signal: AbortSignal.timeout(5_000) })
        if (cssResponse.ok) {
          fullContent += '\n' + await cssResponse.text()
        }
      } catch { /* skip failed CSS fetches */ }
    }

    const tokens = extractTokensFromHTML(fullContent)
    const kit = mapTokensToVibeKit(tokens, url)

    return kit
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e) throw e
    throw createError({ statusCode: 500, message: `Extraction failed: ${(e as Error).message}` })
  }
})

function createError(opts: { statusCode: number; message: string }) {
  const err = new Error(opts.message) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
}
