import { UserProfile } from '../types';

const STORAGE_KEY = 'playwithplaywright_user_session_v1';
const SAVED_CODES_KEY = 'playwithplaywright_code_drafts_v1';

const DEFAULT_USER: UserProfile = {
  id: 'student_' + Math.random().toString(36).substring(2, 9),
  username: 'playwright_champ',
  displayName: 'Alex Rivers',
  avatar: '🦊',
  role: 'Automation Cadet',
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  xp: 450,
  level: 3,
  solvedChallenges: ['ch-001', 'ch-002', 'ch-003'],
  bookmarks: ['ch-015', 'ch-030'],
  companion: {
    type: 'fox',
    name: 'Kitsune QA',
    level: 3,
    xp: 220,
    accessory: 'visor',
    mood: 'happy'
  },
  stats: {
    beginnerSolved: 3,
    intermediateSolved: 0,
    advancedSolved: 0,
    masterSolved: 0,
    apiSolved: 0,
    sqlSolved: 0,
    tsSolved: 0,
    battlesWon: 1
  }
};

export const userService = {
  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse local user profile:', e);
    }
    // Initialize default user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  },

  saveUser(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  },

  loginAs(name: string, companionChoice: 'fox' | 'panda' | 'owl' = 'fox'): UserProfile {
    const cleanName = name.trim() || 'QA Explorer';
    const profile: UserProfile = {
      ...DEFAULT_USER,
      id: 'user_' + Date.now().toString(36),
      username: cleanName.toLowerCase().replace(/\s+/g, '_'),
      displayName: cleanName,
      companion: {
        ...DEFAULT_USER.companion,
        type: companionChoice,
        name: companionChoice === 'fox' ? 'Kitsune QA' : companionChoice === 'panda' ? 'Panda Inspector' : 'Owly Assert'
      }
    };
    this.saveUser(profile);
    return profile;
  },

  logout(): UserProfile {
    localStorage.removeItem(STORAGE_KEY);
    return this.getUser();
  },

  recordChallengeSuccess(challengeId: string, points: number, category: string): { user: UserProfile; leveledUp: boolean; companionLeveledUp: boolean } {
    const user = this.getUser();
    let leveledUp = false;
    let companionLeveledUp = false;

    const isFirstTime = !user.solvedChallenges.includes(challengeId);
    if (isFirstTime) {
      user.solvedChallenges.push(challengeId);
      user.xp += points;
      user.companion.xp += points;

      // Update category breakdown
      if (category === 'api-testing') user.stats.apiSolved++;
      else if (category === 'sql-database') user.stats.sqlSolved++;
      else if (category === 'ts-automation') user.stats.tsSolved++;
      else if (category === 'locators-actions') user.stats.beginnerSolved++;
      else user.stats.intermediateSolved++;

      // Check user level up (every 300 xp)
      const nextUserLevel = Math.floor(user.xp / 300) + 1;
      if (nextUserLevel > user.level) {
        user.level = nextUserLevel;
        leveledUp = true;
      }

      // Check companion level up (every 200 xp)
      const nextCompanionLevel = Math.floor(user.companion.xp / 200) + 1;
      if (nextCompanionLevel > user.companion.level) {
        user.companion.level = nextCompanionLevel;
        companionLeveledUp = true;
      }
    }

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      user.streak += 1;
      user.lastActiveDate = today;
    }

    user.companion.mood = 'cheering';
    this.saveUser(user);
    return { user, leveledUp, companionLeveledUp };
  },

  updateCompanion(updates: Partial<UserProfile['companion']>): UserProfile {
    const user = this.getUser();
    user.companion = { ...user.companion, ...updates };
    this.saveUser(user);
    return user;
  },

  toggleBookmark(challengeId: string): UserProfile {
    const user = this.getUser();
    if (user.bookmarks.includes(challengeId)) {
      user.bookmarks = user.bookmarks.filter(id => id !== challengeId);
    } else {
      user.bookmarks.push(challengeId);
    }
    this.saveUser(user);
    return user;
  },

  getSavedCode(challengeId: string): string | null {
    try {
      const allDrafts = JSON.parse(localStorage.getItem(SAVED_CODES_KEY) || '{}');
      return allDrafts[challengeId] || null;
    } catch {
      return null;
    }
  },

  saveCode(challengeId: string, code: string): void {
    try {
      const allDrafts = JSON.parse(localStorage.getItem(SAVED_CODES_KEY) || '{}');
      allDrafts[challengeId] = code;
      localStorage.setItem(SAVED_CODES_KEY, JSON.stringify(allDrafts));
    } catch (e) {
      console.warn('Failed to save code draft:', e);
    }
  }
};
