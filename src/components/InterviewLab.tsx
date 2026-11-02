import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Code2,
  CheckCircle,
  Building2,
  Play,
  FileCheck2,
  Layers,
  Cpu
} from 'lucide-react';
import { INTERVIEW_QUESTIONS, InterviewCard } from '../data/courses';
import { Challenge } from '../types';

interface InterviewLabProps {
  onOpenChallenge: (challengeId: string) => void;
  challenges: Challenge[];
}

export const InterviewLab: React.FC<InterviewLabProps> = ({ onOpenChallenge, challenges }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'int-1': true,
    'int-5': true
  });

  const categories = ['All', 'Manual Testing', 'Automation', 'API & Protocol', 'DevOps & CI/CD'];

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = INTERVIEW_QUESTIONS.filter(
    (q) => selectedCategory === 'All' || q.category === selectedCategory
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/30 border border-rose-500/20 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1 font-mono">
            <Briefcase size={14} /> Playwright with -@K@SH • Interview Bootcamp
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Automation & Manual Testing Interview Lab
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Real questions curated by Akash. Comprehensive coverage of Playwright internal CDP mechanics, actionability, and core Manual Testing essentials (BVA, Equivalence Partitioning, Bug Life Cycle, Severity vs Priority, Smoke vs Sanity).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-mono font-bold">
            🔥 100% Industry Verified
          </span>
        </div>
      </div>

      {/* Main Track Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === cat
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat === 'Manual Testing' && <FileCheck2 size={13} />}
            {cat === 'Automation' && <Cpu size={13} />}
            <span>{cat}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 font-mono">
              {cat === 'All' ? INTERVIEW_QUESTIONS.length : INTERVIEW_QUESTIONS.filter(q => q.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isExpanded = !!expandedCards[item.id];
          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition shadow-lg hover:border-slate-700"
            >
              {/* Question Header */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none bg-slate-900/80 hover:bg-slate-850"
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 border ${
                    item.category === 'Manual Testing'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {item.category === 'Manual Testing' ? 'MT' : 'PW'}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        item.category === 'Manual Testing' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.subCategory}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          item.frequency === 'Must Know'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {item.frequency}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {item.level}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">{item.question}</h3>
                  </div>
                </div>

                <div className="p-1 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Collapsible Answer & Code */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-950/60 space-y-4 text-sm">
                  {/* Detailed Answer */}
                  <div>
                    <h4 className="text-xs uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" /> Model Answer & Practical Explanation
                    </h4>
                    <p className="text-slate-200 leading-relaxed text-xs sm:text-sm bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      {item.keyAnswer}
                    </p>
                  </div>

                  {/* Code snippet if applicable */}
                  {item.codeSnippet && (
                    <div>
                      <h4 className="text-xs uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Code2 size={14} className="text-cyan-400" /> Reference Snippet / Matrix
                      </h4>
                      <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                        {item.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {/* Interview Trap */}
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
                    <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-amber-300">Candidate Trap to Avoid: </strong>
                      {item.commonTrap}
                    </div>
                  </div>

                  {/* Practice In Lab Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onOpenChallenge('ch-015')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <Play size={13} className="fill-slate-950" /> Practice in Interactive IDE
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
