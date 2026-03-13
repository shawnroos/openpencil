import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_PATH = path.resolve(__dirname, '../fixtures/rgb-sync-test.mp4')

// Skip all tests if WebCodecs is unavailable
test.beforeEach(async ({ page }) => {
  await page.goto('/editor')
  // Don't use networkidle — editor has persistent SSE/WebSocket connections
  await page.waitForFunction(() => (window as any).__testHarness?.createVideoDecoder, { timeout: 15_000 })

  const hasWebCodecs = await page.evaluate(() => typeof VideoDecoder !== 'undefined')
  test.skip(!hasWebCodecs, 'WebCodecs not available in this browser')
})

test.describe('Video Decoder Contract (Layer B)', () => {
  test('decodes first frame as red at t=0.5s', async ({ page }) => {
    // Upload fixture file and create decoder via page.evaluate
    const fileChooserPromise = page.waitForEvent('filechooser')
    // Create a temporary file input to upload the fixture
    await page.evaluate(() => {
      const input = document.createElement('input')
      input.type = 'file'
      input.id = '__test-file-input'
      input.accept = 'video/*'
      document.body.appendChild(input)
      input.click()
    })
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(FIXTURE_PATH)

    // Create decoder from the uploaded file
    const result = await page.evaluate(async () => {
      const input = document.getElementById('__test-file-input') as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return { error: 'no file' }

      const { createVideoDecoder } = (window as any).__testHarness
      const handle = await createVideoDecoder(file, 320, 240)
      if (!handle) return { error: 'decoder returned null' }

      // Store handle for subsequent assertions
      ;(window as any).__testHandle = handle

      // Draw frame at 0.5s (center of red segment) and read pixel
      await handle.drawFrame(0.5)
      const ctx = handle.canvas.getContext('2d')!
      const pixel = ctx.getImageData(160, 120, 1, 1).data
      return {
        duration: handle.duration,
        width: handle.width,
        height: handle.height,
        pixel: [pixel[0], pixel[1], pixel[2], pixel[3]],
      }
    })

    expect(result).not.toHaveProperty('error')
    expect(result.duration).toBeGreaterThan(2.5)
    expect(result.duration).toBeLessThan(3.5)
    expect(result.width).toBe(320)
    expect(result.height).toBe(240)

    // Red pixel: R>200, G<50, B<50
    expect(result.pixel![0]).toBeGreaterThan(200)
    expect(result.pixel![1]).toBeLessThan(50)
    expect(result.pixel![2]).toBeLessThan(50)
  })

  test('decodes green at t=1.5s and blue at t=2.5s', async ({ page }) => {
    // Upload and create decoder
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.evaluate(() => {
      const input = document.createElement('input')
      input.type = 'file'
      input.id = '__test-file-input'
      input.accept = 'video/*'
      document.body.appendChild(input)
      input.click()
    })
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(FIXTURE_PATH)

    const pixels = await page.evaluate(async () => {
      const input = document.getElementById('__test-file-input') as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return null

      const { createVideoDecoder } = (window as any).__testHarness
      const handle = await createVideoDecoder(file, 320, 240)
      if (!handle) return null

      const readPixel = async (t: number) => {
        await handle.drawFrame(t)
        const ctx = handle.canvas.getContext('2d')!
        const p = ctx.getImageData(160, 120, 1, 1).data
        return [p[0], p[1], p[2]]
      }

      const green = await readPixel(1.5)
      const blue = await readPixel(2.5)
      handle.dispose()
      return { green, blue }
    })

    expect(pixels).not.toBeNull()
    // Green pixel
    expect(pixels!.green[0]).toBeLessThan(50)
    expect(pixels!.green[1]).toBeGreaterThan(200)
    expect(pixels!.green[2]).toBeLessThan(50)
    // Blue pixel
    expect(pixels!.blue[0]).toBeLessThan(50)
    expect(pixels!.blue[1]).toBeLessThan(50)
    expect(pixels!.blue[2]).toBeGreaterThan(200)
  })

  test('disposes cleanly without errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.evaluate(() => {
      const input = document.createElement('input')
      input.type = 'file'
      input.id = '__test-file-input'
      input.accept = 'video/*'
      document.body.appendChild(input)
      input.click()
    })
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(FIXTURE_PATH)

    const state = await page.evaluate(async () => {
      const input = document.getElementById('__test-file-input') as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return null

      const { createVideoDecoder } = (window as any).__testHarness
      const handle = await createVideoDecoder(file, 320, 240)
      if (!handle) return null

      handle.startPlayback(0)
      // Let it run briefly
      await new Promise(r => setTimeout(r, 200))
      handle.stopPlayback()
      handle.dispose()

      return {
        isPlaying: handle.isPlaying,
        debugState: handle.__debug?.state,
      }
    })

    expect(state).not.toBeNull()
    expect(state!.isPlaying).toBe(false)
    expect(state!.debugState).toBe('disposed')

    // No video-decoder errors in console
    const decoderErrors = consoleErrors.filter(e => e.includes('[video-decoder]'))
    expect(decoderErrors).toHaveLength(0)
  })
})
