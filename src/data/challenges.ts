import { Challenge } from '../types';

export const CHALLENGES: Challenge[] = [
  // --- BEGINNER: LOCATORS & ACTIONS (1 - 15) ---
  {
    id: 'ch-001',
    num: 1,
    title: 'Click the Magic Button',
    slug: 'click-the-magic-button',
    category: 'locators-actions',
    difficulty: 'Beginner',
    points: 100,
    tags: ['click', 'locator', 'basics'],
    description: 'Learn the primary action in Playwright. Locate the button with id `#submit-action` and trigger a click. Verify the confirmation text appears.',
    requirements: [
      'Locate the button with selector `#submit-action`',
      'Perform a click action on the button',
      'Verify `#message-output` has text "Button Clicked Successfully!"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('click the action button', async ({ page }) => {
  await page.goto('/challenges/click');
  // 1. Locate and click the button
  await page.locator('#submit-action').click();

  // 2. Assert message is visible
  await expect(page.locator('#message-output')).toBeVisible();
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('click the action button', async ({ page }) => {
  await page.goto('/challenges/click');
  await page.locator('#submit-action').click();
  await expect(page.locator('#message-output')).toBeVisible();
  await expect(page.locator('#message-output')).toHaveText('Button Clicked Successfully!');
});`,
    hints: [
      'Use `await page.locator("#submit-action").click()` to click.',
      'Check `await expect(page.locator("#message-output")).toHaveText("Button Clicked Successfully!")`.'
    ],
    docUrl: 'https://playwright.dev/docs/input#mouse-click',
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center">
  <h3 class="text-lg font-bold text-white mb-2">Interactive Button Lab</h3>
  <p class="text-sm text-slate-400 mb-6">Click the button below to trigger the verification state.</p>
  <button id="submit-action" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition cursor-pointer" onclick="document.getElementById('message-output').classList.remove('hidden'); document.getElementById('message-output').textContent = 'Button Clicked Successfully!';">
    Launch Action
  </button>
  <div id="message-output" class="hidden mt-6 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium rounded-lg text-sm">
    Button Clicked Successfully!
  </div>
</div>`
  },
  {
    id: 'ch-002',
    num: 2,
    title: 'Fill Input Fields & Press Enter',
    slug: 'fill-input-fields',
    category: 'locators-actions',
    difficulty: 'Beginner',
    points: 100,
    tags: ['fill', 'input', 'keyboard'],
    description: 'Playwright locator.fill() cleans the field and types the value. Fill the email and password inputs, then click the login button.',
    requirements: [
      'Fill `#email-input` with "student@playwright.com"',
      'Fill `#password-input` with "Secret123!"',
      'Click `#login-submit` button',
      'Assert `#login-greeting` contains "Welcome, student@playwright.com!"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('fill credentials and submit', async ({ page }) => {
  await page.goto('/challenges/login');

  // Fill email and password
  await page.locator('#email-input').fill('student@playwright.com');
  await page.locator('#password-input').fill('Secret123!');

  // Submit form
  await page.locator('#login-submit').click();

  // Verify greeting
  await expect(page.locator('#login-greeting')).toContainText('Welcome');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('fill credentials and submit', async ({ page }) => {
  await page.goto('/challenges/login');
  await page.locator('#email-input').fill('student@playwright.com');
  await page.locator('#password-input').fill('Secret123!');
  await page.locator('#login-submit').click();
  await expect(page.locator('#login-greeting')).toHaveText('Welcome, student@playwright.com!');
});`,
    hints: [
      'Always await both fill and click actions.',
      'locator.fill() automatically focuses and simulates native input events.'
    ],
    docUrl: 'https://playwright.dev/docs/input#text-input',
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto">
  <h3 class="text-lg font-bold text-white mb-4">Authentication Portal</h3>
  <div class="space-y-4">
    <div>
      <label class="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
      <input id="email-input" type="email" placeholder="name@domain.com" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:border-emerald-500 outline-none" />
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-300 mb-1">Password</label>
      <input id="password-input" type="password" placeholder="••••••••" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:border-emerald-500 outline-none" />
    </div>
    <button id="login-submit" class="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition" onclick="const email = document.getElementById('email-input').value; document.getElementById('login-greeting').classList.remove('hidden'); document.getElementById('login-greeting').textContent = 'Welcome, ' + email + '!';">
      Sign In
    </button>
    <div id="login-greeting" class="hidden p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium rounded-lg text-sm text-center"></div>
  </div>
</div>`
  },
  {
    id: 'ch-003',
    num: 3,
    title: 'Checkboxes & Radio Selection',
    slug: 'checkboxes-and-radio-buttons',
    category: 'locators-actions',
    difficulty: 'Beginner',
    points: 100,
    tags: ['check', 'radio', 'assertions'],
    description: 'Use locator.check() and expect(locator).toBeChecked() to manage checkboxes and single-choice radio buttons.',
    requirements: [
      'Check the Terms checkbox `#terms-agree`',
      'Assert `#terms-agree` is checked',
      'Select radio button `#plan-pro`',
      'Assert `#plan-pro` is checked'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('check and verify checkboxes', async ({ page }) => {
  await page.goto('/challenges/checkboxes');

  // Check the terms
  await page.locator('#terms-agree').check();

  // Assert it is checked
  await expect(page.locator('#terms-agree')).toBeChecked();

  // Select pro plan radio
  await page.locator('#plan-pro').check();
  await expect(page.locator('#plan-pro')).toBeChecked();
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('check and verify checkboxes', async ({ page }) => {
  await page.goto('/challenges/checkboxes');
  await page.locator('#terms-agree').check();
  await expect(page.locator('#terms-agree')).toBeChecked();
  await page.locator('#plan-pro').check();
  await expect(page.locator('#plan-pro')).toBeChecked();
});`,
    hints: ['`await locator.check()` handles scrolling and checking safely.'],
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto space-y-4">
  <h3 class="text-lg font-bold text-white mb-2">Subscription Settings</h3>
  <div class="space-y-2">
    <label class="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
      <input type="radio" name="plan" id="plan-free" value="free" class="accent-emerald-500" checked />
      <span class="text-sm text-slate-300">Free Tier (10 Tests/day)</span>
    </label>
    <label class="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
      <input type="radio" name="plan" id="plan-pro" value="pro" class="accent-emerald-500" />
      <span class="text-sm text-slate-300 font-semibold text-emerald-400">Pro Tier (Unlimited Tests)</span>
    </label>
  </div>
  <div class="pt-2 border-t border-slate-800">
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" id="terms-agree" class="w-4 h-4 accent-emerald-500 rounded" />
      <span class="text-xs text-slate-400">I accept the terms of service</span>
    </label>
  </div>
</div>`
  },
  {
    id: 'ch-004',
    num: 4,
    title: 'Dropdown Select Option',
    slug: 'dropdown-select-option',
    category: 'locators-actions',
    difficulty: 'Beginner',
    points: 100,
    tags: ['selectOption', 'dropdown'],
    description: 'Select an option from a native HTML `<select>` element using locator.selectOption().',
    requirements: [
      'Select option with value "playwright" from `#framework-select`',
      'Verify `#selected-result` displays "Selected: Playwright"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('select framework option', async ({ page }) => {
  await page.goto('/challenges/dropdown');

  // Select "playwright"
  await page.locator('#framework-select').selectOption('playwright');

  // Assert result
  await expect(page.locator('#selected-result')).toHaveText('Selected: Playwright');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('select framework option', async ({ page }) => {
  await page.goto('/challenges/dropdown');
  await page.locator('#framework-select').selectOption('playwright');
  await expect(page.locator('#selected-result')).toHaveText('Selected: Playwright');
});`,
    hints: ['Pass either value, index, or label to selectOption.'],
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto">
  <label class="block text-sm font-semibold text-slate-300 mb-2">Choose Automation Framework</label>
  <select id="framework-select" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm" onchange="document.getElementById('selected-result').textContent = 'Selected: ' + this.options[this.selectedIndex].text;">
    <option value="">-- Choose an option --</option>
    <option value="selenium">Selenium WebDriver</option>
    <option value="cypress">Cypress</option>
    <option value="playwright">Playwright</option>
  </select>
  <div id="selected-result" class="mt-4 text-sm font-medium text-cyan-400">Selected: None</div>
</div>`
  },
  {
    id: 'ch-005',
    num: 5,
    title: 'Double Click & Right Click Actions',
    slug: 'double-click-right-click',
    category: 'locators-actions',
    difficulty: 'Beginner',
    points: 120,
    tags: ['dblclick', 'mouse', 'advanced-click'],
    description: 'Handle special mouse triggers like double clicking to edit or trigger high-frequency events.',
    requirements: [
      'Double click `#dblclick-target`',
      'Verify status `#dblclick-status` updates to "Double Click Triggered!"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('double click target card', async ({ page }) => {
  await page.goto('/challenges/clicks');

  // Perform double click
  await page.locator('#dblclick-target').dblclick();

  // Verify status
  await expect(page.locator('#dblclick-status')).toHaveText('Double Click Triggered!');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('double click target card', async ({ page }) => {
  await page.goto('/challenges/clicks');
  await page.locator('#dblclick-target').dblclick();
  await expect(page.locator('#dblclick-status')).toHaveText('Double Click Triggered!');
});`,
    hints: ['Use `locator.dblclick()`.'],
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center">
  <div id="dblclick-target" class="p-8 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-950/60 transition select-none" ondblclick="document.getElementById('dblclick-status').textContent = 'Double Click Triggered!'; document.getElementById('dblclick-status').className = 'text-emerald-400 font-bold';">
    <p class="text-slate-300 font-medium">⚡ Double Click This Area ⚡</p>
  </div>
  <p id="dblclick-status" class="mt-4 text-sm text-slate-500">Waiting for double click...</p>
</div>`
  },

  // --- ASSERTIONS & AUTO-WAITING (6 - 15) ---
  {
    id: 'ch-006',
    num: 6,
    title: 'Auto-Waiting for Delayed Elements',
    slug: 'auto-waiting-delayed-elements',
    category: 'assertions-waiting',
    difficulty: 'Intermediate',
    points: 150,
    tags: ['auto-wait', 'promises', 'expect'],
    description: 'Playwright automatically waits for elements to appear in the DOM before asserting or interacting. No manual `sleep()` required!',
    requirements: [
      'Click `#trigger-loader` button',
      'Do NOT use hardcoded sleep',
      'Assert `#loaded-content` becomes visible with text "Data Fetched from Cloud!"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('wait for delayed ajax element', async ({ page }) => {
  await page.goto('/challenges/waiting');

  await page.locator('#trigger-loader').click();

  // Playwright expect automatically auto-waits up to default timeout!
  await expect(page.locator('#loaded-content')).toBeVisible();
  await expect(page.locator('#loaded-content')).toHaveText('Data Fetched from Cloud!');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('wait for delayed ajax element', async ({ page }) => {
  await page.goto('/challenges/waiting');
  await page.locator('#trigger-loader').click();
  await expect(page.locator('#loaded-content')).toBeVisible();
  await expect(page.locator('#loaded-content')).toHaveText('Data Fetched from Cloud!');
});`,
    hints: ['`await expect(locator).toBeVisible()` polls until the element appears.'],
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center">
  <button id="trigger-loader" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg" onclick="document.getElementById('spinner').classList.remove('hidden'); setTimeout(() => { document.getElementById('spinner').classList.add('hidden'); document.getElementById('loaded-content').classList.remove('hidden'); document.getElementById('loaded-content').textContent = 'Data Fetched from Cloud!'; }, 350);">
    Fetch Remote Data
  </button>
  <div id="spinner" class="hidden mt-4 text-cyan-400 text-sm animate-pulse">Loading data...</div>
  <div id="loaded-content" class="hidden mt-4 p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-semibold rounded-lg text-sm"></div>
</div>`
  },
  {
    id: 'ch-007',
    num: 7,
    title: 'Assert Element Attributes & Classes',
    slug: 'assert-element-attributes',
    category: 'assertions-waiting',
    difficulty: 'Beginner',
    points: 120,
    tags: ['expect', 'attributes', 'validation'],
    description: 'Verify element disabled state, aria attributes, and class toggles.',
    requirements: [
      'Verify `#launch-btn` is initially disabled',
      'Click `#enable-toggle`',
      'Verify `#launch-btn` is enabled'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('assert disabled and enabled states', async ({ page }) => {
  await page.goto('/challenges/attributes');

  // Verify launch button is disabled
  await expect(page.locator('#launch-btn')).toBeDisabled();

  // Toggle enable
  await page.locator('#enable-toggle').click();

  // Verify enabled
  await expect(page.locator('#launch-btn')).toBeEnabled();
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('assert disabled and enabled states', async ({ page }) => {
  await page.goto('/challenges/attributes');
  await expect(page.locator('#launch-btn')).toBeDisabled();
  await page.locator('#enable-toggle').click();
  await expect(page.locator('#launch-btn')).toBeEnabled();
});`,
    hints: ['Use `toBeDisabled()` and `toBeEnabled()` matchers.'],
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-4 max-w-sm mx-auto">
  <button id="launch-btn" disabled class="w-full py-2.5 bg-slate-800 text-slate-500 font-bold rounded-lg cursor-not-allowed">
    🚀 Launch Mission (Disabled)
  </button>
  <button id="enable-toggle" class="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg" onclick="const btn = document.getElementById('launch-btn'); btn.disabled = false; btn.className = 'w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-lg'; btn.textContent = '🚀 Launch Mission (Ready!)';">
    Click to Arm & Enable
  </button>
</div>`
  },
  {
    id: 'ch-008',
    num: 8,
    title: 'Count Multiple Matching Elements',
    slug: 'count-multiple-matching-elements',
    category: 'assertions-waiting',
    difficulty: 'Beginner',
    points: 120,
    tags: ['toHaveCount', 'lists', 'locators'],
    description: 'Assert the exact count of items in a shopping cart list using expect(locator).toHaveCount(n).',
    requirements: [
      'Assert `.cart-item` has an initial count of 3',
      'Click `#add-item-btn`',
      'Assert `.cart-item` now has a count of 4'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('count cart items', async ({ page }) => {
  await page.goto('/challenges/count');

  // Verify initial count is 3
  await expect(page.locator('.cart-item')).toHaveCount(3);

  // Add 1 item
  await page.locator('#add-item-btn').click();

  // Verify count is 4
  await expect(page.locator('.cart-item')).toHaveCount(4);
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('count cart items', async ({ page }) => {
  await page.goto('/challenges/count');
  await expect(page.locator('.cart-item')).toHaveCount(3);
  await page.locator('#add-item-btn').click();
  await expect(page.locator('.cart-item')).toHaveCount(4);
});`,
    hints: ['`expect(locator).toHaveCount(expected)` tests list length.'],
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-sm mx-auto">
  <div class="flex items-center justify-between mb-4">
    <h4 class="font-bold text-white text-sm">Shopping Cart</h4>
    <button id="add-item-btn" class="px-2 py-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded" onclick="const list = document.getElementById('cart-list'); const item = document.createElement('li'); item.className = 'cart-item p-2 bg-slate-950 rounded flex justify-between text-xs text-slate-200'; item.innerHTML = '<span>⚡ Playwright Pro Course</span><span>$49</span>'; list.appendChild(item);">
      + Add Item
    </button>
  </div>
  <ul id="cart-list" class="space-y-2">
    <li class="cart-item p-2 bg-slate-950 rounded flex justify-between text-xs text-slate-200">
      <span>Playwright T-Shirt</span><span>$24</span>
    </li>
    <li class="cart-item p-2 bg-slate-950 rounded flex justify-between text-xs text-slate-200">
      <span>QA Mug</span><span>$15</span>
    </li>
    <li class="cart-item p-2 bg-slate-950 rounded flex justify-between text-xs text-slate-200">
      <span>Sticker Pack</span><span>$8</span>
    </li>
  </ul>
</div>`
  },

  // --- DYNAMIC CONTENT & ASYNC (9 - 15) ---
  {
    id: 'ch-009',
    num: 9,
    title: 'Hover Actions & Tooltip Display',
    slug: 'hover-actions-tooltips',
    category: 'dynamic-elements',
    difficulty: 'Intermediate',
    points: 150,
    tags: ['hover', 'tooltips', 'mouse'],
    description: 'Trigger CSS hover pseudo-classes and hover events with locator.hover() to reveal hidden tooltips.',
    requirements: [
      'Hover over `#tooltip-anchor`',
      'Verify `#tooltip-box` is visible with text "Expert Automation Advice"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('hover to reveal tooltip', async ({ page }) => {
  await page.goto('/challenges/hover');

  // Hover over the target
  await page.locator('#tooltip-anchor').hover();

  // Assert tooltip visibility
  await expect(page.locator('#tooltip-box')).toBeVisible();
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('hover to reveal tooltip', async ({ page }) => {
  await page.goto('/challenges/hover');
  await page.locator('#tooltip-anchor').hover();
  await expect(page.locator('#tooltip-box')).toBeVisible();
  await expect(page.locator('#tooltip-box')).toHaveText('Expert Automation Advice');
});`,
    hints: ['`await locator.hover()` scrolls the element into view and moves the mouse pointer to its center.'],
    domHtml: `<div class="p-8 bg-slate-900 rounded-xl border border-slate-800 text-center relative">
  <button id="tooltip-anchor" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold" onmouseenter="document.getElementById('tooltip-box').classList.remove('hidden');" onmouseleave="/* keep visible for test */">
    Hover For Pro Tip
  </button>
  <div id="tooltip-box" class="hidden mt-4 inline-block px-3 py-1.5 bg-slate-950 border border-purple-500/50 text-purple-300 text-xs rounded-md shadow-lg">
    Expert Automation Advice
  </div>
</div>`
  },
  {
    id: 'ch-010',
    num: 10,
    title: 'Dynamic Data Table Row Filter',
    slug: 'table-row-filtering',
    category: 'forms-tables',
    difficulty: 'Intermediate',
    points: 160,
    tags: ['tables', 'filter', 'locators'],
    description: 'Chain locator filters with locator.filter({ hasText }) to pinpoint exact table rows.',
    requirements: [
      'Locate table row `tr` containing "Playwright"',
      'Click the "Run" button inside that specific row',
      'Verify `#run-status` displays "Running Playwright Suite"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('filter table rows and click inner button', async ({ page }) => {
  await page.goto('/challenges/table');

  // Filter the row with text "Playwright"
  const row = page.locator('tr').filter({ hasText: 'Playwright' });

  // Click the run button inside this row
  await row.locator('.run-btn').click();

  // Assert status
  await expect(page.locator('#run-status')).toHaveText('Running Playwright Suite');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('filter table rows and click inner button', async ({ page }) => {
  await page.goto('/challenges/table');
  const row = page.locator('tr').filter({ hasText: 'Playwright' });
  await row.locator('.run-btn').click();
  await expect(page.locator('#run-status')).toHaveText('Running Playwright Suite');
});`,
    hints: ['`locator.filter({ hasText: ... })` narrows down matching elements by their text content.'],
    domHtml: `<div class="p-4 bg-slate-900 rounded-xl border border-slate-800">
  <table class="w-full text-left text-xs text-slate-300">
    <thead class="bg-slate-950 text-slate-400">
      <tr>
        <th class="p-2">Framework</th>
        <th class="p-2">Status</th>
        <th class="p-2 text-right">Action</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-800">
      <tr>
        <td class="p-2 font-semibold">Cypress</td>
        <td class="p-2 text-amber-400">Idle</td>
        <td class="p-2 text-right"><button class="run-btn px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300" onclick="document.getElementById('run-status').textContent = 'Running Cypress Suite';">Run</button></td>
      </tr>
      <tr>
        <td class="p-2 font-semibold text-emerald-400">Playwright</td>
        <td class="p-2 text-emerald-400">Ready</td>
        <td class="p-2 text-right"><button class="run-btn px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded" onclick="document.getElementById('run-status').textContent = 'Running Playwright Suite';">Run</button></td>
      </tr>
      <tr>
        <td class="p-2 font-semibold">Selenium</td>
        <td class="p-2 text-slate-500">Deprecated</td>
        <td class="p-2 text-right"><button class="run-btn px-2 py-1 bg-slate-800 rounded text-slate-500">Run</button></td>
      </tr>
    </tbody>
  </table>
  <div id="run-status" class="mt-4 text-xs font-mono text-cyan-400">Ready</div>
</div>`
  },

  // --- API TESTING WITH PLAYWRIGHT (11 - 15) ---
  {
    id: 'ch-011',
    num: 11,
    title: 'API GET Request & Status Code Verification',
    slug: 'api-get-request',
    category: 'api-testing',
    difficulty: 'Intermediate',
    points: 180,
    tags: ['api', 'request', 'status-code'],
    description: 'Use Playwright built-in API testing fixture `request.get()` to test backend endpoints directly without launching a browser window.',
    requirements: [
      'Send a GET request to `/api/v1/health`',
      'Assert response status is 200',
      'Assert response body has `success: true`'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('verify health check endpoint', async ({ request }) => {
  const response = await request.get('/api/v1/health');

  // Verify status code
  expect(response.status()).toBe(200);

  // Verify JSON body
  const body = await response.json();
  expect(body.success).toBe(true);
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('verify health check endpoint', async ({ request }) => {
  const response = await request.get('/api/v1/health');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.success).toBe(true);
});`,
    hints: ['`response.status()` returns the numeric HTTP status.', '`await response.json()` parses the JSON payload.'],
    apiScenario: {
      method: 'GET',
      endpoint: '/api/v1/health',
      expectedStatus: 200,
      mockResponseBody: { success: true, timestamp: '2026-10-31T12:00:00Z', server: 'Playwright-Fastify-v1' }
    },
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center">
  <span class="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono">ENDPOINT: GET /api/v1/health</span>
  <p class="text-xs text-slate-400 mt-3">This challenge runs directly in Playwright API mode. Test status codes and response bodies headlessly.</p>
</div>`
  },
  {
    id: 'ch-012',
    num: 12,
    title: 'API POST: Create Resource & Validate Payload',
    slug: 'api-post-create-resource',
    category: 'api-testing',
    difficulty: 'Intermediate',
    points: 190,
    tags: ['api', 'post', 'json-schema'],
    description: 'Send a POST request with payload data and assert 201 Created and response property structure.',
    requirements: [
      'Send POST request to `/api/v1/users` with `{ name: "Akash", role: "QA Lead" }`',
      'Assert status is 201',
      'Assert response contains `created: true`'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('create user via api', async ({ request }) => {
  const response = await request.post('/api/v1/users', {
    data: {
      name: 'Akash',
      role: 'QA Lead'
    }
  });

  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.created).toBe(true);
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('create user via api', async ({ request }) => {
  const response = await request.post('/api/v1/users', {
    data: {
      name: 'Akash',
      role: 'QA Lead'
    }
  });
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.created).toBe(true);
});`,
    hints: ['Pass payload inside `{ data: { ... } }` in request.post().'],
    apiScenario: {
      method: 'POST',
      endpoint: '/api/v1/users',
      requestBody: { name: 'Akash', role: 'QA Lead' },
      expectedStatus: 201,
      mockResponseBody: { id: 'usr_902', name: 'Akash', role: 'QA Lead', created: true }
    },
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center">
  <span class="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-mono">ENDPOINT: POST /api/v1/users</span>
  <p class="text-xs text-slate-400 mt-2">Validating payload serialization and status 201 response.</p>
</div>`
  },

  // --- SQL FOR QA AUTOMATION (13 - 15) ---
  {
    id: 'ch-013',
    num: 13,
    title: 'SQL: Verify User Registration in Database',
    slug: 'sql-verify-user-registration',
    category: 'sql-database',
    difficulty: 'Intermediate',
    points: 180,
    tags: ['sql', 'database-testing', 'e2e'],
    description: 'In real QA pipelines, E2E tests interact with UI and verify database persistence. Query the database to ensure the newly registered user exists with `status = "ACTIVE"`.',
    requirements: [
      'Select user where `email = "test.user@company.com"`',
      'Verify status is "ACTIVE"',
      'Verify role is "ENGINEER"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

// Simulated DB helper in QA framework
test('verify registered record in SQL database', async ({ page }) => {
  await page.goto('/challenges/sql');

  // Verify the query result against DB table
  const targetEmail = 'test.user@company.com';
  const query = \`SELECT * FROM users WHERE email = '\${targetEmail}';\`;

  // UI verification
  await expect(page.locator('#db-record-status')).toHaveText('Record Found in DB: ACTIVE');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('verify registered record in SQL database', async ({ page }) => {
  await page.goto('/challenges/sql');
  await expect(page.locator('#db-record-status')).toHaveText('Record Found in DB: ACTIVE');
});`,
    hints: ['Database validation guarantees that UI state reflects true backend persistence.'],
    sqlScenario: {
      tableSchema: 'CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255), status VARCHAR(50), role VARCHAR(50));',
      sampleRows: [
        { id: 1, email: 'test.user@company.com', status: 'ACTIVE', role: 'ENGINEER' },
        { id: 2, email: 'admin@company.com', status: 'ACTIVE', role: 'ADMIN' }
      ],
      targetQuery: "SELECT status FROM users WHERE email = 'test.user@company.com';",
      expectedResult: [{ status: 'ACTIVE' }]
    },
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto">
  <div class="flex items-center gap-2 mb-3">
    <span class="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 font-mono rounded">SQL INTEGRATION LAB</span>
  </div>
  <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 mb-4">
    <p class="text-cyan-400 font-semibold mb-1">-- PostgreSQL Database Verification</p>
    <p>SELECT * FROM users WHERE email = 'test.user@company.com';</p>
  </div>
  <div id="db-record-status" class="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium rounded text-sm text-center">
    Record Found in DB: ACTIVE
  </div>
</div>`
  },

  // --- TYPESCRIPT FOR PLAYWRIGHT (14 - 15) ---
  {
    id: 'ch-014',
    num: 14,
    title: 'TypeScript: Custom Fixture Extension',
    slug: 'typescript-custom-fixtures',
    category: 'ts-automation',
    difficulty: 'Advanced',
    points: 200,
    tags: ['typescript', 'fixtures', 'type-safety'],
    description: 'Extend Playwright base `test` with custom typed fixtures for authenticated user state.',
    requirements: [
      'Define fixture type interface `AuthUserFixture`',
      'Use fixture in test',
      'Assert `#auth-token-display` contains bearer token'
    ],
    starterCode: `import { test as base, expect } from '@playwright/test';

// Declare types for custom fixtures
type MyFixtures = {
  authToken: string;
};

const test = base.extend<MyFixtures>({
  authToken: async ({}, use) => {
    // Generate simulated token
    const token = 'bearer-jwt-token-xyz-123';
    await use(token);
  },
});

test('use strongly-typed fixture in test', async ({ page }) => {
  await page.goto('/challenges/fixtures');
  await expect(page.locator('#auth-token-display')).toHaveText('Token: Active');
});`,
    solutionCode: `import { test as base, expect } from '@playwright/test';

test('use strongly-typed fixture in test', async ({ page }) => {
  await page.goto('/challenges/fixtures');
  await expect(page.locator('#auth-token-display')).toHaveText('Token: Active');
});`,
    hints: ['`base.extend<CustomFixtures>` provides compile-time auto-complete and guarantees type safety.'],
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center max-w-sm mx-auto">
  <span class="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">TypeScript Fixtures</span>
  <h4 class="text-sm font-semibold text-white mt-2 mb-4">Auth State Provider</h4>
  <div id="auth-token-display" class="p-3 bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs rounded">
    Token: Active
  </div>
</div>`
  },

  // --- INTERVIEW PREPARATION LAB (15 - 20) ---
  {
    id: 'ch-015',
    num: 15,
    title: 'Interview: Auto-Waiting vs Hardcoded Sleep',
    slug: 'interview-autowaiting-vs-sleep',
    category: 'interview-prep',
    difficulty: 'Intermediate',
    points: 150,
    tags: ['interview', 'flakiness', 'best-practices'],
    description: 'TOP INTERVIEW QUESTION: "Why is page.waitForTimeout() considered an anti-pattern in Playwright, and how does Playwright auto-waiting eliminate test flakiness?"',
    requirements: [
      'Understand actionability checks (visible, stable, enabled, receives events)',
      'Assert `#interview-answer` displays "Auto-Waiting Prevents Flaky Tests"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('interview question validation', async ({ page }) => {
  await page.goto('/challenges/interview-1');

  // Assert the key principle
  await expect(page.locator('#interview-answer')).toHaveText('Auto-Waiting Prevents Flaky Tests');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('interview question validation', async ({ page }) => {
  await page.goto('/challenges/interview-1');
  await expect(page.locator('#interview-answer')).toHaveText('Auto-Waiting Prevents Flaky Tests');
});`,
    hints: [
      'Playwright runs actionability checks automatically before click, fill, check.',
      'Hardcoded sleep either wastes time or fails when CI runs slowly.'
    ],
    interviewData: {
      frequency: 'Very High',
      companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'],
      explanation: 'Playwright performs actionability checks (Visible, Stable, Enabled, Editable) before every action. In assertions, expect(locator) polls until the condition is met or timeout is reached.',
      commonMistakes: [
        'Adding `page.waitForTimeout(5000)` to fix a failing test instead of locator auto-waiting.',
        'Not realizing that `expect(await locator.textContent()).toBe(...)` does NOT auto-wait, whereas `await expect(locator).toHaveText(...)` DOES auto-wait.'
      ]
    },
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto">
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold">INTERVIEW QUESTION</span>
    <span class="text-[11px] text-amber-400 font-mono">FAANG Frequency: 95%</span>
  </div>
  <p class="text-xs text-slate-300 font-medium mb-4">"Explain Playwright Auto-Waiting mechanism and why Thread.sleep / waitForTimeout is banned in production QA pipelines."</p>
  <div id="interview-answer" class="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded text-center">
    Auto-Waiting Prevents Flaky Tests
  </div>
</div>`
  },
  // --- SCENARIO-BASED UI & API CHALLENGING PROJECTS (16 - 20) ---
  {
    id: 'ch-016',
    num: 16,
    title: 'Scenario: E-Commerce Multi-Step Checkout Flow',
    slug: 'scenario-ecommerce-checkout-flow',
    category: 'forms-tables',
    difficulty: 'Advanced',
    points: 250,
    tags: ['ecommerce', 'scenario-project', 'forms', 'calculations'],
    description: 'REAL-WORLD PROJECT: Automate a complete checkout pipeline. Add product to cart, apply coupon "AKASH20" for 20% discount, fill shipping details, and verify order confirmation receipt.',
    requirements: [
      'Click `#add-product-btn` to add item',
      'Fill `#coupon-input` with "AKASH20" and click `#apply-coupon-btn`',
      'Verify `#total-amount` updates to "$80.00"',
      'Fill `#shipping-address` and click `#checkout-submit-btn`',
      'Assert `#order-confirmation` is visible with text "Order Confirmed: #ORD-9982"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('complete ecommerce checkout flow', async ({ page }) => {
  await page.goto('/challenges/ecommerce');

  // 1. Add product to cart
  await page.locator('#add-product-btn').click();

  // 2. Apply promo code
  await page.locator('#coupon-input').fill('AKASH20');
  await page.locator('#apply-coupon-btn').click();

  // 3. Verify total is discounted
  await expect(page.locator('#total-amount')).toHaveText('$80.00');

  // 4. Fill shipping address & submit
  await page.locator('#shipping-address').fill('100 Silicon Way, Tech City');
  await page.locator('#checkout-submit-btn').click();

  // 5. Assert final confirmation
  await expect(page.locator('#order-confirmation')).toHaveText('Order Confirmed: #ORD-9982');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('complete ecommerce checkout flow', async ({ page }) => {
  await page.goto('/challenges/ecommerce');
  await page.locator('#add-product-btn').click();
  await page.locator('#coupon-input').fill('AKASH20');
  await page.locator('#apply-coupon-btn').click();
  await expect(page.locator('#total-amount')).toHaveText('$80.00');
  await page.locator('#shipping-address').fill('100 Silicon Way, Tech City');
  await page.locator('#checkout-submit-btn').click();
  await expect(page.locator('#order-confirmation')).toHaveText('Order Confirmed: #ORD-9982');
});`,
    hints: [
      'Remember to await each locator action before asserting total price.',
      'Auto-waiting handles the coupon validation delay.'
    ],
    domHtml: `<div class="p-5 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto space-y-4">
  <div class="flex items-center justify-between border-b border-slate-800 pb-2">
    <span class="text-xs font-bold text-emerald-400 font-mono">SCENARIO LAB: E-COMMERCE</span>
    <span id="total-amount" class="text-sm font-bold text-white font-mono">$100.00</span>
  </div>
  <div class="p-3 bg-slate-950 rounded-lg flex items-center justify-between">
    <div>
      <div class="text-xs font-bold text-white">Playwright Pro SDET Course</div>
      <div class="text-[11px] text-slate-400">by Akash • Full Access</div>
    </div>
    <button id="add-product-btn" class="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded transition" onclick="document.getElementById('cart-status').textContent = 'Item in cart (1)';">
      + Add
    </button>
  </div>
  <div id="cart-status" class="text-[11px] text-cyan-400 font-mono">Cart empty (0)</div>
  <div class="flex gap-2">
    <input id="coupon-input" type="text" placeholder="Promo code (AKASH20)" class="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white outline-none" />
    <button id="apply-coupon-btn" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded transition" onclick="if(document.getElementById('coupon-input').value === 'AKASH20') { document.getElementById('total-amount').textContent = '$80.00'; }">
      Apply
    </button>
  </div>
  <div>
    <input id="shipping-address" type="text" placeholder="Shipping Street Address" class="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white outline-none" />
  </div>
  <button id="checkout-submit-btn" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition" onclick="document.getElementById('order-confirmation').classList.remove('hidden'); document.getElementById('order-confirmation').textContent = 'Order Confirmed: #ORD-9982';">
    Complete Purchase
  </button>
  <div id="order-confirmation" class="hidden p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded text-center"></div>
</div>`
  },
  {
    id: 'ch-017',
    num: 17,
    title: 'Scenario: FinTech Banking OTP Auth & Fund Transfer',
    slug: 'scenario-fintech-otp-transfer',
    category: 'dynamic-elements',
    difficulty: 'Advanced',
    points: 250,
    tags: ['fintech', 'otp', 'modal', 'banking'],
    description: 'REAL-WORLD PROJECT: Secure financial transaction automation. Trigger a funds transfer of $500, wait for the Two-Factor Authentication (2FA) OTP modal to appear, enter code "7890", and verify successful ledger balance deduction.',
    requirements: [
      'Fill transfer amount `#transfer-amount` with "500"',
      'Click `#initiate-transfer-btn`',
      'Wait for OTP modal `#otp-modal` to become visible',
      'Fill `#otp-input` with "7890" and click `#verify-otp-btn`',
      'Verify balance `#account-balance` displays "$4,500.00"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('fintech transfer with 2fa otp verification', async ({ page }) => {
  await page.goto('/challenges/fintech');

  // 1. Enter transfer amount
  await page.locator('#transfer-amount').fill('500');
  await page.locator('#initiate-transfer-btn').click();

  // 2. Wait for OTP modal and enter pin
  await expect(page.locator('#otp-modal')).toBeVisible();
  await page.locator('#otp-input').fill('7890');
  await page.locator('#verify-otp-btn').click();

  // 3. Verify balance deducted
  await expect(page.locator('#account-balance')).toHaveText('$4,500.00');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('fintech transfer with 2fa otp verification', async ({ page }) => {
  await page.goto('/challenges/fintech');
  await page.locator('#transfer-amount').fill('500');
  await page.locator('#initiate-transfer-btn').click();
  await expect(page.locator('#otp-modal')).toBeVisible();
  await page.locator('#otp-input').fill('7890');
  await page.locator('#verify-otp-btn').click();
  await expect(page.locator('#account-balance')).toHaveText('$4,500.00');
});`,
    hints: [
      'Playwright auto-waits for `#otp-modal` visibility before filling `#otp-input`.'
    ],
    domHtml: `<div class="p-5 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto space-y-4 relative">
  <div class="flex items-center justify-between border-b border-slate-800 pb-2">
    <span class="text-xs font-bold text-cyan-400 font-mono">FINTECH VAULT: BANKING</span>
    <span id="account-balance" class="text-xs font-mono font-bold text-emerald-400">$5,000.00</span>
  </div>
  <div>
    <label class="block text-xs text-slate-400 mb-1">Transfer Amount (USD)</label>
    <input id="transfer-amount" type="number" placeholder="500" class="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white" />
  </div>
  <button id="initiate-transfer-btn" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded transition" onclick="document.getElementById('otp-modal').classList.remove('hidden');">
    Authorize Wire Transfer
  </button>
  <div id="otp-modal" class="hidden p-4 bg-slate-950 border border-indigo-500/50 rounded-xl space-y-2 mt-4 shadow-xl">
    <div class="text-xs font-bold text-amber-400">Enter SMS 2FA Security Token</div>
    <input id="otp-input" type="text" placeholder="Enter 7890" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white" />
    <button id="verify-otp-btn" class="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded" onclick="if(document.getElementById('otp-input').value === '7890') { document.getElementById('account-balance').textContent = '$4,500.00'; document.getElementById('otp-modal').classList.add('hidden'); }">
      Confirm & Settle
    </button>
  </div>
</div>`
  },
  {
    id: 'ch-018',
    num: 18,
    title: 'Scenario: Live Crypto Ticker & Flakiness Auto-Retry',
    slug: 'scenario-crypto-ticker-retry',
    category: 'assertions-waiting',
    difficulty: 'Advanced',
    points: 250,
    tags: ['crypto', 'flakiness', 'auto-retry', 'websocket'],
    description: 'REAL-WORLD PROJECT: Real-time dynamic prices fluctuate rapidly. Execute a conditional assertion that waits for Bitcoin price to surpass $65,000 and executes a limit order without flakiness.',
    requirements: [
      'Click `#start-stream-btn` to initiate live market feed',
      'Assert `#btc-price` contains "$65,000"',
      'Click `#limit-order-btn`',
      'Verify status `#order-status` reads "Order Executed @ $65,000"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('assert dynamic stock ticker with auto-waiting', async ({ page }) => {
  await page.goto('/challenges/crypto');

  // Start feed
  await page.locator('#start-stream-btn').click();

  // Auto-waits until the live price hits 65,000
  await expect(page.locator('#btc-price')).toHaveText('$65,000');

  // Execute limit order
  await page.locator('#limit-order-btn').click();
  await expect(page.locator('#order-status')).toHaveText('Order Executed @ $65,000');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('assert dynamic stock ticker with auto-waiting', async ({ page }) => {
  await page.goto('/challenges/crypto');
  await page.locator('#start-stream-btn').click();
  await expect(page.locator('#btc-price')).toHaveText('$65,000');
  await page.locator('#limit-order-btn').click();
  await expect(page.locator('#order-status')).toHaveText('Order Executed @ $65,000');
});`,
    hints: [
      'Playwright expect().toHaveText() continuously polls the DOM until $65,000 appears.'
    ],
    domHtml: `<div class="p-5 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto space-y-4 text-center">
  <span class="text-xs font-mono text-amber-400 font-bold">CRYPTO TRADING DESK</span>
  <div class="text-2xl font-mono font-bold text-white mt-1" id="btc-price">$62,400</div>
  <button id="start-stream-btn" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium" onclick="setTimeout(() => { document.getElementById('btc-price').textContent = '$65,000'; document.getElementById('btc-price').className = 'text-2xl font-mono font-bold text-emerald-400'; }, 300);">
    Connect Realtime WebSocket Feed
  </button>
  <div class="pt-2">
    <button id="limit-order-btn" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg" onclick="if(document.getElementById('btc-price').textContent.includes('65,000')) { document.getElementById('order-status').textContent = 'Order Executed @ $65,000'; }">
      Trigger Limit Buy
    </button>
  </div>
  <div id="order-status" class="text-xs font-mono text-cyan-400 mt-2">Standing by...</div>
</div>`
  },
  {
    id: 'ch-019',
    num: 19,
    title: 'Scenario: Chaos Engineering & API 503 Outage Mocking',
    slug: 'scenario-chaos-api-mocking',
    category: 'api-testing',
    difficulty: 'Master',
    points: 300,
    tags: ['chaos-engineering', 'api-mocking', 'page.route', '503'],
    description: 'REAL-WORLD PROJECT: Mock a severe third-party API outage. Use page.route() to inject an HTTP 503 Service Unavailable, and verify the frontend displays the resilient fallback error banner.',
    requirements: [
      'Register `page.route` to intercept `/api/v1/payment` and fulfill status 503',
      'Click `#process-payment-btn`',
      'Verify `#fallback-banner` displays "Gateway Offline - Switched to Secondary Rail"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('chaos testing api 503 outage and fallback recovery', async ({ page }) => {
  await page.goto('/challenges/chaos');

  // Intercept payment route and mock 503 outage
  await page.route('**/api/v1/payment', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Service Unavailable' })
    });
  });

  // Trigger payment
  await page.locator('#process-payment-btn').click();

  // Assert resilient fallback banner
  await expect(page.locator('#fallback-banner')).toBeVisible();
  await expect(page.locator('#fallback-banner')).toHaveText('Gateway Offline - Switched to Secondary Rail');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('chaos testing api 503 outage and fallback recovery', async ({ page }) => {
  await page.goto('/challenges/chaos');
  await page.route('**/api/v1/payment', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Service Unavailable' })
    });
  });
  await page.locator('#process-payment-btn').click();
  await expect(page.locator('#fallback-banner')).toBeVisible();
  await expect(page.locator('#fallback-banner')).toHaveText('Gateway Offline - Switched to Secondary Rail');
});`,
    hints: [
      'page.route() intercepts network requests at the browser socket level before reaching backend.'
    ],
    domHtml: `<div class="p-5 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto text-center space-y-4">
  <span class="text-xs font-mono text-rose-400 font-bold">CHAOS SIMULATION LAB</span>
  <h4 class="text-sm font-bold text-white">Payment Gateway Resiliency</h4>
  <button id="process-payment-btn" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition" onclick="document.getElementById('fallback-banner').classList.remove('hidden'); document.getElementById('fallback-banner').textContent = 'Gateway Offline - Switched to Secondary Rail';">
    Simulate Stripe Charge
  </button>
  <div id="fallback-banner" class="hidden p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs rounded text-center"></div>
</div>`
  },
  {
    id: 'ch-020',
    num: 20,
    title: 'Scenario: Paginated Data Grid Multi-Sort & Verification',
    slug: 'scenario-datagrid-multisort',
    category: 'forms-tables',
    difficulty: 'Advanced',
    points: 260,
    tags: ['tables', 'sorting', 'pagination', 'sdet-project'],
    description: 'REAL-WORLD PROJECT: In an enterprise employee directory, sort the table by "Experience" descending, select the top candidate, and assert selected count.',
    requirements: [
      'Click `#sort-exp-btn` to sort descending',
      'Verify first row candidate name is "Akash Lead SDET"',
      'Click `#select-candidate-1` checkbox',
      'Assert `#selection-summary` reads "1 Candidate Selected for Interview"'
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('sort enterprise table and select candidate', async ({ page }) => {
  await page.goto('/challenges/grid');

  // Sort by experience
  await page.locator('#sort-exp-btn').click();

  // Verify top candidate
  await expect(page.locator('.candidate-name').first()).toHaveText('Akash Lead SDET');

  // Select top row
  await page.locator('#select-candidate-1').check();
  await expect(page.locator('#selection-summary')).toHaveText('1 Candidate Selected for Interview');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('sort enterprise table and select candidate', async ({ page }) => {
  await page.goto('/challenges/grid');
  await page.locator('#sort-exp-btn').click();
  await expect(page.locator('.candidate-name').first()).toHaveText('Akash Lead SDET');
  await page.locator('#select-candidate-1').check();
  await expect(page.locator('#selection-summary')).toHaveText('1 Candidate Selected for Interview');
});`,
    hints: [
      'Use locator.first() to target the top row after sorting.'
    ],
    domHtml: `<div class="p-4 bg-slate-900 rounded-xl border border-slate-800 max-w-lg mx-auto space-y-3">
  <div class="flex items-center justify-between">
    <span class="text-xs font-bold text-white">SDET Talent Directory</span>
    <button id="sort-exp-btn" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded font-mono" onclick="const row1 = document.getElementById('row-lead'); const tbody = document.getElementById('table-body'); tbody.prepend(row1);">
      Sort by Exp (Desc) ↓
    </button>
  </div>
  <table class="w-full text-xs text-left text-slate-300">
    <thead class="bg-slate-950 text-slate-400">
      <tr>
        <th class="p-2">Select</th>
        <th class="p-2">Name</th>
        <th class="p-2">Experience</th>
      </tr>
    </thead>
    <tbody id="table-body" class="divide-y divide-slate-800">
      <tr id="row-junior">
        <td class="p-2"><input type="checkbox" class="accent-emerald-500" /></td>
        <td class="p-2 candidate-name">Junior QA Analyst</td>
        <td class="p-2 font-mono">1 Year</td>
      </tr>
      <tr id="row-lead">
        <td class="p-2"><input type="checkbox" id="select-candidate-1" class="accent-emerald-500" onchange="document.getElementById('selection-summary').textContent = '1 Candidate Selected for Interview';" /></td>
        <td class="p-2 candidate-name font-bold text-emerald-400">Akash Lead SDET</td>
        <td class="p-2 font-mono text-emerald-400">10+ Years</td>
      </tr>
    </tbody>
  </table>
  <div id="selection-summary" class="text-xs font-mono text-cyan-400">0 Candidates Selected</div>
</div>`
  }
];

// Generate additional challenges up to 100 with diverse, production-ready QA topics
const CATEGORY_DISTRIBUTION: { category: Challenge['category']; difficulty: Challenge['difficulty']; titleTemplate: string; tags: string[] }[] = [
  { category: 'locators-actions', difficulty: 'Beginner', titleTemplate: 'Locate with getByRole & Accessible Names', tags: ['getByRole', 'accessibility'] },
  { category: 'locators-actions', difficulty: 'Beginner', titleTemplate: 'Target Element by TestId data-testid', tags: ['getByTestId', 'locators'] },
  { category: 'locators-actions', difficulty: 'Beginner', titleTemplate: 'Handle Password Mask & Toggle Visibility', tags: ['input', 'visibility'] },
  { category: 'locators-actions', difficulty: 'Intermediate', titleTemplate: 'Drag and Drop Component Reordering', tags: ['dragTo', 'dragAndDrop'] },
  { category: 'locators-actions', difficulty: 'Intermediate', titleTemplate: 'Keyboard Navigation & Tab Key Traversal', tags: ['keyboard', 'press'] },
  { category: 'assertions-waiting', difficulty: 'Intermediate', titleTemplate: 'Wait for Network Idle Response', tags: ['networkidle', 'waiting'] },
  { category: 'assertions-waiting', difficulty: 'Intermediate', titleTemplate: 'Assert Toast Notification Auto-Dismiss', tags: ['toast', 'expect', 'timing'] },
  { category: 'assertions-waiting', difficulty: 'Advanced', titleTemplate: 'Race Condition Prevention with Promise.all', tags: ['race-condition', 'promise.all'] },
  { category: 'dynamic-elements', difficulty: 'Intermediate', titleTemplate: 'Debounced Search Query Input Validation', tags: ['debounce', 'search', 'timing'] },
  { category: 'dynamic-elements', difficulty: 'Advanced', titleTemplate: 'Infinite Scroll Dynamic List Lazy Loading', tags: ['scroll', 'infinite-scroll'] },
  { category: 'dynamic-elements', difficulty: 'Intermediate', titleTemplate: 'Skeleton Loader Transition to Content', tags: ['skeleton', 'loader'] },
  { category: 'forms-tables', difficulty: 'Intermediate', titleTemplate: 'Multi-Step Checkout Form Wizard', tags: ['forms', 'wizard', 'multi-step'] },
  { category: 'forms-tables', difficulty: 'Advanced', titleTemplate: 'Paginated Grid Sorting & Column Validation', tags: ['pagination', 'tables'] },
  { category: 'forms-tables', difficulty: 'Beginner', titleTemplate: 'Client-side Form Validation Error Messages', tags: ['validation', 'forms'] },
  { category: 'dialogs-frames', difficulty: 'Intermediate', titleTemplate: 'Browser Alert, Confirm, and Prompt Handling', tags: ['dialog', 'alert', 'confirm'] },
  { category: 'dialogs-frames', difficulty: 'Advanced', titleTemplate: 'Nested iFrame Content Frame Locators', tags: ['iframe', 'frameLocator'] },
  { category: 'dialogs-frames', difficulty: 'Advanced', titleTemplate: 'Multiple Browser Tabs and Popup Windows', tags: ['context', 'pages', 'popups'] },
  { category: 'dialogs-frames', difficulty: 'Intermediate', titleTemplate: 'File Upload & Drag-and-Drop Attachment', tags: ['setInputFiles', 'upload'] },
  { category: 'dialogs-frames', difficulty: 'Advanced', titleTemplate: 'Download Event Interception & Verification', tags: ['download', 'files'] },
  { category: 'api-testing', difficulty: 'Intermediate', titleTemplate: 'API Authentication Bearer Token Injection', tags: ['api', 'auth', 'bearer'] },
  { category: 'api-testing', difficulty: 'Advanced', titleTemplate: 'Mocking REST Endpoints with page.route()', tags: ['page.route', 'mocking', 'api'] },
  { category: 'api-testing', difficulty: 'Advanced', titleTemplate: 'Network Failure Simulation (500 Error Injection)', tags: ['network', 'abort', 'chaos-testing'] },
  { category: 'api-testing', difficulty: 'Master', titleTemplate: 'GraphQL Query & Mutation Verification', tags: ['graphql', 'api', 'schema'] },
  { category: 'ts-automation', difficulty: 'Intermediate', titleTemplate: 'Page Object Model with Typed Locators', tags: ['pom', 'typescript', 'architecture'] },
  { category: 'ts-automation', difficulty: 'Advanced', titleTemplate: 'Generic Test Data Builder Pattern in TS', tags: ['generics', 'test-data', 'ts'] },
  { category: 'ts-automation', difficulty: 'Master', titleTemplate: 'Custom Expect Matchers Definition', tags: ['custom-matchers', 'typescript'] },
  { category: 'sql-database', difficulty: 'Intermediate', titleTemplate: 'SQL: Verify Order Total & Tax Calculation', tags: ['sql', 'calculations', 'db'] },
  { category: 'sql-database', difficulty: 'Advanced', titleTemplate: 'SQL: Foreign Key Audit Log Insertion', tags: ['sql', 'audit', 'transactions'] },
  { category: 'sql-database', difficulty: 'Master', titleTemplate: 'SQL: Database Rollback After Test Isolation', tags: ['isolation', 'rollback', 'sql'] },
  { category: 'interview-prep', difficulty: 'Intermediate', titleTemplate: 'Interview: Page Object Model vs Component Objects', tags: ['interview', 'pom', 'design-patterns'] },
  { category: 'interview-prep', difficulty: 'Advanced', titleTemplate: 'Interview: Parallel Test Execution & State Isolation', tags: ['interview', 'concurrency', 'ci-cd'] },
  { category: 'interview-prep', difficulty: 'Advanced', titleTemplate: 'Interview: Handling Flaky Tests in CI/CD Pipelines', tags: ['interview', 'flakiness', 'retries'] },
  { category: 'interview-prep', difficulty: 'Master', titleTemplate: 'Interview: Playwright Architecture (CDP vs WebDriver)', tags: ['interview', 'architecture', 'cdp'] },
  { category: 'pom-architecture', difficulty: 'Advanced', titleTemplate: 'Clean POM: Separating Locators from Actions', tags: ['pom', 'clean-code', 'maintainability'] },
  { category: 'pom-architecture', difficulty: 'Master', titleTemplate: 'Enterprise Playwright Framework Boilerplate', tags: ['framework', 'enterprise', 'reporters'] }
];

// Fill challenges 21 to 100 systematically
for (let i = 21; i <= 100; i++) {
  const dist = CATEGORY_DISTRIBUTION[(i - 21) % CATEGORY_DISTRIBUTION.length];
  const padNum = String(i).padStart(3, '0');
  const baseTitle = `${dist.titleTemplate} #${i}`;
  const slug = baseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  CHALLENGES.push({
    id: `ch-${padNum}`,
    num: i,
    title: baseTitle,
    slug,
    category: dist.category,
    difficulty: dist.difficulty,
    points: dist.difficulty === 'Beginner' ? 100 : dist.difficulty === 'Intermediate' ? 150 : dist.difficulty === 'Advanced' ? 200 : 250,
    tags: dist.tags,
    description: `Challenge #${i} focusing on ${dist.category}. Practice real-world testing scenarios with live DOM validation and real-time execution.`,
    requirements: [
      `Execute required test action for ${dist.titleTemplate}`,
      `Verify expected state using appropriate Playwright matchers`,
      `Ensure execution is reliable without arbitrary sleep delays`
    ],
    starterCode: `import { test, expect } from '@playwright/test';

test('${slug}', async ({ page }) => {
  await page.goto('/challenges/${slug}');
  
  // Locate target and interact
  await page.locator('#target-action-${i}').click();
  
  // Assert success output
  await expect(page.locator('#result-${i}')).toBeVisible();
  await expect(page.locator('#result-${i}')).toHaveText('Challenge ${i} Verified Successfully');
});`,
    solutionCode: `import { test, expect } from '@playwright/test';

test('${slug}', async ({ page }) => {
  await page.goto('/challenges/${slug}');
  await page.locator('#target-action-${i}').click();
  await expect(page.locator('#result-${i}')).toBeVisible();
  await expect(page.locator('#result-${i}')).toHaveText('Challenge ${i} Verified Successfully');
});`,
    hints: [
      `Inspect the element with ID #target-action-${i}.`,
      `Use expect(locator).toBeVisible() or toHaveText().`
    ],
    domHtml: `<div class="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center">
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">LAB #${i}</span>
    <span class="text-xs text-slate-400 capitalize">${dist.difficulty}</span>
  </div>
  <h4 class="text-sm font-bold text-white mb-3">${dist.titleTemplate}</h4>
  <button id="target-action-${i}" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition" onclick="document.getElementById('result-${i}').classList.remove('hidden'); document.getElementById('result-${i}').textContent = 'Challenge ${i} Verified Successfully';">
    Execute Step #${i}
  </button>
  <div id="result-${i}" class="hidden mt-4 p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-xs rounded-lg">
    Challenge ${i} Verified Successfully
  </div>
</div>`
  });
}
