import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Globe,
  Terminal,
  HelpCircle,
  BookOpen,
  Sparkles,
  ChevronRight,
  Maximize2,
  Smartphone,
  Monitor,
  Tablet,
  FileCheck,
  AlertCircle,
  Database,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Layers
} from 'lucide-react';
import { Challenge, TestStepResult, ValidationResult, UserProfile } from '../types';
import { PlaywrightEngine } from '../services/playwrightEngine';
import { userService } from '../services/userService';

interface PlaywrightIDEProps {
  challenge: Challenge;
  user: UserProfile;
  onChallengeComplete: (challengeId: string, points: number, category: string) => void;
  onNextChallenge?: () => void;
  onCompanionActionChange?: (state: 'idle' | 'running' | 'success' | 'fail') => void;
}

export const PlaywrightIDE: React.FC<PlaywrightIDEProps> = ({
  challenge,
  user,
  onChallengeComplete,
  onNextChallenge,
  onCompanionActionChange
}) => {
  const [code, setCode] = useState<string>(() => {
    return userService.getSavedCode(challenge.id) || challenge.starterCode;
  });
  const [activeTab, setActiveTab] = useState<'instructions' | 'hints' | 'inspector' | 'api-sql'>('instructions');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [inspectMode, setInspectMode] = useState(false);
  const [copiedLocator, setCopiedLocator] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeStepTab, setActiveStepTab] = useState<'steps' | 'logs'>('steps');

  // Visual highlight in live browser
  const [highlightBox, setHighlightBox] = useState<{ rect: DOMRect; label: string } | null>(null);

  // Target DOM container ref
  const virtualBrowserRef = useRef<HTMLDivElement>(null);
  const browserWrapperRef = useRef<HTMLDivElement>(null);

  // Update code when challenge changes
  useEffect(() => {
    const saved = userService.getSavedCode(challenge.id);
    setCode(saved || challenge.starterCode);
    setResults(null);
    setConsoleLogs([]);
    setHighlightBox(null);
    onCompanionActionChange?.('idle');
  }, [challenge.id]);

  // Render DOM HTML whenever challenge changes or user resets
  const resetDom = () => {
    if (!virtualBrowserRef.current) return;
    virtualBrowserRef.current.innerHTML = challenge.domHtml;
    // Execute any inline scripts inside domScript if present
    if (challenge.domScript) {
      try {
        const scriptFn = new Function('container', challenge.domScript);
        scriptFn(virtualBrowserRef.current);
      } catch (e) {
        console.warn('Error running challenge domScript:', e);
      }
    }
  };

  useEffect(() => {
    resetDom();
  }, [challenge.id, challenge.domHtml]);

  // Handle run test
  const handleRunTest = async () => {
    if (isRunning || !virtualBrowserRef.current) return;

    setIsRunning(true);
    setResults(null);
    setConsoleLogs([]);
    onCompanionActionChange?.('running');

    // Reset DOM state before running so tests run cleanly
    resetDom();
    await new Promise((r) => setTimeout(r, 60));

    try {
      const execResult = await PlaywrightEngine.runTest(code, {
        domContainer: virtualBrowserRef.current,
        mockApiStore: challenge.apiScenario?.mockResponseBody,
        onStepHighlight: (rect, selector) => {
          if (rect && browserWrapperRef.current) {
            const wrapperRect = browserWrapperRef.current.getBoundingClientRect();
            // Convert to relative coordinates inside wrapper
            const relativeRect = {
              top: rect.top - wrapperRect.top,
              left: rect.left - wrapperRect.left,
              width: rect.width,
              height: rect.height,
              bottom: rect.bottom - wrapperRect.top,
              right: rect.right - wrapperRect.left,
              x: rect.x - wrapperRect.left,
              y: rect.y - wrapperRect.top,
              toJSON: () => {}
            } as DOMRect;
            setHighlightBox({ rect: relativeRect, label: selector });
          } else {
            setHighlightBox(null);
          }
        }
      });

      setResults(execResult);
      setConsoleLogs(execResult.logs);

      if (execResult.passed) {
        onCompanionActionChange?.('success');
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        onChallengeComplete(challenge.id, challenge.points, challenge.category);
      } else {
        onCompanionActionChange?.('fail');
      }
    } catch (err: any) {
      setResults({
        passed: false,
        message: err.message || 'Execution failed',
        steps: [{ name: 'Test execution failed', durationMs: 0, status: 'failed', error: err.message }],
        logs: [err.message]
      });
      onCompanionActionChange?.('fail');
    } finally {
      setIsRunning(false);
      setHighlightBox(null);
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunTest();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        userService.saveCode(challenge.id, code);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, challenge.id, isRunning]);

  // Click on virtual browser element in Inspector mode to copy locator snippet
  const handleInspectClick = (e: React.MouseEvent) => {
    if (!inspectMode) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (!target) return;

    let selector = '';
    if (target.id) {
      selector = `page.locator('#${target.id}')`;
    } else if (target.getAttribute('data-testid')) {
      selector = `page.getByTestId('${target.getAttribute('data-testid')}')`;
    } else if (target.tagName.toLowerCase() === 'button' && target.textContent) {
      selector = `page.getByRole('button', { name: '${target.textContent.trim()}' })`;
    } else if (target.getAttribute('placeholder')) {
      selector = `page.getByPlaceholder('${target.getAttribute('placeholder')}')`;
    } else if (target.className && typeof target.className === 'string') {
      const firstClass = target.className.split(' ')[0];
      selector = `page.locator('.${firstClass}')`;
    } else {
      selector = `page.locator('${target.tagName.toLowerCase()}')`;
    }

    navigator.clipboard.writeText(selector);
    setCopiedLocator(selector);
    setTimeout(() => setCopiedLocator(null), 2000);
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Reset to starter
  const handleResetCode = () => {
    if (confirm('Reset code to starter template?')) {
      setCode(challenge.starterCode);
      userService.saveCode(challenge.id, challenge.starterCode);
      resetDom();
      setResults(null);
    }
  };

  // Reveal solution
  const handleRevealSolution = () => {
    if (confirm('Load the verified solution code?')) {
      setCode(challenge.solutionCode);
      userService.saveCode(challenge.id, challenge.solutionCode);
    }
  };

  const isSolved = user.solvedChallenges.includes(challenge.id);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Challenge Meta Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
            #{challenge.num}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            {challenge.title}
            {isSolved && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                <Check size={12} /> Solved
              </span>
            )}
          </h2>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              challenge.difficulty === 'Beginner'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : challenge.difficulty === 'Intermediate'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {challenge.difficulty}
          </span>
          <span className="text-xs text-slate-400 font-mono">+{challenge.points} XP</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onNextChallenge && (
            <button
              onClick={onNextChallenge}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              Next Challenge <ChevronRight size={14} />
            </button>
          )}

          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer ${
              isRunning
                ? 'bg-emerald-600/50 text-slate-300 cursor-wait'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            <Play size={14} className={isRunning ? 'animate-spin' : 'fill-slate-950'} />
            {isRunning ? 'Running Tests...' : 'Run Test (Ctrl+Enter)'}
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Pane: Challenge Guide & Requirements (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col border-r border-slate-800 bg-slate-900/60 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900 px-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3 py-2.5 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'instructions'
                  ? 'border-emerald-500 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} /> Instructions
            </button>

            <button
              onClick={() => setActiveTab('hints')}
              className={`px-3 py-2.5 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'hints'
                  ? 'border-emerald-500 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={14} /> Hints ({challenge.hints.length})
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3 py-2.5 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'inspector'
                  ? 'border-emerald-500 text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={14} /> DOM Guide
            </button>

            {(challenge.interviewData || challenge.sqlScenario || challenge.apiScenario) && (
              <button
                onClick={() => setActiveTab('api-sql')}
                className={`px-3 py-2.5 flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'api-sql'
                    ? 'border-cyan-500 text-cyan-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {challenge.interviewData ? '💼 Interview' : challenge.sqlScenario ? '🗄️ SQL DB' : '⚡ API Payload'}
              </button>
            )}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm text-slate-300">
            {activeTab === 'instructions' && (
              <>
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Problem Statement</h3>
                  <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">{challenge.description}</p>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Acceptance Criteria</h3>
                  <ul className="space-y-2">
                    {challenge.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                          {i + 1}
                        </span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {challenge.docUrl && (
                  <div className="pt-2">
                    <a
                      href={challenge.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
                    >
                      <BookOpen size={12} /> Playwright Official Documentation Reference
                    </a>
                  </div>
                )}
              </>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                  Try solving the challenge first! If you get stuck, use these progressive hints.
                </div>
                {challenge.hints.map((hint, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 mr-1.5">Hint #{idx + 1}:</span>
                    <span className="text-slate-300">{hint}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={handleRevealSolution}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
                  >
                    Reveal Verified Solution Code
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'inspector' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  DOM markup rendered in the Virtual Browser. Hover & click elements in the browser when "Inspect Mode" is active to auto-copy their Playwright locator:
                </p>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                  {challenge.domHtml}
                </pre>
              </div>
            )}

            {activeTab === 'api-sql' && (
              <div className="space-y-4">
                {challenge.interviewData && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-400">Interview Drilldown</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Asked at: {challenge.interviewData.companies.join(', ')}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      {challenge.interviewData.explanation}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-rose-300 mb-1">Common Pitfalls to Avoid:</h4>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                        {challenge.interviewData.commonMistakes.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {challenge.sqlScenario && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                      <Database size={14} /> Database Schema & Query Target
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400">
                      {challenge.sqlScenario.tableSchema}
                    </pre>
                    <div className="text-xs text-slate-400">Target Assertion Query:</div>
                    <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-cyan-300">
                      {challenge.sqlScenario.targetQuery}
                    </pre>
                  </div>
                )}

                {challenge.apiScenario && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                      <Send size={14} /> Mock API Request & Response Schema
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="font-mono text-emerald-400 font-bold">{challenge.apiScenario.method}</span> {challenge.apiScenario.endpoint}
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                      {JSON.stringify(challenge.apiScenario.mockResponseBody, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center / Right Split: Code Editor (4 Cols) & Virtual Browser (4 Cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          {/* Top Half: Code Editor */}
          <div className="flex-1 flex flex-col min-h-[280px] border-b border-slate-800 bg-slate-950">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Code2 size={14} className="text-emerald-400" />
                <span>test.spec.ts</span>
                <span className="text-[10px] text-slate-500">• TypeScript</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyCode}
                  className="px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded flex items-center gap-1 transition"
                  title="Copy Code"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleResetCode}
                  className="px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded flex items-center gap-1 transition"
                  title="Reset to starter"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Code Input Area with line numbering simulation */}
            <div className="flex-1 relative flex overflow-hidden font-mono text-xs sm:text-sm">
              <div className="w-10 select-none py-3 bg-slate-950 text-slate-600 text-right pr-2 text-xs font-mono border-r border-slate-800/80">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  userService.saveCode(challenge.id, e.target.value);
                }}
                spellCheck={false}
                className="flex-1 p-3 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed border-none"
              />
            </div>
          </div>

          {/* Bottom Half: Live Virtual Browser & Execution Trace */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-[300px] bg-slate-900/40">
            {/* Live Virtual Browser Target */}
            <div className="flex flex-col border-r border-slate-800 bg-slate-950/80">
              {/* Browser Address Bar Header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-950 rounded text-[11px] text-slate-400 font-mono border border-slate-800 max-w-[160px] sm:max-w-xs truncate">
                    <Globe size={11} className="text-emerald-400 shrink-0" />
                    <span>play-with-playwright.dev/arena/{challenge.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Viewport size switcher */}
                  <button
                    onClick={() => setViewportMode('desktop')}
                    className={`p-1 rounded ${viewportMode === 'desktop' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Desktop (100%)"
                  >
                    <Monitor size={13} />
                  </button>
                  <button
                    onClick={() => setViewportMode('tablet')}
                    className={`p-1 rounded ${viewportMode === 'tablet' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Tablet View"
                  >
                    <Tablet size={13} />
                  </button>
                  <button
                    onClick={() => setViewportMode('mobile')}
                    className={`p-1 rounded ${viewportMode === 'mobile' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Mobile View"
                  >
                    <Smartphone size={13} />
                  </button>

                  {/* Inspector Mode Button */}
                  <button
                    onClick={() => setInspectMode(!inspectMode)}
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition ${
                      inspectMode
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Click element to copy Playwright locator"
                  >
                    <Eye size={11} />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>

              {/* Virtual Browser Viewport */}
              <div
                ref={browserWrapperRef}
                className="flex-1 relative p-4 overflow-auto flex items-center justify-center bg-grid-pattern"
              >
                <div
                  className={`w-full transition-all duration-200 ${
                    viewportMode === 'tablet'
                      ? 'max-w-[480px]'
                      : viewportMode === 'mobile'
                      ? 'max-w-[320px]'
                      : 'max-w-full'
                  }`}
                >
                  <div
                    ref={virtualBrowserRef}
                    onClick={handleInspectClick}
                    className={`w-full ${inspectMode ? 'cursor-crosshair' : ''}`}
                  />
                </div>

                {/* Locator Copied Toast */}
                {copiedLocator && (
                  <div className="absolute top-2 right-2 px-3 py-1 bg-cyan-500 text-slate-950 font-mono text-xs font-bold rounded shadow-lg animate-fade-in pointer-events-none">
                    Copied: {copiedLocator}
                  </div>
                )}

                {/* Real-time Playwright Target Element Highlight Box */}
                {highlightBox && (
                  <div
                    style={{
                      position: 'absolute',
                      top: `${highlightBox.rect.top}px`,
                      left: `${highlightBox.rect.left}px`,
                      width: `${highlightBox.rect.width}px`,
                      height: `${highlightBox.rect.height}px`,
                      pointerEvents: 'none',
                      zIndex: 40
                    }}
                    className="border-2 border-emerald-400 bg-emerald-500/20 rounded shadow-lg transition-all duration-75 flex items-start justify-end p-0.5"
                  >
                    <span className="text-[9px] bg-emerald-600 text-white font-mono px-1 rounded shadow">
                      {highlightBox.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Results & Execution Trace Panel */}
            <div className="flex flex-col bg-slate-950">
              {/* Results Tabs Header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStepTab('steps')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium ${
                      activeStepTab === 'steps' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    <FileCheck size={12} /> Test Trace
                  </button>
                  <button
                    onClick={() => setActiveStepTab('logs')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium ${
                      activeStepTab === 'logs' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    <Terminal size={12} /> Console ({consoleLogs.length})
                  </button>
                </div>

                {/* Status Indicator */}
                {results && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {results.passed ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Passed
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle size={13} /> Failed
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Panel Body */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-xs">
                {!results && !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                    <Terminal size={24} className="mb-2 opacity-50 text-slate-400" />
                    <p className="text-xs">Click "Run Test" or press Ctrl+Enter to execute.</p>
                    <p className="text-[11px] text-slate-600 mt-1">Playwright will execute locators against the virtual browser.</p>
                  </div>
                )}

                {isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-cyan-400 text-center p-4">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs font-semibold">Executing Playwright Automation Suite...</p>
                    <p className="text-[11px] text-slate-500">Checking actionability and running assertions</p>
                  </div>
                )}

                {results && activeStepTab === 'steps' && (
                  <div className="space-y-1.5">
                    {/* Summary Header */}
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        results.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <span className="font-semibold">{results.message}</span>
                      <span className="text-[10px] opacity-80">
                        {results.steps.length} step(s) • {results.steps.reduce((a, b) => a + b.durationMs, 0)}ms
                      </span>
                    </div>

                    {/* Step list */}
                    <div className="space-y-1 pt-1">
                      {results.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded border flex items-start justify-between text-xs transition ${
                            step.status === 'passed'
                              ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                              : 'bg-rose-950/40 border-rose-800 text-rose-300'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            {step.status === 'passed' ? (
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-mono">{step.name}</div>
                              {step.error && (
                                <div className="text-[11px] text-rose-400 mt-1 font-sans bg-rose-950/80 p-1.5 rounded">
                                  {step.error}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono ml-2">
                            {step.durationMs}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeStepTab === 'logs' && (
                  <div className="space-y-1">
                    {consoleLogs.length === 0 ? (
                      <p className="text-slate-600 text-xs">No console logs generated.</p>
                    ) : (
                      consoleLogs.map((log, i) => (
                        <div key={i} className="text-slate-300 text-[11px] font-mono leading-tight">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
