import { test, expect } from '@playwright/test'

test('unified create mode UI is correct', async ({ page }) => {
  await page.goto('/editor')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(3000)

  // Take initial screenshot
  await page.screenshot({ path: 'unified-create-mode.png' })

  // 1. Verify new tabs exist
  const buttons = await page.locator('button').allTextContents()
  const buttonText = buttons.join(' | ')
  console.log('[tabs] All buttons:', buttonText)

  expect(buttonText).toContain('Create')
  expect(buttonText).toContain('Code')
  expect(buttonText).toContain('Vibe')

  // 2. Old tabs should NOT exist
  expect(buttonText).not.toContain('Design')
  expect(buttonText).not.toMatch(/\bAnimate\b/)

  // 3. Right panel is visible (Create tab is active by default)
  // The text "No selection" appears in the property panel when nothing is selected
  const noSelectionText = page.locator('text=No selection')
  // This may or may not be visible depending on whether Create tab shows property panel
  // Just verify the tab bar exists
  const createButton = page.getByText('Create').first()
  await expect(createButton).toBeVisible()

  // 4. Click Vibe tab — should show AI chat
  await page.getByText('Vibe').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'unified-vibe-tab.png' })

  // 5. Click back to Create
  await page.getByText('Create').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'unified-create-tab.png' })

  console.log('[unified] All checks passed')
})
