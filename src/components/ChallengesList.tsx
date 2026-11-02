import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Circle,
  Sparkles,
  Filter,
  Flame,
  Trophy,
  ArrowRight,
  Shuffle,
  ChevronRight,
  Layers,
  Code2,
  Check,
  Bookmark
} from 'lucide-react';
import { Challenge, Category, Difficulty, UserProfile } from '../types';

interface ChallengesListProps {
  challenges: Challenge[];
  user: UserProfile;
  onSelectChallenge: (challenge: Challenge) => void;
  onToggleBookmark: (challengeId: string) => void;
}

export const ChallengesList: React.FC<ChallengesListProps> = ({
  challenges,
  user,
  onSelectChallenge,
  onToggleBookmark
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');

  // Solved counts
  const solvedCount = user.solvedChallenges.length;
  const totalCount = challenges.length;
  const progressPercent = Math.round((solvedCount / totalCount) * 100);

  // Category labels mapping
  const categoryLabels: { id: Category | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All Challenges (100)', icon: '🌟' },
    { id: 'locators-actions', label: 'Locators & Actions', icon: '🎯' },
    { id: 'assertions-waiting', label: 'Auto-Waiting & Asserts', icon: '⏳' },
    { id: 'dynamic-elements', label: 'Async & Dynamic Elements', icon: '⚡' },
    { id: 'forms-tables', label: 'Forms & Data Tables', icon: '📋' },
    { id: 'dialogs-frames', label: 'Dialogs & iFrames', icon: '🖼️' },
    { id: 'api-testing', label: 'API Testing Studio', icon: '🔌' },
    { id: 'ts-automation', label: 'TypeScript for QA', icon: '🔷' },
    { id: 'sql-database', label: 'SQL DB Verification', icon: '🗄️' },
    { id: 'interview-prep', label: 'Interview Q&A Labs', icon: '💼' }
  ];

  // Filtered challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((ch) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ch.title.toLowerCase().includes(q);
        const matchTags = ch.tags.some((t) => t.toLowerCase().includes(q));
        const matchDesc = ch.description.toLowerCase().includes(q);
        if (!matchTitle && !matchTags && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== 'all' && ch.category !== selectedCategory) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'all' && ch.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status
      const isSolved = user.solvedChallenges.includes(ch.id);
      if (statusFilter === 'solved' && !isSolved) return false;
      if (statusFilter === 'unsolved' && isSolved) return false;

      return true;
    });
  }, [challenges, searchQuery, selectedCategory, selectedDifficulty, statusFilter, user.solvedChallenges]);

  // Pick random unsolved challenge
  const handlePickRandom = () => {
    const unsolved = challenges.filter((c) => !user.solvedChallenges.includes(c.id));
    const pool = unsolved.length > 0 ? unsolved : challenges;
    const random = pool[Math.floor(Math.random() * pool.length)];
    onSelectChallenge(random);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* Top Banner & Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Progress Overview Card */}
        <div className="md:col-span-2 p-5 bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">Play-with Playwright</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold border border-cyan-500/30">
                  -@K@SH
                </span>
                <span className="text-[10px] text-slate-400 font-mono">by Akash</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">100 Challenges & Scenario Projects</h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono font-bold">
              <Trophy size={14} /> {user.xp} Total XP
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Curriculum Progress</span>
              <span className="text-emerald-400 font-mono">{solvedCount} / {totalCount} Solved ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Breakdown Badges */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400">Difficulty Cleared:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
              Beginner: {user.stats.beginnerSolved}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
              Interm: {user.stats.intermediateSolved}
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono">
              Adv: {user.stats.advancedSolved}
            </span>
          </div>
        </div>

        {/* Streak & Level Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Practice Streak</span>
            <Flame size={20} className="text-orange-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white flex items-center gap-2">
              {user.streak} <span className="text-sm font-normal text-slate-400">Days Active</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Keep solving daily to maintain streak multiplier</p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] text-emerald-400 font-medium">🔥 Streak Bonus: +25% Companion XP</span>
          </div>
        </div>

        {/* 3D Mascot Companion Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active 3D Mascot</span>
            <span className="text-lg">
              {user.companion.type === 'fox' ? '🦊' : user.companion.type === 'panda' ? '🐼' : '🦉'}
            </span>
          </div>
          <div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {user.companion.name}
              <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                Lv.{user.companion.level}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Accessory: <strong className="text-slate-200 capitalize">{user.companion.accessory}</strong></span>
            </div>
          </div>
          <button
            onClick={handlePickRandom}
            className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <Shuffle size={13} /> Pick Random Challenge
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, locator, keyword (e.g. click, table, api, sleep)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Quick Selectors */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Master">Master</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved Only</option>
              <option value="unsolved">Unsolved Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categoryLabels.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Table / Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-3 w-16">#</th>
                <th className="py-3 px-4">Challenge Title</th>
                <th className="py-3 px-4 hidden md:table-cell">Category</th>
                <th className="py-3 px-4 w-28">Difficulty</th>
                <th className="py-3 px-4 w-20 text-center">XP</th>
                <th className="py-3 px-4 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredChallenges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No challenges found matching your filters. Try clearing search filters.
                  </td>
                </tr>
              ) : (
                filteredChallenges.map((ch) => {
                  const isSolved = user.solvedChallenges.includes(ch.id);
                  const isBookmarked = user.bookmarks.includes(ch.id);

                  return (
                    <tr
                      key={ch.id}
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                      onClick={() => onSelectChallenge(ch)}
                    >
                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isSolved ? (
                          <CheckCircle2 size={18} className="text-emerald-400 mx-auto" />
                        ) : (
                          <Circle size={18} className="text-slate-600 mx-auto group-hover:text-slate-400" />
                        )}
                      </td>

                      {/* Number */}
                      <td className="py-3.5 px-3 font-mono text-slate-400 font-semibold">
                        #{ch.num}
                      </td>

                      {/* Title & Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-emerald-400 transition">
                            {ch.title}
                          </span>
                          {ch.interviewData && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold">
                              Interview
                            </span>
                          )}
                          {ch.apiScenario && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-semibold">
                              API
                            </span>
                          )}
                          {ch.sqlScenario && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">
                              SQL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {ch.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-400 capitalize">
                        {ch.category.replace('-', ' ')}
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium inline-block ${
                            ch.difficulty === 'Beginner'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : ch.difficulty === 'Intermediate'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : ch.difficulty === 'Advanced'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {ch.difficulty}
                        </span>
                      </td>

                      {/* XP Points */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-slate-300">
                        +{ch.points}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectChallenge(ch);
                          }}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 transition flex items-center gap-1 ml-auto"
                        >
                          <span>Solve</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
