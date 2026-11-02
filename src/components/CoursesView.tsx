import React from 'react';
import { COURSES, CourseTrack } from '../data/courses';
import { BookOpen, Check, ArrowRight, Sparkles, Award } from 'lucide-react';
import { UserProfile } from '../types';

interface CoursesViewProps {
  user: UserProfile;
  onSelectCategory: (category: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ user, onSelectCategory }) => {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
          <BookOpen size={14} /> Comprehensive Automation Curriculum
        </div>
        <h2 className="text-2xl font-extrabold text-white">Interactive QA & Playwright Academy</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Everything required to become an elite SDET: core browser mechanics, network API testing, strictly typed TypeScript patterns, database verification, and interview mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {COURSES.map((course) => {
          let solvedCount = 0;
          if (course.id === 'playwright-core') solvedCount = user.solvedChallenges.length;
          else if (course.id === 'api-testing') solvedCount = user.stats.apiSolved;
          else if (course.id === 'ts-automation') solvedCount = user.stats.tsSolved;
          else if (course.id === 'sql-database') solvedCount = user.stats.sqlSolved;
          else solvedCount = 1;

          const pct = Math.min(100, Math.round((solvedCount / course.challengeCount) * 100));

          return (
            <div
              key={course.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {course.icon}
                  </span>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${course.color}`}>
                    {course.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition mb-1.5">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {course.description}
                </p>

                {/* Topics list */}
                <div className="space-y-1.5 mb-5">
                  <div className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Curriculum Topics:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {course.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress & Action */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Completion</span>
                  <span className="text-emerald-400 font-bold">{pct}% ({solvedCount}/{course.challengeCount})</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(3, pct)}%` }}
                  />
                </div>

                <button
                  onClick={() => {
                    if (course.id === 'api-testing') onSelectCategory('api-testing');
                    else if (course.id === 'ts-automation') onSelectCategory('ts-automation');
                    else if (course.id === 'sql-database') onSelectCategory('sql-database');
                    else if (course.id === 'interview-prep') onSelectCategory('interview-prep');
                    else onSelectCategory('all');
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 group-hover:bg-emerald-500 group-hover:text-slate-950"
                >
                  <span>Enter Track Labs</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
