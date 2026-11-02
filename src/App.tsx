/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ChallengesList } from './components/ChallengesList';
import { PlaywrightIDE } from './components/PlaywrightIDE';
import { CheatsheetView } from './components/CheatsheetView';
import { InterviewLab } from './components/InterviewLab';
import { CoursesView } from './components/CoursesView';
import { BattlegroundView } from './components/BattlegroundView';
import { ThreeCompanion } from './components/ThreeCompanion';
import { AuthModal } from './components/AuthModal';
import { GitYamlModal } from './components/GitYamlModal';
import { CHALLENGES } from './data/challenges';
import { Challenge, UserProfile } from './types';
import { userService } from './services/userService';
import { ChevronDown, Trophy } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => userService.getUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGitYamlModal, setShowGitYamlModal] = useState(false);
  const [showCompanionDock, setShowCompanionDock] = useState(true);
  const [companionAction, setCompanionAction] = useState<'idle' | 'running' | 'success' | 'fail'>('idle');
  const [levelUpToast, setLevelUpToast] = useState<string | null>(null);

  // Sync user state on change
  const handleUpdateCompanion = (updates: Partial<UserProfile['companion']>) => {
    const updated = userService.updateCompanion(updates);
    setUser(updated);
  };

  const handleChallengeComplete = (challengeId: string, points: number, category: string) => {
    const { user: updatedUser, leveledUp, companionLeveledUp } = userService.recordChallengeSuccess(
      challengeId,
      points,
      category
    );
    setUser(updatedUser);

    if (leveledUp) {
      setLevelUpToast(`🎉 Level Up! You reached Level ${updatedUser.level}!`);
      setTimeout(() => setLevelUpToast(null), 4000);
    } else if (companionLeveledUp) {
      setLevelUpToast(`🌟 ${updatedUser.companion.name} reached Level ${updatedUser.companion.level}!`);
      setTimeout(() => setLevelUpToast(null), 4000);
    }
  };

  const handleSelectChallenge = (ch: Challenge) => {
    setSelectedChallenge(ch);
    setCurrentTab('ide');
  };

  const handleNextChallenge = () => {
    const currentIndex = CHALLENGES.findIndex((c) => c.id === selectedChallenge.id);
    if (currentIndex >= 0 && currentIndex < CHALLENGES.length - 1) {
      setSelectedChallenge(CHALLENGES[currentIndex + 1]);
    }
  };

  const handleSelectCategoryFromCourses = (category: string) => {
    if (category === 'all') {
      setCurrentTab('challenges');
    } else if (category === 'interview-prep') {
      setCurrentTab('interview');
    } else {
      const match = CHALLENGES.find((c) => c.category === category);
      if (match) {
        setSelectedChallenge(match);
        setCurrentTab('ide');
      } else {
        setCurrentTab('challenges');
      }
    }
  };

  const handleOpenSnippetInIde = (snippetCode: string) => {
    userService.saveCode(selectedChallenge.id, snippetCode);
    setCurrentTab('ide');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenGitYaml={() => setShowGitYamlModal(true)}
        showCompanionDock={showCompanionDock}
        onToggleCompanionDock={() => setShowCompanionDock(!showCompanionDock)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {currentTab === 'challenges' && (
          <ChallengesList
            challenges={CHALLENGES}
            user={user}
            onSelectChallenge={handleSelectChallenge}
            onToggleBookmark={(id) => {
              const u = userService.toggleBookmark(id);
              setUser(u);
            }}
          />
        )}

        {currentTab === 'ide' && (
          <div className="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)]">
            <PlaywrightIDE
              challenge={selectedChallenge}
              user={user}
              onChallengeComplete={handleChallengeComplete}
              onNextChallenge={handleNextChallenge}
              onCompanionActionChange={setCompanionAction}
            />
          </div>
        )}

        {currentTab === 'cheatsheet' && (
          <CheatsheetView
            onOpenInIde={handleOpenSnippetInIde}
            onOpenGitYaml={() => setShowGitYamlModal(true)}
          />
        )}

        {currentTab === 'interview' && (
          <InterviewLab
            challenges={CHALLENGES}
            onOpenChallenge={(id) => {
              const ch = CHALLENGES.find((c) => c.id === id) || CHALLENGES[0];
              handleSelectChallenge(ch);
            }}
          />
        )}

        {currentTab === 'courses' && (
          <CoursesView
            user={user}
            onSelectCategory={handleSelectCategoryFromCourses}
          />
        )}

        {currentTab === 'battle' && (
          <BattlegroundView
            user={user}
            challenges={CHALLENGES}
            onOpenChallenge={handleSelectChallenge}
            onUpdateUser={setUser}
          />
        )}
      </main>

      {/* Level Up Banner Notification */}
      {levelUpToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Trophy size={18} />
          <span>{levelUpToast}</span>
        </div>
      )}

      {/* Floating 3D Animal Companion Dock */}
      {showCompanionDock && (
        <div className="fixed bottom-4 right-4 z-40 w-72 sm:w-80 shadow-2xl transition-all duration-300">
          <div className="relative">
            {/* Collapse button header */}
            <button
              onClick={() => setShowCompanionDock(false)}
              className="absolute -top-3 right-3 z-50 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-full border border-slate-700 flex items-center gap-1 shadow"
            >
              <ChevronDown size={12} /> Minimize
            </button>
            <ThreeCompanion
              user={user}
              onUpdateCompanion={handleUpdateCompanion}
              actionState={companionAction}
              compact={false}
            />
          </div>
        </div>
      )}

      {/* User Login & Profile Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={user}
        onUserChange={setUser}
      />

      {/* GitHub Actions YAML on Push Generator Modal */}
      <GitYamlModal
        isOpen={showGitYamlModal}
        onClose={() => setShowGitYamlModal(false)}
      />
    </div>
  );
}
