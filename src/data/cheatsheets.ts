export interface CheatCodeItem {
  id: string;
  title: string;
  category: 'locators' | 'assertions' | 'typescript' | 'api' | 'sql' | 'cicd-docker' | 'config';
  syntax: string;
  explanation: string;
  example: string;
  tips?: string;
  tags: string[];
}

export const CHEATSHEET_CATEGORIES = [
  { id: 'all', label: 'All Cheat Codes', icon: '⚡' },
  { id: 'locators', label: 'Locators & Actions', icon: '🎯' },
  { id: 'assertions', label: 'Web-First Assertions', icon: '🛡️' },
  { id: 'typescript', label: 'TypeScript TS Heaven', icon: '🔷' },
  { id: 'api', label: 'API Testing & Mocking', icon: '🔌' },
  { id: 'sql', label: 'SQL for QA Engineers', icon: '🗄️' },
  { id: 'cicd-docker', label: 'CI/CD, Docker & Jenkins', icon: '🚀' },
  { id: 'config', label: 'playwright.config.ts', icon: '⚙️' }
];

export const CHEAT_CODES: CheatCodeItem[] = [
  // --- LOCATORS & ACTIONS ---
  {
    id: 'loc-1',
    category: 'locators',
    title: 'Role-Based Locator (Best Practice)',
    syntax: `page.getByRole(role, { name?: string | RegExp, exact?: boolean })`,
    explanation: 'Recommended locator by Playwright team. Matches accessible semantics reflecting how real users and assistive technologies perceive the UI.',
    example: `// Button with exact text
await page.getByRole('button', { name: 'Submit Order', exact: true }).click();

// Heading with regex
await page.getByRole('heading', { name: /welcome back/i }).waitFor();

// Textbox with aria-label or accessible name
await page.getByRole('textbox', { name: 'Email address' }).fill('akash@test.com');`,
    tips: 'Always prefer getByRole over raw CSS or XPath. It makes tests immune to DOM restructuring.',
    tags: ['getByRole', 'accessibility', 'locators']
  },
  {
    id: 'loc-2',
    category: 'locators',
    title: 'Text & TestId Locators',
    syntax: `page.getByText(text) | page.getByTestId(testId)`,
    explanation: 'Target elements by visible rendered text or explicit data-testid attributes.',
    example: `// Exact text match
await page.getByText('Account verified successfully').toBeVisible();

// Stable test id
await page.getByTestId('checkout-total-price').toHaveText('$149.99');`,
    tips: 'You can configure custom testIdAttribute in playwright.config.ts (e.g. data-qa or test-id).',
    tags: ['getByText', 'getByTestId', 'locators']
  },
  {
    id: 'loc-3',
    category: 'locators',
    title: 'Chaining & Filtering Locators',
    syntax: `locator.filter({ hasText?: string, has?: Locator, hasNot?: Locator })`,
    explanation: 'Filter a collection of matching elements down to the exact row, card, or item containing specific child elements or text.',
    example: `// Find product card containing "MacBook Pro" and click Buy inside it
const productCard = page.locator('.product-card').filter({
  hasText: 'MacBook Pro M3',
  has: page.locator('.in-stock-badge')
});
await productCard.getByRole('button', { name: 'Add to Cart' }).click();`,
    tips: 'Chaining is resilient to changes in sibling elements.',
    tags: ['filter', 'chaining', 'complex-locators']
  },
  {
    id: 'loc-4',
    category: 'locators',
    title: 'Advanced Mouse & Keyboard Actions',
    syntax: `locator.click() | dblclick() | hover() | dragTo() | pressSequentially()`,
    explanation: 'All mouse and keyboard interactions automatically perform actionability checks (visible, stable, enabled).',
    example: `// Force click if obscured by animation
await page.locator('#modal-overlay-close').click({ force: true });

// Realistic human typing (good for search autocomplete)
await page.locator('#search-bar').pressSequentially('Playwright by Akash', { delay: 100 });

// Drag and drop one card to a target board
await page.locator('#card-task-102').dragTo(page.locator('#column-completed'));

// File upload
await page.locator('input[type="file"]').setInputFiles(['./fixtures/test-invoice.pdf']);`,
    tips: 'Use pressSequentially() instead of type() (which is deprecated in modern Playwright).',
    tags: ['mouse', 'dragTo', 'upload', 'keyboard']
  },

  // --- ASSERTIONS ---
  {
    id: 'ast-1',
    category: 'assertions',
    title: 'Web-First Auto-Waiting Assertions',
    syntax: `await expect(locator).toBeVisible() | toHaveText() | toHaveValue()`,
    explanation: 'Web-first assertions repeatedly poll the DOM until the condition passes or the assertion timeout (default 5000ms) expires.',
    example: `// Waits for element to appear & become visible
await expect(page.locator('#toast-notification')).toBeVisible();

// Waits for async text update
await expect(page.locator('#wallet-balance')).toHaveText('$5,240.00');

// Verify element disabled during AJAX submission
await expect(page.getByRole('button', { name: 'Processing...' })).toBeDisabled();

// Count check
await expect(page.locator('.cart-item-row')).toHaveCount(4);`,
    tips: 'NEVER forget "await" before expect(locator). Without await, the assertion returns a Promise and does NOT wait!',
    tags: ['expect', 'auto-waiting', 'web-first']
  },
  {
    id: 'ast-2',
    category: 'assertions',
    title: 'Auto-Waiting vs Non-Waiting Anti-Pattern',
    syntax: `// CORRECT (Auto-waiting):
await expect(locator).toHaveText('Success');

// WRONG (No auto-waiting, flaky):
expect(await locator.textContent()).toBe('Success');`,
    explanation: 'When calling `await locator.textContent()`, Playwright only reads the text once at that exact millisecond. If the text updates 50ms later, the test fails flakily.',
    example: `// ✅ Recommended:
await expect(page.locator('#status-pill')).toHaveText('COMPLETED', { timeout: 10000 });

// ❌ Flaky Anti-Pattern:
const text = await page.locator('#status-pill').textContent();
expect(text).toBe('COMPLETED'); // Will fail if status changes from PENDING to COMPLETED`,
    tips: 'Always use locator-based expect() methods: toHaveText, toContainText, toBeVisible.',
    tags: ['anti-pattern', 'flakiness', 'interview']
  },

  // --- TYPESCRIPT TS HEAVEN ---
  {
    id: 'ts-1',
    category: 'typescript',
    title: 'Typed Page Object Model (POM)',
    syntax: `class MyPage { readonly page: Page; readonly myBtn: Locator; }`,
    explanation: 'Enforce strict typing for components and pages with clean encapsulation.',
    example: `import { type Page, type Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly promoCodeInput: Locator;
  readonly applyDiscountBtn: Locator;
  readonly grandTotalDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.promoCodeInput = page.getByPlaceholder('Enter promo code');
    this.applyDiscountBtn = page.getByRole('button', { name: 'Apply' });
    this.grandTotalDisplay = page.getByTestId('cart-grand-total');
  }

  async applyDiscount(code: string): Promise<string> {
    await this.promoCodeInput.fill(code);
    await this.applyDiscountBtn.click();
    await this.page.waitForResponse(res => res.url().includes('/api/promo') && res.status() === 200);
    return (await this.grandTotalDisplay.textContent()) || '';
  }
}`,
    tips: 'Store Locators as readonly class properties in the constructor so they are never recreated.',
    tags: ['pom', 'typescript', 'architecture']
  },
  {
    id: 'ts-2',
    category: 'typescript',
    title: 'Type-Safe Fixtures Extension (test.extend)',
    syntax: `test.extend<MyCustomFixtures>({ fixtureName: async ({ page }, use) => { ... } })`,
    explanation: 'Dependency injection for custom authenticated pages, test data, and database connections.',
    example: `import { test as base, expect } from '@playwright/test';
import { CheckoutPage } from './pages/CheckoutPage';

type CustomFixtures = {
  checkoutPage: CheckoutPage;
  authenticatedToken: string;
};

export const test = base.extend<CustomFixtures>({
  authenticatedToken: async ({}, use) => {
    // Generate simulated JWT
    const token = 'JWT_PROD_BEARER_SAMPLE_KEY';
    await use(token);
  },
  checkoutPage: async ({ page }, use) => {
    const cp = new CheckoutPage(page);
    await page.goto('/checkout');
    await use(cp);
  }
});

export { expect };`,
    tips: 'With test.extend, any test imports your custom test object and gets full intellisense and typing.',
    tags: ['test.extend', 'fixtures', 'typescript']
  },

  // --- API TESTING & MOCKING ---
  {
    id: 'api-1',
    category: 'api',
    title: 'Headless API Testing (request fixture)',
    syntax: `await request.get(url, { headers, params }) | await request.post(url, { data })`,
    explanation: 'Playwright includes high-speed HTTP client for backend testing without spinning up browser.',
    example: `import { test, expect } from '@playwright/test';

test('verify order creation api', async ({ request }) => {
  const response = await request.post('https://api.store.com/v1/orders', {
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN',
      'Content-Type': 'application/json'
    },
    data: {
      productId: 'PROD_998',
      quantity: 2,
      discountCode: 'AKASH_SPECIAL'
    }
  });

  // Verify HTTP status
  expect(response.status()).toBe(201);

  // Validate response schema
  const body = await response.json();
  expect(body).toMatchObject({
    orderId: expect.any(String),
    status: 'CREATED',
    totalPrice: expect.any(Number)
  });
});`,
    tips: 'Use API request context to seed data before UI tests and delete data in afterEach cleanup.',
    tags: ['api', 'request', 'post', 'status']
  },
  {
    id: 'api-2',
    category: 'api',
    title: 'Network Mocking & Route Interception',
    syntax: `await page.route(urlPattern, async (route) => { ... })`,
    explanation: 'Intercept live network calls to mock slow APIs, test error status codes (500, 429), or block ad trackers.',
    example: `// 1. Mock 500 internal server error to test UI fallback error banner:
await page.route('**/api/weather', async (route) => {
  await route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Sensor down' })
  });
});

// 2. Abort analytics and 3rd party scripts to accelerate test speed:
await page.route(/google-analytics|hotjar|segment/, route => route.abort());

// 3. Fulfill with simulated JSON data
await page.route('**/api/users/current', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ name: 'Akash SDET', role: 'SUPER_ADMIN' })
  });
});`,
    tips: 'Always register page.route() BEFORE calling page.goto() or clicking the action that triggers the request.',
    tags: ['page.route', 'mocking', 'chaos-testing']
  },

  // --- SQL FOR QA ENGINEERS ---
  {
    id: 'sql-1',
    category: 'sql',
    title: 'PostgreSQL Database Verification in Tests',
    syntax: `const result = await dbClient.query('SELECT * FROM table WHERE ...');`,
    explanation: 'Verify that UI mutations (signup, payments, status change) correctly persist into SQL tables.',
    example: `import { test, expect } from '@playwright/test';
import { Client } from 'pg';

test('verify signup persists to Postgres DB', async ({ page }) => {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  const testEmail = \`qa_\${Date.now()}@domain.com\`;
  
  // 1. UI Signup Flow
  await page.goto('/register');
  await page.getByLabel('Email').fill(testEmail);
  await page.getByLabel('Password').fill('SecureP@ss123');
  await page.getByRole('button', { name: 'Register' }).click();

  // 2. Direct SQL Database Assertion
  const res = await db.query('SELECT email, status, role FROM users WHERE email = $1', [testEmail]);
  expect(res.rows.length).toBe(1);
  expect(res.rows[0].status).toBe('ACTIVE');

  // 3. Cleanup test row
  await db.query('DELETE FROM users WHERE email = $1', [testEmail]);
  await db.end();
});`,
    tips: 'Use parameterized queries ($1, $2) to avoid SQL injection in automated test scripts.',
    tags: ['sql', 'postgres', 'database-testing']
  },
  {
    id: 'sql-2',
    category: 'sql',
    title: 'Essential SQL Cheat Queries for SDETs',
    syntax: `SELECT ... FROM ... JOIN ... WHERE ... GROUP BY ... HAVING ...`,
    explanation: 'The most common SQL query patterns every automation QA lead must know.',
    example: `-- 1. Validate Order Total Against Line Items
SELECT o.id, o.total_amount, SUM(i.price * i.quantity) AS computed_sum
FROM orders o
JOIN order_items i ON o.id = i.order_id
WHERE o.id = 'ORD-2026-99'
GROUP BY o.id, o.total_amount
HAVING o.total_amount = SUM(i.price * i.quantity);

-- 2. Audit Trail Verification
SELECT event_type, created_at, user_id
FROM audit_logs
WHERE user_id = 452
ORDER BY created_at DESC
LIMIT 5;`,
    tips: 'JOIN queries guarantee data integrity across parent and foreign-key child tables.',
    tags: ['sql', 'queries', 'joins', 'aggregates']
  },

  // --- CI/CD, DOCKER & JENKINS ---
  {
    id: 'cicd-1',
    category: 'cicd-docker',
    title: 'GitHub Actions Matrix & Sharding Workflow',
    syntax: `name: Playwright Tests on Push / PR`,
    explanation: 'Production GitHub Actions workflow running 4 parallel shards with automatic HTML report artifact upload.',
    example: `name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium
    - name: Run Playwright tests with Sharding
      run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
    - uses: actions/upload-artifact@v4
      if: \${{ !cancelled() }}
      with:
        name: blob-report-\${{ matrix.shardIndex }}
        path: blob-report/
        retention-days: 7`,
    tips: 'Sharding cuts total CI run time linearly: 4 shards = ~4x faster suite execution.',
    tags: ['github-actions', 'cicd', 'sharding', 'parallel']
  },
  {
    id: 'cicd-2',
    category: 'cicd-docker',
    title: 'Jenkins Declarative Pipeline (Jenkinsfile)',
    syntax: `pipeline { agent { docker { image 'mcr.microsoft.com/playwright:v1.49.0-noble' } } ... }`,
    explanation: 'Enterprise Jenkins pipeline utilizing Microsoft official Playwright Docker image and HTML report publisher.',
    example: `pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.49.0-noble'
            args '-u root'
        }
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Run E2E Tests') {
            steps {
                sh 'npx playwright test --workers=4 --reporter=html,list'
            }
        }
    }
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report by Akash'
            ])
        }
    }
}`,
    tips: 'Using the official Microsoft Docker image eliminates browser dependency installation time on Jenkins build agents.',
    tags: ['jenkins', 'jenkinsfile', 'cicd', 'pipeline']
  },
  {
    id: 'cicd-3',
    category: 'cicd-docker',
    title: 'Docker & Docker Compose Containerization',
    syntax: `FROM mcr.microsoft.com/playwright:v1.49.0-noble`,
    explanation: 'Containerize tests for reproducible execution locally or inside Kubernetes test clusters.',
    example: `# Dockerfile
FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Run test command
CMD ["npx", "playwright", "test"]

# ----------------------------
# docker-compose.yml:
version: '3.8'
services:
  playwright-runner:
    build: .
    environment:
      - CI=true
      - BASE_URL=https://staging.app.com
    volumes:
      - ./playwright-report:/app/playwright-report
      - ./test-results:/app/test-results
    ipc: host # Prevents Chromium shared memory crashes`,
    tips: 'Always set "ipc: host" in Docker Compose to prevent Chromium out-of-memory browser tab crashes.',
    tags: ['docker', 'docker-compose', 'containers']
  },

  // --- CONFIG ---
  {
    id: 'cfg-1',
    category: 'config',
    title: 'Production playwright.config.ts Template',
    syntax: `defineConfig({ ... })`,
    explanation: 'Battle-tested configuration with retries in CI, trace viewer on failure, screenshot on failure, and parallel workers.',
    example: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'results.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://playwithplaywright.dev',
    trace: 'on-first-retry', // Records step-by-step video, DOM snapshots, network log
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 15'] } }
  ]
});`,
    tips: 'Trace "on-first-retry" saves gigabytes of CI artifact storage while guaranteeing failure diagnostics.',
    tags: ['config', 'retries', 'reporters', 'parallel']
  }
];
