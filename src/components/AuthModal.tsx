import React, { useState } from 'react';
import { User, Sparkles, X, Shield, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { userService } from '../services/userService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [username, setUsername] = useState(currentUser.displayName);
  const [selectedCompanion, setSelectedCompanion] = useState<'fox' | 'panda' | 'owl'>(currentUser.companion.type);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = userService.loginAs(username, selectedCompanion);
    onUserChange(newUser);
    onClose();
  };

  const quickProfiles = [
    { name: 'Alex Rivers', companion: 'fox' as const, role: 'Senior Automation Lead' },
    { name: 'Maya Lin', companion: 'panda' as const, role: 'SDET Specialist' },
    { name: 'David Kumar', companion: 'owl' as const, role: 'Full Stack QA Architect' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <h2 className="text-lg font-bold text-white">Student Sign In & Profile</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Anyone can sign in immediately to practice 100+ challenges, track streaks, and level up your 3D mascot.
        </p>

        {/* Quick 1-Click Login options */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-400 mb-2">Instant 1-Click Profiles:</label>
          <div className="grid grid-cols-3 gap-2">
            {quickProfiles.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  const u = userService.loginAs(p.name, p.companion);
                  onUserChange(u);
                  onClose();
                }}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition flex flex-col justify-between"
              >
                <span className="text-lg mb-1">{p.companion === 'fox' ? '🦊' : p.companion === 'panda' ? '🐼' : '🦉'}</span>
                <div>
                  <div className="text-xs font-semibold text-slate-200 truncate">{p.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">1-Click</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Student / Handle Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Akash SDET"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Choose 3D Mascot Companion</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedCompanion('fox')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  selectedCompanion === 'fox'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">🦊</div>
                <div className="text-xs font-semibold">Cyber Fox</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCompanion('panda')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  selectedCompanion === 'panda'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">🐼</div>
                <div className="text-xs font-semibold">Robo Panda</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCompanion('owl')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  selectedCompanion === 'owl'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">🦉</div>
                <div className="text-xs font-semibold">Wise Owl</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
          >
            Enter Play-with Playwright • by Akash
          </button>
        </form>
      </div>
    </div>
  );
};
