import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`charts render after hydration and tables work at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page).toHaveTitle('Sample Analytics Dashboard')
    await expect(
      page.getByText(/Sample data. Illustrative values/),
    ).toBeVisible()
    await expect(page.getByText('$266,000', { exact: true })).toBeVisible()
    const canvases = page.locator('canvas')
    await expect(canvases).toHaveCount(3)
    for (const canvas of await canvases.all()) {
      await expect(canvas).toBeVisible()
      await expect(canvas).toHaveAttribute('role', 'img')
      await expect
        .poll(() =>
          canvas.evaluate((element) => {
            if (!(element instanceof HTMLCanvasElement)) return 0
            const pixels = element
              .getContext('2d')!
              .getImageData(0, 0, element.width, element.height).data
            let painted = 0
            for (let i = 3; i < pixels.length; i += 4)
              if (pixels[i] > 0) painted++
            return painted
          }),
        )
        .toBeGreaterThan(2000)
      const bounds = await canvas.boundingBox()
      expect(bounds!.width).toBeGreaterThan(200)
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    }
    for (const title of [
      'Monthly Revenue',
      'User Growth',
      'Orders by Category',
    ]) {
      const panel = page.getByRole('region', { name: title, exact: true })
      await panel.locator('summary').focus()
      await page.keyboard.press('Enter')
      await expect(panel.getByRole('table')).toBeVisible()
    }
    await expect(
      page.getByRole('row', { name: 'Jan $12,000', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('row', { name: 'Dec 7,200', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('row', { name: 'Electronics 644', exact: true }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    expect(errors).toEqual([])
  })
}
