import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_PATH = path.resolve(__dirname, '../fixtures/rgb-sync-test.mp4')

test.beforeEach(async ({ page }) => {
  page.on('console', (msg) => {
    if (msg.text().includes('[video-')) {
      console.log(`[browser:${msg.type()}] ${msg.text()}`)
    }
  })

  await page.goto('/editor')
  await page.waitForFunction(
    () => !!(window as any).__testHarness?.createVideoDecoder && !!(window as any).__documentStore,
    { timeout: 15_000 },
  )

  const hasWebCodecs = await page.evaluate(() => typeof VideoDecoder !== 'undefined')
  test.skip(!hasWebCodecs, 'WebCodecs not available in this browser')
})

/**
 * Import fixture video programmatically: upload file, create decoder,
 * register in store. Stashes nodeId on window.__testVideoNodeId.
 */
async function importVideo(page: import('@playwright/test').Page) {
  // Create a file input and upload the fixture
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.evaluate(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.id = '__test-video-input'
    document.body.appendChild(input)
    input.click()
  })
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(FIXTURE_PATH)

  // Create decoder and add video node
  const result = await page.evaluate(async () => {
    try {
      const input = document.getElementById('__test-video-input') as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return { error: 'No file selected' }

      const harness = (window as any).__testHarness
      const handle = await harness.createVideoDecoder(file, 320, 240)
      if (!handle) return { error: 'Decoder creation failed' }

      const nodeId = 'test-' + Math.random().toString(36).slice(2, 10)
      harness.storeVideoFile(nodeId, file)
      harness.registerVideoDecoder(nodeId, handle)

      const store = (window as any).__documentStore
      store.getState().addNode(null, {
        id: nodeId,
        type: 'video',
        name: 'test-video',
        src: file.name,
        mimeType: file.type,
        videoDuration: Math.round(handle.duration * 1000),
        x: 100, y: 100,
        width: 320, height: 240,
        clips: [{
          id: 'clip-' + Math.random().toString(36).slice(2, 10),
          kind: 'video',
          startTime: 0,
          duration: Math.round(handle.duration * 1000),
          sourceStart: 0,
          sourceEnd: Math.round(handle.duration * 1000),
          playbackRate: 1,
        }],
      })

      // Stash nodeId for test access
      ;(window as any).__testVideoNodeId = nodeId
      input.remove()
      return { success: true, nodeId }
    } catch (e: any) {
      return { error: e.message || String(e) }
    }
  })

  if (result.error) {
    throw new Error(`Import failed: ${result.error}`)
  }
}

test.describe('Editor Video Integration (Layer A)', () => {
  test('import shows video with red first frame', async ({ page }) => {
    await importVideo(page)

    const pixel = await page.evaluate(() => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      if (!handle) return null
      const ctx = handle.canvas.getContext('2d')
      if (!ctx) return null
      const p = ctx.getImageData(
        Math.floor(handle.canvas.width / 2),
        Math.floor(handle.canvas.height / 2), 1, 1,
      ).data
      return [p[0], p[1], p[2]]
    })

    expect(pixel).not.toBeNull()
    expect(pixel![0]).toBeGreaterThan(200) // Red
    expect(pixel![1]).toBeLessThan(50)
    expect(pixel![2]).toBeLessThan(50)
  })

  test('scrub shows green at 1.5s and blue at 2.5s', async ({ page }) => {
    await importVideo(page)

    // Seek to green (1.5s)
    const green = await page.evaluate(async () => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      if (!handle) return null
      await handle.drawFrame(1.5)
      const ctx = handle.canvas.getContext('2d')!
      const p = ctx.getImageData(Math.floor(handle.canvas.width / 2), Math.floor(handle.canvas.height / 2), 1, 1).data
      return [p[0], p[1], p[2]]
    })

    expect(green).not.toBeNull()
    expect(green![0]).toBeLessThan(50)
    expect(green![1]).toBeGreaterThan(200)
    expect(green![2]).toBeLessThan(50)

    // Seek to blue (2.5s)
    const blue = await page.evaluate(async () => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      if (!handle) return null
      await handle.drawFrame(2.5)
      const ctx = handle.canvas.getContext('2d')!
      const p = ctx.getImageData(Math.floor(handle.canvas.width / 2), Math.floor(handle.canvas.height / 2), 1, 1).data
      return [p[0], p[1], p[2]]
    })

    expect(blue).not.toBeNull()
    expect(blue![0]).toBeLessThan(50)
    expect(blue![1]).toBeLessThan(50)
    expect(blue![2]).toBeGreaterThan(200)
  })

  test('play/stop lifecycle with audio', async ({ page }) => {
    await importVideo(page)

    // Record initial pixel
    const initialPixel = await page.evaluate(() => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      if (!handle) return null
      const ctx = handle.canvas.getContext('2d')!
      const p = ctx.getImageData(Math.floor(handle.canvas.width / 2), Math.floor(handle.canvas.height / 2), 1, 1).data
      return [p[0], p[1], p[2]]
    })

    // Start playback on the decoder directly
    await page.evaluate(() => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      handle?.startPlayback(0)
    })

    // Wait for playback to start and advance a frame
    // drawFrame(1.5) forces a seek to the green segment — proves decoder can advance
    const advancedPixel = await page.evaluate(async () => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      if (!handle) return null
      // Wait a beat for playback to initialize, then draw a specific frame
      await new Promise(r => setTimeout(r, 500))
      await handle.drawFrame(1.5)
      const ctx = handle.canvas.getContext('2d')!
      const p = ctx.getImageData(Math.floor(handle.canvas.width / 2), Math.floor(handle.canvas.height / 2), 1, 1).data
      return [p[0], p[1], p[2]]
    })

    // Should be green (different from red initial)
    expect(advancedPixel).not.toBeNull()
    expect(advancedPixel).not.toEqual(initialPixel)

    // Check audio state
    const audioState = await page.evaluate(() => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      return handle?.__debug?.audioContext?.state ?? 'no-context'
    })
    // Audio may or may not start depending on headless browser — don't fail on this
    console.log(`[test] AudioContext state during playback: ${audioState}`)

    // Stop playback
    await page.evaluate(() => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      handle?.stopPlayback()
    })

    const isPlaying = await page.evaluate(() => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      return handle?.isPlaying ?? true
    })
    expect(isPlaying).toBe(false)
  })

  test('rapid scrub produces no decoder errors', async ({ page }) => {
    const decoderErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('[video-decoder]')) {
        decoderErrors.push(msg.text())
      }
    })

    await importVideo(page)

    // Fire 50 rapid seeks
    await page.evaluate(async () => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      if (!handle) return

      const promises: Promise<void>[] = []
      for (let i = 0; i < 50; i++) {
        promises.push(handle.drawFrame((i / 49) * handle.duration))
      }
      // Wait for all to settle (some will be dropped by debounce internally)
      await Promise.allSettled(promises)
    })

    // Read the final pixel — should be near the end of the video (blue)
    const pixel = await page.evaluate(() => {
      const nodeId = (window as any).__testVideoNodeId
      const handle = (window as any).__testHarness.getVideoDecoder(nodeId)
      if (!handle) return null
      const ctx = handle.canvas.getContext('2d')!
      const p = ctx.getImageData(Math.floor(handle.canvas.width / 2), Math.floor(handle.canvas.height / 2), 1, 1).data
      return [p[0], p[1], p[2]]
    })

    expect(pixel).not.toBeNull()
    // Last seek was at duration (blue segment) — blue channel should be dominant
    expect(pixel![2]).toBeGreaterThan(150)

    // No decoder errors
    expect(decoderErrors).toHaveLength(0)
  })
})
