import React from 'react';
import {
  Sparkles,
  Flame,
  Trophy,
  Swords,
  BookOpen,
  Briefcase,
  Code2,
  FileCode,
  Layers,
  GitBranch
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab = 'challenges' | 'ide' | 'cheatsheet' | 'interview' | 'courses' | 'battle';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenGitYaml: () => void;
  showCompanionDock: boolean;
  onToggleCompanionDock: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  onOpenAuth,
  onOpenGitYaml,
  showCompanionDock,
  onToggleCompanionDock
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('challenges')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              🎭
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Play-with <span className="text-emerald-400">Playwright</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold px-1.5 py-0.2 bg-cyan-500/10 rounded border border-cyan-500/30">
                  -@K@SH
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">by Akash • TS Heaven</div>
            </div>
          </button>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => onTabChange('challenges')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              currentTab === 'challenges'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 size={14} /> Challenges (100)
          </button>

          <button
            onClick={() => onTabChange('ide')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              currentTab === 'ide'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles size={14} /> Live IDE Lab
          </button>

          <button
            onClick={() => onTabChange('cheatsheet')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              currentTab === 'cheatsheet'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode size={14} /> Cheatsheet
          </button>

          <button
            onClick={() => onTabChange('interview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              currentTab === 'interview'
                ? 'bg-slate-800 text-rose-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Briefcase size={14} /> Interview Q&A
          </button>

          <button
            onClick={() => onTabChange('courses')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              currentTab === 'courses'
                ? 'bg-slate-800 text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen size={14} /> Courses
          </button>

          <button
            onClick={() => onTabChange('battle')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              currentTab === 'battle'
                ? 'bg-slate-800 text-red-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Swords size={14} /> 1v1 Arena
          </button>
        </nav>

        {/* Right User Stats & Mascot Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Git YAML on Push Button */}
          <button
            onClick={onOpenGitYaml}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-purple-500/40 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 shadow-sm"
            title="Open GitHub Actions YAML on Push Generator"
          >
            <GitBranch size={13} className="text-purple-400" />
            <span className="hidden sm:inline">Git YAML</span>
            <span className="text-[10px] px-1 py-0.2 bg-purple-500/30 text-purple-200 rounded font-mono">push</span>
          </button>

          {/* 3D Mascot Toggle Button */}
          <button
            onClick={onToggleCompanionDock}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              showCompanionDock
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle 3D Animal Companion Dock"
          >
            <span className="text-sm">
              {user.companion.type === 'fox' ? '🦊' : user.companion.type === 'panda' ? '🐼' : '🦉'}
            </span>
            <span className="hidden sm:inline">3D Companion</span>
          </button>

          {/* Streak Flame */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-orange-400 shadow-sm">
            <Flame size={14} className="fill-orange-500 text-orange-500" />
            <span>{user.streak}d</span>
          </div>

          {/* XP & Level */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-400">
            <Trophy size={13} />
            <span>Lv.{user.level}</span>
            <span className="text-slate-600">•</span>
            <span>{user.xp} XP</span>
          </div>

          {/* User Sign In / Profile Modal Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs transition"
          >
            <span className="font-semibold text-slate-200 hidden sm:inline max-w-[100px] truncate">
              {user.displayName.split(' ')[0]}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {user.displayName.charAt(0)}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-950 text-xs overflow-x-auto">
        <button
          onClick={() => onTabChange('challenges')}
          className={`px-2 py-1 rounded whitespace-nowrap ${currentTab === 'challenges' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Challenges
        </button>
        <button
          onClick={() => onTabChange('ide')}
          className={`px-2 py-1 rounded whitespace-nowrap ${currentTab === 'ide' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Live IDE
        </button>
        <button
          onClick={() => onTabChange('cheatsheet')}
          className={`px-2 py-1 rounded whitespace-nowrap ${currentTab === 'cheatsheet' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          Cheatsheet
        </button>
        <button
          onClick={() => onTabChange('interview')}
          className={`px-2 py-1 rounded whitespace-nowrap ${currentTab === 'interview' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
        >
          Interview
        </button>
        <button
          onClick={() => onTabChange('courses')}
          className={`px-2 py-1 rounded whitespace-nowrap ${currentTab === 'courses' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Courses
        </button>
        <button
          onClick={() => onTabChange('battle')}
          className={`px-2 py-1 rounded whitespace-nowrap ${currentTab === 'battle' ? 'text-red-400 font-bold' : 'text-slate-400'}`}
        >
          1v1 Arena
        </button>
      </div>
    </header>
  );
};
