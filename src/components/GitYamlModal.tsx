import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  GitBranch,
  Terminal,
  Layers,
  Sparkles,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCode2
} from 'lucide-react';

interface GitYamlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitYamlModal: React.FC<GitYamlModalProps> = ({ isOpen, onClose }) => {
  const [branches, setBranches] = useState('main, master');
  const [includePR, setIncludePR] = useState(true);
  const [includeCron, setIncludeCron] = useState(false);
  const [cronSchedule, setCronSchedule] = useState('0 2 * * *');
  const [enableSharding, setEnableSharding] = useState(false);
  const [shardCount, setShardCount] = useState(4);
  const [enableCache, setEnableCache] = useState(true);
  const [nodeVersion, setNodeVersion] = useState('20');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const branchList = branches
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);

  const branchArrayYaml = branchList.map((b) => `"${b}"`).join(', ');

  const generateYaml = () => {
    let triggers = `on:
  push:
    branches: [ ${branchArrayYaml} ]`;

    if (includePR) {
      triggers += `
  pull_request:
    branches: [ ${branchArrayYaml} ]`;
    }

    if (includeCron) {
      triggers += `
  schedule:
    # Nightly regression run at 02:00 UTC
    - cron: '${cronSchedule}'`;
    }

    triggers += `
  # Allows manual runs from GitHub Actions Web UI
  workflow_dispatch:
    inputs:
      test_grep:
        description: 'Test tag / grep filter (e.g. @smoke, @regression)'
        required: false
        default: ''`;

    const strategyBlock = enableSharding
      ? `
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [${Array.from({ length: shardCount }, (_, i) => i + 1).join(', ')}]
        shardTotal: [${shardCount}]`
      : '';

    const testCommand = enableSharding
      ? `run: |
          if [ -n "\${{ github.event.inputs.test_grep }}" ]; then
            npx playwright test --grep "\${{ github.event.inputs.test_grep }}" --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
          else
            npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}
          fi`
      : `run: |
          if [ -n "\${{ github.event.inputs.test_grep }}" ]; then
            npx playwright test --grep "\${{ github.event.inputs.test_grep }}"
          else
            npx playwright test
          fi`;

    const reportArtifactName = enableSharding
      ? `playwright-report-\${{ matrix.shardIndex }}`
      : `playwright-report`;

    const cacheSteps = enableCache
      ? `      - name: Get Playwright Version for Cache
        id: playwright-version
        run: echo "PLAYWRIGHT_VERSION=$(node -e "try { console.log(require('@playwright/test/package.json').version) } catch { console.log('latest') }")" >> $GITHUB_ENV

      - name: Cache Playwright Browser Binaries
        uses: actions/cache@v4
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: \${{ runner.os }}-playwright-\${{ env.PLAYWRIGHT_VERSION }}

      - name: Install Playwright Browsers & OS Dependencies
        run: npx playwright install --with-deps
        if: steps.playwright-cache.outputs.cache-hit != 'true'

      - name: Install OS Dependencies Only (Cache Hit)
        run: npx playwright install-deps
        if: steps.playwright-cache.outputs.cache-hit == 'true'`
      : `      - name: Install Playwright Browsers with Dependencies
        run: npx playwright install --with-deps`;

    return `name: Playwright Tests by Akash
run-name: Playwright E2E Tests on \${{ github.ref_name }} by @\${{ github.actor }}

${triggers}

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  test:
    name: ${enableSharding ? 'Run Sharded Tests (${{ matrix.shardIndex }}/${{ matrix.shardTotal }})' : 'Run Playwright Test Suite'}
    timeout-minutes: 60
    runs-on: ubuntu-latest${strategyBlock}

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js ${nodeVersion}
        uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

${cacheSteps}

      - name: Run Playwright Tests
        env:
          CI: true
        ${testCommand}

      - name: Upload Playwright HTML Report
        uses: actions/upload-artifact@v4
        if: \${{ !cancelled() }}
        with:
          name: ${reportArtifactName}
          path: playwright-report/
          retention-days: 14

      - name: Upload Test Failure Traces & Screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results${enableSharding ? '-${{ matrix.shardIndex }}' : ''}
          path: test-results/
          retention-days: 14
`;
  };

  const yamlContent = generateYaml();

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playwright.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <FileCode2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">GitHub Actions YAML Generator</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-semibold">
                  on: push
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production-grade <code className="text-cyan-400">.github/workflows/playwright.yml</code> by Akash
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              title="Download playwright.yml"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied YAML!' : 'Copy YAML'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Config Options & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0">
          {/* Controls Sidebar (4 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-900/90 border-r border-slate-800 overflow-y-auto space-y-4 text-xs">
            {/* Target Branches */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <GitBranch size={13} className="text-emerald-400" /> Target Branches (on: push)
              </label>
              <input
                type="text"
                value={branches}
                onChange={(e) => setBranches(e.target.value)}
                placeholder="main, master, develop"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Comma-separated branch names</span>
            </div>

            {/* Triggers */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Triggers</label>
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePR}
                  onChange={(e) => setIncludePR(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <div>
                  <div className="text-slate-200 font-medium">on: pull_request</div>
                  <div className="text-[10px] text-slate-500">Run tests on every incoming PR to prevent regressions</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCron}
                  onChange={(e) => setIncludeCron(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <div>
                  <div className="text-slate-200 font-medium">on: schedule (Cron Job)</div>
                  <div className="text-[10px] text-slate-500">Nightly or scheduled test execution</div>
                </div>
              </label>

              {includeCron && (
                <div className="pl-6 pt-1">
                  <input
                    type="text"
                    value={cronSchedule}
                    onChange={(e) => setCronSchedule(e.target.value)}
                    placeholder="0 2 * * *"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500">Cron syntax (default: 02:00 UTC daily)</span>
                </div>
              )}
            </div>

            {/* Matrix & Sharding */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" /> Parallel Sharding
              </label>
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSharding}
                  onChange={(e) => setEnableSharding(e.target.checked)}
                  className="accent-cyan-500 rounded"
                />
                <div>
                  <div className="text-slate-200 font-medium">Enable Test Sharding (Matrix)</div>
                  <div className="text-[10px] text-slate-500">Distribute tests across multiple CI runners</div>
                </div>
              </label>

              {enableSharding && (
                <div className="pl-6 pt-1 flex items-center gap-2">
                  <span className="text-slate-400">Shards:</span>
                  {[2, 4, 8].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setShardCount(n)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                        shardCount === n
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {n} Shards ({n}x speed)
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Performance & Caching */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Cpu size={13} className="text-purple-400" /> Performance & Cache
              </label>
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCache}
                  onChange={(e) => setEnableCache(e.target.checked)}
                  className="accent-purple-500 rounded"
                />
                <div>
                  <div className="text-slate-200 font-medium">Cache Browser Binaries</div>
                  <div className="text-[10px] text-slate-500">Saves 2-4 minutes of download time on each CI run</div>
                </div>
              </label>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Node.js Version</label>
                <div className="flex gap-2">
                  {['20', '22', '18'].map((ver) => (
                    <button
                      key={ver}
                      type="button"
                      onClick={() => setNodeVersion(ver)}
                      className={`px-3 py-1 rounded text-xs font-mono transition ${
                        nodeVersion === ver
                          ? 'bg-purple-500 text-white font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-400'
                      }`}
                    >
                      Node {ver}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructions info */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">How to use:</strong>
              <ol className="list-decimal pl-4 mt-1 space-y-1">
                <li>Create <code className="text-emerald-400">.github/workflows/playwright.yml</code> in your repository</li>
                <li>Paste this YAML configuration</li>
                <li>Commit and push to trigger automated tests!</li>
              </ol>
            </div>
          </div>

          {/* YAML Live Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Terminal size={13} className="text-emerald-400" /> .github/workflows/playwright.yml
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">Ready on push</span>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-200">
              <pre className="text-slate-200 selection:bg-purple-500/30">
                {yamlContent}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
