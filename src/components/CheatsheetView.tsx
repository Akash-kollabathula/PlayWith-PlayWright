import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  Code2,
  Terminal,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  FileCode,
  Flame,
  CheckCircle2,
  GitBranch
} from 'lucide-react';
import { CHEAT_CODES, CHEATSHEET_CATEGORIES, CheatCodeItem } from '../data/cheatsheets';

interface CheatsheetViewProps {
  onOpenInIde?: (sampleCode: string) => void;
  onOpenGitYaml?: () => void;
}

export const CheatsheetView: React.FC<CheatsheetViewProps> = ({ onOpenInIde, onOpenGitYaml }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCodes = useMemo(() => {
    return CHEAT_CODES.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = item.title.toLowerCase().includes(q);
        const mSyntax = item.syntax.toLowerCase().includes(q);
        const mExp = item.explanation.toLowerCase().includes(q);
        const mTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!mTitle && !mSyntax && !mExp && !mTags) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Hero Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1 font-mono">
            <Sparkles size={14} /> Playwright with -@K@SH • Cheatsheet Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The Ultimate Playwright & TS Heaven Cheat Codes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Instant copy-paste syntax, role locators, web-first auto-waiting assertions, typed Page Object Models, API fixtures, SQL query patterns, and CI/CD pipelines (GitHub Actions, Jenkins, Docker).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenGitYaml && (
            <button
              onClick={onOpenGitYaml}
              className="px-3.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
            >
              <GitBranch size={13} className="text-purple-400" />
              <span>Git YAML on Push</span>
            </button>
          )}
          <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
            <Flame size={14} className="text-orange-400" /> by Akash
          </span>
          <span className="px-3 py-1 bg-slate-950/80 border border-slate-800 text-slate-400 rounded-xl text-xs font-mono">
            v1.49+ Ready
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cheat codes (e.g. getByRole, expect, docker, route, fixtures, sql)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 outline-none transition"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CHEATSHEET_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cheat Code Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCodes.map((item) => {
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-slate-400 uppercase">
                    {item.category}
                  </span>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {item.explanation}
                </p>

                {/* Syntax Pill */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 mb-3 overflow-x-auto">
                  {item.syntax}
                </div>

                {/* Production Code Snippet */}
                <div className="relative group/code mb-3">
                  <pre className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800/90 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-56 leading-relaxed">
                    {item.example}
                  </pre>
                  <button
                    onClick={() => handleCopy(item.id, item.example)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1 transition opacity-0 group-hover/code:opacity-100 shadow"
                    title="Copy snippet"
                  >
                    {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Pro Tip */}
                {item.tips && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-1.5 mb-3">
                    <Sparkles size={13} className="shrink-0 mt-0.5 text-emerald-400" />
                    <span><strong>Pro Tip:</strong> {item.tips}</span>
                  </div>
                )}
              </div>

              {/* Tags & Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, item.example)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                  >
                    {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {onOpenInIde && (
                    <button
                      onClick={() => onOpenInIde(item.example)}
                      className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 transition shadow"
                    >
                      <Play size={12} className="fill-slate-950" /> Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
