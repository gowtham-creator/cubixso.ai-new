# Testing Patterns

**Analysis Date:** 2026-05-23

## Current State: NO TEST FRAMEWORK CONFIGURED

**Status:** The codebase has **zero testing infrastructure** in place.

- No `jest.config.js` or `vitest.config.ts` file
- No test runner dependencies in `package.json`
- No test files (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`) in the codebase
- No test script in `package.json` (only `dev`, `build`, `start`, `lint`)

This is a **gap that must be addressed** before production deployment.

## Package.json Scripts (Current)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

**Missing:**
- `test` — Unit and integration tests
- `test:watch` — Development test watcher
- `test:coverage` — Coverage report generation
- `e2e` — End-to-end tests

## Recommended Testing Stack

### Unit & Integration Testing: Vitest + React Testing Library

**Why Vitest:**
- Native ESM support (matches Next.js 15 / Node 19+)
- Fast, Vite-powered test runner
- Jest-compatible API (low learning curve)
- Excellent TypeScript support
- Optimized for component testing

**Why React Testing Library:**
- Industry standard for React component testing
- Encourages testing behavior, not implementation
- Works with Framer Motion animations (query via `screen.getByText`, `screen.getByRole`)
- Aligns with accessibility-first testing philosophy

**Setup:**
```bash
npm install --save-dev vitest @vitest/ui react-testing-library jsdom
```

**Config file:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### E2E Testing: Playwright

**Why Playwright:**
- Multi-browser support (Chrome, Firefox, Safari)
- Supports Framer Motion animations (waits for animations to complete)
- Next.js integration tested and stable
- Great for testing scroll-triggered animations and interactive canvas elements

**Setup:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Config file:** `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

**Package.json scripts:**
```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug"
  }
}
```

## Testing Strategy (To Be Implemented)

### Unit Tests

**What to test:**
- Utility functions: `cn()` from `src/lib/cn.ts`, `src/lib/utils.ts`
- Data transformations: Any computed properties in components
- Custom hooks (if created): scroll tracking, intersection observers, etc.

**Test file location:** Co-located with source, e.g., `src/lib/cn.test.ts` next to `src/lib/cn.ts`

**Example structure:**
```typescript
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/cn'

describe('cn()', () => {
  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('combines non-conflicting classes', () => {
    expect(cn('px-2', 'py-3')).toContain('px-2')
    expect(cn('px-2', 'py-3')).toContain('py-3')
  })
})
```

### Component Tests

**What to test:**
- Motion component entrance animations (via `screen.getByText` + `waitFor`)
- Interactive components: `Magnetic`, `WordReveal`, buttons
- Props rendering and conditional display
- Accessibility: ARIA attributes, focus management

**Test file location:** Co-located with component, e.g., `src/components/motion/WordReveal.test.tsx` next to `src/components/motion/WordReveal.tsx`

**Example structure (Framer Motion animation):**
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { WordReveal } from '@/components/motion/WordReveal'

describe('WordReveal', () => {
  it('renders children text', () => {
    render(<WordReveal>Hello world</WordReveal>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('world')).toBeInTheDocument()
  })

  it('applies motion.span to each word', () => {
    const { container } = render(<WordReveal>Hello world</WordReveal>)
    const spans = container.querySelectorAll('[style*="display"]')
    expect(spans.length).toBeGreaterThan(0)
  })

  it('respects custom delay prop', () => {
    render(<WordReveal delay={0.5}>Test</WordReveal>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### Integration Tests

**What to test:**
- Section components rendering with data from `src/lib/data.ts`
- Multi-component interactions: Hero + Nav + Contact flow
- Data fetch and state propagation (if added)

**Test file location:** `src/components/sections/__tests__/Hero.test.tsx`

**Example structure:**
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Hero } from '@/components/sections/Hero'

describe('Hero Section', () => {
  it('renders the main headline', () => {
    render(<Hero />)
    expect(screen.getByText(/Generative AI/)).toBeInTheDocument()
  })

  it('renders CTA button with correct href', () => {
    render(<Hero />)
    const cta = screen.getByText(/Start the conversation/)
    expect(cta.closest('a')).toHaveAttribute('href', '#contact')
  })

  it('renders location info', () => {
    render(<Hero />)
    expect(screen.getByText(/HYDERABAD/)).toBeInTheDocument()
  })
})
```

### E2E Tests

**What to test:**
- Full page navigation flow: Hero → Services → Products → Contact
- Scroll-triggered animations (viewport intersections)
- Form submission on contact page
- Canvas rendering (HeroCanvas shader loads and renders)

**Test file location:** `e2e/homepage.spec.ts`

**Example structure:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Cubixso Homepage', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Generative AI')
  })

  test('should navigate to services on scroll', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="#services"]').click()
    await expect(page.locator('#services')).toBeVisible()
  })

  test('should render shader canvas without errors', async ({ page }) => {
    await page.goto('/')
    // Wait for canvas element to render
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 })
  })

  test('should handle contact form submission', async ({ page }) => {
    await page.goto('/#contact')
    // Fill form and submit
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    // Verify success message or redirect
    await expect(page.locator('.success-message')).toBeVisible()
  })
})
```

## Coverage Targets

**Recommended minimums:**
- Statements: 70% (core logic, utilities)
- Branches: 60% (conditional rendering)
- Functions: 70% (component exports)
- Lines: 70% (entry points)

**High-priority coverage:**
- `src/lib/` utilities (100%)
- `src/components/sections/` (80%+)
- `src/components/motion/` (70%+)
- API routes `src/app/api/` (90%+)

## Testing Best Practices (To Follow)

1. **Test behavior, not implementation:** Don't test that `opacity: 0` initially, test that text becomes visible after animation
2. **Use semantic queries:** `screen.getByRole('button', { name: /start/i })` over `screen.getByClass(...)`
3. **Mock external services:** Canvas rendering, GSAP, external APIs
4. **Wait for async:** Use `waitFor()` for animations, data loads, etc.
5. **Keep tests isolated:** Each test should be independent; use `beforeEach` for setup
6. **Test accessibility:** Include ARIA assertions, focus management, keyboard navigation

## Migration Path

**Phase 1 (Week 1):**
- Install Vitest + React Testing Library
- Write 5-10 unit tests for `src/lib/` utilities
- Establish test structure and naming conventions

**Phase 2 (Week 2):**
- Write component tests for motion components (WordReveal, Magnetic, etc.)
- Write section component tests
- Aim for 50% coverage

**Phase 3 (Week 3):**
- Install Playwright
- Write E2E tests for critical user journeys
- Set up CI/CD integration (GitHub Actions)

**Phase 4 (Ongoing):**
- Maintain 70%+ coverage
- Add tests for new features before merging
- Run tests on every commit

---

*Testing analysis: 2026-05-23*

**CRITICAL:** This codebase is production-facing (Cubixso.ai public site) and currently has zero tests. Recommend implementing this stack immediately to prevent regressions and ensure animation/interaction fidelity.
