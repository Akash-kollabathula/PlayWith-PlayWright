import { TestStepResult, ValidationResult } from '../types';

export interface ExecutionContextOptions {
  domContainer: HTMLElement;
  onStepHighlight?: (rect: DOMRect | null, selector: string) => void;
  mockApiStore?: Record<string, any>;
}

export class PlaywrightEngine {
  /**
   * Executes a user Playwright test code against a live DOM container.
   */
  static async runTest(
    code: string,
    options: ExecutionContextOptions
  ): Promise<ValidationResult> {
    const { domContainer, onStepHighlight } = options;
    const steps: TestStepResult[] = [];
    const logs: string[] = [];
    let isPassed = true;
    let failureMessage = '';

    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    };

    const recordStep = (
      name: string,
      startTime: number,
      status: 'passed' | 'failed',
      error?: string,
      targetSelector?: string
    ) => {
      const durationMs = Math.max(1, Math.round(performance.now() - startTime));
      steps.push({
        name,
        durationMs,
        status,
        error,
        targetSelector
      });
      if (status === 'failed') {
        isPassed = false;
        failureMessage = error || `Step failed: ${name}`;
      }
    };

    // Helper: flash visual element highlight in the virtual browser
    const highlightElement = async (el: HTMLElement | null, selDescription: string) => {
      if (el && onStepHighlight) {
        const rect = el.getBoundingClientRect();
        onStepHighlight(rect, selDescription);
        await new Promise((r) => setTimeout(r, 120));
      }
    };

    const clearHighlight = () => {
      if (onStepHighlight) {
        onStepHighlight(null, '');
      }
    };

    // Locator implementation mimicking Playwright Locator API
    class SimulatedLocator {
      selector: string;
      rawElements: HTMLElement[];

      constructor(selector: string, elements: HTMLElement[] = []) {
        this.selector = selector;
        this.rawElements = elements;
      }

      private getElement(): HTMLElement | null {
        if (this.rawElements.length > 0) return this.rawElements[0];
        try {
          return domContainer.querySelector(this.selector) as HTMLElement | null;
        } catch {
          return null;
        }
      }

      private getAllElements(): HTMLElement[] {
        if (this.rawElements.length > 0) return this.rawElements;
        try {
          return Array.from(domContainer.querySelectorAll(this.selector)) as HTMLElement[];
        } catch {
          return [];
        }
      }

      first(): SimulatedLocator {
        const els = this.getAllElements();
        return new SimulatedLocator(`${this.selector}:first`, els.slice(0, 1));
      }

      last(): SimulatedLocator {
        const els = this.getAllElements();
        return new SimulatedLocator(`${this.selector}:last`, els.slice(-1));
      }

      nth(index: number): SimulatedLocator {
        const els = this.getAllElements();
        return new SimulatedLocator(`${this.selector}:nth(${index})`, els[index] ? [els[index]] : []);
      }

      filter(opts: { hasText?: string | RegExp }): SimulatedLocator {
        const els = this.getAllElements();
        const filtered = els.filter((el) => {
          if (!opts.hasText) return true;
          const text = el.textContent || '';
          if (typeof opts.hasText === 'string') {
            return text.includes(opts.hasText);
          }
          return opts.hasText.test(text);
        });
        return new SimulatedLocator(`${this.selector}.filter(...)`, filtered);
      }

      async click(clickOptions?: { force?: boolean; button?: 'left' | 'right' | 'middle'; timeout?: number }): Promise<void> {
        const t0 = performance.now();
        const stepName = `locator('${this.selector}').click()`;
        try {
          // Wait for element to exist (auto-waiting simulation)
          let el = this.getElement();
          let waited = 0;
          while (!el && waited < 1200) {
            await new Promise((r) => setTimeout(r, 50));
            waited += 50;
            el = this.getElement();
          }

          if (!el) {
            throw new Error(`Element matching locator "${this.selector}" was not found in the DOM.`);
          }

          if (!clickOptions?.force && (el as HTMLButtonElement).disabled) {
            throw new Error(`Element "${this.selector}" is disabled. Actionability check failed.`);
          }

          await highlightElement(el, this.selector);

          // Dispatch real click events
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const clickEvt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
          el.dispatchEvent(clickEvt);
          if (typeof (el as any).click === 'function') {
            (el as any).click();
          }

          clearHighlight();
          recordStep(stepName, t0, 'passed', undefined, this.selector);
          addLog(`✓ Clicked element: ${this.selector}`);
        } catch (err: any) {
          clearHighlight();
          recordStep(stepName, t0, 'failed', err.message, this.selector);
          addLog(`✗ Failed to click element: ${err.message}`);
          throw err;
        }
      }

      async dblclick(): Promise<void> {
        const t0 = performance.now();
        const stepName = `locator('${this.selector}').dblclick()`;
        try {
          const el = this.getElement();
          if (!el) throw new Error(`Element "${this.selector}" not found.`);
          await highlightElement(el, this.selector);
          const dbl = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
          el.dispatchEvent(dbl);
          clearHighlight();
          recordStep(stepName, t0, 'passed', undefined, this.selector);
        } catch (err: any) {
          clearHighlight();
          recordStep(stepName, t0, 'failed', err.message, this.selector);
          throw err;
        }
      }

      async fill(value: string): Promise<void> {
        const t0 = performance.now();
        const stepName = `locator('${this.selector}').fill('${value}')`;
        try {
          const el = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
          if (!el) throw new Error(`Target input "${this.selector}" was not found.`);
          await highlightElement(el, this.selector);

          el.focus();
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));

          clearHighlight();
          recordStep(stepName, t0, 'passed', undefined, this.selector);
          addLog(`✓ Filled input [${this.selector}] with "${value}"`);
        } catch (err: any) {
          clearHighlight();
          recordStep(stepName, t0, 'failed', err.message, this.selector);
          throw err;
        }
      }

      async check(): Promise<void> {
        const t0 = performance.now();
        const stepName = `locator('${this.selector}').check()`;
        try {
          const el = this.getElement() as HTMLInputElement;
          if (!el) throw new Error(`Checkbox "${this.selector}" not found.`);
          await highlightElement(el, this.selector);
          if (!el.checked) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
          clearHighlight();
          recordStep(stepName, t0, 'passed', undefined, this.selector);
        } catch (err: any) {
          clearHighlight();
          recordStep(stepName, t0, 'failed', err.message, this.selector);
          throw err;
        }
      }

      async uncheck(): Promise<void> {
        const t0 = performance.now();
        const stepName = `locator('${this.selector}').uncheck()`;
        try {
          const el = this.getElement() as HTMLInputElement;
          if (!el) throw new Error(`Checkbox "${this.selector}" not found.`);
          await highlightElement(el, this.selector);
          if (el.checked) {
            el.checked = false;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
          clearHighlight();
          recordStep(stepName, t0, 'passed', undefined, this.selector);
        } catch (err: any) {
          clearHighlight();
          recordStep(stepName, t0, 'failed', err.message, this.selector);
          throw err;
        }
      }

      async selectOption(values: string | string[] | { label?: string; value?: string }): Promise<string[]> {
        const t0 = performance.now();
        const stepName = `locator('${this.selector}').selectOption(...)`;
        try {
          const el = this.getElement() as HTMLSelectElement;
          if (!el) throw new Error(`Select element "${this.selector}" not found.`);
          await highlightElement(el, this.selector);

          const targetVal = typeof values === 'string' ? values : (values as any).value || (values as any).label;
          el.value = targetVal;
          el.dispatchEvent(new Event('change', { bubbles: true }));

          clearHighlight();
          recordStep(stepName, t0, 'passed', undefined, this.selector);
          return [el.value];
        } catch (err: any) {
          clearHighlight();
          recordStep(stepName, t0, 'failed', err.message, this.selector);
          throw err;
        }
      }

      async hover(): Promise<void> {
        const t0 = performance.now();
        const stepName = `locator('${this.selector}').hover()`;
        try {
          const el = this.getElement();
          if (!el) throw new Error(`Element "${this.selector}" not found.`);
          await highlightElement(el, this.selector);
          el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          clearHighlight();
          recordStep(stepName, t0, 'passed', undefined, this.selector);
        } catch (err: any) {
          clearHighlight();
          recordStep(stepName, t0, 'failed', err.message, this.selector);
          throw err;
        }
      }

      async textContent(): Promise<string | null> {
        const el = this.getElement();
        return el ? el.textContent : null;
      }

      async innerText(): Promise<string> {
        const el = this.getElement();
        return el ? el.innerText : '';
      }

      async inputValue(): Promise<string> {
        const el = this.getElement() as HTMLInputElement;
        return el ? el.value : '';
      }

      async isVisible(): Promise<boolean> {
        const el = this.getElement();
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }

      async count(): Promise<number> {
        return this.getAllElements().length;
      }

      async getAttribute(name: string): Promise<string | null> {
        const el = this.getElement();
        return el ? el.getAttribute(name) : null;
      }
    }

    // Simulated Page Object
    const page = {
      goto: async (url: string) => {
        const t0 = performance.now();
        recordStep(`page.goto('${url}')`, t0, 'passed');
        addLog(`Navigated to ${url}`);
        return { status: () => 200, ok: () => true };
      },

      locator: (selector: string) => {
        return new SimulatedLocator(selector);
      },

      getByRole: (role: string, opts?: { name?: string | RegExp }) => {
        // Build locator selector based on common accessibility roles
        let selector = '';
        if (role === 'button') selector = `button, input[type="button"], input[type="submit"], [role="button"]`;
        else if (role === 'heading') selector = `h1, h2, h3, h4, h5, h6, [role="heading"]`;
        else if (role === 'link') selector = `a, [role="link"]`;
        else if (role === 'textbox') selector = `input[type="text"], input:not([type]), textarea, [role="textbox"]`;
        else if (role === 'checkbox') selector = `input[type="checkbox"], [role="checkbox"]`;
        else selector = `[role="${role}"]`;

        const locator = new SimulatedLocator(selector);
        if (opts?.name) {
          return locator.filter({ hasText: opts.name });
        }
        return locator;
      },

      getByText: (text: string | RegExp) => {
        const all = Array.from(domContainer.querySelectorAll('*')) as HTMLElement[];
        const matching = all.filter((el) => {
          if (el.children.length > 0) {
            // only match leaf elements or elements whose direct text matches
            const directText = Array.from(el.childNodes)
              .filter((n) => n.nodeType === Node.TEXT_NODE)
              .map((n) => n.textContent || '')
              .join(' ')
              .trim();
            if (typeof text === 'string') return directText.includes(text);
            return text.test(directText);
          }
          const content = el.textContent || '';
          if (typeof text === 'string') return content.includes(text);
          return text.test(content);
        });
        return new SimulatedLocator(`getByText('${text}')`, matching);
      },

      getByTestId: (testId: string) => {
        return new SimulatedLocator(`[data-testid="${testId}"]`);
      },

      getByPlaceholder: (placeholder: string) => {
        return new SimulatedLocator(`[placeholder="${placeholder}"]`);
      },

      getByLabel: (labelText: string) => {
        const labels = Array.from(domContainer.querySelectorAll('label'));
        const targetLabel = labels.find((l) => (l.textContent || '').includes(labelText));
        if (targetLabel && targetLabel.htmlFor) {
          return new SimulatedLocator(`#${targetLabel.htmlFor}`);
        }
        return new SimulatedLocator(`label:has-text("${labelText}") input`);
      },

      waitForTimeout: async (ms: number) => {
        const t0 = performance.now();
        await new Promise((r) => setTimeout(r, ms));
        recordStep(`page.waitForTimeout(${ms})`, t0, 'passed');
      },

      waitForSelector: async (selector: string, opts?: { state?: 'visible' | 'hidden' | 'attached'; timeout?: number }) => {
        const t0 = performance.now();
        const timeout = opts?.timeout || 3000;
        const targetState = opts?.state || 'visible';
        let waited = 0;

        while (waited < timeout) {
          const el = domContainer.querySelector(selector) as HTMLElement | null;
          let matched = false;
          if (targetState === 'visible') {
            matched = !!(el && el.offsetParent !== null);
          } else if (targetState === 'hidden') {
            matched = !el || el.offsetParent === null;
          } else {
            matched = !!el;
          }
          if (matched) {
            recordStep(`page.waitForSelector('${selector}', { state: '${targetState}' })`, t0, 'passed', undefined, selector);
            return new SimulatedLocator(selector);
          }
          await new Promise((r) => setTimeout(r, 60));
          waited += 60;
        }

        const err = `Timeout ${timeout}ms exceeded while waiting for selector "${selector}"`;
        recordStep(`page.waitForSelector('${selector}')`, t0, 'failed', err, selector);
        throw new Error(err);
      },

      route: async (urlPattern: string | RegExp, handler: (route: any) => void) => {
        addLog(`Registered mock route interceptor: ${urlPattern}`);
        recordStep(`page.route('${urlPattern}')`, performance.now(), 'passed');
      },

      evaluate: async (fnOrString: any, ...args: any[]) => {
        if (typeof fnOrString === 'function') {
          return fnOrString(...args);
        }
        return null;
      }
    };

    // Simulated Expect Matchers
    const expect = (actual: any) => {
      const isLocator = actual instanceof SimulatedLocator;

      return {
        toBeVisible: async () => {
          const t0 = performance.now();
          const stepName = `expect(${isLocator ? actual.selector : 'locator'}).toBeVisible()`;
          if (!isLocator) throw new Error('toBeVisible matcher requires a Locator');

          // Auto-wait up to 1500ms
          let isVis = false;
          let waited = 0;
          while (!isVis && waited < 1500) {
            isVis = await actual.isVisible();
            if (isVis) break;
            await new Promise((r) => setTimeout(r, 60));
            waited += 60;
          }

          if (!isVis) {
            const err = `Expected locator "${actual.selector}" to be visible, but it was not visible.`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toBeHidden: async () => {
          const t0 = performance.now();
          const stepName = `expect(${isLocator ? actual.selector : 'locator'}).toBeHidden()`;
          if (!isLocator) throw new Error('toBeHidden requires a Locator');
          const isVis = await actual.isVisible();
          if (isVis) {
            const err = `Expected locator "${actual.selector}" to be hidden, but it was visible.`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toHaveText: async (expectedText: string | RegExp) => {
          const t0 = performance.now();
          const stepName = `expect(locator).toHaveText(${expectedText})`;
          if (!isLocator) throw new Error('toHaveText requires a Locator');

          let text = await actual.textContent();
          let waited = 0;
          while (waited < 1500) {
            text = (await actual.textContent()) || '';
            const match = typeof expectedText === 'string' ? text.trim() === expectedText.trim() : expectedText.test(text);
            if (match) break;
            await new Promise((r) => setTimeout(r, 60));
            waited += 60;
          }

          const match = typeof expectedText === 'string' ? (text || '').trim() === expectedText.trim() : (expectedText as RegExp).test(text || '');
          if (!match) {
            const err = `Expected text "${expectedText}", but received "${text}".`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toContainText: async (expectedSubstring: string) => {
          const t0 = performance.now();
          const stepName = `expect(locator).toContainText('${expectedSubstring}')`;
          if (!isLocator) throw new Error('toContainText requires a Locator');

          let text = (await actual.textContent()) || '';
          let waited = 0;
          while (!text.includes(expectedSubstring) && waited < 1500) {
            await new Promise((r) => setTimeout(r, 60));
            waited += 60;
            text = (await actual.textContent()) || '';
          }

          if (!text.includes(expectedSubstring)) {
            const err = `Expected locator to contain "${expectedSubstring}", but received "${text}".`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toHaveValue: async (expectedValue: string) => {
          const t0 = performance.now();
          const stepName = `expect(locator).toHaveValue('${expectedValue}')`;
          const val = await actual.inputValue();
          if (val !== expectedValue) {
            const err = `Expected input value to be "${expectedValue}", but got "${val}".`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toBeChecked: async () => {
          const t0 = performance.now();
          const stepName = `expect(locator).toBeChecked()`;
          const el = (actual as any).getElement() as HTMLInputElement;
          if (!el || !el.checked) {
            const err = `Expected checkbox to be checked, but it was unchecked.`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toBeDisabled: async () => {
          const t0 = performance.now();
          const stepName = `expect(locator).toBeDisabled()`;
          const el = (actual as any).getElement() as HTMLButtonElement;
          if (!el || !el.disabled) {
            const err = `Expected element to be disabled, but it was enabled.`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toBeEnabled: async () => {
          const t0 = performance.now();
          const stepName = `expect(locator).toBeEnabled()`;
          const el = (actual as any).getElement() as HTMLButtonElement;
          if (!el || el.disabled) {
            const err = `Expected element to be enabled, but it was disabled.`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toHaveCount: async (expectedCount: number) => {
          const t0 = performance.now();
          const stepName = `expect(locator).toHaveCount(${expectedCount})`;
          const count = await actual.count();
          if (count !== expectedCount) {
            const err = `Expected element count to be ${expectedCount}, but found ${count}.`;
            recordStep(stepName, t0, 'failed', err, actual.selector);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed', undefined, actual.selector);
        },

        toBe: (expectedVal: any) => {
          const t0 = performance.now();
          const stepName = `expect(val).toBe(${expectedVal})`;
          if (actual !== expectedVal) {
            const err = `Expected ${expectedVal}, but got ${actual}`;
            recordStep(stepName, t0, 'failed', err);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed');
        },

        toEqual: (expectedVal: any) => {
          const t0 = performance.now();
          const stepName = `expect(val).toEqual(...)`;
          const isEq = JSON.stringify(actual) === JSON.stringify(expectedVal);
          if (!isEq) {
            const err = `Objects do not match: ${JSON.stringify(actual)} vs ${JSON.stringify(expectedVal)}`;
            recordStep(stepName, t0, 'failed', err);
            throw new Error(err);
          }
          recordStep(stepName, t0, 'passed');
        }
      };
    };

    // Simulated API Request object for Playwright API testing
    const request = {
      get: async (url: string, opts?: any) => {
        const t0 = performance.now();
        addLog(`[API GET] ${url}`);
        recordStep(`request.get('${url}')`, t0, 'passed');
        return {
          status: () => 200,
          ok: () => true,
          json: async () => options.mockApiStore || { success: true, count: 5, data: [] }
        };
      },
      post: async (url: string, opts?: any) => {
        const t0 = performance.now();
        addLog(`[API POST] ${url} - Body: ${JSON.stringify(opts?.data || {})}`);
        recordStep(`request.post('${url}')`, t0, 'passed');
        return {
          status: () => 201,
          ok: () => true,
          json: async () => ({ id: 'new_id_99', created: true, ...(opts?.data || {}) })
        };
      }
    };

    // Mock test runner wrapper
    const testRunner = async (title: string, testFn: (fixtures: any) => Promise<void>) => {
      addLog(`▶ Running test suite: "${title}"`);
      await testFn({ page, request });
    };

    // Prepare sandbox execution: strip imports and bundle into executable function
    try {
      // Remove imports
      let cleanCode = code
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/export\s+.*?;?/g, '');

      // Check if test(...) was defined or if code is raw statements
      if (!cleanCode.includes('test(')) {
        cleanCode = `await (async ({ page, request }) => {\n${cleanCode}\n})({ page, request });`;
      } else {
        // Replace test(...) calls with testRunner(...)
        cleanCode = cleanCode.replace(/\btest\s*\(/g, 'testRunner(');
      }

      // Async Function sandbox
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction('page', 'expect', 'request', 'testRunner', 'console', cleanCode);

      // Custom console interceptor
      const customConsole = {
        log: (...args: any[]) => addLog(`[LOG] ${args.join(' ')}`),
        error: (...args: any[]) => addLog(`[ERROR] ${args.join(' ')}`),
        warn: (...args: any[]) => addLog(`[WARN] ${args.join(' ')}`)
      };

      await fn(page, expect, request, testRunner, customConsole);

      if (steps.length === 0) {
        steps.push({
          name: 'Execution completed',
          durationMs: 5,
          status: 'passed'
        });
      }

      addLog(`✨ Test run completed with ${steps.filter((s) => s.status === 'passed').length} passed step(s).`);

      return {
        passed: isPassed && steps.every((s) => s.status === 'passed'),
        message: isPassed ? 'All test assertions passed successfully!' : failureMessage,
        steps,
        logs
      };
    } catch (err: any) {
      addLog(`❌ Test execution aborted: ${err.message}`);
      return {
        passed: false,
        message: err.message || 'Execution error encountered',
        steps,
        logs
      };
    }
  }
}
