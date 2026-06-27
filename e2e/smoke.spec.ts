import { test, expect, type Page } from '@playwright/test'

/** Wrap a resource in the backend's standard success envelope (CLAUDE.md §2). */
function envelope(data: unknown) {
  return { json: { success: true, message: 'ok', data } }
}

/** Mock the two calls the login → documents flow makes. */
async function mockAuthedDocuments(page: Page, documents: unknown[] = []) {
  await page.route('**/v1/auth/login', (route) =>
    route.fulfill(envelope({ token: 'test.jwt.token' })),
  )
  await page.route('**/v1/documents', (route) => route.fulfill(envelope(documents)))
}

test.describe('Meridian smoke', () => {
  test('guards the app: visiting /documents signed-out redirects to login', async ({ page }) => {
    await page.goto('/documents')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText('Sign in', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('login routes through to signup', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('link', { name: 'Create an account' }).click()
    await expect(page).toHaveURL(/\/signup$/)
  })

  test('signing in lands on the documents list', async ({ page }) => {
    await mockAuthedDocuments(page)

    await page.goto('/login')
    await page.getByLabel('Email').fill('captain@meridian.test')
    await page.getByLabel('Password').fill('north-star')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page).toHaveURL(/\/documents$/)
    await expect(page.getByRole('heading', { name: 'Documents' })).toBeVisible()
    await expect(page.getByText('No documents yet')).toBeVisible()
  })

  test('an invalid login surfaces an inline error and stays put', async ({ page }) => {
    await page.route('**/v1/auth/login', (route) =>
      route.fulfill({
        status: 401,
        json: { statusCode: 401, message: 'Invalid credentials', error: 'Unauthorized' },
      }),
    )

    await page.goto('/login')
    await page.getByLabel('Email').fill('captain@meridian.test')
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Email or password is incorrect.')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
})
