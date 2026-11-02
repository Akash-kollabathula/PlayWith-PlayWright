export interface CourseTrack {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  badge: string;
  challengeCount: number;
  level: string;
  topics: string[];
}

export const COURSES: CourseTrack[] = [
  {
    id: 'playwright-core',
    title: 'Playwright Masterclass • by Akash',
    description: '100 progressive coding challenges from beginner locators to enterprise Page Object Models, auto-waiting, dynamic element handling, and parallel workers.',
    icon: '🎭',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    badge: '100 Challenges',
    challengeCount: 100,
    level: 'Beginner to Master',
    topics: ['Locators & Actions', 'Auto-Waiting', 'Dynamic Spinners', 'Tables & Forms', 'iFrames & Popups', 'Page Objects']
  },
  {
    id: 'interview-prep',
    title: 'Playwright & Manual Testing Interview Lab',
    description: 'High-frequency automation & manual testing interview questions asked at Google, Microsoft, Amazon, and top tier firms with model answers.',
    icon: '💼',
    color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-400',
    badge: 'FAANG Frequency',
    challengeCount: 50,
    level: 'Junior to Architect',
    topics: ['Actionability Checks', 'CDP vs WebDriver', 'Flakiness Fixes', 'BVA & Equivalence Partitioning', 'Severity vs Priority', 'Bug Life Cycle']
  },
  {
    id: 'api-testing',
    title: 'Playwright API & Network Testing Studio',
    description: 'Master headless request fixtures, route interception, payload mutation, authentication cookies, status code verification, and REST contract validation.',
    icon: '⚡',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    badge: 'API Studio',
    challengeCount: 20,
    level: 'Intermediate',
    topics: ['request.get / post', 'page.route() Mocking', 'Network Interception', 'Bearer Auth Tokens', 'JSON Schema Validation']
  },
  {
    id: 'ts-automation',
    title: 'TypeScript for Test Automation (TS Heaven)',
    description: 'Supercharge your tests with strict TypeScript typing, custom fixtures, generic helper utilities, and typed Page Object patterns by Akash.',
    icon: '🔷',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    badge: 'TS Heaven',
    challengeCount: 15,
    level: 'Intermediate to Advanced',
    topics: ['test.extend Fixtures', 'Generic Page Objects', 'Type Narrowing', 'Custom Expect Matchers', 'Promise Async Patterns']
  },
  {
    id: 'sql-database',
    title: 'SQL for QA & Test Automation',
    description: 'Verify database state, run query assertions, validate audit logs, and ensure end-to-end data integrity in PostgreSQL & SQLite.',
    icon: '🗄️',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400',
    badge: 'Database QA',
    challengeCount: 15,
    level: 'Beginner to Intermediate',
    topics: ['SELECT Queries', 'Data Integrity Checks', 'Transactions & Rollbacks', 'Foreign Key Verification', 'Seed Data Fixtures']
  },
  {
    id: 'devops-cicd',
    title: 'CI/CD, Jenkins, GitHub Actions & Docker',
    description: 'Enterprise pipeline deployment, Docker containerization, matrix sharding across 4 parallel jobs, and Allure / HTML reporting.',
    icon: '🚀',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    badge: 'DevOps Pipeline',
    challengeCount: 10,
    level: 'Advanced / Lead',
    topics: ['GitHub Actions Workflows', 'Jenkinsfile Pipelines', 'Docker & Compose', 'Parallel Sharding', 'Allure Reports']
  }
];

export interface InterviewCard {
  id: string;
  category: 'Automation' | 'Manual Testing' | 'API & Protocol' | 'DevOps & CI/CD';
  subCategory: string;
  question: string;
  frequency: 'Must Know' | 'High' | 'Medium';
  level: 'Junior' | 'Mid-Level' | 'Senior/Lead';
  keyAnswer: string;
  codeSnippet?: string;
  commonTrap: string;
}

export const INTERVIEW_QUESTIONS: InterviewCard[] = [
  // --- AUTOMATION QUESTIONS ---
  {
    id: 'int-1',
    category: 'Automation',
    subCategory: 'Architecture',
    question: 'How does Playwright differ fundamentally from Selenium WebDriver?',
    frequency: 'Must Know',
    level: 'Mid-Level',
    keyAnswer: 'Selenium relies on the W3C WebDriver HTTP JSON Wire Protocol which sends individual HTTP commands to a separate driver executable for every action, introducing latency and timing issues. Playwright communicates directly with browsers using a single-websocket connection via DevTools protocols (CDP in Chromium, specialized protocols in Firefox and WebKit). This provides sub-millisecond execution, bi-directional event listeners, network interception, and built-in auto-waiting.',
    codeSnippet: `// Selenium: requires explicit WebDriverWait and driver binaries
// Playwright: direct CDP bi-directional socket with auto-waiting
await page.locator('#submit').click(); // Auto-waits for visible, stable, enabled`,
    commonTrap: 'Saying Playwright only supports Chromium. Playwright supports Chromium, WebKit (Safari), and Firefox using true native rendering engines.'
  },
  {
    id: 'int-2',
    category: 'Automation',
    subCategory: 'Locators & Flakiness',
    question: 'Why does locator.click() eliminate 90% of flaky test failures compared to traditional tools?',
    frequency: 'Must Know',
    level: 'Junior',
    keyAnswer: 'Playwright performs automatic actionability checks prior to executing the click. It verifies: 1) Attached to DOM, 2) Visible (bounding box not 0, visibility not hidden), 3) Stable (not animating/moving), 4) Enabled (disabled attribute is false), 5) Receives Events (not obscured by an overlay or sticky navbar). If any check fails, it waits up to the timeout rather than throwing immediate NoSuchElementException.',
    codeSnippet: `// Playwright does NOT need manual Thread.sleep or wait.until(visibilityOf)
await page.getByRole('button', { name: 'Save Changes' }).click();`,
    commonTrap: 'Adding manual page.waitForTimeout(5000) before locator clicks, defeating auto-waiting.'
  },
  {
    id: 'int-3',
    category: 'Automation',
    subCategory: 'State Management',
    question: 'How does Playwright reuse authenticated session state across 100+ tests without logging in each time?',
    frequency: 'Must Know',
    level: 'Senior/Lead',
    keyAnswer: 'Through storageState(). Playwright logs in once in a setup project or beforeAll hook, captures the cookies and localStorage via `await page.context().storageState({ path: "auth.json" })`, and then passes this JSON to all worker contexts via `use: { storageState: "auth.json" }`. Tests start already logged in, cutting suite execution time by 80%.',
    codeSnippet: `// 1. In auth.setup.ts:
await page.locator('#user').fill('admin');
await page.locator('#pass').fill('secret');
await page.locator('#login').click();
await page.context().storageState({ path: 'playwright/.auth/user.json' });

// 2. In playwright.config.ts:
projects: [
  { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
  { name: 'chromium', use: { storageState: 'playwright/.auth/user.json' } }
];`,
    commonTrap: 'Thinking storageState persists sessionStorage by default (only cookies and localStorage are captured unless custom serialized).'
  },
  {
    id: 'int-4',
    category: 'Automation',
    subCategory: 'Network & API',
    question: 'How do you mock third-party payment gateways or ads in Playwright using page.route()?',
    frequency: 'High',
    level: 'Senior/Lead',
    keyAnswer: 'Use page.route() to intercept requests at the browser network layer. You can either fulfill with custom mock JSON, abort the request (e.g., block analytics or images to speed up tests), or modify request headers before forwarding to the real server.',
    codeSnippet: `// Mock payment gateway response:
await page.route('**/api/payment/charge', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ transactionId: 'TXN_SUCCESS_999', status: 'PAID' })
  });
});`,
    commonTrap: 'Not awaiting route.fulfill() or calling route.continue() after fulfilling.'
  },

  // --- MANUAL TESTING CONCEPTS ---
  {
    id: 'int-5',
    category: 'Manual Testing',
    subCategory: 'Test Design Techniques',
    question: 'Explain Boundary Value Analysis (BVA) vs Equivalence Class Partitioning (EP) with practical examples.',
    frequency: 'Must Know',
    level: 'Junior',
    keyAnswer: 'Equivalence Partitioning (EP) divides the input data domain into valid and invalid partitions, picking one representative value from each partition. Boundary Value Analysis (BVA) focuses on the boundary limits where most edge-case bugs occur: min, min+1, nominal, max-1, max. Example: An age field accepting 18 to 60. EP Valid: 35. EP Invalid: 10, 75. BVA test values: 17, 18, 19, 59, 60, 61.',
    codeSnippet: `// Test values for Age [18 - 60]:
// Min-1 (Invalid): 17 -> "Must be at least 18"
// Min (Valid): 18 -> Success
// Max (Valid): 60 -> Success
// Max+1 (Invalid): 61 -> "Must not exceed 60"`,
    commonTrap: 'Confusing BVA with stress testing. BVA is a functional specification-based black box technique targeting transition thresholds.'
  },
  {
    id: 'int-6',
    category: 'Manual Testing',
    subCategory: 'Defect Management',
    question: 'What is the difference between Severity vs Priority? Give 4 quadrant real-world examples.',
    frequency: 'Must Know',
    level: 'Junior',
    keyAnswer: 'Severity reflects the technical impact of the defect on the system functionality (measured by QA). Priority reflects the business urgency of fixing the defect (decided by Product / Business). Quadrants: 1) High Severity & High Priority: Checkout payment crash on production; 2) High Severity & Low Priority: Crash on legacy browser that accounts for 0.01% of traffic; 3) Low Severity & High Priority: Company CEO name misspelled or company logo broken on homepage; 4) Low Severity & Low Priority: Minor misalignment of footer copyright text.',
    codeSnippet: `// Matrix:
// High Sev / High Prio: Fatal crash blocking all sales
// Low Sev / High Prio: Typo in main brand header
// High Sev / Low Prio: Crash in deprecated export tool used once a year
// Low Sev / Low Prio: 1px button border mismatch`,
    commonTrap: 'Claiming Severity and Priority are always identical. Severity is technical impact; Priority is business timeline.'
  },
  {
    id: 'int-7',
    category: 'Manual Testing',
    subCategory: 'Testing Classifications',
    question: 'Compare Smoke Testing, Sanity Testing, Regression Testing, and Re-testing.',
    frequency: 'Must Know',
    level: 'Junior',
    keyAnswer: 'Smoke Testing: "Build Verification Test". Shallow & wide test of critical basic workflows to decide if the new build is stable enough for deeper QA. Sanity Testing: Subset of regression testing, narrow & deep, performed after a minor bug fix to verify the specific module works. Re-Testing: Executing the exact failed test cases to verify the reported bug was resolved. Regression Testing: Testing the entire application or unaffected modules to ensure recent code changes did not break existing features.',
    commonTrap: 'Using Smoke and Sanity interchangeably. Smoke tests broad basic functionality on fresh builds; Sanity tests specific module stability after fixes.'
  },
  {
    id: 'int-8',
    category: 'Manual Testing',
    subCategory: 'STLC & Bug Lifecycle',
    question: 'Walk through the complete Bug Life Cycle states and when a defect is marked Deferred vs Rejected.',
    frequency: 'High',
    level: 'Mid-Level',
    keyAnswer: 'States: New -> Assigned -> Open -> In Progress -> Fixed -> Pending Retest -> Retest -> Verified -> Closed. Exceptions: 1) REJECTED: When developer proves the behavior matches product specs (Not a Bug); 2) DUPLICATE: Same root cause already logged in Jira; 3) DEFERRED: Valid bug, but postponed to a future sprint/release due to low priority or release deadlines; 4) NOT REPRODUCIBLE: Cannot reproduce in dev/staging environment.',
    commonTrap: 'Closing a bug directly after developer says it is fixed without independent QA verification in staging.'
  },

  // --- API & PROTOCOL ---
  {
    id: 'int-9',
    category: 'API & Protocol',
    subCategory: 'HTTP Methods & Status',
    question: 'What is Idempotency in REST APIs, and how do PUT, POST, and PATCH differ?',
    frequency: 'Must Know',
    level: 'Mid-Level',
    keyAnswer: 'An HTTP method is idempotent if executing it multiple times produces the identical side-effect on the server as executing it once. GET, PUT, DELETE, and HEAD are idempotent. POST is NOT idempotent (calling POST 5 times creates 5 separate resources). Difference: POST creates a new resource. PUT completely replaces an existing resource (or creates if absent). PATCH partially updates specific fields of an existing resource without touching others.',
    codeSnippet: `// POST: Not idempotent -> /api/orders (creates new order each time)
// PUT: Idempotent -> /api/users/101 (replaces whole object)
// PATCH: Idempotent/Non-idempotent -> /api/users/101 { status: 'ACTIVE' }`,
    commonTrap: 'Assuming PATCH is always identical to PUT. PUT requires sending the full representation; PATCH only modifies supplied attributes.'
  },

  // --- DEVOPS & CI/CD ---
  {
    id: 'int-10',
    category: 'DevOps & CI/CD',
    subCategory: 'Parallelism & Sharding',
    question: 'What is Test Sharding in Playwright, and how does it differ from Workers?',
    frequency: 'Must Know',
    level: 'Senior/Lead',
    keyAnswer: 'Workers run tests in parallel on multiple CPU cores within a SINGLE machine or CI container. Sharding distributes test files across MULTIPLE independent CI machines/VMs. For example, with 4 shards (`--shard=1/4`, `--shard=2/4`), 4 separate GitHub Actions VMs run concurrently, each executing 25% of the test suite. Combining both (e.g. 4 shards * 2 workers = 8 parallel browser streams) drops a 40-minute suite down to under 5 minutes.',
    codeSnippet: `// In GitHub Actions matrix:
// run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }} --workers=2`,
    commonTrap: 'Setting workers too high on a low-spec CI machine (e.g. 10 workers on a 2-core GitHub runner), causing CPU throttling, tab crashes, and massive flakiness.'
  }
];
