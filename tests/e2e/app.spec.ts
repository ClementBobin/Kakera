import { test, expect } from '@playwright/test'

test('app window title contains Kakera', async ({ page }) => {
  await page.goto('http://localhost:1420')
  await expect(page).toHaveTitle(/Kakera/)
})

test('main navigation is visible', async ({ page }) => {
  await page.goto('http://localhost:1420')
  const nav = page.getByRole('navigation', { name: 'main navigation' })
  await expect(nav).toBeVisible()
  await expect(nav.getByRole('button', { name: 'Library' })).toBeVisible()
  await expect(nav.getByRole('button', { name: 'Calendar' })).toBeVisible()
  await expect(nav.getByRole('button', { name: 'Settings' })).toBeVisible()
})
