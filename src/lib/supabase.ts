import { createClient } from '@supabase/supabase-js';

// Domain protection - chỉ cho phép chạy trên domain của bạn
const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  // Vercel domains
  'courseai-platform-two.vercel.app',
  'vercel.app', // Cho phép preview deployments
];

const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
  currentDomain === domain || currentDomain.endsWith(`.${domain}`)
);

if (!isAllowedDomain && typeof window !== 'undefined') {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a2e;color:#fff;font-family:sans-serif;text-align:center;padding:20px;">
      <div>
        <h1 style="color:#ef4444;">⚠️ Unauthorized Access</h1>
        <p>This application is not authorized to run on this domain.</p>
        <p style="color:#888;font-size:14px;">Domain: ${currentDomain}</p>
      </div>
    </div>
  `;
  throw new Error('Unauthorized domain');
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Custom storage with fallback
const customStorage = {
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Fallback to memory storage if localStorage is blocked
      console.warn('localStorage not available, using memory storage');
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: customStorage,
    storageKey: 'codemind-auth',
  },
  global: {
    headers: {
      'x-application-name': 'CodeMind AI',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  avatar_icon: string;
  total_coins: number;
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: {
    theory: string;
    example: string;
    challenge: string;
  };
  order_index: number;
  coins_reward: number;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  code_solution: string | null;
  completed_at: string | null;
  created_at: string;
};

export type Treasure = {
  id: string;
  title: string;
  description: string;
  riddle: string;
  answer: string;
  coins_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  map_x: number;
  map_y: number;
  location_name: string;
  unlocked_by_lesson: string | null;
  created_at: string;
};

export type FoundTreasure = {
  id: string;
  user_id: string;
  treasure_id: string;
  found_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  thumbnail_url: string | null;
  lessons_count: number;
  created_at: string;
};

export type PurchasedCourse = {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: 'lessons_completed' | 'treasures_found' | 'xp_reached' | 'courses_purchased';
  requirement_value: number;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  quest_type: 'complete_lessons' | 'find_treasures' | 'earn_xp' | 'purchase_course';
  target_value: number;
  xp_reward: number;
  coins_reward: number;
  is_active: boolean;
  created_at: string;
};

export type UserDailyProgress = {
  id: string;
  user_id: string;
  quest_id: string;
  current_value: number;
  completed: boolean;
  date: string;
  created_at: string;
};

export type AIConversation = {
  id: string;
  user_id: string;
  message: string;
  response: string;
  context: string | null;
  created_at: string;
};

export type RoadmapStep = {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lesson_ids: string[];
  required_previous: string | null;
  created_at: string;
};

export type UserRoadmapProgress = {
  id: string;
  user_id: string;
  step_id: string;
  completed: boolean;
  completed_at: string | null;
};
