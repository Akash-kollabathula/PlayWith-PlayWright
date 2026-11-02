export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';

export type Category =
  | 'locators-actions'
  | 'assertions-waiting'
  | 'dynamic-elements'
  | 'forms-tables'
  | 'dialogs-frames'
  | 'api-testing'
  | 'ts-automation'
  | 'sql-database'
  | 'interview-prep'
  | 'pom-architecture';

export interface TestStepResult {
  name: string;
  durationMs: number;
  status: 'passed' | 'failed' | 'running';
  error?: string;
  targetSelector?: string;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  steps: TestStepResult[];
  logs: string[];
}

export interface Challenge {
  id: string;
  num: number;
  title: string;
  slug: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  tags: string[];
  description: string;
  requirements: string[];
  starterCode: string;
  solutionCode: string;
  hints: string[];
  docUrl?: string;
  domHtml: string;
  domScript?: string;
  interviewData?: {
    frequency: 'High' | 'Very High' | 'Medium';
    companies: string[];
    explanation: string;
    commonMistakes: string[];
  };
  sqlScenario?: {
    tableSchema: string;
    sampleRows: Record<string, any>[];
    targetQuery: string;
    expectedResult: Record<string, any>[];
  };
  apiScenario?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    headers?: Record<string, string>;
    requestBody?: any;
    mockResponseBody: any;
    expectedStatus: number;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: string;
  streak: number;
  lastActiveDate: string;
  xp: number;
  level: number;
  solvedChallenges: string[]; // Challenge IDs
  bookmarks: string[];
  companion: {
    type: 'fox' | 'panda' | 'owl';
    name: string;
    level: number;
    xp: number;
    accessory: 'none' | 'visor' | 'gradcap' | 'crown' | 'wizard';
    mood: 'happy' | 'thinking' | 'excited' | 'cheering' | 'studying';
  };
  stats: {
    beginnerSolved: number;
    intermediateSolved: number;
    advancedSolved: number;
    masterSolved: number;
    apiSolved: number;
    sqlSolved: number;
    tsSolved: number;
    battlesWon: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  avatar: string;
  points: number;
  solvedCount: number;
  streak: number;
  badge: string;
  companionType: 'fox' | 'panda' | 'owl';
}
