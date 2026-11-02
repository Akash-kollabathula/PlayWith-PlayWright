import React, { useState, useEffect } from 'react';
import { Swords, Flame, Trophy, Play, CheckCircle, Clock, Zap, Bot, ShieldAlert } from 'lucide-react';
import { UserProfile, Challenge } from '../types';
import confetti from 'canvas-confetti';

interface BattlegroundViewProps {
  user: UserProfile;
  challenges: Challenge[];
  onOpenChallenge: (challenge: Challenge) => void;
  onUpdateUser: (u: UserProfile) => void;
}

export const BattlegroundView: React.FC<BattlegroundViewProps> = ({
  user,
  challenges,
  onOpenChallenge,
  onUpdateUser
}) => {
  const [inMatch, setInMatch] = useState(false);
  const [matchTime, setMatchTime] = useState(60);
  const [rivalProgress, setRivalProgress] = useState(0);
  const [rivalBot, setRivalBot] = useState({ name: 'SeleniumRival', level: 4, avatar: '🤖', speed: 1.2 });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(challenges[0]);
  const [battleResult, setBattleResult] = useState<'won' | 'lost' | null>(null);

  const rivals = [
    { name: 'CypressNovice', level: 2, avatar: '🐢', speed: 0.8 },
    { name: 'SeleniumVeteran', level: 4, avatar: '🤖', speed: 1.2 },
    { name: 'PlaywrightArchon', level: 8, avatar: '⚡', speed: 1.8 }
  ];

  // Start battle
  const startBattle = (bot: typeof rivals[0]) => {
    setRivalBot(bot);
    const pool = challenges.slice(0, 15);
    const randomCh = pool[Math.floor(Math.random() * pool.length)];
    setSelectedChallenge(randomCh);
    setInMatch(true);
    setMatchTime(60);
    setRivalProgress(0);
    setBattleResult(null);
  };

  useEffect(() => {
    if (!inMatch) return;
    const interval = setInterval(() => {
      setMatchTime((prev) => {
        if (prev <= 1) {
          setInMatch(false);
          setBattleResult('lost');
          return 0;
        }
        return prev - 1;
      });

      // Rival bot advances
      setRivalProgress((prev) => {
        const next = prev + Math.random() * 2 * rivalBot.speed;
        if (next >= 100) {
          setInMatch(false);
          setBattleResult('lost');
          return 100;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [inMatch, rivalBot]);

  const handleClaimWin = () => {
    confetti({ particleCount: 100, spread: 80 });
    setBattleResult('won');
    setInMatch(false);
    const updated = { ...user, xp: user.xp + 300, stats: { ...user.stats, battlesWon: user.stats.battlesWon + 1 } };
    onUpdateUser(updated);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border border-red-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            <Swords size={16} /> 1v1 QA Automation Battleground
          </div>
          <h2 className="text-2xl font-extrabold text-white">Live Speedrun & Bot Duels</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Race against rival automation bots or challenge fellow SDETs to solve Playwright scenarios in real-time. Speed + Accuracy = Glory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Battles Won</div>
            <div className="text-xl font-mono font-bold text-emerald-400">{user.stats.battlesWon}</div>
          </div>
        </div>
      </div>

      {!inMatch && !battleResult && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Select Your AI Opponent</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rivals.map((bot) => (
              <div
                key={bot.name}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 bg-slate-950 rounded-xl border border-slate-800">
                      {bot.avatar}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      Rank Lv.{bot.level}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{bot.name}</h4>
                  <p className="text-xs text-slate-400">
                    Speed multiplier: <strong className="text-slate-200">{bot.speed}x</strong>
                  </p>
                </div>
                <button
                  onClick={() => startBattle(bot)}
                  className="mt-5 w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5"
                >
                  <Swords size={13} /> Challenge Duel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Battle Arena */}
      {inMatch && (
        <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {user.companion.type === 'fox' ? '🦊' : user.companion.type === 'panda' ? '🐼' : '🦉'}
              </span>
              <div>
                <div className="font-bold text-sm text-white">{user.displayName} (You)</div>
                <div className="text-xs text-emerald-400 font-mono">Playwright Test Engineer</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 font-mono text-base font-bold text-amber-400">
              <Clock size={16} /> {matchTime}s Remaining
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="font-bold text-sm text-white">{rivalBot.name}</div>
                <div className="text-xs text-red-400 font-mono">Rival AI Bot</div>
              </div>
              <span className="text-2xl">{rivalBot.avatar}</span>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Rival Bot Progress</span>
                <span className="text-red-400">{Math.round(rivalProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-red-500 transition-all duration-500 rounded-full"
                  style={{ width: `${rivalProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Battle Challenge Info */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Duel Challenge</span>
              <h3 className="text-base font-bold text-white">{selectedChallenge.title}</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-lg">{selectedChallenge.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onOpenChallenge(selectedChallenge)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
              >
                <Play size={13} className="fill-slate-950" /> Launch IDE & Solve
              </button>
              <button
                onClick={handleClaimWin}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition shadow"
              >
                Verify & Claim Victory!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Battle End Modal / Banner */}
      {battleResult && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="text-4xl">{battleResult === 'won' ? '🏆' : '💀'}</div>
          <h3 className="text-xl font-bold text-white">
            {battleResult === 'won' ? 'Victory in Battle Arena!' : 'Defeated by Rival Bot'}
          </h3>
          <p className="text-xs text-slate-400">
            {battleResult === 'won'
              ? 'You outpaced the rival bot and delivered clean, passing Playwright automation! +300 XP awarded.'
              : 'The rival completed their assertions first. Practice auto-waiting and locator speed to conquer!'}
          </p>
          <button
            onClick={() => setBattleResult(null)}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
          >
            Back to Arena Hub
          </button>
        </div>
      )}
    </div>
  );
};
